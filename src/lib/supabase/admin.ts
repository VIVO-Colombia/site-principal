import "server-only"

import { createClient } from "@supabase/supabase-js"

import { isSupabaseConfigured } from "@/lib/env"

export function createServiceSupabaseClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!isSupabaseConfigured() || !key) return null

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
