export const brand = {
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME?.trim() || "VIVO Planner",
  tagline: "Que tu dinero tenga un plan.",
  description:
    "Organiza tus ingresos, controla tus gastos y descubre cuánto puedes gastar sin perder de vista tus próximos pagos.",
  shortDescription:
    "Planeación financiera personal para ver el dinero disponible y anticipar obligaciones.",
} as const

export const group = {
  name: "VIVO",
  legalName: "VIVO Colombia",
  title: "VIVO Colombia | Transporte y soluciones de software",
  tagline: "Movemos negocios. Creamos soluciones.",
  description:
    "Transporte que conecta oportunidades. Tecnología que simplifica procesos y transforma la manera de trabajar y vivir.",
  shortDescription:
    "Dos divisiones: transporte terrestre de carga y soluciones de software para empresas y personas.",
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
