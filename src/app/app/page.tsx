import Link from "next/link"
import type { ComponentType } from "react"
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
} from "lucide-react"

import { CycleForm } from "@/components/finance/cycle-form"
import { EmptyState } from "@/components/shared/empty-state"
import { requireAppAccess } from "@/lib/auth/access"
import {
  computeAccountBalances,
  computeAvailableToBudget,
  computeBudgetRows,
  computeCycleMetrics,
  groupBudgetTotals,
} from "@/lib/finance/calculations"
import { categoryGroupLabels, transactionKindLabels } from "@/lib/finance/labels"
import { getFinanceBootstrap } from "@/lib/finance/queries"
import { formatCop, formatShortDate } from "@/lib/format"
import { appRoutes } from "@/config/routes"
import { addAmounts } from "@/lib/finance/money"

export default async function AppHomePage() {
  const access = await requireAppAccess()
  const data = await getFinanceBootstrap(access.user!.id)
  const firstName = access.profile?.full_name?.split(" ")[0] ?? "Hola"

  if (!data.cycle) {
    return (
      <div className="mx-auto grid max-w-2xl gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hola, {firstName}</h1>
          <p className="mt-1 text-sm text-[#5b6b82]">
            Empieza creando un ciclo financiero. No tiene que coincidir con el mes calendario.
          </p>
        </div>
        <CycleForm cycles={data.cycles} readOnly={access.readOnly} />
      </div>
    )
  }

  const balances = computeAccountBalances(data.accounts, data.transactions)
  const accountBalance = addAmounts(...balances.map((item) => item.balance))
  const cycleMetrics = computeCycleMetrics(data.transactions)
  const budgetRows = computeBudgetRows(data.categories, data.budgets, data.transactions, data.scheduledPayments)
  const availableToBudget = computeAvailableToBudget(cycleMetrics.incomes, budgetRows)
  const groups = groupBudgetTotals(budgetRows)
  const upcoming = data.scheduledPayments
    .filter((item) => item.status !== "paid" && item.status !== "cancelled")
    .slice(0, 4)
  const recent = data.transactions.filter((item) => item.status === "posted").slice(0, 6)
  const budgetRemaining = addAmounts(
    ...groups.map((item) => item.remaining)
  )

  return (
    <div className="mx-auto grid max-w-5xl gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {firstName}</h1>
        <p className="text-sm text-[#5b6b82]">{data.cycle.name}</p>
      </div>

      <section className="rounded-[28px] bg-[#17243c] p-5 text-white">
        <p className="text-sm text-white/70">Disponible del periodo</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCop(cycleMetrics.cycleBalance)}</p>
        <dl className="mt-5 grid grid-cols-3 gap-2 text-xs">
          <div>
            <dt className="text-white/60">Ingresos</dt>
            <dd className="mt-1 font-medium">{formatCop(cycleMetrics.incomes)}</dd>
          </div>
          <div>
            <dt className="text-white/60">Salidas</dt>
            <dd className="mt-1 font-medium">{formatCop(cycleMetrics.outflows)}</dd>
          </div>
          <div>
            <dt className="text-white/60">Presupuesto</dt>
            <dd className="mt-1 font-medium">{formatCop(budgetRemaining)}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric label="Saldo real de cuentas" value={formatCop(accountBalance)} hint="Suma de saldos, incluidas transferencias internas." />
        <Metric label="Balance del ciclo" value={formatCop(cycleMetrics.cycleBalance)} hint="Ingresos menos salidas. Las transferencias no cuentan." />
        <Metric label="Disponible para presupuestar" value={formatCop(availableToBudget)} hint="Ingresos del ciclo menos lo ya planeado." />
      </section>

      <section className="grid grid-cols-4 gap-2">
        <QuickAction href={`${appRoutes.movements}?nuevo=1&tipo=expense`} label="Gasto" icon={ArrowUpRight} />
        <QuickAction href={`${appRoutes.movements}?nuevo=1&tipo=income`} label="Ingreso" icon={ArrowDownLeft} />
        <QuickAction href={`${appRoutes.movements}?nuevo=1&tipo=transfer`} label="Transferir" icon={ArrowLeftRight} />
        <QuickAction href={`${appRoutes.payments}?nuevo=1`} label="Programar" icon={CalendarClock} />
      </section>

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <h2 className="font-semibold">Presupuesto</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <div key={group.group} className="rounded-2xl bg-[#f7f9fc] p-3">
              <p className="text-sm font-medium">{categoryGroupLabels[group.group]}</p>
              <p className="mt-1 text-xs text-[#5b6b82]">
                {formatCop(group.executed)} de {formatCop(group.planned)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Próximos pagos</h2>
          <Link href={appRoutes.payments} className="text-sm text-primary">
            Ver todos
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-[#5b6b82]">No hay compromisos pendientes en este ciclo.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {upcoming.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-2xl bg-[#f7f9fc] px-3 py-2 text-sm">
                <span>
                  {item.name}
                  <span className="block text-xs text-[#5b6b82]">{formatShortDate(item.due_on)}</span>
                </span>
                <span className="font-medium">{formatCop(item.expected_amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Últimos movimientos</h2>
          <Link href={appRoutes.movements} className="text-sm text-primary">
            Ver todos
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="Aún no hay movimientos"
            description="Registra un ingreso o un gasto para ver saldos reales."
            action={{ href: `${appRoutes.movements}?nuevo=1`, label: "Registrar movimiento" }}
          />
        ) : (
          <ul className="mt-3 grid gap-2">
            {recent.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span>
                  {item.description || transactionKindLabels[item.kind]}
                  <span className="block text-xs text-[#5b6b82]">{formatShortDate(item.occurred_on)}</span>
                </span>
                <span className={item.kind === "income" ? "text-[#16a34a]" : item.kind === "transfer" ? "text-[#5b6b82]" : "text-[#dc2626]"}>
                  {item.kind === "income" ? "+" : item.kind === "transfer" ? "" : "−"}
                  {formatCop(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
      <p className="text-xs text-[#5b6b82]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-[#7c93b5]">{hint}</p>
    </div>
  )
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Link href={href} className="grid min-h-20 place-items-center gap-1 rounded-[20px] bg-white text-center text-xs ring-1 ring-[#e5eaf1]">
      <Icon className="size-5 text-primary" />
      {label}
    </Link>
  )
}
