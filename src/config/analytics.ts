/** Commercial events. Properties stay categorical: never send money, documents or credentials. */
export const analyticsEvents = {
  transportClick: "clic_transporte",
  softwareClick: "clic_software",
  plannerClick: "clic_planner",
  quoteStart: "inicio_cotizacion",
  quoteSent: "cotizacion_enviada",
  infoRequest: "solicitud_informacion",
  contactSent: "contacto_enviado",
  signupClick: "clic_crear_cuenta",
  signupComplete: "registro_completado",
  plansView: "visita_planes",
  premiumRequest: "solicitud_premium",
} as const

export type AnalyticsEvent = (typeof analyticsEvents)[keyof typeof analyticsEvents]
