"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { publicRoutes } from "@/config/routes"
import { resolvePostAuthPath } from "@/lib/auth/access"
import { getAccessContext } from "@/lib/auth/session"
import { isSupabaseConfigured } from "@/lib/env"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { verifyTurnstileToken } from "@/lib/turnstile"
import {
  loginSchema,
  recoverSchema,
  registerSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth"

type ActionResult = {
  error?: string
  success?: string
}

async function clientIp() {
  const headerList = await headers()
  return (
    headerList.get("cf-connecting-ip") ||
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  )
}

function missingAuthConfig(): ActionResult {
  return {
    error:
      "La autenticación todavía no está configurada. Agrega las claves de Supabase para crear una cuenta real.",
  }
}

export async function signInAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." }
  }

  const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, await clientIp())
  if (!captcha.ok) return { error: captcha.error }

  if (!isSupabaseConfigured()) return missingAuthConfig()

  const supabase = await createServerSupabaseClient()
  if (!supabase) return missingAuthConfig()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    if (/confirm/i.test(error.message)) {
      return { error: "Confirma tu correo antes de iniciar sesión. Revisa la bandeja de entrada." }
    }
    return { error: "Correo o contraseña incorrectos." }
  }

  const context = await getAccessContext()
  redirect(resolvePostAuthPath(context))
}

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." }
  }

  const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, await clientIp())
  if (!captcha.ok) return { error: captcha.error }

  if (!isSupabaseConfigured()) return missingAuthConfig()

  const supabase = await createServerSupabaseClient()
  if (!supabase) return missingAuthConfig()

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?siguiente=${publicRoutes.activate}`,
      data: {
        full_name: parsed.data.name,
      },
    },
  })

  if (error) {
    return { error: "No pudimos crear la cuenta. Inténtalo de nuevo o usa otro correo." }
  }

  if (data.user?.identities && data.user.identities.length === 0) {
    return { error: "Este correo ya está registrado. Inicia sesión o recupera tu acceso." }
  }

  return {
    success:
      "Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión y solicitar la activación de un plan.",
  }
}

export async function recoverPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = recoverSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa el correo ingresado." }
  }

  const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, await clientIp())
  if (!captcha.ok) return { error: captcha.error }

  if (!isSupabaseConfigured()) return missingAuthConfig()

  const supabase = await createServerSupabaseClient()
  if (!supabase) return missingAuthConfig()

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?siguiente=${publicRoutes.updatePassword}`,
  })

  if (error) {
    return { error: "No pudimos enviar el correo de recuperación." }
  }

  return {
    success:
      "Si el correo está registrado, te enviaremos un enlace para restablecer la contraseña.",
  }
}

export async function updatePasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." }
  }

  if (!isSupabaseConfigured()) return missingAuthConfig()

  const supabase = await createServerSupabaseClient()
  if (!supabase) return missingAuthConfig()

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: "No pudimos actualizar la contraseña. Solicita un nuevo enlace." }
  }

  return { success: "Tu contraseña fue actualizada. Ya puedes iniciar sesión." }
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect(publicRoutes.login)
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const { profileSettingsSchema } = await import("@/lib/validations/finance")
  const parsed = profileSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." }
  }

  const supabase = await createServerSupabaseClient()
  if (!supabase) return missingAuthConfig()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Inicia sesión para actualizar tu perfil." }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      timezone: parsed.data.timezone,
    })
    .eq("id", user.id)

  if (error) return { error: "No pudimos guardar el perfil." }
  return { success: "Perfil actualizado." }
}
