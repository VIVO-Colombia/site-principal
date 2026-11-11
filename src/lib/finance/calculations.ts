import { addAmounts, toAmount } from "@/lib/finance/money"
import type {
  CategoryGroup,
  FinancialAccount,
  FinancialBudget,
  FinancialCategory,
  FinancialTransaction,
  ScheduledPayment,
  TransactionKind,
} from "@/types/database"

const outflowKinds: TransactionKind[] = ["expense", "savings_contribution", "debt_payment"]

const kindsByGroup: Record<CategoryGroup, TransactionKind[]> = {
  income: ["income"],
  scheduled_payment: ["expense", "debt_payment", "savings_contribution"],
  expense: ["expense"],
  savings: ["savings_contribution"],
  debt: ["debt_payment"],
}

export type AccountBalance = {
  accountId: string
  name: string
  kind: FinancialAccount["kind"]
  isActive: boolean
  opening: number
  balance: number
  negative: boolean
}

export function computeAccountBalances(
  accounts: FinancialAccount[],
  transactions: Pick<FinancialTransaction, "account_id" | "counterparty_account_id" | "kind" | "amount" | "status">[]
): AccountBalance[] {
  const posted = transactions.filter((item) => item.status === "posted")

  return accounts.map((account) => {
    const opening = toAmount(account.opening_balance)
    let movement = 0

    for (const tx of posted) {
      const amount = toAmount(tx.amount)
      if (tx.kind === "transfer") {
        if (tx.account_id === account.id) movement -= amount
        if (tx.counterparty_account_id === account.id) movement += amount
        continue
      }
      if (tx.account_id !== account.id) continue
      movement += tx.kind === "income" ? amount : -amount
    }

    const balance = addAmounts(opening, movement)
    return {
      accountId: account.id,
      name: account.name,
      kind: account.kind,
      isActive: account.is_active,
      opening,
      balance,
      negative: balance < 0,
    }
  })
}

export function computeCycleMetrics(
  transactions: Pick<FinancialTransaction, "kind" | "amount" | "status">[]
) {
  const posted = transactions.filter((item) => item.status === "posted")
  const incomes = addAmounts(
    ...posted.filter((item) => item.kind === "income").map((item) => item.amount)
  )
  const outflows = addAmounts(
    ...posted.filter((item) => outflowKinds.includes(item.kind)).map((item) => item.amount)
  )

  return {
    incomes,
    outflows,
    cycleBalance: addAmounts(incomes, -outflows),
  }
}

export type BudgetRow = {
  categoryId: string
  name: string
  group: CategoryGroup
  planned: number
  executed: number
  difference: number
  percent: number
}

export function resolveBudgetCategoryId(
  transaction: Pick<FinancialTransaction, "category_id" | "scheduled_payment_id" | "kind">,
  paymentsById: Map<string, Pick<ScheduledPayment, "id" | "category_id">>
): string | null {
  if (transaction.kind === "transfer") return null
  if (transaction.scheduled_payment_id) {
    const payment = paymentsById.get(transaction.scheduled_payment_id)
    return payment?.category_id ?? transaction.category_id ?? null
  }
  return transaction.category_id ?? null
}

export function computeBudgetRows(
  categories: FinancialCategory[],
  budgets: FinancialBudget[],
  transactions: Pick<
    FinancialTransaction,
    "category_id" | "kind" | "amount" | "status" | "scheduled_payment_id"
  >[],
  scheduledPayments: Pick<ScheduledPayment, "id" | "category_id" | "paid_amount" | "status">[] = []
): BudgetRow[] {
  const posted = transactions.filter((item) => item.status === "posted")
  const paymentsById = new Map(scheduledPayments.map((item) => [item.id, item]))
  const budgetByCategory = new Map(budgets.map((item) => [item.category_id, item]))
  const categoriesById = new Map(categories.map((item) => [item.id, item]))

  const visibleIds = new Set<string>()
  for (const category of categories) {
    if (category.is_active) visibleIds.add(category.id)
  }
  for (const budget of budgets) {
    visibleIds.add(budget.category_id)
  }

  const executedByCategory = new Map<string, number>()
  for (const tx of posted) {
    const categoryId = resolveBudgetCategoryId(tx, paymentsById)
    if (!categoryId) continue
    const category = categoriesById.get(categoryId)
    if (!category) continue
    if (!kindsByGroup[category.group_code].includes(tx.kind)) continue
    executedByCategory.set(categoryId, addAmounts(executedByCategory.get(categoryId), tx.amount))
    visibleIds.add(categoryId)
  }

  return [...visibleIds]
    .map((categoryId) => categoriesById.get(categoryId))
    .filter((category): category is FinancialCategory => Boolean(category))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "es"))
    .map((category) => {
      const planned = toAmount(budgetByCategory.get(category.id)?.planned_amount)
      const executed = toAmount(executedByCategory.get(category.id))
      const difference = addAmounts(planned, -executed)
      return {
        categoryId: category.id,
        name: category.name,
        group: category.group_code,
        planned,
        executed,
        difference,
        percent: planned > 0 ? Math.round((executed / planned) * 100) : executed > 0 ? 100 : 0,
      }
    })
}

export function computeAvailableToBudget(incomes: number, budgetRows: BudgetRow[]) {
  const assigned = addAmounts(
    ...budgetRows.filter((row) => row.group !== "income").map((row) => row.planned)
  )
  return addAmounts(incomes, -assigned)
}

export function groupBudgetTotals(rows: BudgetRow[]) {
  const groups: CategoryGroup[] = ["scheduled_payment", "expense", "savings", "debt"]
  return groups.map((group) => {
    const subset = rows.filter((row) => row.group === group)
    const planned = addAmounts(...subset.map((row) => row.planned))
    const executed = addAmounts(...subset.map((row) => row.executed))
    return { group, planned, executed, remaining: addAmounts(planned, -executed) }
  })
}
