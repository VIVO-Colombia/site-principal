import { QUOTE_DISCLAIMER } from "@/lib/transport/defaults"
import type { HelperRule, PricingConfig, QuoteRequest, QuoteResult } from "@/lib/transport/types"

function roundCop(value: number) {
  return Math.round(value / 100) * 100
}

function marginAmount(cost: number, config: PricingConfig) {
  const rate = config.margin.rate
  if (rate <= 0) return 0
  if (config.margin.mode === "on_sale") {
    const sale = cost / (1 - rate)
    return sale - cost
  }
  return cost * rate
}

function difficultyFloor(floor: number | null, elevator: boolean) {
  if (elevator) return 1
  return floor
}

function matchHelper(floor: number, rules: HelperRule[]) {
  return rules.find((rule) => floor >= rule.minFloor && floor <= rule.maxFloor) ?? null
}

export function calculateQuote(input: QuoteRequest, config: PricingConfig): QuoteResult {
  const lines: QuoteResult["lines"] = []
  const vehicle = config.vehicles.find((item) => item.id === input.vehicleId) ?? null
  const cargo = config.cargo.find((item) => item.id === input.cargoId) ?? null

  if (input.routeStatus !== "ok" || input.distanceKm == null || input.durationMinutes == null) {
    return {
      configVersion: config.version,
      lines,
      transportCop: null,
      helpersCop: null,
      otherCop: null,
      totalCop: null,
      definitive: false,
      message:
        "Este recorrido requiere una cotización personalizada. Envíanos tu solicitud para confirmar el valor.",
      disclaimer: QUOTE_DISCLAIMER,
    }
  }

  if (!vehicle || !cargo) {
    return {
      configVersion: config.version,
      lines,
      transportCop: null,
      helpersCop: null,
      otherCop: null,
      totalCop: null,
      definitive: false,
      message:
        "Este recorrido requiere una cotización personalizada. Envíanos tu solicitud para confirmar el valor.",
      disclaimer: QUOTE_DISCLAIMER,
    }
  }

  const overweight =
    (input.weightKg != null && input.weightKg > vehicle.maxWeightKg) ||
    (input.volumeM3 != null && input.volumeM3 > vehicle.maxVolumeM3)

  if (overweight) {
    return {
      configVersion: config.version,
      lines: [
        {
          id: "capacidad",
          label: "Capacidad del vehículo",
          amountCop: null,
          pending: "El peso o el volumen supera la categoría elegida.",
        },
      ],
      transportCop: null,
      helpersCop: null,
      otherCop: null,
      totalCop: null,
      definitive: false,
      message:
        "Este recorrido requiere una cotización personalizada. Envíanos tu solicitud para confirmar el valor.",
      disclaimer: QUOTE_DISCLAIMER,
    }
  }

  const billedKm = input.distanceKm * (1 + Math.max(0, config.emptyReturnFactor))
  const distanceCost = billedKm * vehicle.costPerKmCop
  const fuelCost = vehicle.includesFuel ? 0 : billedKm * config.fuel.copPerKm
  const driveCost = input.durationMinutes * vehicle.costPerMinuteCop
  const handlingMinutes = (config.loadMinutes + config.unloadMinutes) * cargo.timeFactor
  const handlingCost = handlingMinutes * vehicle.costPerMinuteCop

  lines.push({
    id: "distancia",
    label: "Desplazamiento",
    amountCop: roundCop(distanceCost + fuelCost),
  })
  lines.push({
    id: "tiempo",
    label: "Tiempo de ruta y de cargue/descargue",
    amountCop: roundCop(driveCost + handlingCost),
  })

  let tolls = 0
  let tollPending: string | undefined
  if (input.tollsCop != null) {
    tolls = input.tollsCop
    lines.push({ id: "peajes", label: "Peajes informados por la ruta", amountCop: roundCop(tolls) })
  } else if (config.tollFallbackPerKmCop > 0) {
    tolls = input.distanceKm * config.tollFallbackPerKmCop
    lines.push({ id: "peajes", label: "Peajes configurados por kilómetro", amountCop: roundCop(tolls) })
  } else if (config.requireRealTolls) {
    tollPending = "El proveedor no entregó peajes y no hay un parámetro configurado."
    lines.push({ id: "peajes", label: "Peajes", amountCop: null, pending: tollPending })
  }

  let operational = distanceCost + fuelCost + driveCost + handlingCost + tolls
  operational = Math.max(operational, config.minimumOperationCop, vehicle.minimumTripCop)
  const transportBeforeMargin = roundCop(operational)
  const commercial = marginAmount(transportBeforeMargin, config)
  const transportCop = roundCop(transportBeforeMargin + commercial)

  lines.push({
    id: "margen",
    label:
      config.margin.mode === "on_sale"
        ? "Margen comercial sobre el precio de venta"
        : "Margen comercial sobre el costo",
    amountCop: roundCop(commercial),
  })

  const originFloor = difficultyFloor(input.originAccess.floor, input.originAccess.elevator)
  const destinationFloor = difficultyFloor(
    input.destinationAccess.floor,
    input.destinationAccess.elevator
  )

  let helpersCop: number | null = 0
  let helperPending: string | undefined
  if (input.helpers > 0) {
    if (originFloor == null || destinationFloor == null) {
      helpersCop = null
      helperPending = "Falta el piso de origen o de destino."
    } else {
      const hardest = Math.max(originFloor, destinationFloor)
      const rule = matchHelper(hardest, config.helpers)
      if (!rule) {
        helpersCop = null
        helperPending =
          "No hay una tarifa de personal para esta combinación de pisos. Hay que confirmarla."
      } else {
        helpersCop = roundCop(rule.copPerHelper * input.helpers)
      }
    }
    lines.push({
      id: "ayudantes",
      label: "Personal de apoyo",
      amountCop: helpersCop,
      pending: helperPending,
    })
  }

  const pending = Boolean(tollPending || helperPending)
  const totalCop = pending || helpersCop == null ? null : transportCop + (helpersCop ?? 0)

  return {
    configVersion: config.version,
    lines,
    transportCop,
    helpersCop,
    otherCop: tolls > 0 ? roundCop(tolls) : 0,
    totalCop,
    definitive: !pending,
    message: pending
      ? "Este recorrido requiere una cotización personalizada. Envíanos tu solicitud para confirmar el valor."
      : null,
    disclaimer: QUOTE_DISCLAIMER,
  }
}
