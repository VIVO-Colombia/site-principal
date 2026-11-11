import "server-only"

import { redirect } from "next/navigation"

import { publicRoutes } from "@/config/routes"
import {
  canReadFinancialData,
  isSuperAdminRole,
  type SubscriptionStatus,
} from "@/lib/auth/roles"
import { getAccessContext } from "@/lib/auth/session"
import type { AccessContext } from "@/types/database"

function currentStatus(context: AccessContext): SubscriptionStatus | null {
  const subscription = context.subscription
  if (!subscription) return null

  if (
    (subscription.status === "active" || subscription.status === "trialing") &&
    subscription.ends_at &&
    new Date(subscription.ends_at) < new Date()
  ) {
    return "expired"
  }

  return subscription.status
}

export function resolvePostAuthPath(context: AccessContext) {
  if (!context.configured) {
    return `${publicRoutes.login}?razon=configuracion`
  }

  if (!context.user) {
    return publicRoutes.login
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

  if (!isSuperAdminRole(context.profile?.role)) {
    redirect("/app")
  }

  return context
}
