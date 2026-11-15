"use server"

import { headers } from "next/headers"

import { getLeadWebhookUrl, isWeb3FormsConfigured } from "@/lib/env"
import { commercialMail } from "@/lib/transport/mail"
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
    message:
      lead.kind === "quote"
        ? [lead.message, lead.pendingNotes, lead.estimateLabel].filter(Boolean).join("\n") || null
        : [lead.topic, lead.message].filter(Boolean).join(" — ") || null,
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

  if (!isWeb3FormsConfigured()) {
    return {
      error:
        "El formulario no está configurado: falta WEB3FORMS_ACCESS_KEY. No enviamos la solicitud ni simulamos el éxito.",
    }
  }

  const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, await clientIp())
  if (!captcha.ok) return { error: captcha.error }

  const email = parsed.data.email.toLowerCase()
  if (tooSoon(email)) {
    return { error: "Ya recibimos una solicitud con este correo. Espera un minuto e inténtalo de nuevo." }
  }

  const row = rowFrom(parsed.data)
  const mail = commercialMail(parsed.data)
  const formData = new FormData()
  formData.append("access_key", process.env.WEB3FORMS_ACCESS_KEY!.trim())
  formData.append("subject", mail.subject)
  formData.append("from_name", "VIVO Colombia")
  formData.append("name", parsed.data.name)
  formData.append("email", parsed.data.email)
  formData.append("phone", parsed.data.phone)
  formData.append("message", mail.body)
  formData.append("botcheck", "")

  let delivered = false
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(12000),
    })
    const data = (await response.json()) as { success?: boolean }
    delivered = response.ok && data.success === true
  } catch {
    delivered = false
  }

  if (!delivered) {
    return {
      error: "Web3Forms no confirmó la recepción. Revisa la conexión e inténtalo de nuevo.",
    }
  }

  const supabase = createServiceSupabaseClient()
  if (supabase) {
    await supabase.from("commercial_leads").insert(row)
  }

  const webhook = getLeadWebhookUrl()
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...row, receivedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      })
    } catch {
      /* la confirmación ya la dio Web3Forms */
    }
  }

  if (parsed.data.kind === "quote") {
    return {
      success:
        "Recibimos tu solicitud. Nuestro equipo revisará la información para confirmar las condiciones y el valor del servicio.",
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
