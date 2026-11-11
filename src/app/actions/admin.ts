"use server"

import { revalidatePath } from "next/cache"

import { requireAdminAccess } from "@/lib/auth/access"
import { actionError, type ActionResult } from "@/lib/action-result"
import { toAmount } from "@/lib/finance/money"
import { requireSupabase } from "@/lib/supabase/require"
import {
  accountStatusSchema,
  grantTrialSchema,
  paymentMethodSchema,
  planSchema,
  reviewRequestSchema,
  subscriptionActionSchema,
} from "@/lib/validations/admin"

function refreshAdmin() {
  revalidatePath("/admin")
  revalidatePath("/admin/usuarios")
  revalidatePath("/admin/suscripciones")
  revalidatePath("/admin/solicitudes")
  revalidatePath("/admin/pagos")
  revalidatePath("/admin/planes")
  revalidatePath("/admin/auditoria")
  revalidatePath("/activar")
}

function rpcError(error: { message: string } | null): ActionResult | null {
  if (!error) return null
  return { error: error.message }
}

export async function savePlanAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAccess()
    const parsed = planSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()
    const payload = {
      code: parsed.data.code,
      name: parsed.data.name,
      description: parsed.data.description || null,
      cadence: parsed.data.cadence,
      duration_days: parsed.data.durationDays,
      price_amount: parsed.data.priceAmount ? toAmount(parsed.data.priceAmount.replace(",", ".")) : null,
      currency: parsed.data.currency,
      is_active: parsed.data.isActive,
      visible_on_landing: parsed.data.visibleOnLanding,
      sort_order: parsed.data.sortOrder,
    }

    if (parsed.data.id) {
      const { error } = await supabase.from("plans").update(payload).eq("id", parsed.data.id)
      if (error) return { error: error.message }
      refreshAdmin()
      return { success: "Plan actualizado. Las suscripciones vigentes conservan sus condiciones." }
    }

    const { error } = await supabase.from("plans").insert(payload)
    if (error) return { error: error.message }
    refreshAdmin()
    return { success: "Plan creado." }
  } catch (error) {
    return actionError(error, "No pudimos guardar el plan.")
  }
}

export async function savePaymentMethodAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAccess()
    const parsed = paymentMethodSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()
    const payload = {
      name: parsed.data.name,
      instructions: parsed.data.instructions || null,
      is_active: parsed.data.isActive,
    }
    if (parsed.data.id) {
      const { error } = await supabase.from("payment_methods").update(payload).eq("id", parsed.data.id)
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase.from("payment_methods").insert(payload)
      if (error) return { error: error.message }
    }
    refreshAdmin()
    return { success: "Medio de pago guardado." }
  } catch (error) {
    return actionError(error, "No pudimos guardar el medio de pago.")
  }
}

export async function approvePaymentRequestAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAccess()
    const parsed = reviewRequestSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()
    const { error } = await supabase.rpc("admin_approve_payment_request", {
      p_request_id: parsed.data.requestId,
      p_review_notes: parsed.data.reviewNotes || null,
    })
    const failed = rpcError(error)
    if (failed) return failed
    refreshAdmin()
    return { success: "Pago aprobado y suscripción actualizada en una sola operación." }
  } catch (error) {
    return actionError(error, "No se pudo aprobar la solicitud.")
  }
}

export async function rejectPaymentRequestAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAccess()
    const parsed = reviewRequestSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    if (!parsed.data.reviewNotes) return { error: "Indica el motivo del rechazo." }
    const supabase = await requireSupabase()
    const { error } = await supabase.rpc("admin_reject_payment_request", {
      p_request_id: parsed.data.requestId,
      p_review_notes: parsed.data.reviewNotes,
    })
    const failed = rpcError(error)
    if (failed) return failed
    refreshAdmin()
    return { success: "Solicitud rechazada." }
  } catch (error) {
    return actionError(error, "No se pudo rechazar la solicitud.")
  }
}

export async function setAccountStatusAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAccess()
    const parsed = accountStatusSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()
    const { error } = await supabase.rpc("admin_set_account_status", {
      p_user_id: parsed.data.userId,
      p_status: parsed.data.status,
      p_reason: parsed.data.reason,
    })
    const failed = rpcError(error)
    if (failed) return failed
    refreshAdmin()
    return { success: parsed.data.status === "suspended" ? "Cuenta suspendida." : "Cuenta reactivada." }
  } catch (error) {
    return actionError(error, "No se pudo actualizar la cuenta.")
  }
}

export async function grantTrialAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAccess()
    const parsed = grantTrialSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()
    const { error } = await supabase.rpc("admin_grant_trial", {
      p_user_id: parsed.data.userId,
      p_plan_id: parsed.data.planId,
      p_starts_at: new Date(parsed.data.startsAt).toISOString(),
      p_ends_at: new Date(parsed.data.endsAt).toISOString(),
      p_reason: parsed.data.reason,
    })
    const failed = rpcError(error)
    if (failed) return failed
    refreshAdmin()
    return { success: "Prueba gratuita concedida." }
  } catch (error) {
    return actionError(error, "No se pudo conceder la prueba.")
  }
}

export async function setSubscriptionStatusAction(
  input: unknown,
  status: "active" | "suspended" | "cancelled" | "expired"
): Promise<ActionResult> {
  try {
    await requireAdminAccess()
    const parsed = subscriptionActionSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    const supabase = await requireSupabase()
    const { error } = await supabase.rpc("admin_set_subscription_status", {
      p_subscription_id: parsed.data.subscriptionId,
      p_status: status,
      p_reason: parsed.data.reason,
    })
    const failed = rpcError(error)
    if (failed) return failed
    refreshAdmin()
    return { success: "Suscripción actualizada." }
  } catch (error) {
    return actionError(error, "No se pudo actualizar la suscripción.")
  }
}

export async function extendSubscriptionAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminAccess()
    const parsed = subscriptionActionSchema.safeParse(input)
    if (!parsed.success) return { error: parsed.error.issues[0]?.message }
    if (!parsed.data.days) return { error: "Indica los días de extensión." }
    const supabase = await requireSupabase()
    const { error } = await supabase.rpc("admin_extend_subscription", {
      p_subscription_id: parsed.data.subscriptionId,
      p_days: parsed.data.days,
      p_reason: parsed.data.reason,
    })
    const failed = rpcError(error)
    if (failed) return failed
    refreshAdmin()
    return { success: "Suscripción extendida." }
  } catch (error) {
    return actionError(error, "No se pudo extender la suscripción.")
  }
}
