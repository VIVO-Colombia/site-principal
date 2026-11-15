export const TRANSPORT_WHATSAPP = {
  e164: "573137047746",
  display: "+57 313 704 7746",
  href: "https://wa.me/573137047746",
} as const

export type WhatsappQuote = {
  origin?: string
  destination?: string
  cargo?: string
  date?: string
  distance?: string
  estimate?: string
  helpers?: string
}

const BASE =
  "Hola, estoy consultando los servicios de transporte de VIVO Colombia y quisiera recibir información para cotizar un viaje."

export function transportWhatsappUrl(quote?: WhatsappQuote) {
  const lines = [BASE]
  if (quote?.origin) lines.push(`Origen: ${quote.origin}`)
  if (quote?.destination) lines.push(`Destino: ${quote.destination}`)
  if (quote?.cargo) lines.push(`Tipo de carga: ${quote.cargo}`)
  if (quote?.date) lines.push(`Fecha estimada: ${quote.date}`)
  if (quote?.distance) lines.push(`Distancia aproximada: ${quote.distance}`)
  if (quote?.estimate) lines.push(`Valor estimado: ${quote.estimate}`)
  if (quote?.helpers) lines.push(`Ayudantes: ${quote.helpers}`)
  return `${TRANSPORT_WHATSAPP.href}?text=${encodeURIComponent(lines.join("\n"))}`
}
