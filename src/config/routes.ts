export const publicRoutes = {
  home: "/",
  transport: "/transporte",
  software: "/software",
  planner: "/planner",
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
  commercial: "/admin/comercial",
} as const

export const marketingAnchors = {
  features: "/planner#funcionalidades",
  howItWorks: "/planner#como-funciona",
  faq: "/planner#preguntas-frecuentes",
  privacy: "/planner#privacidad",
  mobile: "/planner#celular",
  control: "/planner#control",
  ecosystem: "/#ecosistema",
  about: "/#vivo",
  brand: "/#marca",
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

export function isPlannerMarketingPath(pathname: string) {
  return (
    pathname === publicRoutes.planner ||
    pathname.startsWith(`${publicRoutes.planner}/`) ||
    pathname === publicRoutes.plans
  )
}
