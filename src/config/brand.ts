export const brand = {
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME?.trim() || "Planeador",
  tagline: "Tu dinero, más claro cada día.",
  description:
    "Organiza tus ingresos, controla tus gastos y anticipa tus pagos desde un solo lugar. Planea mejor cada mes, sin depender de hojas de cálculo.",
  shortDescription:
    "Organiza ingresos, gastos, presupuestos y pagos desde un solo lugar.",
} as const

export const site = {
  get url() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  },
  locale: "es_CO",
  lang: "es",
} as const

export function productName() {
  return brand.name
}
