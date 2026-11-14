/** PostgREST reports this when a migration has not reached the API cache yet. */
export function omitUnknownColumn<T extends Record<string, unknown>>(
  row: T,
  message: string,
  allowed: readonly string[]
): T | null {
  const column = message.match(/Could not find the '([^']+)' column/)?.[1]
  if (!column || !allowed.includes(column) || !Object.prototype.hasOwnProperty.call(row, column)) {
    return null
  }
  const next = { ...row }
  delete next[column]
  return next
}

export function isMissingTable(message: string, table: string) {
  return (
    message.includes(table) &&
    (message.includes("schema cache") || message.includes("does not exist") || message.includes("Could not find the table"))
  )
}
