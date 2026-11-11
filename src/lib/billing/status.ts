import type { SubscriptionStatus } from "@/lib/auth/roles"
import type { AccessContext, Subscription } from "@/types/database"

export function effectiveSubscriptionStatus(
  subscription: Pick<Subscription, "status" | "ends_at"> | null | undefined,
  now = new Date()
): SubscriptionStatus | null {
  if (!subscription) return null

  if (
    (subscription.status === "active" || subscription.status === "trialing") &&
    subscription.ends_at &&
    new Date(subscription.ends_at) < now
  ) {
    return "expired"
  }

  return subscription.status
}

export function nextRenewalStart(subscription: Pick<Subscription, "status" | "ends_at"> | null, now = new Date()) {
  const status = effectiveSubscriptionStatus(subscription, now)
  if (subscription?.ends_at && (status === "active" || status === "trialing")) {
    return new Date(subscription.ends_at)
  }
  return now
}

export function accessStateLabel(context: AccessContext) {
  if (!context.user) return "Sin sesión"
  if (!context.user.emailConfirmed) return "Correo sin confirmar"
  if (context.profile?.account_status === "suspended") return "Cuenta suspendida"
  if (context.profile?.role === "super_admin") return "Super Admin"

  const status = effectiveSubscriptionStatus(context.subscription)
  switch (status) {
    case "active":
      return "Suscripción activa"
    case "trialing":
      return "Prueba gratuita autorizada"
    case "expired":
      return "Suscripción vencida"
    case "suspended":
      return "Suscripción suspendida"
    case "cancelled":
      return "Suscripción cancelada"
    default:
      return "Cuenta sin suscripción"
  }
}
