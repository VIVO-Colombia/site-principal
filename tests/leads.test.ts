import { describe, expect, it } from "vitest"

import { demoFinance } from "../src/components/product/demo-data"
import { quoteLeadSchema } from "../src/lib/validations/leads"

describe("commercial leads", () => {
  it("accepts a quote with the fields the operation needs", () => {
    const parsed = quoteLeadSchema.safeParse({
      kind: "quote",
      name: "Ana Pérez",
      email: "ana@empresa.com",
      phone: "3000000000",
      company: "Logística Andina",
      originCity: "Bogotá",
      destinationCity: "Medellín",
      cargoType: "Estibas",
      weightVolume: "",
      estimatedDate: "",
      message: "",
      consent: true,
      companyUrl: "",
    })
    expect(parsed.success).toBe(true)
  })

  it("rejects a quote without consent", () => {
    const parsed = quoteLeadSchema.safeParse({
      kind: "quote",
      name: "Ana Pérez",
      email: "ana@empresa.com",
      phone: "3000000000",
      originCity: "Bogotá",
      destinationCity: "Medellín",
      cargoType: "Estibas",
      consent: false,
    })
    expect(parsed.success).toBe(false)
  })
})

describe("planner demo copy", () => {
  it("does not present a fixed calendar date as current", () => {
    expect(demoFinance.cycleLabel).not.toMatch(/\d/)
    expect(demoFinance.nextPayment.due).not.toMatch(/\d/)
    expect(demoFinance.movements.every((item) => item.date.startsWith("Día"))).toBe(true)
  })
})
