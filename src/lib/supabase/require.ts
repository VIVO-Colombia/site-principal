import "server-only"

import { connection } from "next/server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function requireSupabase() {
  await connection()
  const supabase = await createServerSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase todavía no está configurado.")
  }
  return supabase
}
