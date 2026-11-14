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
  title: "VIVO Colombia | Transporte, software y finanzas",
  tagline: "Hacemos que las cosas avancen.",
  description:
    "Movemos carga, simplificamos la logística con tecnología y te ayudamos a tomar el control de tus finanzas.",
  shortDescription:
    "Tres soluciones colombianas con una misma visión: transporte de carga, gestión documental y planeación financiera.",
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
