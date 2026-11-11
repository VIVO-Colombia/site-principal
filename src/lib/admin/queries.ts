import "server-only"

import { effectiveSubscriptionStatus } from "@/lib/billing/status"
import { requireSupabase } from "@/lib/supabase/require"
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
  const now = new Date()
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()

  const [
    users,
    enabled,
    suspended,
    expiredSubs,
    pendingRequests,
    upcoming,
    approvedPayments,
    subs,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "enabled"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("account_status", "suspended"),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "expired"),
    supabase.from("payment_requests").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "trialing"])
      .lte("ends_at", inTwoWeeks)
      .gte("ends_at", now.toISOString()),
    supabase.from("payments").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("user_id,status,ends_at"),
  ])

  const classified = new Map<string, "premium" | "trial" | "expired">()
  for (const row of (subs.data as Pick<Subscription, "user_id" | "status" | "ends_at">[] | null) ?? []) {
    const status = effectiveSubscriptionStatus(row)
    if (status === "trialing") classified.set(row.user_id, "trial")
    else if (status === "active") classified.set(row.user_id, "premium")
    else if (status === "expired" && classified.get(row.user_id) !== "premium" && classified.get(row.user_id) !== "trial") {
      classified.set(row.user_id, "expired")
    }
  }
  const premiumUsers = [...classified.values()].filter((item) => item === "premium").length
  const trialUsers = [...classified.values()].filter((item) => item === "trial").length
  const freeUsers = Math.max((enabled.count ?? 0) - premiumUsers - trialUsers, 0)

  return {
    users: users.count ?? 0,
    enabled: enabled.count ?? 0,
    suspended: suspended.count ?? 0,
    activeSubs: premiumUsers,
    expiredSubs: expiredSubs.count ?? 0,
    trials: trialUsers,
    pendingRequests: pendingRequests.count ?? 0,
    upcoming: upcoming.count ?? 0,
    approvedPayments: approvedPayments.count ?? 0,
    freeUsers,
    premiumUsers,
  }
}

export async function listAdminUsers() {
  const supabase = await requireSupabase()
  const [{ data: profiles, error: profileError }, { data: subscriptions, error: subError }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
  ])
  if (profileError) throw new Error(profileError.message)
  if (subError) throw new Error(subError.message)

  const latestByUser = new Map<string, Subscription>()
  for (const row of (subscriptions as Subscription[]) ?? []) {
    if (!latestByUser.has(row.user_id)) latestByUser.set(row.user_id, row)
  }

  return ((profiles as Profile[]) ?? []).map((profile) => ({
    profile,
    subscription: latestByUser.get(profile.id) ?? null,
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
