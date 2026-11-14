export type PayFrequency = "monthly" | "semimonthly" | "every_n_days"

export type PayScheduleInput = {
  frequency: PayFrequency
  /** Days of the month. Monthly uses one. Semimonthly uses two. Ignored for every_n_days. */
  paymentDays: number[]
  /** Distance between payments. Required for every_n_days. */
  intervalDays?: number | null
  /** First payment date. Required for every_n_days. Monthly rules also work before this date. */
  anchorDate: string
}

export type PayPeriod = {
  startsOn: string
  endsOn: string
  label: string
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

export function calendarDateInTimeZone(timeZone: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

function parseDateUtc(isoDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) throw new Error("Fecha inválida")
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const epoch = Date.UTC(year, month - 1, day)
  const check = new Date(epoch)
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error("Fecha inválida")
  }
  return epoch
}

function formatDateUtc(epochMs: number) {
  return new Date(epochMs).toISOString().slice(0, 10)
}

export function addDays(isoDate: string, days: number) {
  return formatDateUtc(parseDateUtc(isoDate) + days * 86_400_000)
}

function lastDayOfMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

/** RN-002: a missing monthly day falls on the last day of that month. */
export function clampMonthDay(year: number, monthIndex: number, day: number) {
  const last = lastDayOfMonth(year, monthIndex)
  const used = Math.min(Math.max(day, 1), last)
  return formatDateUtc(Date.UTC(year, monthIndex, used))
}

function periodLabel(startsOn: string, endsOn: string) {
  const [startYear, startMonth, startDay] = startsOn.split("-").map(Number)
  const [endYear, endMonth, endDay] = endsOn.split("-").map(Number)
  const left = `${startDay} ${MONTHS[startMonth - 1]}`
  const right = `${endDay} ${MONTHS[endMonth - 1]} ${endYear}`
  return startYear === endYear ? `${left} – ${right}` : `${left} ${startYear} – ${right}`
}

function uniqueSorted(dates: string[]) {
  return [...new Set(dates)].sort()
}

export function payDatesBetween(schedule: PayScheduleInput, fromInclusive: string, untilInclusive: string) {
  if (untilInclusive < fromInclusive) return []

  if (schedule.frequency === "every_n_days") {
    const interval = schedule.intervalDays
    if (!interval || interval < 1) throw new Error("Indica cada cuántos días te pagan")
    const dates: string[] = []
    let cursor = schedule.anchorDate
    if (cursor < fromInclusive) {
      const behind = Math.floor((parseDateUtc(fromInclusive) - parseDateUtc(cursor)) / 86_400_000)
      const steps = Math.floor(behind / interval)
      cursor = addDays(schedule.anchorDate, steps * interval)
      if (cursor < fromInclusive) cursor = addDays(cursor, interval)
    }
    while (cursor <= untilInclusive) {
      dates.push(cursor)
      cursor = addDays(cursor, interval)
    }
    return dates
  }

  const days = schedule.paymentDays.filter((day) => day >= 1 && day <= 31)
  if (days.length === 0) throw new Error("Indica el día de pago")
  const from = parseDateUtc(fromInclusive)
  const until = parseDateUtc(untilInclusive)
  const start = new Date(from)
  const end = new Date(until)
  const dates: string[] = []
  for (let year = start.getUTCFullYear(); year <= end.getUTCFullYear(); year += 1) {
    for (let month = 0; month < 12; month += 1) {
      const monthStart = Date.UTC(year, month, 1)
      const monthEnd = Date.UTC(year, month, lastDayOfMonth(year, month))
      if (monthEnd < from || monthStart > until) continue
      for (const day of days) {
        const date = clampMonthDay(year, month, day)
        if (date >= fromInclusive && date <= untilInclusive) dates.push(date)
      }
    }
  }
  return uniqueSorted(dates)
}

export function periodContaining(schedule: PayScheduleInput, onDate: string): PayPeriod | null {
  const dates = payDatesBetween(schedule, addDays(onDate, -400), addDays(onDate, 400))
  if (dates.length < 2) return null

  let start = ""
  for (const date of dates) {
    if (date <= onDate) start = date
    else break
  }

  if (!start) {
    const next = dates.find((date) => date >= onDate)
    const following = next ? dates.find((date) => date > next) : undefined
    if (!next || !following) return null
    const endsOn = addDays(following, -1)
    return { startsOn: next, endsOn, label: periodLabel(next, endsOn) }
  }

  const next = dates.find((date) => date > start)
  if (!next) return null
  const endsOn = addDays(next, -1)
  return { startsOn: start, endsOn, label: periodLabel(start, endsOn) }
}

/** Current period plus the following ones. Does not rewrite dates that already exist. */
export function periodsFrom(schedule: PayScheduleInput, onDate: string, count: number): PayPeriod[] {
  const first = periodContaining(schedule, onDate)
  if (!first || count < 1) return []
  const periods = [first]
  let cursor = addDays(first.endsOn, 1)
  while (periods.length < count) {
    const next = periodContaining(schedule, cursor)
    if (!next || next.startsOn === periods[periods.length - 1]?.startsOn) break
    periods.push(next)
    cursor = addDays(next.endsOn, 1)
  }
  return periods
}

export function rangesOverlap(left: { startsOn: string; endsOn: string }, right: { startsOn: string; endsOn: string }) {
  return left.startsOn <= right.endsOn && right.startsOn <= left.endsOn
}

/**
 * Periods that can be inserted without touching cycles the user already has.
 * Historical and current cycles keep their dates (RN-004).
 */
export function cyclesToCreate<T extends { startsOn: string; endsOn: string }>(existing: T[], periods: PayPeriod[]) {
  const occupied = existing.map((cycle) => ({ startsOn: cycle.startsOn, endsOn: cycle.endsOn }))
  const created: PayPeriod[] = []
  for (const period of periods) {
    if (occupied.some((cycle) => rangesOverlap(cycle, period))) continue
    created.push(period)
    occupied.push({ startsOn: period.startsOn, endsOn: period.endsOn })
  }
  return created
}
