"use client"

import { Turnstile } from "@marsidev/react-turnstile"

import { getTurnstileSiteKey, isTurnstileBrowserConfigured } from "@/lib/public-env"

export function TurnstileField({
  onSuccess,
}: {
  onSuccess: (token: string) => void
}) {
  if (!isTurnstileBrowserConfigured()) {
    return (
      <p className="rounded-xl border border-dashed border-[#e5eaf1] px-3 py-3 text-xs leading-5 text-[#5b6b82]">
        La verificación de seguridad (Cloudflare Turnstile) aparecerá aquí cuando se configure la
        clave pública.
      </p>
    )
  }

  return (
    <Turnstile
      siteKey={getTurnstileSiteKey()}
      onSuccess={onSuccess}
      options={{ theme: "light", size: "flexible" }}
    />
  )
}
