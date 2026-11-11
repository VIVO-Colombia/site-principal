import { describe, expect, it } from "vitest"

import { hasCapability, hasLivePremium, resolveEntitlement } from "../src/lib/auth/capabilities"
import type { AccessContext } from "../src/types/database"

function context(partial: Partial<AccessContext> & Pick<AccessContext, "user" | "profile" | "subscription">): AccessContext {
  return { configured: true, ...partial }
}

const user = { id: "1", email: "a@b.c", emailConfirmed: true }

describe("Free and Premium entitlements", () => {
  it("gives Free write access without a subscription", () => {
    const access = context({
      user,
      profile: {
        id: "1",
        full_name: "Ana",
        email: "a@b.c",
        role: "user",
        account_status: "enabled",
        timezone: "America/Bogota",
        created_at: "",
        updated_at: "",
      },
      subscription: null,
    })
    expect(resolveEntitlement(access)).toBe("free")
    expect(hasCapability(access, "manual_transactions")).toBe(true)
    expect(hasCapability(access, "receipt_ocr")).toBe(false)
  })

  it("treats expired Premium as Free", () => {
    expect(
      hasLivePremium({
        status: "active",
        ends_at: "2020-01-01T00:00:00Z",
      })
    ).toBe(false)
  })

  it("blocks a suspended account", () => {
    const access = context({
      user,
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
      subscription: null,
    })
    expect(resolveEntitlement(access)).toBe("blocked")
  })
})
