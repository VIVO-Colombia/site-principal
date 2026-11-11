import { effectiveSubscriptionStatus } from "@/lib/billing/status"
import type { Subscription } from "@/types/database"

type SubscriptionRow = Pick<Subscription, "user_id" | "status" | "ends_at" | "created_at">

export function isLiveSubscription(subscription: Pick<Subscription, "status" | "ends_at">, now = new Date()) {
  const status = effectiveSubscriptionStatus(subscription, now)
  return status === "active" || status === "trialing"
}

export function selectCurrentSubscription<T extends SubscriptionRow>(subscriptions: T[], now = new Date()): T | null {
  if (subscriptions.length === 0) return null

  const live = subscriptions.filter((item) => isLiveSubscription(item, now))
  if (live.length > 0) {
    return (
      [...live].sort((a, b) => {
        const byEnd = (b.ends_at ?? "").localeCompare(a.ends_at ?? "")
        if (byEnd !== 0) return byEnd
        return b.created_at.localeCompare(a.created_at)
      })[0] ?? null
    )
  }

  return (
    [...subscriptions].sort((a, b) => {
      const byEnd = (b.ends_at ?? "").localeCompare(a.ends_at ?? "")
      if (byEnd !== 0) return byEnd
      return b.created_at.localeCompare(a.created_at)
    })[0] ?? null
  )
}

export function summarizeSubscriptions(subscriptions: SubscriptionRow[], now = new Date()) {
  const byUser = new Map<string, SubscriptionRow[]>()
  for (const row of subscriptions) {
    const list = byUser.get(row.user_id) ?? []
    list.push(row)
    byUser.set(row.user_id, list)
  }

  let activeSubs = 0
  let trials = 0
  let expiredSubs = 0
  let upcoming = 0
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  for (const rows of byUser.values()) {
    const current = selectCurrentSubscription(rows, now)
    if (!current) continue

    const status = effectiveSubscriptionStatus(current, now)
    if (status === "active") {
      activeSubs += 1
    } else if (status === "trialing") {
      trials += 1
    } else if (status === "expired") {
      expiredSubs += 1
    }

    if (
      (status === "active" || status === "trialing") &&
      current.ends_at &&
      new Date(current.ends_at) <= inTwoWeeks &&
      new Date(current.ends_at) >= now
    ) {
      upcoming += 1
    }
  }

  return { activeSubs, trials, expiredSubs, upcoming }
}
