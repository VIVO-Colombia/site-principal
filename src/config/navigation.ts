import { adminRoutes, appRoutes, marketingAnchors, publicRoutes } from "@/config/routes"

export const marketingNav = [
  { href: marketingAnchors.features, label: "Funcionalidades" },
  { href: marketingAnchors.howItWorks, label: "Cómo funciona" },
  { href: publicRoutes.plans, label: "Planes" },
  { href: marketingAnchors.faq, label: "Preguntas frecuentes" },
] as const

export const footerNav = {
  product: [
    { href: publicRoutes.home, label: "Inicio" },
    { href: marketingAnchors.features, label: "Funcionalidades" },
    { href: publicRoutes.plans, label: "Planes" },
    { href: publicRoutes.login, label: "Acceso" },
  ],
  legal: [
    { href: publicRoutes.privacy, label: "Privacidad" },
    { href: publicRoutes.terms, label: "Términos y condiciones" },
    { href: publicRoutes.contact, label: "Contacto" },
  ],
} as const

export const appNav = [
  { href: appRoutes.home, label: "Inicio", icon: "home" },
  { href: appRoutes.movements, label: "Movimientos", icon: "arrowLeftRight" },
  { href: appRoutes.planning, label: "Planeación", icon: "calendarRange" },
] as const

export const appMoreNav = [
  { href: appRoutes.payments, label: "Pagos" },
  { href: appRoutes.accounts, label: "Cuentas" },
  { href: appRoutes.savings, label: "Ahorros" },
  { href: appRoutes.debts, label: "Deudas" },
  { href: appRoutes.calendar, label: "Calendario" },
  { href: appRoutes.analysis, label: "Análisis" },
  { href: appRoutes.calculators, label: "Calculadoras" },
  { href: appRoutes.notifications, label: "Notificaciones" },
  { href: appRoutes.subscription, label: "Mi suscripción" },
  { href: appRoutes.settings, label: "Configuración" },
] as const

export const appSidebarNav = [
  { href: appRoutes.home, label: "Inicio" },
  { href: appRoutes.movements, label: "Movimientos" },
  { href: appRoutes.planning, label: "Planeación" },
  { href: appRoutes.payments, label: "Pagos" },
  { href: appRoutes.accounts, label: "Cuentas" },
  { href: appRoutes.savings, label: "Ahorros" },
  { href: appRoutes.debts, label: "Deudas" },
  { href: appRoutes.calendar, label: "Calendario" },
  { href: appRoutes.analysis, label: "Análisis" },
  { href: appRoutes.calculators, label: "Calculadoras" },
] as const

export const adminNav = [
  { href: adminRoutes.home, label: "Resumen" },
  { href: adminRoutes.users, label: "Usuarios" },
  { href: adminRoutes.subscriptions, label: "Suscripciones" },
  { href: adminRoutes.requests, label: "Solicitudes" },
  { href: adminRoutes.payments, label: "Pagos" },
  { href: adminRoutes.plans, label: "Planes" },
  { href: adminRoutes.notifications, label: "Notificaciones" },
  { href: adminRoutes.audit, label: "Auditoría" },
  { href: adminRoutes.settings, label: "Configuración" },
] as const
