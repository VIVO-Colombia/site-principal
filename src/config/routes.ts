export const publicRoutes = {
  home: "/",
  plans: "/planes",
  login: "/acceso",
  register: "/registro",
  recoverPassword: "/recuperar-contrasena",
  updatePassword: "/actualizar-contrasena",
  activate: "/activar",
  privacy: "/privacidad",
  terms: "/terminos",
  contact: "/contacto",
} as const

export const appRoutes = {
  home: "/app",
  movements: "/app/movimientos",
  planning: "/app/planeacion",
  payments: "/app/pagos",
  accounts: "/app/cuentas",
  savings: "/app/ahorros",
  debts: "/app/deudas",
  calendar: "/app/calendario",
  analysis: "/app/analisis",
  calculators: "/app/calculadoras",
  notifications: "/app/notificaciones",
  subscription: "/app/mi-suscripcion",
  settings: "/app/configuracion",
} as const

export const adminRoutes = {
  home: "/admin",
  users: "/admin/usuarios",
  subscriptions: "/admin/suscripciones",
  requests: "/admin/solicitudes",
  payments: "/admin/pagos",
  plans: "/admin/planes",
  notifications: "/admin/notificaciones",
  audit: "/admin/auditoria",
  settings: "/admin/configuracion",
} as const

export const marketingAnchors = {
  features: "/#funcionalidades",
  howItWorks: "/#como-funciona",
  faq: "/#preguntas-frecuentes",
  privacy: "/#privacidad",
  mobile: "/#celular",
  control: "/#control",
} as const

export function isAppPath(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/")
}

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/")
}

export function isAuthPath(pathname: string) {
  return (
    pathname === publicRoutes.login ||
    pathname === publicRoutes.register ||
    pathname === publicRoutes.recoverPassword
  )
}
