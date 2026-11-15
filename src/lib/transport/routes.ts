import "server-only"

import { detectOriginCity, type OriginCity } from "@/lib/transport/geography"

type CacheEntry<T> = { at: number; value: T }

const suggestionCache = new Map<string, CacheEntry<PlaceSuggestion[]>>()
const routeCache = new Map<string, CacheEntry<RouteLookup>>()

export type PlaceSuggestion = {
  id: string
  label: string
}

export type RouteLookup = {
  status: "ok" | "unavailable" | "not_found" | "provider_error" | "origin_rejected"
  originLabel?: string
  destinationLabel?: string
  originCity?: OriginCity
  distanceKm?: number
  durationMinutes?: number
  tollsCop?: number | null
  message?: string
}

function mapsKey() {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() || ""
}

export function isMapsConfigured() {
  return mapsKey().length > 10
}

export async function suggestPlaces(query: string, originCity?: OriginCity): Promise<PlaceSuggestion[]> {
  const text = query.trim()
  if (text.length < 3) return []
  if (!isMapsConfigured()) return []

  const bias =
    originCity === "popayan"
      ? "Popayán, Cauca, Colombia"
      : originCity === "cali"
        ? "Cali, Valle del Cauca, Colombia"
        : "Colombia"
  const cacheKey = `${originCity ?? "co"}:${text.toLowerCase()}`
  const cached = suggestionCache.get(cacheKey)
  if (cached && Date.now() - cached.at < 5 * 60_000) return cached.value

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": mapsKey(),
      "x-goog-fieldmask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
    },
    body: JSON.stringify({
      input: `${text}, ${bias}`,
      includedRegionCodes: ["co"],
      languageCode: "es",
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) return []
  const data = (await response.json()) as {
    suggestions?: { placePrediction?: { placeId?: string; text?: { text?: string } } }[]
  }
  const value = (data.suggestions ?? [])
    .map((item) => ({
      id: item.placePrediction?.placeId ?? "",
      label: item.placePrediction?.text?.text ?? "",
    }))
    .filter((item) => item.id && item.label)
    .slice(0, 5)

  suggestionCache.set(cacheKey, { at: Date.now(), value })
  return value
}

async function placeLabel(placeId: string) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "x-goog-api-key": mapsKey(),
      "x-goog-fieldmask": "formattedAddress,addressComponents",
    },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) return null
  const data = (await response.json()) as {
    formattedAddress?: string
    addressComponents?: { longText?: string; types?: string[] }[]
  }
  const parts = (data.addressComponents ?? []).map((part) => part.longText ?? "").join(", ")
  return data.formattedAddress || parts || null
}

export async function lookupRoute(originPlaceId: string, destinationPlaceId: string): Promise<RouteLookup> {
  if (!isMapsConfigured()) {
    return {
      status: "unavailable",
      message:
        "El servicio de rutas no está configurado. Puedes enviar la solicitud para una cotización manual.",
    }
  }

  const cacheKey = `${originPlaceId}>${destinationPlaceId}`
  const cached = routeCache.get(cacheKey)
  if (cached && Date.now() - cached.at < 24 * 60 * 60_000) return cached.value

  const originLabel = await placeLabel(originPlaceId)
  const destinationLabel = await placeLabel(destinationPlaceId)
  if (!originLabel || !destinationLabel) {
    return { status: "provider_error", message: "No pudimos leer las direcciones seleccionadas." }
  }

  const originCity = detectOriginCity(originLabel)
  if (!originCity) {
    return {
      status: "origin_rejected",
      originLabel,
      destinationLabel,
      message: "El origen solo puede ser Popayán o Cali.",
    }
  }

  let response: Response
  try {
    response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": mapsKey(),
        "x-goog-fieldmask":
          "routes.distanceMeters,routes.duration,routes.travelAdvisory.tollInfo",
      },
      body: JSON.stringify({
        origin: { placeId: originPlaceId },
        destination: { placeId: destinationPlaceId },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
        extraComputations: ["TOLLS"],
        languageCode: "es",
        regionCode: "CO",
        units: "METRIC",
      }),
      signal: AbortSignal.timeout(12000),
    })
  } catch {
    return {
      status: "provider_error",
      originLabel,
      destinationLabel,
      originCity,
      message: "El servicio de mapas no respondió. Puedes pedir una cotización manual.",
    }
  }

  if (!response.ok) {
    return {
      status: "provider_error",
      originLabel,
      destinationLabel,
      originCity,
      message: "El servicio de mapas no pudo calcular la ruta. Puedes pedir una cotización manual.",
    }
  }

  const data = (await response.json()) as {
    routes?: {
      distanceMeters?: number
      duration?: string
      travelAdvisory?: { tollInfo?: { estimatedPrice?: { units?: string; nanos?: number; currencyCode?: string }[] } }
    }[]
  }
  const route = data.routes?.[0]
  if (!route?.distanceMeters) {
    return {
      status: "not_found",
      originLabel,
      destinationLabel,
      originCity,
      message: "No encontramos un recorrido terrestre para ese destino.",
    }
  }

  const seconds = Number.parseInt(String(route.duration ?? "0").replace("s", ""), 10)
  const toll = route.travelAdvisory?.tollInfo?.estimatedPrice?.find((item) => item.currencyCode === "COP")
  const tollsCop = toll
    ? Number(toll.units ?? 0) + Number(toll.nanos ?? 0) / 1_000_000_000
    : null

  const value: RouteLookup = {
    status: "ok",
    originLabel,
    destinationLabel,
    originCity,
    distanceKm: route.distanceMeters / 1000,
    durationMinutes: Number.isFinite(seconds) ? seconds / 60 : 0,
    tollsCop,
  }
  routeCache.set(cacheKey, { at: Date.now(), value })
  return value
}
