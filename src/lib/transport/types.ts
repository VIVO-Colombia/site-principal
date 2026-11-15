export type MarginMode = "on_cost" | "on_sale"

export type VehicleClass = {
  id: string
  label: string
  maxWeightKg: number
  maxVolumeM3: number
  /** COP por kilómetro vial. Si includesFuel es true, el combustible ya está dentro. */
  costPerKmCop: number
  /** COP por minuto de conducción y de tiempo operativo de cargue/descargue. */
  costPerMinuteCop: number
  includesFuel: boolean
  /** Piso operativo del vehículo. Se aplica al costo de desplazamiento+tiempo, antes del margen. */
  minimumTripCop: number
}

export type HelperRule = {
  id: string
  /** Piso máximo cubierto por esta regla, sin ascensor. */
  maxFloor: number
  minFloor: number
  copPerHelper: number
}

export type CargoFactor = {
  id: string
  label: string
  /** Multiplica solo el costo de tiempo operativo, no el kilometraje. */
  timeFactor: number
}

export type PricingConfig = {
  version: number
  effectiveFrom: string
  currency: "COP"
  notes: string
  margin: { mode: MarginMode; rate: number }
  /** Tope inferior del costo operativo de transporte, antes de ayudantes y margen. */
  minimumOperationCop: number
  /** Fracción adicional de la distancia que se cobra como retorno vacío. 0 desactiva el retorno. */
  emptyReturnFactor: number
  /** COP por km solo si el proveedor no entrega peajes. 0 deja el peaje pendiente si se exige. */
  tollFallbackPerKmCop: number
  requireRealTolls: boolean
  loadMinutes: number
  unloadMinutes: number
  vehicles: VehicleClass[]
  cargo: CargoFactor[]
  helpers: HelperRule[]
  /** Si el piso no cae en una regla, el personal queda pendiente. No se inventa tarifa. */
  fuel: {
    /** Se suma solo en vehículos con includesFuel = false. */
    copPerKm: number
  }
}

export type AccessPoint = {
  floor: number | null
  elevator: boolean
}

export type QuoteRequest = {
  originLabel: string
  destinationLabel: string
  originCity: "popayan" | "cali"
  distanceKm: number | null
  durationMinutes: number | null
  tollsCop: number | null
  routeStatus: "ok" | "unavailable" | "not_found" | "provider_error"
  vehicleId: string
  cargoId: string
  weightKg: number | null
  volumeM3: number | null
  helpers: number
  originAccess: AccessPoint
  destinationAccess: AccessPoint
}

export type MoneyLine = {
  id: string
  label: string
  amountCop: number | null
  pending?: string
}

export type QuoteResult = {
  configVersion: number
  lines: MoneyLine[]
  transportCop: number | null
  helpersCop: number | null
  otherCop: number | null
  totalCop: number | null
  definitive: boolean
  message: string | null
  disclaimer: string
}
