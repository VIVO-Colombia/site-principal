import "server-only"

import { getTurnstileSecret, isTurnstileConfigured } from "@/lib/env"

type TurnstileResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string }

export async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string | null
): Promise<TurnstileResult> {
  if (!isTurnstileConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return {
        ok: false,
        error: "La verificación de seguridad todavía no está configurada.",
      }
    }

    return { ok: true, skipped: true }
  }

  if (!token) {
    return { ok: false, error: "Completa la verificación de seguridad." }
  }

  const body = new URLSearchParams({
    secret: getTurnstileSecret(),
    response: token,
  })

  if (ip) {
    body.set("remoteip", ip)
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
    }
  )

  if (!response.ok) {
    return { ok: false, error: "No pudimos validar la verificación de seguridad." }
  }

  const data = (await response.json()) as { success?: boolean }

  if (!data.success) {
    return { ok: false, error: "La verificación de seguridad no es válida. Inténtalo de nuevo." }
  }

  return { ok: true }
}
