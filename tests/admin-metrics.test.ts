import { describe, expect, it } from "vitest"

import { selectCurrentSubscription, summarizeSubscriptions } from "../src/lib/admin/metrics"
import type { Subscription } from "../src/types/database"

function sub(partial: Partial<Subscription> & Pick<Subscription, "id" | "user_id" | "status">): Subscription {
  return {
    plan_id: "p1",
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2026-02-01T00:00:00Z",
    source: "manual",
    plan_name_snapshot: "Mensual",
    duration_days_snapshot: 30,
    price_amount_snapshot: null,
    currency_snapshot: "COP",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...partial,
  }
}

const now = new Date("2026-06-01T00:00:00Z")

describe("admin subscription indicators", () => {
  it("treats an active row past ends_at as expired, not live", () => {
    const rows = [
      sub({
        id: "s1",
        user_id: "u1",
        status: "active",
        ends_at: "2026-01-15T00:00:00Z",
      }),
      sub({
        id: "s2",
        user_id: "u2",
        status: "active",
        ends_at: "2026-12-01T00:00:00Z",
      }),
      sub({
        id: "s3",
        user_id: "u3",
        status: "trialing",
        ends_at: "2026-06-10T00:00:00Z",
      }),
      sub({
        id: "s4",
        user_id: "u3",
        status: "expired",
        ends_at: "2026-01-01T00:00:00Z",
        created_at: "2025-12-01T00:00:00Z",
      }),
    ]

    const summary = summarizeSubscriptions(rows, now)
    expect(summary.activeSubs).toBe(1)
    expect(summary.trials).toBe(1)
    expect(summary.expiredSubs).toBe(1)
    expect(summary.upcoming).toBe(1)
  })

  it("prefers a live subscription over a newer expired row", () => {
    const current = selectCurrentSubscription(
      [
        sub({
          id: "old-live",
          user_id: "u1",
          status: "active",
          ends_at: "2026-12-01T00:00:00Z",
          created_at: "2026-01-01T00:00:00Z",
        }),
        sub({
          id: "new-expired",
          user_id: "u1",
          status: "expired",
          ends_at: "2026-03-01T00:00:00Z",
          created_at: "2026-05-01T00:00:00Z",
        }),
      ],
      now
    )
    expect(current?.id).toBe("old-live")
  })
})
