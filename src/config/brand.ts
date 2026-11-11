export const brand = {
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME?.trim() || "VIVO Planner",
  tagline: "Ve cuánto te queda. Antes de gastarlo.",
  description:
    "Ingresos, gastos, presupuesto y pagos en un solo ciclo. Tú eliges las fechas. El sistema te dice qué puedes gastar hoy.",
  shortDescription: "Organiza ingresos, gastos y pagos. Sabe cuánto te queda, en un solo lugar.",
} as const

export const group = {
  name: "VIVO",
  legalName: "VIVO Colombia",
  title: "VIVO Colombia | Grupo Empresarial",
  tagline: "Diferentes caminos. Un mismo propósito.",
  description:
    "Conectamos soluciones de transporte, tecnología y planeación financiera para hacer más sencillo lo que realmente importa.",
  shortDescription:
    "Grupo empresarial colombiano con soluciones de transporte, software y planeación financiera.",
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

export function groupName() {
  return group.name
}
