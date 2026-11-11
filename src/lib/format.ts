import { toAmount } from "@/lib/finance/money"

const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCop(value: number | string | null | undefined) {
  return cop.format(toAmount(value))
}

export function formatShortDate(isoDate: string, timeZone = "America/Bogota") {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    timeZone,
  }).format(new Date(`${isoDate}T12:00:00Z`))
}

export function formatLongDate(isoDate: string, timeZone = "America/Bogota") {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00Z`))
}

export function formatDateTime(isoDate: string, timeZone = "America/Bogota") {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(isoDate))
}
