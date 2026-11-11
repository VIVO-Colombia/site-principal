function parseDateUtc(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map((part) => Number(part))
  if (!year || !month || !day) {
    throw new Error("Fecha inválida")
  }
  return Date.UTC(year, month - 1, day)
}

function formatDateUtc(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10)
}

/** Shifts a due date by the difference between cycle starts, then clamps it to the new cycle. */
export function shiftDueOn(input: {
  dueOn: string
  sourceStartsOn: string
  targetStartsOn: string
  targetEndsOn: string
}): string {
  const sourceStart = parseDateUtc(input.sourceStartsOn)
  const due = parseDateUtc(input.dueOn)
  const targetStart = parseDateUtc(input.targetStartsOn)
  const targetEnd = parseDateUtc(input.targetEndsOn)
  const shifted = targetStart + (due - sourceStart)

  if (shifted < targetStart) return formatDateUtc(targetStart)
  if (shifted > targetEnd) return formatDateUtc(targetEnd)
  return formatDateUtc(shifted)
}
