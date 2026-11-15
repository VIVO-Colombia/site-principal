import type { PricingConfig } from "@/lib/transport/types"

/**
 * Parámetros operativos iniciales.
 * No son tarifas por ciudad. Sirven para arrancar el motor y deben reemplazarse
 * con los costos reales de VIVO (combustible, peajes, margen, personal).
 * Referencias usadas solo para calibrar el orden de magnitud, no como respuesta fija:
 * urbano Popayán ~40.000–250.000, Popayán–Cali ~600.000, ayudante piso 1 ~50.000,
 * ayudante piso 3–4 ~100.000.
 */
export const defaultPricingConfig: PricingConfig = {
  version: 1,
  effectiveFrom: "2026-11-15",
  currency: "COP",
  notes:
    "Versión inicial de costos operativos. El kilometraje incluye combustible en los vehículos marcados. El personal se calcula una sola vez según la mayor dificultad de acceso.",
  margin: { mode: "on_cost", rate: 0.12 },
  minimumOperationCop: 40000,
  emptyReturnFactor: 0,
  tollFallbackPerKmCop: 0,
  requireRealTolls: false,
  loadMinutes: 40,
  unloadMinutes: 40,
  fuel: { copPerKm: 0 },
  vehicles: [
    {
      id: "urbano",
      label: "Vehículo urbano",
      maxWeightKg: 800,
      maxVolumeM3: 4,
      costPerKmCop: 3200,
      costPerMinuteCop: 280,
      includesFuel: true,
      minimumTripCop: 40000,
    },
    {
      id: "liviano",
      label: "Camión liviano",
      maxWeightKg: 3500,
      maxVolumeM3: 16,
      costPerKmCop: 2600,
      costPerMinuteCop: 340,
      includesFuel: true,
      minimumTripCop: 180000,
    },
    {
      id: "pesado",
      label: "Camión de mayor capacidad",
      maxWeightKg: 12000,
      maxVolumeM3: 40,
      costPerKmCop: 3400,
      costPerMinuteCop: 420,
      includesFuel: true,
      minimumTripCop: 380000,
    },
  ],
  cargo: [
    { id: "general", label: "Carga general", timeFactor: 1 },
    { id: "fragil", label: "Carga frágil", timeFactor: 1.25 },
    { id: "volumetrica", label: "Carga voluminosa", timeFactor: 1.15 },
  ],
  helpers: [
    { id: "piso-1", minFloor: 1, maxFloor: 1, copPerHelper: 50000 },
    { id: "piso-3-4", minFloor: 3, maxFloor: 4, copPerHelper: 100000 },
  ],
}

export const QUOTE_DISCLAIMER =
  "Valor estimado. La tarifa final está sujeta a confirmación por parte de VIVO y puede variar según el tipo de carga, disponibilidad, condiciones del recorrido y características del servicio."
