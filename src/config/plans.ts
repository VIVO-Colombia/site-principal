export type CatalogPlan = {
  id: string
  name: string
  cadence: string
  summary: string
  features: string[]
  highlighted?: boolean
  availability: "available-to-request" | "coming-soon"
}

/**
 * Commercial catalog used until plans are loaded from the database.
 * Amounts are intentionally omitted: pricing is confirmed during access requests.
 */
export const catalogPlans: CatalogPlan[] = [
  {
    id: "mensual",
    name: "Mensual",
    cadence: "Un mes",
    summary: "Un ciclo completo de acceso. Renuevas cuando quieras, a mano.",
    features: [
      "Presupuesto y planeación por ciclo",
      "Movimientos, cuentas y pagos programados",
      "Consulta y exportación CSV",
      "Ahorros, deudas y análisis, cuando salgan",
    ],
    availability: "available-to-request",
  },
  {
    id: "anual",
    name: "Anual",
    cadence: "Doce meses",
    summary: "El mismo producto, con menos vueltas de activación.",
    features: [
      "Todo lo del plan mensual",
      "Una sola solicitud al año",
      "Revisión prioritaria al activar",
      "Historial continuo de tus ciclos",
    ],
    highlighted: true,
    availability: "available-to-request",
  },
]
