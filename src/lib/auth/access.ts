import "server-only"

import { redirect } from "next/navigation"

import { publicRoutes } from "@/config/routes"
import { hasCapability, resolveEntitlement, type Capability } from "@/lib/auth/capabilities"
import { isSuperAdminRole, type SubscriptionStatus } from "@/lib/auth/roles"
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

  if (resolveEntitlement(context) === "blocked") {
    return publicRoutes.activate
  }

  return "/app"
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

  if (resolveEntitlement(context) === "blocked") {
    redirect(`${publicRoutes.activate}?estado=suspendida`)
  }

  return {
    ...context,
    status: currentStatus(context),
    entitlement: resolveEntitlement(context),
    readOnly: false,
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
    throw new Error("Tu cuenta no puede modificar registros en este momento.")
  }
  return access
}

export async function requireCapability(capability: Capability) {
  const access = await requireWritableAppAccess()
  if (!hasCapability(access, capability)) {
    throw new Error("Esta función forma parte de Premium.")
  }
  return access
}
