import { describe, expect, it } from "vitest"

import { canReadFinancialData, canWriteFinancialData, isSuperAdminRole } from "../src/lib/auth/roles"
import { effectiveSubscriptionStatus, nextRenewalStart } from "../src/lib/billing/status"
import type { AccessContext } from "../src/types/database"

describe("roles", () => {
  it("never treats a public user as super admin", () => {
    expect(isSuperAdminRole("user")).toBe(false)
    expect(isSuperAdminRole(undefined)).toBe(false)
    expect(isSuperAdminRole("super_admin")).toBe(true)
  })

  it("keeps read and write independent of the account role", () => {
    expect(canWriteFinancialData("active")).toBe(true)
    expect(canWriteFinancialData("trialing")).toBe(true)
    expect(canWriteFinancialData("expired")).toBe(true)
    expect(canReadFinancialData("expired")).toBe(true)
    expect(canReadFinancialData("pending")).toBe(true)
    expect(canWriteFinancialData("suspended")).toBe(false)
  })
})

describe("subscription rules", () => {
  it("treats an active row past ends_at as expired without a cron", () => {
    expect(
      effectiveSubscriptionStatus({
        status: "active",
        ends_at: "2020-01-01T00:00:00Z",
      })
    ).toBe("expired")
  })

  it("extends a still-valid subscription from the current end date", () => {
    const currentEnd = new Date("2030-01-10T00:00:00Z")
    const start = nextRenewalStart({ status: "active", ends_at: currentEnd.toISOString() }, new Date("2030-01-01T00:00:00Z"))
    expect(start.toISOString()).toBe(currentEnd.toISOString())
  })

  it("renews a lapsed subscription from now", () => {
    const now = new Date("2030-02-01T00:00:00Z")
    const start = nextRenewalStart({ status: "expired", ends_at: "2030-01-01T00:00:00Z" }, now)
    expect(start.toISOString()).toBe(now.toISOString())
  })
})

describe("access context independence", () => {
  it("keeps account status separate from subscription status", () => {
    const context: AccessContext = {
      configured: true,
      user: { id: "1", email: "a@b.c", emailConfirmed: true },
      profile: {
        id: "1",
        full_name: "Ana",
        email: "a@b.c",
        role: "user",
        account_status: "suspended",
        timezone: "America/Bogota",
        created_at: "",
        updated_at: "",
      },
      subscription: {
        id: "s1",
        user_id: "1",
        plan_id: "p1",
        status: "active",
        starts_at: "2030-01-01T00:00:00Z",
        ends_at: "2030-02-01T00:00:00Z",
        source: "manual",
        plan_name_snapshot: "Mensual",
        duration_days_snapshot: 30,
        price_amount_snapshot: null,
        currency_snapshot: "COP",
        created_at: "",
        updated_at: "",
      },
    }

    expect(effectiveSubscriptionStatus(context.subscription)).toBe("active")
    expect(context.profile?.account_status).toBe("suspended")
  })
})
