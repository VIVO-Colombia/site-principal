import "server-only"

import { selectCurrentSubscription, summarizeSubscriptions } from "@/lib/admin/metrics"
import { requireSupabase } from "@/lib/supabase/require"

const PAGE_SIZE = 1000

async function fetchAll<T>(table: string, columns: string): Promise<T[]> {
  const supabase = await requireSupabase()
  const rows: T[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    const chunk = (data as T[]) ?? []
    rows.push(...chunk)
    if (chunk.length < PAGE_SIZE) break
    from += chunk.length
  }

  return rows
}
import type {
  AuditLog,
  Payment,
  PaymentMethod,
  PaymentRequest,
  Plan,
  Profile,
  Subscription,
} from "@/types/database"

export async function listPlans(includeHidden = false) {
  const supabase = await requireSupabase()
  let query = supabase.from("plans").select("*").order("sort_order", { ascending: true })
  if (!includeHidden) {
    query = query.eq("is_active", true).eq("visible_on_landing", true)
  }
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as Plan[]) ?? []
}

export async function listPaymentMethods(includeInactive = false) {
  const supabase = await requireSupabase()
  let query = supabase.from("payment_methods").select("*").order("sort_order")
  if (!includeInactive) query = query.eq("is_active", true)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as PaymentMethod[]) ?? []
}

export async function getAdminMetrics() {
  const supabase = await requireSupabase()

  const [users, enabled, suspended, subscriptions, pendingRequests, approvedPayments] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "enabled"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "suspended"),
    fetchAll<Pick<Subscription, "user_id" | "status" | "ends_at" | "created_at">>(
      "subscriptions",
      "user_id, status, ends_at, created_at"
    ),
    supabase.from("payment_requests").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("payments").select("id", { count: "exact", head: true }),
  ])

  const totals = summarizeSubscriptions(subscriptions)

  return {
    users: users.count ?? 0,
    enabled: enabled.count ?? 0,
    suspended: suspended.count ?? 0,
    activeSubs: totals.activeSubs,
    expiredSubs: totals.expiredSubs,
    trials: totals.trials,
    pendingRequests: pendingRequests.count ?? 0,
    upcoming: totals.upcoming,
    approvedPayments: approvedPayments.count ?? 0,
  }
}

export async function listAdminUsers() {
  const [profiles, subscriptions] = await Promise.all([
    fetchAll<Profile>("profiles", "*"),
    fetchAll<Subscription>("subscriptions", "*"),
  ])

  const byUser = new Map<string, Subscription[]>()
  for (const row of subscriptions) {
    const list = byUser.get(row.user_id) ?? []
    list.push(row)
    byUser.set(row.user_id, list)
  }

  return [...profiles]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((profile) => ({
      profile,
      subscription: selectCurrentSubscription(byUser.get(profile.id) ?? []) ?? null,
    }))
}

export async function getAdminUser(userId: string) {
  const supabase = await requireSupabase()
  const [profile, subscriptions, requests, payments] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("payment_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ])
  if (profile.error) throw new Error(profile.error.message)
  return {
    profile: (profile.data as Profile | null) ?? null,
    subscriptions: (subscriptions.data as Subscription[]) ?? [],
    requests: (requests.data as PaymentRequest[]) ?? [],
    payments: (payments.data as Payment[]) ?? [],
  }
}

export async function listPaymentRequests(status?: string) {
  const supabase = await requireSupabase()
  let query = supabase.from("payment_requests").select("*").order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as PaymentRequest[]) ?? []
}

export async function listSubscriptions() {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Subscription[]) ?? []
}

export async function listPayments() {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Payment[]) ?? []
}

export async function listAuditLogs() {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) throw new Error(error.message)
  return (data as AuditLog[]) ?? []
}
