export const userRoles = ["user", "super_admin"] as const

export type UserRole = (typeof userRoles)[number]

export const subscriptionStatuses = [
  "pending",
  "active",
  "trialing",
  "expired",
  "suspended",
  "cancelled",
] as const

export type SubscriptionStatus = (typeof subscriptionStatuses)[number]

export function isSuperAdminRole(role: string | null | undefined) {
  return role === "super_admin"
}

export function canWriteFinancialData(status: SubscriptionStatus | null) {
  return status !== "suspended"
}

export function canReadFinancialData(status: SubscriptionStatus | null) {
  return status !== "suspended"
}
