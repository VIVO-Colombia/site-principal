const POPAYAN = "popayan"
const CALI = "cali"

export type OriginCity = typeof POPAYAN | typeof CALI

export function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
}

export function detectOriginCity(label: string): OriginCity | null {
  const text = fold(label)
  if (text.includes("popayan")) return POPAYAN
  if (/\bcali\b/.test(text) || text.includes("santiago de cali")) return CALI
  return null
}

export function destinationAllowed(origin: OriginCity, destinationLabel: string) {
  const text = fold(destinationLabel)
  if (!text || text.length < 2) return false
  if (text.includes("colombia") && text.split(",").length < 2 && !text.includes("popayan") && !text.includes("cali")) {
    return false
  }
  return true
}

export function sameCity(origin: OriginCity, destinationLabel: string) {
  const city = detectOriginCity(destinationLabel)
  return city === origin
}
