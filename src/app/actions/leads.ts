"use server"

import { headers } from "next/headers"

import { getLeadWebhookUrl, isLeadChannelConfigured } from "@/lib/env"
import { createServiceSupabaseClient } from "@/lib/supabase/admin"
import { verifyTurnstileToken } from "@/lib/turnstile"
import { leadSchema, type LeadInput } from "@/lib/validations/leads"

type LeadResult = {
  error?: string
  success?: string
}

const recent = new Map<string, number>()

async function clientIp() {
  const headerList = await headers()
  return (
    headerList.get("cf-connecting-ip") ||
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  )
}

function tooSoon(email: string) {
  const now = Date.now()
  const previous = recent.get(email)
  if (previous && now - previous < 60_000) return true
  recent.set(email, now)
  if (recent.size > 500) {
    for (const [key, at] of recent) {
      if (now - at > 60_000) recent.delete(key)
    }
  }
  return false
}

function rowFrom(lead: LeadInput) {
  return {
    kind: lead.kind,
    name: lead.name,
    company: lead.company || null,
    email: lead.email,
    phone: lead.phone,
    origin_city: lead.kind === "quote" ? lead.originCity : null,
    destination_city: lead.kind === "quote" ? lead.destinationCity : null,
    cargo_type: lead.kind === "quote" ? lead.cargoType : null,
    weight_volume: lead.kind === "quote" ? lead.weightVolume || null : null,
    estimated_date: lead.kind === "quote" && lead.estimatedDate ? lead.estimatedDate : null,
    message: lead.kind === "quote" ? lead.message || null : [lead.topic, lead.message].filter(Boolean).join(" — ") || null,
  }
}

export async function submitLeadAction(input: unknown): Promise<LeadResult> {
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." }
  }

  if (parsed.data.companyUrl) {
    return { success: "Recibimos tu solicitud." }
  }

  if (!isLeadChannelConfigured()) {
    return {
      error: "El canal de solicitudes todavía no está configurado. No enviamos los datos a ningún destino.",
    }
  }

  const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, await clientIp())
  if (!captcha.ok) return { error: captcha.error }

  const email = parsed.data.email.toLowerCase()
  if (tooSoon(email)) {
    return { error: "Ya recibimos una solicitud con este correo. Espera un minuto e inténtalo de nuevo." }
  }

  const row = rowFrom(parsed.data)
  let stored = false
  let forwarded = false

  const supabase = createServiceSupabaseClient()
  if (supabase) {
    const { error } = await supabase.from("commercial_leads").insert(row)
    if (!error) stored = true
  }

  const webhook = getLeadWebhookUrl()
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...row, receivedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      })
      forwarded = response.ok
    } catch {
      forwarded = false
    }
  }

  if (!stored && !forwarded) {
    return {
      error:
        "No pudimos registrar la solicitud. Revisa la configuración del almacenamiento o inténtalo más tarde.",
    }
  }

  if (parsed.data.kind === "quote") {
    return {
      success:
        "Recibimos la cotización. La revisaremos con la información que enviaste. Este mensaje confirma la recepción, no un servicio ya acordado.",
    }
  }

  if (parsed.data.kind === "software") {
    return {
      success:
        "Recibimos tu solicitud de información sobre VIVO Software. Te contactaremos por los datos que dejaste cuando podamos darte una respuesta.",
    }
  }

  return { success: "Recibimos tu mensaje. Te responderemos por el correo o el teléfono que indicaste." }
}
