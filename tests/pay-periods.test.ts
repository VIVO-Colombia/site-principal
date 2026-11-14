import { describe, expect, it } from "vitest"

import { computeSpendable, type AccountBalance } from "../src/lib/finance/calculations"
import { addAmounts } from "../src/lib/finance/money"
import {
  clampMonthDay,
  cyclesToCreate,
  periodContaining,
  periodsFrom,
} from "../src/lib/finance/pay-periods"
import { omitUnknownColumn } from "../src/lib/finance/schema-cache"
import { payScheduleSchema } from "../src/lib/validations/finance"
import type { ScheduledPayment } from "../src/types/database"

const monthly25 = {
  frequency: "monthly" as const,
  paymentDays: [25],
  anchorDate: "2026-01-25",
}

describe("pay periods", () => {
  it("starts a monthly period on the 25th and ends the day before the next pay", () => {
    const current = periodContaining(monthly25, "2026-11-25")
    expect(current).toMatchObject({ startsOn: "2026-11-25", endsOn: "2026-12-24" })

    const upcoming = periodsFrom(monthly25, "2026-11-25", 3)
    expect(upcoming.map((period) => [period.startsOn, period.endsOn])).toEqual([
      ["2026-11-25", "2026-12-24"],
      ["2026-12-25", "2027-01-24"],
      ["2027-01-25", "2027-02-24"],
    ])
  })

  it("uses the period already in progress when today is before payday", () => {
    expect(periodContaining(monthly25, "2026-11-13")).toMatchObject({
      startsOn: "2026-10-25",
      endsOn: "2026-11-24",
    })
  })

  it("moves a day-31 payment to the last day of a short month", () => {
    expect(clampMonthDay(2027, 1, 31)).toBe("2027-02-28")
    expect(clampMonthDay(2028, 1, 31)).toBe("2028-02-29")
    expect(periodContaining({ ...monthly25, paymentDays: [31] }, "2027-02-15")).toMatchObject({
      startsOn: "2027-01-31",
      endsOn: "2027-02-27",
    })
    expect(periodContaining({ ...monthly25, paymentDays: [31] }, "2027-02-28")).toMatchObject({
      startsOn: "2027-02-28",
      endsOn: "2027-03-30",
    })
  })

  it("builds two monthly pay dates without an empty february period", () => {
    const schedule = {
      frequency: "semimonthly" as const,
      paymentDays: [15, 30],
      anchorDate: "2026-01-15",
    }
    expect(periodContaining(schedule, "2026-11-20")).toMatchObject({
      startsOn: "2026-11-15",
      endsOn: "2026-11-29",
    })
    expect(periodContaining(schedule, "2027-02-20")).toMatchObject({
      startsOn: "2027-02-15",
      endsOn: "2027-02-27",
    })
  })

  it("repeats every 14 days from the anchor", () => {
    const schedule = {
      frequency: "every_n_days" as const,
      paymentDays: [],
      intervalDays: 14,
      anchorDate: "2026-11-25",
    }
    expect(periodsFrom(schedule, "2026-11-25", 2).map((period) => [period.startsOn, period.endsOn])).toEqual([
      ["2026-11-25", "2026-12-08"],
      ["2026-12-09", "2026-12-22"],
    ])
  })

  it("does not rewrite cycles that already occupy those dates", () => {
    const existing = [{ id: "old", startsOn: "2026-10-01", endsOn: "2026-10-31" }]
    const created = cyclesToCreate(existing, periodsFrom(monthly25, "2026-10-20", 4))
    expect(existing).toEqual([{ id: "old", startsOn: "2026-10-01", endsOn: "2026-10-31" }])
    expect(created.some((period) => period.startsOn <= "2026-10-31" && period.endsOn >= "2026-10-01")).toBe(false)
    expect(created[0]).toMatchObject({ startsOn: "2026-11-25", endsOn: "2026-12-24" })
  })
})

describe("spendable money", () => {
  it("subtracts pending commitments and reserved savings once", () => {
    const balances: AccountBalance[] = [
      balance("cash", "cash", 2_700_000),
      balance("save", "savings", 300_000),
    ]
    const result = computeSpendable({
      balances,
      commitments: [payment("rent", 1_200_000, 0, "pending", "2026-11-20")],
      throughDate: "2026-11-24",
    })
    expect(result).toMatchObject({
      included: 3_000_000,
      reserved: 300_000,
      commitments: 1_200_000,
      spendable: 1_500_000,
    })
    expect(addAmounts(result.included, -result.reserved, -result.commitments)).toBe(result.spendable)
  })

  it("keeps a partial balance and ignores paid or later commitments", () => {
    const result = computeSpendable({
      balances: [balance("cash", "cash", 500_000)],
      commitments: [
        payment("partial", 400_000, 100_000, "partial", "2026-11-10"),
        payment("paid", 900_000, 900_000, "paid", "2026-11-10"),
        payment("later", 250_000, 0, "pending", "2026-12-25"),
      ],
      throughDate: "2026-11-24",
    })
    expect(result.commitments).toBe(300_000)
    expect(result.spendable).toBe(200_000)
  })

  it("shows a deficit instead of hiding it", () => {
    const result = computeSpendable({
      balances: [balance("cash", "cash", 100_000)],
      commitments: [payment("rent", 250_000, 0, "overdue", "2026-11-01")],
      throughDate: "2026-11-24",
    })
    expect(result.spendable).toBe(-150_000)
  })
})

describe("pay schedule form", () => {
  it("accepts a monthly payday when the other fields are empty", () => {
    const parsed = payScheduleSchema.safeParse({
      frequency: "monthly",
      payDay: "25",
      payDay2: null,
      intervalDays: null,
      anchorDate: null,
      expectedAmount: "",
      accountId: null,
      variable: "",
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.payDay).toBe(25)
  })
})

describe("account schema cache", () => {
  it("drops only the missing optional column reported by PostgREST", () => {
    const row = { name: "Efectivo", color: null, icon: null, include_in_total: true }
    const next = omitUnknownColumn(
      row,
      "Could not find the 'color' column of 'financial_accounts' in the schema cache",
      ["color", "icon", "include_in_total"]
    )
    expect(next).toEqual({ name: "Efectivo", icon: null, include_in_total: true })
    expect(row.color).toBeNull()
  })
})

function balance(id: string, kind: AccountBalance["kind"], amount: number): AccountBalance {
  return {
    accountId: id,
    name: id,
    kind,
    isActive: true,
    includeInTotal: true,
    opening: amount,
    balance: amount,
    negative: amount < 0,
  }
}

function payment(
  id: string,
  expected: number,
  paid: number,
  status: ScheduledPayment["status"],
  dueOn: string
): Pick<ScheduledPayment, "expected_amount" | "paid_amount" | "status" | "due_on"> & { id: string } {
  return { id, expected_amount: expected, paid_amount: paid, status, due_on: dueOn }
}
