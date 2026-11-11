import { describe, expect, it } from "vitest"

import { shiftDueOn } from "../src/lib/finance/cycle-dates"
import { csvEscape, toCsv } from "../src/lib/finance/csv"

describe("shiftDueOn", () => {
  it("moves a mid-cycle due date by the start-date delta", () => {
    expect(
      shiftDueOn({
        dueOn: "2026-04-15",
        sourceStartsOn: "2026-04-01",
        targetStartsOn: "2026-05-01",
        targetEndsOn: "2026-05-31",
      })
    ).toBe("2026-05-15")
  })

  it("clamps a due date that would fall after the new cycle", () => {
    expect(
      shiftDueOn({
        dueOn: "2026-04-30",
        sourceStartsOn: "2026-04-01",
        targetStartsOn: "2026-05-01",
        targetEndsOn: "2026-05-15",
      })
    ).toBe("2026-05-15")
  })

  it("clamps a due date that would fall before the new cycle", () => {
    expect(
      shiftDueOn({
        dueOn: "2026-03-20",
        sourceStartsOn: "2026-04-01",
        targetStartsOn: "2026-05-01",
        targetEndsOn: "2026-05-31",
      })
    ).toBe("2026-05-01")
  })
})

describe("csv", () => {
  it("escapes commas and quotes without dropping rows", () => {
    expect(csvEscape('Hola, "mundo"')).toBe('"Hola, ""mundo"""')
    expect(toCsv(["a", "b"], [["1", "dos,tres"]])).toBe("a,b\r\n1,\"dos,tres\"\r\n")
  })
})
