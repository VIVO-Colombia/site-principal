/** Money helpers. Persist numeric(14,2); never use float math as the source of truth. */

export function toAmount(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

export function parseAmountInput(raw: string): number {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error("Ingresa un valor")
  }

  const hasComma = trimmed.includes(",")
  const hasDot = trimmed.includes(".")
  let normalized = trimmed.replace(/[^\d.,-]/g, "")

  if (hasComma && hasDot) {
    if (trimmed.lastIndexOf(",") > trimmed.lastIndexOf(".")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".")
    } else {
      normalized = normalized.replace(/,/g, "")
    }
  } else if (hasComma) {
    const parts = normalized.split(",")
    normalized = parts.length === 2 && parts[1]!.length <= 2
      ? `${parts[0]!.replace(/\./g, "")}.${parts[1]}`
      : normalized.replace(/,/g, "")
  } else if (hasDot) {
    const parts = normalized.split(".")
    if (parts.length > 2 || (parts[1] && parts[1].length > 2)) {
      normalized = normalized.replace(/\./g, "")
    }
  }

  const n = Number(normalized)
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Ingresa un valor mayor a cero")
  }

  return Math.round(n * 100) / 100
}

export function addAmounts(...values: Array<string | number | null | undefined>) {
  return Math.round(values.reduce<number>((sum, value) => sum + toAmount(value), 0) * 100) / 100
}

export function signedAmount(kind: string, amount: string | number, direction: "from" | "to" = "from") {
  const value = toAmount(amount)
  if (kind === "income") return value
  if (kind === "transfer") return direction === "from" ? -value : value
  return -value
}
