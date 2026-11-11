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
    cadence: "Facturación mensual",
    summary: "Acceso completo al planeador durante un mes, renovable de forma manual.",
    features: [
      "Presupuestos y planeación por ciclo",
      "Movimientos, cuentas y pagos programados",
      "Ahorros, deudas y calendario",
      "Análisis y exportables cuando estén listos",
    ],
    availability: "available-to-request",
  },
  {
    id: "anual",
    name: "Anual",
    cadence: "Facturación anual",
    summary: "El mismo acceso, con una vigencia más larga y menos renovaciones.",
    features: [
      "Todo lo incluido en el plan mensual",
      "Una sola solicitud de activación al año",
      "Prioridad de revisión en activaciones",
      "Historial continuo de tus ciclos",
    ],
    highlighted: true,
    availability: "available-to-request",
  },
]
