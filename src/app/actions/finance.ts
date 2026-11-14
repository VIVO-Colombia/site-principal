"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { requireWritableAppAccess } from "@/lib/auth/access"
import { actionError, type ActionResult } from "@/lib/action-result"
import { shiftDueOn } from "@/lib/finance/cycle-dates"
import { parseAmountInput, toAmount } from "@/lib/finance/money"
import {
  calendarDateInTimeZone,
  cyclesToCreate,
  periodsFrom,
  type PayScheduleInput,
} from "@/lib/finance/pay-periods"
import { CYCLE_COOKIE } from "@/lib/finance/queries"
import { isMissingTable, omitUnknownColumn } from "@/lib/finance/schema-cache"
import { requireSupabase } from "@/lib/supabase/require"
import {
  accountSchema,
  budgetSchema,
  categorySchema,
  cycleSchema,
  payScheduleSchema,
  scheduledPaymentSchema,
  transactionSchema,
} from "@/lib/validations/finance"

const ACCOUNT_OPTIONAL_COLUMNS = ["color", "icon", "include_in_total"] as const
const CYCLE_OPTIONAL_COLUMNS = ["source_schedule_id"] as const

type FinanceClient = Awaited<ReturnType<typeof requireSupabase>>

async function insertRow(
  supabase: FinanceClient,
  table: "financial_accounts" | "financial_cycles" | "income_schedules" | "scheduled_incomes",
  row: Record<string, unknown>,
  optional: readonly string[]
) {
  let payload = { ...row }
  for (let attempt = 0; attempt <= optional.length; attempt += 1) {
    const { data, error } = await supabase.from(table).insert(payload).select("id").single()
    if (!error) return { id: String(data.id), error: null as string | null }
    const next = omitUnknownColumn(payload, error.message, optional)
    if (!next) return { id: null as string | null, error: error.message }
    payload = next
  }
  return { id: null as string | null, error: "No pudimos guardar el registro." }
}

async function updateRow(
  supabase: FinanceClient,
  table: "financial_accounts",
  id: string,
  userId: string,
  row: Record<string, unknown>,
  optional: readonly string[]
) {
  let payload = { ...row }
  for (let attempt = 0; attempt <= optional.length; attempt += 1) {
    const { error } = await supabase.from(table).update(payload).eq("id", id).eq("user_id", userId)
    if (!error) return null
    const next = omitUnknownColumn(payload, error.message, optional)
    if (!next) return error.message
    payload = next
  }
  return "No pudimos guardar el registro."
}

function accountWriteError(message: string) {
  if (message.includes("invalid input value for enum account_kind")) {
    return "Ese tipo de cuenta todavía no está disponible en la base. Elige Efectivo, Cuenta bancaria o Billetera digital."
  }
  if (message.includes("schema cache")) {
    return "No pudimos guardar la cuenta. Intenta de nuevo en un momento."
  }
  return message
}

function optionalAmount(raw: string | undefined) {
  const trimmed = raw?.trim() ?? ""
  if (!trimmed || trimmed === "0") return 0
  return parseAmountInput(trimmed)
}

function toPaySchedule(
  data: {
    frequency: PayScheduleInput["frequency"]
    payDay?: number
    payDay2?: number
    intervalDays?: number
    anchorDate?: string
  },
  today: string
): PayScheduleInput {
  if (data.frequency === "monthly") {
    return { frequency: "monthly", paymentDays: [data.payDay ?? 1], anchorDate: today }
  }
  if (data.frequency === "semimonthly") {
    return {
      frequency: "semimonthly",
      paymentDays: [data.payDay ?? 1, data.payDay2 ?? 15],
      anchorDate: today,
    }
  }
  return {
    frequency: "every_n_days",
    paymentDays: [],
    intervalDays: data.intervalDays,
    anchorDate: data.anchorDate || today,
  }
}

function refreshFinance() {
  revalidatePath("/app")
  revalidatePath("/app/movimientos")
  revalidatePath("/app/planeacion")
  revalidatePath("/app/cuentas")
  revalidatePath("/app/pagos")
}

async function requireOwnedId(
  table: "financial_cycles" | "financial_accounts" | "financial_categories" | "scheduled_payments",
  id: string,
  userId: string
) {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from(table).select("id").eq("id", id).eq("user_id", userId).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) {
    throw new Error("El registro no pertenece a tu cuenta.")
  }
}

export async function setActiveCycleAction(cycleId: string): Promise<ActionResult> {
  const { requireAppAccess } = await import("@/lib/auth/access")
  const access = await requireAppAccess()
  if (!access.user) return { error: "Inicia sesión." }

  const store = await cookies()
  store.set(CYCLE_COOKIE, cycleId, { path: "/", sameSite: "lax" })
  refreshFinance()
  return { success: "Ciclo seleccionado." }
}

export async function createCycleAction(input: unknown): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const parsed = cycleSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    if (parsed.data.endsOn < parsed.data.startsOn) {
      return { error: "La fecha de finalización debe ser posterior al inicio." }
    }

    const supabase = await requireSupabase()
    const userId = access.user!.id

    let sourceCycle: { id: string; starts_on: string; ends_on: string } | null = null
    if (parsed.data.duplicateFromId) {
      const source = await supabase
        .from("financial_cycles")
        .select("id, starts_on, ends_on")
        .eq("user_id", userId)
        .eq("id", parsed.data.duplicateFromId)
        .maybeSingle()
      if (source.error) return { error: source.error.message }
      if (!source.data) {
        return { error: "El ciclo a duplicar no existe o no te pertenece." }
      }
      sourceCycle = source.data
    }

    const { data, error } = await supabase
      .from("financial_cycles")
      .insert({
        user_id: userId,
        name: parsed.data.name,
        starts_on: parsed.data.startsOn,
        ends_on: parsed.data.endsOn,
        notes: parsed.data.notes || null,
        status: "open",
      })
      .select("id")
      .single()

    if (error) {
      if (error.message.includes("financial_cycles_no_overlap")) {
        return { error: "Ese rango se cruza con otro ciclo. Ajusta las fechas." }
      }
      return { error: error.message }
    }

    await supabase.rpc("seed_default_categories", { p_user_id: userId })

    if (sourceCycle) {
      const [{ data: budgets }, { data: payments }] = await Promise.all([
        supabase
          .from("financial_budgets")
          .select("category_id, planned_amount")
          .eq("user_id", userId)
          .eq("cycle_id", sourceCycle.id),
        supabase
          .from("scheduled_payments")
          .select("category_id, preferred_account_id, name, expected_amount, due_on, notes")
          .eq("user_id", userId)
          .eq("cycle_id", sourceCycle.id),
      ])

      if (budgets?.length) {
        await supabase.from("financial_budgets").insert(
          budgets.map((row) => ({
            user_id: userId,
            cycle_id: data.id,
            category_id: row.category_id,
            planned_amount: row.planned_amount,
          }))
        )
      }

      if (payments?.length) {
        await supabase.from("scheduled_payments").insert(
          payments.map((row) => ({
            user_id: userId,
            cycle_id: data.id,
            category_id: row.category_id,
            preferred_account_id: row.preferred_account_id,
            name: row.name,
            expected_amount: row.expected_amount,
            due_on: shiftDueOn({
              dueOn: row.due_on,
              sourceStartsOn: sourceCycle.starts_on,
              targetStartsOn: parsed.data.startsOn,
              targetEndsOn: parsed.data.endsOn,
            }),
            notes: row.notes,
            paid_amount: 0,
            status: "pending",
          }))
        )
      }
    }

    const store = await cookies()
    store.set(CYCLE_COOKIE, data.id, { path: "/", sameSite: "lax" })
    refreshFinance()
    return { success: "Ciclo creado.", id: data.id }
  } catch (error) {
    return actionError(error, "No pudimos crear el ciclo.")
  }
}

export async function savePayScheduleAction(input: unknown): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const parsed = payScheduleSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }

    const supabase = await requireSupabase()
    const userId = access.user!.id
    const today = calendarDateInTimeZone(access.profile?.timezone || "America/Bogota")
    const schedule = toPaySchedule(parsed.data, today)
    const periods = periodsFrom(schedule, today, 6)
    if (periods.length === 0) return { error: "No pudimos calcular los periodos con esa fecha de pago." }

    const expected = optionalAmount(parsed.data.expectedAmount)
    const accountId = parsed.data.accountId || null
    if (accountId) {
      const account = await supabase
        .from("financial_accounts")
        .select("id")
        .eq("id", accountId)
        .eq("user_id", userId)
        .maybeSingle()
      if (account.error) return { error: account.error.message }
      if (!account.data) return { error: "La cuenta no pertenece a tu usuario." }
    }

    let scheduleId: string | null = null
    const cleared = await supabase
      .from("income_schedules")
      .update({ is_primary: false })
      .eq("user_id", userId)
      .eq("is_primary", true)
    if (cleared.error && !isMissingTable(cleared.error.message, "income_schedules")) {
      return { error: cleared.error.message }
    }
    if (!cleared.error) {
      const saved = await insertRow(
        supabase,
        "income_schedules",
        {
          user_id: userId,
          name: "Fecha de pago",
          expected_amount: expected,
          frequency: schedule.frequency,
          payment_days: schedule.paymentDays,
          interval_days: schedule.intervalDays ?? null,
          anchor_date: schedule.anchorDate,
          account_id: accountId,
          is_primary: true,
          is_variable: parsed.data.variable === "true" || parsed.data.variable === "on",
          active: true,
        },
        []
      )
      if (saved.error && !isMissingTable(saved.error, "income_schedules")) return { error: saved.error }
      scheduleId = saved.id
    }

    const existing = await supabase
      .from("financial_cycles")
      .select("id, starts_on, ends_on")
      .eq("user_id", userId)
    if (existing.error) return { error: existing.error.message }
    const currentCycles = existing.data ?? []
    const fresh = cyclesToCreate(
      currentCycles.map((cycle) => ({ startsOn: cycle.starts_on, endsOn: cycle.ends_on })),
      periods
    )

    const created: { id: string; startsOn: string; endsOn: string }[] = []
    for (const period of fresh) {
      const inserted = await insertRow(
        supabase,
        "financial_cycles",
        {
          user_id: userId,
          name: period.label,
          starts_on: period.startsOn,
          ends_on: period.endsOn,
          status: "open",
          notes: "Generado con la fecha de pago. Los ciclos anteriores conservan sus fechas.",
          source_schedule_id: scheduleId,
        },
        CYCLE_OPTIONAL_COLUMNS
      )
      if (inserted.error) {
        if (inserted.error.includes("financial_cycles_no_overlap")) continue
        return { error: inserted.error }
      }
      if (inserted.id) created.push({ id: inserted.id, startsOn: period.startsOn, endsOn: period.endsOn })
    }

    await supabase.rpc("seed_default_categories", { p_user_id: userId })

    let incomeSaved = false
    if (expected > 0 && created.length > 0) {
      const category = await supabase
        .from("financial_categories")
        .select("id")
        .eq("user_id", userId)
        .eq("group_code", "income")
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle()
      const incomeCategoryId = category.data?.id
      if (!category.error && incomeCategoryId) {
        const income = await supabase.from("scheduled_incomes").insert(
          created.map((cycle) => ({
            user_id: userId,
            cycle_id: cycle.id,
            category_id: incomeCategoryId,
            preferred_account_id: accountId,
            name: "Ingreso previsto",
            expected_amount: expected,
            due_on: cycle.startsOn,
            received_amount: 0,
            status: "pending",
            notes: "Estimado. No aumenta el saldo hasta registrarlo como recibido.",
          }))
        )
        incomeSaved = !income.error
      }
    }

    const covering = [
      ...currentCycles.map((cycle) => ({ id: cycle.id, starts_on: cycle.starts_on, ends_on: cycle.ends_on })),
      ...created.map((cycle) => ({ id: cycle.id, starts_on: cycle.startsOn, ends_on: cycle.endsOn })),
    ]
    const active =
      covering.find((cycle) => cycle.starts_on <= today && cycle.ends_on >= today) ?? created[0] ?? null
    if (active) {
      const store = await cookies()
      store.set(CYCLE_COOKIE, active.id, { path: "/", sameSite: "lax" })
    }

    refreshFinance()
    if (created.length === 0) {
      return {
        success: "Conservamos los ciclos que ya tenías. Cambiar la fecha de pago no reescribe sus fechas.",
      }
    }
    return {
      success:
        incomeSaved
          ? `Quedaron ${created.length} periodos según tu fecha de pago. El ingreso estimado no entra al saldo hasta que lo registres.`
          : `Quedaron ${created.length} periodos según tu fecha de pago.`,
      id: active && "id" in active ? active.id : undefined,
    }
  } catch (error) {
    return actionError(error, "No pudimos guardar la fecha de pago.")
  }
}

export async function updateCycleAction(id: string, input: unknown): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const parsed = cycleSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()

    const { data: txs } = await supabase
      .from("financial_transactions")
      .select("occurred_on")
      .eq("user_id", access.user!.id)
      .eq("cycle_id", id)
      .eq("status", "posted")

    if (txs?.length) {
      const dates = txs.map((row) => row.occurred_on as string).sort()
      if (parsed.data.startsOn > dates[0]! || parsed.data.endsOn < dates[dates.length - 1]!) {
        return { error: "No puedes acortar el ciclo por fuera de los movimientos ya registrados." }
      }
    }

    const { error } = await supabase
      .from("financial_cycles")
      .update({
        name: parsed.data.name,
        starts_on: parsed.data.startsOn,
        ends_on: parsed.data.endsOn,
        notes: parsed.data.notes || null,
      })
      .eq("id", id)
      .eq("user_id", access.user!.id)

    if (error) return { error: error.message }
    refreshFinance()
    return { success: "Ciclo actualizado." }
  } catch (error) {
    return actionError(error, "No pudimos actualizar el ciclo.")
  }
}

export async function setCycleStatusAction(id: string, status: "open" | "closed"): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const supabase = await requireSupabase()
    const { error } = await supabase
      .from("financial_cycles")
      .update({ status })
      .eq("id", id)
      .eq("user_id", access.user!.id)
    if (error) return { error: error.message }
    refreshFinance()
    return { success: status === "closed" ? "Ciclo cerrado." : "Ciclo reabierto." }
  } catch (error) {
    return actionError(error, "No pudimos cambiar el estado del ciclo.")
  }
}

export async function upsertAccountAction(input: unknown): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const parsed = accountSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()
    const openingRaw = parsed.data.openingBalance?.trim() ?? ""
    const opening = !openingRaw || openingRaw === "0" ? 0 : parseAmountInput(openingRaw)

    const includeInTotal =
      parsed.data.includeInTotal == null
        ? true
        : parsed.data.includeInTotal === "true" || parsed.data.includeInTotal === "on"
    const visuals = {
      color: parsed.data.color || null,
      icon: parsed.data.icon || null,
      include_in_total: includeInTotal,
    }

    if (parsed.data.id) {
      const error = await updateRow(
        supabase,
        "financial_accounts",
        parsed.data.id,
        access.user!.id,
        {
          name: parsed.data.name,
          kind: parsed.data.kind,
          notes: parsed.data.notes || null,
          ...visuals,
        },
        ACCOUNT_OPTIONAL_COLUMNS
      )
      if (error) return { error: accountWriteError(error) }
      refreshFinance()
      return { success: "Cuenta actualizada." }
    }

    const inserted = await insertRow(
      supabase,
      "financial_accounts",
      {
        user_id: access.user!.id,
        name: parsed.data.name,
        kind: parsed.data.kind,
        opening_balance: opening,
        notes: parsed.data.notes || null,
        ...visuals,
      },
      ACCOUNT_OPTIONAL_COLUMNS
    )
    if (inserted.error) return { error: accountWriteError(inserted.error) }
    refreshFinance()
    return { success: "Cuenta creada." }
  } catch (error) {
    return actionError(error, "No pudimos guardar la cuenta.")
  }
}

export async function setAccountActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const supabase = await requireSupabase()
    const { error } = await supabase
      .from("financial_accounts")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("user_id", access.user!.id)
    if (error) return { error: error.message }
    refreshFinance()
    return { success: isActive ? "Cuenta reactivada." : "Cuenta desactivada." }
  } catch (error) {
    return actionError(error, "No pudimos cambiar la cuenta.")
  }
}

export async function upsertCategoryAction(input: unknown): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const parsed = categorySchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()

    if (parsed.data.id) {
      const { error } = await supabase
        .from("financial_categories")
        .update({
          name: parsed.data.name,
          group_code: parsed.data.groupCode,
          color: parsed.data.color || null,
          icon: parsed.data.icon || null,
        })
        .eq("id", parsed.data.id)
        .eq("user_id", access.user!.id)
      if (error) return { error: error.message }
      refreshFinance()
      return { success: "Categoría actualizada." }
    }

    const { error } = await supabase.from("financial_categories").insert({
      user_id: access.user!.id,
      name: parsed.data.name,
      group_code: parsed.data.groupCode,
      color: parsed.data.color || null,
      icon: parsed.data.icon || null,
    })
    if (error) return { error: error.message }
    refreshFinance()
    return { success: "Categoría creada." }
  } catch (error) {
    return actionError(error, "No pudimos guardar la categoría.")
  }
}

export async function deactivateCategoryAction(id: string): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const supabase = await requireSupabase()
    const { error } = await supabase
      .from("financial_categories")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", access.user!.id)
    if (error) return { error: error.message }
    refreshFinance()
    return { success: "Categoría desactivada. Se conserva porque puede tener movimientos." }
  } catch (error) {
    return actionError(error, "No pudimos desactivar la categoría.")
  }
}

export async function saveBudgetAction(input: unknown): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const parsed = budgetSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()
    const planned = parsed.data.plannedAmount ? toAmount(parsed.data.plannedAmount.replace(",", ".")) : 0
    await Promise.all([
      requireOwnedId("financial_cycles", parsed.data.cycleId, access.user!.id),
      requireOwnedId("financial_categories", parsed.data.categoryId, access.user!.id),
    ])

    const { error } = await supabase.from("financial_budgets").upsert(
      {
        user_id: access.user!.id,
        cycle_id: parsed.data.cycleId,
        category_id: parsed.data.categoryId,
        planned_amount: planned,
      },
      { onConflict: "cycle_id,category_id" }
    )
    if (error) return { error: error.message }
    refreshFinance()
    return { success: "Presupuesto guardado." }
  } catch (error) {
    return actionError(error, "No pudimos guardar el presupuesto.")
  }
}

export async function saveTransactionAction(input: unknown): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const parsed = transactionSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const amount = parseAmountInput(parsed.data.amount)

    if (parsed.data.kind === "transfer" && !parsed.data.counterpartyAccountId) {
      return { error: "Selecciona la cuenta destino." }
    }
    if (parsed.data.kind === "transfer" && parsed.data.counterpartyAccountId === parsed.data.accountId) {
      return { error: "La transferencia debe ocurrir entre dos cuentas distintas." }
    }

    const supabase = await requireSupabase()
    await Promise.all([
      requireOwnedId("financial_cycles", parsed.data.cycleId, access.user!.id),
      requireOwnedId("financial_accounts", parsed.data.accountId, access.user!.id),
      parsed.data.counterpartyAccountId
        ? requireOwnedId("financial_accounts", parsed.data.counterpartyAccountId, access.user!.id)
        : Promise.resolve(),
      parsed.data.categoryId
        ? requireOwnedId("financial_categories", parsed.data.categoryId, access.user!.id)
        : Promise.resolve(),
      parsed.data.scheduledPaymentId
        ? requireOwnedId("scheduled_payments", parsed.data.scheduledPaymentId, access.user!.id)
        : Promise.resolve(),
    ])

    const payload = {
      user_id: access.user!.id,
      cycle_id: parsed.data.cycleId,
      account_id: parsed.data.accountId,
      counterparty_account_id: parsed.data.kind === "transfer" ? parsed.data.counterpartyAccountId : null,
      category_id: parsed.data.kind === "transfer" ? null : parsed.data.categoryId || null,
      scheduled_payment_id: parsed.data.scheduledPaymentId || null,
      kind: parsed.data.kind,
      amount,
      occurred_on: parsed.data.occurredOn,
      description: parsed.data.description || null,
      notes: parsed.data.notes || null,
      status: "posted",
    }

    if (parsed.data.id) {
      const { error } = await supabase
        .from("financial_transactions")
        .update(payload)
        .eq("id", parsed.data.id)
        .eq("user_id", access.user!.id)
        .eq("status", "posted")
      if (error) return { error: error.message }
      refreshFinance()
      return { success: "Movimiento actualizado." }
    }

    const { error } = await supabase.from("financial_transactions").insert(payload)
    if (error) return { error: error.message }
    refreshFinance()
    return { success: "Movimiento registrado." }
  } catch (error) {
    return actionError(error, "No pudimos guardar el movimiento.")
  }
}

export async function voidTransactionAction(id: string): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const supabase = await requireSupabase()
    const { error } = await supabase
      .from("financial_transactions")
      .update({ status: "voided", voided_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", access.user!.id)
    if (error) return { error: error.message }
    refreshFinance()
    return { success: "Movimiento anulado." }
  } catch (error) {
    return actionError(error, "No pudimos anular el movimiento.")
  }
}

export async function upsertScheduledPaymentAction(input: unknown): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const parsed = scheduledPaymentSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const expected = parseAmountInput(parsed.data.expectedAmount)
    const supabase = await requireSupabase()
    await Promise.all([
      requireOwnedId("financial_cycles", parsed.data.cycleId, access.user!.id),
      parsed.data.categoryId
        ? requireOwnedId("financial_categories", parsed.data.categoryId, access.user!.id)
        : Promise.resolve(),
      parsed.data.preferredAccountId
        ? requireOwnedId("financial_accounts", parsed.data.preferredAccountId, access.user!.id)
        : Promise.resolve(),
    ])

    const payload = {
      user_id: access.user!.id,
      cycle_id: parsed.data.cycleId,
      category_id: parsed.data.categoryId || null,
      preferred_account_id: parsed.data.preferredAccountId || null,
      name: parsed.data.name,
      expected_amount: expected,
      due_on: parsed.data.dueOn,
      notes: parsed.data.notes || null,
    }

    if (parsed.data.id) {
      const { error } = await supabase
        .from("scheduled_payments")
        .update(payload)
        .eq("id", parsed.data.id)
        .eq("user_id", access.user!.id)
      if (error) return { error: error.message }
      refreshFinance()
      return { success: "Compromiso actualizado." }
    }

    const { error } = await supabase.from("scheduled_payments").insert({
      ...payload,
      paid_amount: 0,
      status: "pending",
    })
    if (error) return { error: error.message }
    refreshFinance()
    return { success: "Compromiso creado." }
  } catch (error) {
    return actionError(error, "No pudimos guardar el compromiso.")
  }
}

export async function recordScheduledPaymentAction(input: {
  scheduledPaymentId: string
  amount: string
  accountId: string
  occurredOn: string
  cycleId: string
}): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const supabase = await requireSupabase()
    const { data: payment, error } = await supabase
      .from("scheduled_payments")
      .select("id, category_id, name")
      .eq("id", input.scheduledPaymentId)
      .eq("user_id", access.user!.id)
      .maybeSingle()
    if (error) return { error: error.message }
    if (!payment) return { error: "El compromiso no existe o no te pertenece." }

    return saveTransactionAction({
      kind: "expense",
      amount: input.amount,
      occurredOn: input.occurredOn,
      accountId: input.accountId,
      cycleId: input.cycleId,
      categoryId: payment.category_id ?? "",
      scheduledPaymentId: input.scheduledPaymentId,
      description: payment.name || "Pago de compromiso",
    })
  } catch (error) {
    return actionError(error, "No pudimos registrar el pago.")
  }
}

export async function completeOnboardingAction(): Promise<ActionResult> {
  try {
    const access = await requireWritableAppAccess()
    const supabase = await requireSupabase()
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", access.user!.id)
    if (error) return { error: error.message }
    refreshFinance()
    return { success: "Listo. Ya puedes registrar tu primer movimiento." }
  } catch (error) {
    return actionError(error, "No pudimos guardar el onboarding.")
  }
}

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  try {
    const { requireAppAccess } = await import("@/lib/auth/access")
    const access = await requireAppAccess()
    const supabase = await requireSupabase()
    const { error } = await supabase
      .from("in_app_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", access.user!.id)
    if (error) return { error: error.message }
    revalidatePath("/app/notificaciones")
    revalidatePath("/app")
    return { success: "Marcada como leída." }
  } catch (error) {
    return actionError(error, "No pudimos actualizar la notificación.")
  }
}
