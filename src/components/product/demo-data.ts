export const DEMO_LABEL = "Demostración"

export const demoFinance = {
  cycleLabel: "16 oct — 15 nov",
  available: 2_480_000,
  income: 4_500_000,
  expenses: 2_020_000,
  budgetPlanned: 3_200_000,
  budgetUsed: 2_176_000,
  budgetPercent: 68,
  nextPayment: {
    name: "Arriendo",
    amount: 1_200_000,
    due: "12 nov",
    days: 2,
  },
  accounts: [
    { name: "Bancolombia", amount: 1_850_000 },
    { name: "Nequi", amount: 430_000 },
    { name: "Efectivo", amount: 200_000 },
  ],
  movements: [
    { name: "Nómina", type: "ingreso" as const, amount: 4_500_000, date: "30 oct" },
    { name: "Mercado", type: "gasto" as const, amount: 286_400, date: "2 nov" },
    { name: "Transporte", type: "gasto" as const, amount: 64_000, date: "4 nov" },
    { name: "Servicios", type: "gasto" as const, amount: 187_900, date: "6 nov" },
  ],
  categories: [
    { name: "Vivienda", used: 1_200_000, planned: 1_200_000 },
    { name: "Mercado", used: 540_000, planned: 700_000 },
    { name: "Transporte", used: 210_000, planned: 280_000 },
    { name: "Ocio", used: 226_000, planned: 250_000 },
  ],
  trend: [
    { name: "S1", ingresos: 0, gastos: 420 },
    { name: "S2", ingresos: 4500, gastos: 980 },
    { name: "S3", ingresos: 4500, gastos: 1480 },
    { name: "S4", ingresos: 4500, gastos: 2020 },
  ],
}
