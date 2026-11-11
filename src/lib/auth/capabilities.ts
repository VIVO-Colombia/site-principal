import { isSuperAdminRole, type SubscriptionStatus } from "@/lib/auth/roles"
import { effectiveSubscriptionStatus } from "@/lib/billing/status"
import type { AccessContext, Subscription } from "@/types/database"

export const capabilities = [
  "manual_transactions",
  "accounts",
  "budgets",
  "scheduled_payments",
  "basic_analytics",
  "basic_export",
  "receipt_upload",
  "receipt_ocr",
  "advanced_analytics",
  "advanced_export",
] as const

export type Capability = (typeof capabilities)[number]

export const freeCapabilities: Capability[] = [
  "manual_transactions",
  "accounts",
  "budgets",
  "scheduled_payments",
  "basic_analytics",
  "basic_export",
]

export const premiumCapabilities: Capability[] = [...capabilities]

export type Entitlement = "blocked" | "free" | "premium"

export function hasLivePremium(
  subscription: Pick<Subscription, "status" | "ends_at"> | null | undefined,
  now = new Date()
) {
  const status = effectiveSubscriptionStatus(subscription, now)
  return status === "active" || status === "trialing"
}

export function resolveEntitlement(context: Pick<AccessContext, "profile" | "subscription" | "user">): Entitlement {
  if (!context.user?.emailConfirmed) return "blocked"
  if (context.profile?.account_status === "suspended") return "blocked"
  const status = effectiveSubscriptionStatus(context.subscription) as SubscriptionStatus | null
  if (status === "suspended") return "blocked"
  if (isSuperAdminRole(context.profile?.role) || hasLivePremium(context.subscription)) return "premium"
  return "free"
}

export function resolveCapabilities(context: Pick<AccessContext, "profile" | "subscription" | "user">): Capability[] {
  const entitlement = resolveEntitlement(context)
  if (entitlement === "blocked") return []
  if (entitlement === "premium") return [...premiumCapabilities]
  return [...freeCapabilities]
}

export function hasCapability(
  context: Pick<AccessContext, "profile" | "subscription" | "user">,
  capability: Capability
) {
  return resolveCapabilities(context).includes(capability)
}
