import { Suspense } from "react"

import { FinancialHome } from "@/components/finance-home/financial-home"
import { requireAppAccess } from "@/lib/auth/access"
import { resolveCapabilities, resolveEntitlement } from "@/lib/auth/capabilities"
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

  const balances = computeAccountBalances(data.accounts, data.ledgerTransactions)
  const accountBalance = addAmounts(...balances.map((item) => item.balance))
  const cycleMetrics = computeCycleMetrics(data.cycleTransactions)
  const budgetRows = computeBudgetRows(
    data.categories,
    data.budgets,
    data.cycleTransactions,
    data.scheduledPayments
  )
  const availableToBudget = computeAvailableToBudget(cycleMetrics.incomes, budgetRows)
  const groups = groupBudgetTotals(budgetRows)
  const upcoming = data.scheduledPayments
    .filter((item) => item.status !== "paid" && item.status !== "cancelled")
    .slice(0, 4)
  const recent = data.cycleTransactions.filter((item) => item.status === "posted").slice(0, 6)
  const budgetRemaining = addAmounts(
    ...groups.map((item) => item.remaining)
  )

export default function AppHomePage() {
  return (
    <Suspense fallback={<div className="h-40 rounded-[28px] bg-white" />}>
      <HomeContent />
    </Suspense>
  )
}

async function HomeContent() {
  const access = await requireAppAccess()
  const data = await getFinanceBootstrap(access.user!.id)
  const userName = access.profile?.full_name || access.user?.email || "Hola"

  return (
    <FinancialHome
      data={data}
      userName={userName}
      entitlement={resolveEntitlement(access)}
      capabilities={resolveCapabilities(access)}
      onboardingCompleted={Boolean(access.profile?.onboarding_completed_at)}
    />
  )
}
