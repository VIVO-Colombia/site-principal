import { redirect } from "next/navigation"

export default async function PlanningPage() {
  const access = await requireAppAccess()
  const data = await getFinanceBootstrap(access.user!.id)

  if (!data.cycle) {
    return (
      <div className="mx-auto grid max-w-2xl gap-4">
        <EmptyState
          title="Crea un ciclo para planear"
          description="Los presupuestos pertenecen a un ciclo concreto y no se reescriben al cambiar uno posterior."
        />
        <CycleForm cycles={data.cycles} readOnly={access.readOnly} />
      </div>
    )
  }

  const rows = computeBudgetRows(data.categories, data.budgets, data.cycleTransactions, data.scheduledPayments)

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Planeación</h1>
        <p className="text-sm text-[#5b6b82]">
          Categorías propias y presupuestos del ciclo {data.cycle.name}. El valor ejecutado se recalcula con los
          movimientos.
        </p>
      </div>
      <PlanningBoard cycle={data.cycle} rows={rows} readOnly={access.readOnly} />
    </div>
  )
}
