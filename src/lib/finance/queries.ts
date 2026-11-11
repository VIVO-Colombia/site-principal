import "server-only"

import { cookies } from "next/headers"

import { requireSupabase } from "@/lib/supabase/require"
import type {
  FinancialAccount,
  FinancialBudget,
  FinancialCategory,
  FinancialCycle,
  FinancialTransaction,
  InAppNotification,
  ScheduledPayment,
} from "@/types/database"

export const CYCLE_COOKIE = "planeador.cycle"

export async function getPreferredCycleId() {
  const store = await cookies()
  return store.get(CYCLE_COOKIE)?.value ?? null
}

export async function listCycles(userId: string) {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("financial_cycles")
    .select("*")
    .eq("user_id", userId)
    .order("starts_on", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as FinancialCycle[]) ?? []
}

export function resolveActiveCycle(cycles: FinancialCycle[], preferredId: string | null) {
  if (preferredId) {
    const match = cycles.find((cycle) => cycle.id === preferredId)
    if (match) return match
  }
  const today = new Date().toISOString().slice(0, 10)
  return (
    cycles.find((cycle) => cycle.status === "open" && cycle.starts_on <= today && cycle.ends_on >= today) ??
    cycles.find((cycle) => cycle.status === "open") ??
    cycles[0] ??
    null
  )
}

export async function listAccounts(userId: string) {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("financial_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data as FinancialAccount[]) ?? []
}

export async function listCategories(userId: string) {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("financial_categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
  if (error) throw new Error(error.message)
  return (data as FinancialCategory[]) ?? []
}

export async function listBudgets(userId: string, cycleId: string) {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("financial_budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("cycle_id", cycleId)
  if (error) throw new Error(error.message)
  return (data as FinancialBudget[]) ?? []
}

export async function listTransactions(
  userId: string,
  filters: {
    cycleId?: string
    accountId?: string
    categoryId?: string
    kind?: string
    from?: string
    to?: string
    limit?: number
  } = {}
) {
  const supabase = await requireSupabase()
  let query = supabase
    .from("financial_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })

  if (filters.cycleId) query = query.eq("cycle_id", filters.cycleId)
  if (filters.accountId) query = query.eq("account_id", filters.accountId)
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId)
  if (filters.kind) query = query.eq("kind", filters.kind)
  if (filters.from) query = query.gte("occurred_on", filters.from)
  if (filters.to) query = query.lte("occurred_on", filters.to)
  if (filters.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as FinancialTransaction[]) ?? []
}

export async function listScheduledPayments(userId: string, cycleId?: string) {
  const supabase = await requireSupabase()
  let query = supabase
    .from("scheduled_payments")
    .select("*")
    .eq("user_id", userId)
    .order("due_on", { ascending: true })
  if (cycleId) query = query.eq("cycle_id", cycleId)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as ScheduledPayment[]) ?? []
}

export async function listNotifications(userId: string) {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("in_app_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40)
  if (error) throw new Error(error.message)
  return (data as InAppNotification[]) ?? []
}

export const TRANSACTION_PAGE_SIZE = 1000

export async function listAllTransactions(userId: string) {
  const rows: FinancialTransaction[] = []
  let from = 0

  while (true) {
    const supabase = await requireSupabase()
    const to = from + TRANSACTION_PAGE_SIZE - 1
    const { data, error } = await supabase
      .from("financial_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to)
    if (error) throw new Error(error.message)
    const page = (data as FinancialTransaction[]) ?? []
    rows.push(...page)
    if (page.length < TRANSACTION_PAGE_SIZE) break
    from += TRANSACTION_PAGE_SIZE
  }

  return rows
}

export async function getFinanceBootstrap(userId: string) {
  const [cycles, accounts, categories, notifications, preferredCycleId, ledgerTransactions] = await Promise.all([
    listCycles(userId),
    listAccounts(userId),
    listCategories(userId),
    listNotifications(userId),
    getPreferredCycleId(),
    listAllTransactions(userId),
  ])
  const cycle = resolveActiveCycle(cycles, preferredCycleId)
  const [budgets, scheduledPayments] = cycle
    ? await Promise.all([listBudgets(userId, cycle.id), listScheduledPayments(userId, cycle.id)])
    : [[], []]

  const transactions = cycle
    ? ledgerTransactions.filter((item) => item.cycle_id === cycle.id)
    : []

  return {
    cycles,
    cycle,
    accounts,
    categories,
    budgets,
    transactions,
    ledgerTransactions,
    scheduledPayments,
    notifications,
    unreadNotifications: notifications.filter((item) => !item.read_at).length,
  }
}
