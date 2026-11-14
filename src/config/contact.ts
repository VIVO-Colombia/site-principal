function clean(value: string | undefined) {
  const text = value?.trim() ?? ""
  return text.length > 0 ? text : null
}

/** Public contact channels. Empty values stay unpublished. */
export function publicContact() {
  const email = clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL)
  const whatsappRaw = clean(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP)?.replace(/[^\d]/g, "") ?? ""
  const whatsapp = whatsappRaw.length >= 10 ? whatsappRaw : null

  return { email, whatsapp }
}
