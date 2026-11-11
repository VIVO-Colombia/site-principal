export const workspaceTabs = ["movimientos", "pagos", "presupuesto", "analisis"] as const
export type WorkspaceTab = (typeof workspaceTabs)[number]

export const homeActions = [
  "gasto",
  "ingreso",
  "transferencia",
  "ahorro",
  "pago",
  "cuenta",
  "recibo",
  "ciclo",
  "categoria",
  "ajustes",
  "avisos",
  "premium",
] as const
export type HomeAction = (typeof homeActions)[number]

export function parseTab(value: string | null): WorkspaceTab {
  return workspaceTabs.includes(value as WorkspaceTab) ? (value as WorkspaceTab) : "movimientos"
}

export function parseAction(value: string | null): HomeAction | null {
  return homeActions.includes(value as HomeAction) ? (value as HomeAction) : null
}

export function homeHref(params: {
  tab?: WorkspaceTab
  accion?: HomeAction | null
  cuenta?: string | null
  movimiento?: string | null
  pago?: string | null
  categoria?: string | null
}) {
  const search = new URLSearchParams()
  if (params.tab && params.tab !== "movimientos") search.set("tab", params.tab)
  if (params.accion) search.set("accion", params.accion)
  if (params.cuenta) search.set("cuenta", params.cuenta)
  if (params.movimiento) search.set("movimiento", params.movimiento)
  if (params.pago) search.set("pago", params.pago)
  if (params.categoria) search.set("categoria", params.categoria)
  const query = search.toString()
  return query ? `/app?${query}` : "/app"
}
