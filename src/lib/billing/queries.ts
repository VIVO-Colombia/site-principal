import "server-only"

import { requireSupabase } from "@/lib/supabase/require"
import type { PaymentRequest, Plan, Subscription } from "@/types/database"

export async function listUserSubscriptions(userId: string) {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Subscription[]) ?? []
}

export async function listUserPaymentRequests(userId: string) {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as PaymentRequest[]) ?? []
}

export async function listSelectablePlans() {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
  if (error) throw new Error(error.message)
  return (data as Plan[]) ?? []
}
