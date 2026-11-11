import "server-only"

import { connection } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/env"
import { effectiveSubscriptionStatus } from "@/lib/billing/status"
import type { AccessContext, Profile, Subscription } from "@/types/database"

function fallbackProfile(user: { id: string; email?: string; created_at: string; user_metadata: Record<string, unknown> }): Profile {
  return {
    id: user.id,
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    email: user.email ?? null,
    role: "user",
    account_status: "enabled",
    timezone: "America/Bogota",
    onboarding_completed_at: null,
    created_at: user.created_at,
    updated_at: user.created_at,
  }
}

function pickCurrentSubscription(rows: Subscription[]): Subscription | null {
  if (rows.length === 0) return null

  const live = rows.find((row) => {
    const status = effectiveSubscriptionStatus(row)
    return status === "active" || status === "trialing"
  })
  if (live) return live

  const expired = rows.find((row) => effectiveSubscriptionStatus(row) === "expired" || row.status === "expired")
  if (expired) return expired

  return rows[0] ?? null
}

export async function getAccessContext(): Promise<AccessContext> {
  await connection()

  if (!isSupabaseConfigured()) {
    return {
      user: null,
      profile: null,
      subscription: null,
      configured: false,
    }
  }

  const supabase = await createServerSupabaseClient()
  if (!supabase) {
    return {
      user: null,
      profile: null,
      subscription: null,
      configured: false,
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      profile: null,
      subscription: null,
      configured: true,
    }
  }

  const [{ data: profile }, { data: subscriptions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ])

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      emailConfirmed: Boolean(user.email_confirmed_at),
    },
    profile: (profile as Profile | null) ?? fallbackProfile(user),
    subscription: pickCurrentSubscription((subscriptions as Subscription[] | null) ?? []),
    configured: true,
  }
}
