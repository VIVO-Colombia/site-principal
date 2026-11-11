import "server-only"

import { redirect } from "next/navigation"

import { publicRoutes } from "@/config/routes"
import {
  canReadFinancialData,
  isSuperAdminRole,
  type SubscriptionStatus,
} from "@/lib/auth/roles"
import { getAccessContext } from "@/lib/auth/session"
import { effectiveSubscriptionStatus } from "@/lib/billing/status"
import type { AccessContext } from "@/types/database"

export function currentStatus(context: AccessContext): SubscriptionStatus | null {
  return effectiveSubscriptionStatus(context.subscription)
}

export function resolvePostAuthPath(context: AccessContext) {
  if (!context.configured) {
    return `${publicRoutes.login}?razon=configuracion`
  }

  if (!context.user) {
    return publicRoutes.login
  }

  if (!context.user.emailConfirmed) {
    return `${publicRoutes.activate}?estado=correo`
  }

  if (context.profile?.account_status === "suspended") {
    return `${publicRoutes.activate}?estado=suspendida`
  }

  if (isSuperAdminRole(context.profile?.role)) {
    return "/admin"
  }

  const status = currentStatus(context)

  if (!status || status === "pending" || status === "cancelled" || status === "suspended") {
    return publicRoutes.activate
  }

  if (canReadFinancialData(status)) {
    return "/app"
  }

  return publicRoutes.activate
}

export async function requireUser() {
  const context = await getAccessContext()

  if (!context.configured) {
    redirect(`${publicRoutes.login}?razon=configuracion`)
  }

  if (!context.user) {
    redirect(publicRoutes.login)
  }

  return context
}

export async function requireAppAccess() {
  const context = await requireUser()

  if (!context.user?.emailConfirmed) {
    redirect(`${publicRoutes.activate}?estado=correo`)
  }

  if (context.profile?.account_status === "suspended") {
    redirect(`${publicRoutes.activate}?estado=suspendida`)
  }

  if (isSuperAdminRole(context.profile?.role)) {
    return { ...context, readOnly: false, status: currentStatus(context) }
  }

  const status = currentStatus(context)

  if (!status || status === "pending" || status === "cancelled" || status === "suspended") {
    redirect(publicRoutes.activate)
  }

  return {
    ...context,
    status,
    readOnly: status === "expired",
  }
}

export async function requireAdminAccess() {
  const context = await requireUser()

  if (context.profile?.account_status === "suspended") {
    redirect(`${publicRoutes.activate}?estado=suspendida`)
  }

  if (!isSuperAdminRole(context.profile?.role)) {
    redirect("/app")
  }

  return context
}

export async function requireWritableAppAccess() {
  const access = await requireAppAccess()
  if (access.readOnly) {
    throw new Error("Tu suscripción vencida permite consultar, pero no crear ni modificar registros.")
  }
  return access
}
