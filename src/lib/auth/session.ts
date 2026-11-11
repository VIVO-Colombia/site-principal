import "server-only"

import { connection } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/env"
import type { AccessContext, Profile, Subscription } from "@/types/database"

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

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: (profile as Profile | null) ?? {
      id: user.id,
      full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
      role: "user",
      created_at: user.created_at,
      updated_at: user.created_at,
    },
    subscription: (subscription as Subscription | null) ?? null,
    configured: true,
  }
}
