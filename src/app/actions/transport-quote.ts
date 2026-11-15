"use server"

import { loadPricingConfig, savePricingConfig } from "@/lib/transport/config-store"
import { calculateQuote } from "@/lib/transport/engine"
import { isMapsConfigured, lookupRoute, suggestPlaces } from "@/lib/transport/routes"
import type { PricingConfig, QuoteRequest } from "@/lib/transport/types"

export async function suggestPlacesAction(query: string, originCity?: "popayan" | "cali") {
  if (!isMapsConfigured()) {
    return { configured: false as const, suggestions: [] as { id: string; label: string }[] }
  }
  const suggestions = await suggestPlaces(query, originCity)
  return { configured: true as const, suggestions }
}

export async function quoteRouteAction(input: {
  originPlaceId: string
  destinationPlaceId: string
  vehicleId: string
  cargoId: string
  weightKg: number | null
  volumeM3: number | null
  helpers: number
  originFloor: number | null
  originElevator: boolean
  destinationFloor: number | null
  destinationElevator: boolean
  travelDate: string
}) {
  const route = await lookupRoute(input.originPlaceId, input.destinationPlaceId)
  const config = await loadPricingConfig()
  const request: QuoteRequest = {
    originLabel: route.originLabel ?? "",
    destinationLabel: route.destinationLabel ?? "",
    originCity: route.originCity ?? "popayan",
    distanceKm: route.distanceKm ?? null,
    durationMinutes: route.durationMinutes ?? null,
    tollsCop: route.tollsCop ?? null,
    routeStatus:
      route.status === "origin_rejected" || route.status === "unavailable"
        ? route.status === "unavailable"
          ? "unavailable"
          : "provider_error"
        : route.status,
    vehicleId: input.vehicleId,
    cargoId: input.cargoId,
    weightKg: input.weightKg,
    volumeM3: input.volumeM3,
    helpers: input.helpers,
    originAccess: { floor: input.originFloor, elevator: input.originElevator },
    destinationAccess: { floor: input.destinationFloor, elevator: input.destinationElevator },
  }

  if (route.status === "origin_rejected") {
    return {
      route,
      quote: null,
      vehicles: config.vehicles.map((item) => ({ id: item.id, label: item.label })),
      cargo: config.cargo.map((item) => ({ id: item.id, label: item.label })),
      travelDate: input.travelDate,
    }
  }

  const quote = calculateQuote(
    {
      ...request,
      routeStatus: route.status === "ok" ? "ok" : route.status === "not_found" ? "not_found" : request.routeStatus,
    },
    config
  )

  return {
    route,
    quote,
    vehicles: config.vehicles.map((item) => ({ id: item.id, label: item.label })),
    cargo: config.cargo.map((item) => ({ id: item.id, label: item.label })),
    travelDate: input.travelDate,
  }
}

export async function publicPricingOptions() {
  const config = await loadPricingConfig()
  return {
    maps: isMapsConfigured(),
    vehicles: config.vehicles.map((item) => ({
      id: item.id,
      label: item.label,
      maxWeightKg: item.maxWeightKg,
      maxVolumeM3: item.maxVolumeM3,
    })),
    cargo: config.cargo.map((item) => ({ id: item.id, label: item.label })),
    version: config.version,
  }
}

export async function updatePricingConfigAction(token: string, config: PricingConfig) {
  const expected = process.env.TRANSPORT_PRICING_ADMIN_KEY?.trim()
  if (!expected || token !== expected) {
    return { error: "No autorizado para actualizar los parámetros." }
  }
  if (!config.vehicles?.length || config.margin.rate < 0 || config.margin.rate >= 0.95) {
    return { error: "La configuración no es válida." }
  }
  const saved = await savePricingConfig(config)
  if (saved.error) return { error: saved.error }
  return { success: `Parámetros guardados en ${saved.stored}.`, version: config.version }
}
