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

export type AccountBalance = {
  accountId: string
  name: string
  kind: FinancialAccount["kind"]
  isActive: boolean
  includeInTotal?: boolean
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
      includeInTotal: account.include_in_total !== false,
      opening,
      balance,
      negative: balance < 0,
    }
  })
}

export function computeIncludedBalance(balances: AccountBalance[]) {
  return addAmounts(
    ...balances.filter((item) => item.isActive && item.includeInTotal !== false).map((item) => item.balance)
  )
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

export function computeBudgetRows(
  categories: FinancialCategory[],
  budgets: FinancialBudget[],
  transactions: Pick<FinancialTransaction, "category_id" | "kind" | "amount" | "status">[],
  scheduledPayments: Pick<ScheduledPayment, "category_id" | "paid_amount" | "status">[] = []
): BudgetRow[] {
  const posted = transactions.filter((item) => item.status === "posted")

  return categories
    .filter((category) => category.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "es"))
    .map((category) => {
      const planned = toAmount(
        budgets.find((item) => item.category_id === category.id)?.planned_amount
      )

      let executed = 0
      if (category.group_code === "income") {
        executed = addAmounts(
          ...posted
            .filter((item) => item.category_id === category.id && item.kind === "income")
            .map((item) => item.amount)
        )
      } else if (category.group_code === "scheduled_payment") {
        const fromCommitments = addAmounts(
          ...scheduledPayments
            .filter((item) => item.category_id === category.id && item.status !== "cancelled")
            .map((item) => item.paid_amount)
        )
        const fromTransactions = addAmounts(
          ...posted
            .filter(
              (item) =>
                item.category_id === category.id &&
                (item.kind === "expense" || item.kind === "debt_payment")
            )
            .map((item) => item.amount)
        )
        executed = Math.max(fromCommitments, fromTransactions)
      } else {
        const kinds: TransactionKind[] =
          category.group_code === "savings"
            ? ["savings_contribution"]
            : category.group_code === "debt"
              ? ["debt_payment"]
              : ["expense"]
        executed = addAmounts(
          ...posted
            .filter((item) => item.category_id === category.id && kinds.includes(item.kind))
            .map((item) => item.amount)
        )
      }

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
