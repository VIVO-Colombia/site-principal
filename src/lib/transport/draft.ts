export const TRANSPORT_DRAFT_KEY = "vivo-transport-draft"

export type TransportDraft = {
  originLabel: string
  destinationLabel: string
  originCity: string
  destinationCity: string
  cargo: string
  vehicle: string
  helpers: string
  date: string
  distance: string
  estimate: string
  pending: string
  access: string
  weight: string
  calculatedAt: string
}
