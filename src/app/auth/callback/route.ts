import { NextResponse } from "next/server"

import { publicRoutes } from "@/config/routes"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("siguiente") ?? publicRoutes.activate

  if (!code) {
    return NextResponse.redirect(`${origin}${publicRoutes.login}?razon=enlace`)
  }

  const supabase = await createServerSupabaseClient()
  if (!supabase) {
    return NextResponse.redirect(`${origin}${publicRoutes.login}?razon=configuracion`)
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}${publicRoutes.login}?razon=enlace`)
  }

  const safeNext = next.startsWith("/") ? next : publicRoutes.activate
  return NextResponse.redirect(`${origin}${safeNext}`)
}
