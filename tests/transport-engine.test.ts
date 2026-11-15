import { describe, expect, it } from "vitest"

import { defaultPricingConfig } from "../src/lib/transport/defaults"
import { calculateQuote } from "../src/lib/transport/engine"
import { detectOriginCity } from "../src/lib/transport/geography"
import type { PricingConfig, QuoteRequest } from "../src/lib/transport/types"
import { transportWhatsappUrl } from "../src/lib/transport/whatsapp"

const base: QuoteRequest = {
  originLabel: "Popayán",
  destinationLabel: "Cali",
  originCity: "popayan",
  distanceKm: 170,
  durationMinutes: 240,
  tollsCop: null,
  routeStatus: "ok",
  vehicleId: "liviano",
  cargoId: "general",
  weightKg: 1000,
  volumeM3: 8,
  helpers: 0,
  originAccess: { floor: 1, elevator: false },
  destinationAccess: { floor: 1, elevator: false },
}

describe("dynamic transport pricing", () => {
  it("changes the estimate when the margin parameter changes", () => {
    const low = calculateQuote(base, defaultPricingConfig)
    const higher: PricingConfig = {
      ...defaultPricingConfig,
      margin: { mode: "on_cost", rate: 0.3 },
    }
    const high = calculateQuote(base, higher)
    expect(low.totalCop).not.toBeNull()
    expect(high.totalCop).toBeGreaterThan(low.totalCop ?? 0)
  })

  it("does not add fuel when the vehicle rate already includes it", () => {
    const withFuelFlag = calculateQuote(base, defaultPricingConfig)
    const extraFuel: PricingConfig = {
      ...defaultPricingConfig,
      fuel: { copPerKm: 900 },
    }
    const stillIncluded = calculateQuote(base, extraFuel)
    expect(stillIncluded.transportCop).toBe(withFuelFlag.transportCop)
  })

  it("prices helpers once from the harder floor", () => {
    const quote = calculateQuote(
      {
        ...base,
        helpers: 2,
        originAccess: { floor: 1, elevator: false },
        destinationAccess: { floor: 4, elevator: false },
      },
      defaultPricingConfig
    )
    expect(quote.helpersCop).toBe(200000)
    expect(quote.definitive).toBe(true)
  })

  it("asks for confirmation when the floor has no rule", () => {
    const quote = calculateQuote(
      {
        ...base,
        helpers: 1,
        destinationAccess: { floor: 2, elevator: false },
      },
      defaultPricingConfig
    )
    expect(quote.helpersCop).toBeNull()
    expect(quote.totalCop).toBeNull()
    expect(quote.definitive).toBe(false)
  })

  it("does not invent a price without a road distance", () => {
    const quote = calculateQuote({ ...base, distanceKm: null, routeStatus: "provider_error" }, defaultPricingConfig)
    expect(quote.totalCop).toBeNull()
    expect(quote.message).toMatch(/cotización personalizada/i)
  })

  it("rejects origins outside Popayán and Cali", () => {
    expect(detectOriginCity("Bogotá, Colombia")).toBeNull()
    expect(detectOriginCity("Popayán, Cauca")).toBe("popayan")
    expect(detectOriginCity("Santiago de Cali")).toBe("cali")
  })
})

describe("transport whatsapp", () => {
  it("uses the official number and encodes the quote", () => {
    const url = transportWhatsappUrl({ origin: "Popayán", destination: "Cali", estimate: "$600.000" })
    expect(url.startsWith("https://wa.me/573137047746?text=")).toBe(true)
    const text = decodeURIComponent(url.split("text=")[1])
    expect(text).toContain("Popayán")
    expect(text).toContain("Cali")
    expect(text).toContain("$600.000")
  })
})
