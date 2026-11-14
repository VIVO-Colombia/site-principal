import "server-only"

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && anon && url.startsWith("http") && anon.length > 20)
}

export function getSupabasePublicConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  }
}

export function getTurnstileSecret() {
  return process.env.TURNSTILE_SECRET_KEY ?? ""
}

export function isTurnstileConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY
  )
}

export function getLeadWebhookUrl() {
  const url = process.env.LEAD_WEBHOOK_URL?.trim() ?? ""
  if (!url.startsWith("https://")) return ""
  return url
}

export function isLeadChannelConfigured() {
  const hasServiceRole = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http")
  )
  const hasDestination = hasServiceRole || Boolean(getLeadWebhookUrl())
  if (!hasDestination) return false
  if (process.env.NODE_ENV === "production" && !isTurnstileConfigured()) return false
  return true
}
