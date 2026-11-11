import { describe, expect, it } from "vitest"

import {
  computeAccountBalances,
  computeAvailableToBudget,
  computeBudgetRows,
  computeCycleMetrics,
  computeIncludedBalance,
} from "../src/lib/finance/calculations"
import { parseAmountInput, toAmount } from "../src/lib/finance/money"
import type {
  FinancialAccount,
  FinancialBudget,
  FinancialCategory,
  FinancialTransaction,
  ScheduledPayment,
} from "../src/types/database"

function account(partial: Partial<FinancialAccount> & { id: string; name: string }): FinancialAccount {
  return {
    user_id: "u1",
    kind: "cash",
    currency: "COP",
    opening_balance: 0,
    allow_negative: true,
    is_active: true,
    notes: null,
    ...partial,
  }
}

function category(
  partial: Partial<FinancialCategory> & { id: string; name: string; group_code: FinancialCategory["group_code"] }
): FinancialCategory {
  return {
    user_id: "u1",
    color: null,
    icon: null,
    is_active: true,
    sort_order: 1,
    ...partial,
  }
}

function tx(
  partial: Partial<FinancialTransaction> & {
    id: string
    kind: FinancialTransaction["kind"]
    amount: number
    account_id: string
  }
): FinancialTransaction {
  return {
    user_id: "u1",
    cycle_id: "c1",
    counterparty_account_id: null,
    category_id: null,
    scheduled_payment_id: null,
    scheduled_income_id: null,
    status: "posted",
    occurred_on: "2026-04-10",
    description: null,
    notes: null,
    voided_at: null,
    created_at: "2026-04-10T00:00:00Z",
    ...partial,
  }
}

describe("money parsing", () => {
  it("accepts Colombian thousands separators", () => {
    expect(parseAmountInput("1.500.000")).toBe(1500000)
    expect(parseAmountInput("1.500,50")).toBe(1500.5)
  })
})

describe("account balances", () => {
  it("applies a transfer once on each side and never as income/expense", () => {
    const accounts = [
      account({ id: "a1", name: "Banco", opening_balance: 1000 }),
      account({ id: "a2", name: "Efectivo", opening_balance: 0 }),
    ]
    const transactions = [
      tx({ id: "t1", kind: "income", amount: 500, account_id: "a1" }),
      tx({ id: "t2", kind: "expense", amount: 200, account_id: "a1" }),
      tx({
        id: "t3",
        kind: "transfer",
        amount: 100,
        account_id: "a1",
        counterparty_account_id: "a2",
      }),
    ]

    const balances = computeAccountBalances(accounts, transactions)
    expect(balances.find((item) => item.accountId === "a1")?.balance).toBe(1200)
    expect(balances.find((item) => item.accountId === "a2")?.balance).toBe(100)

    const cycle = computeCycleMetrics(transactions)
    expect(cycle.incomes).toBe(500)
    expect(cycle.outflows).toBe(200)
    expect(cycle.cycleBalance).toBe(300)
  })

  it("uses the full ledger, including movements from other cycles", () => {
    const accounts = [account({ id: "a1", name: "Banco", opening_balance: 100 })]
    const transactions = [
      tx({ id: "t1", kind: "income", amount: 50, account_id: "a1", cycle_id: "c-old" }),
      tx({ id: "t2", kind: "expense", amount: 20, account_id: "a1", cycle_id: "c-new" }),
    ]
    expect(computeAccountBalances(accounts, transactions)[0]?.balance).toBe(130)
  })

  it("ignores voided transactions", () => {
    const accounts = [account({ id: "a1", name: "Banco", opening_balance: 0 })]
    const transactions = [
      tx({ id: "t1", kind: "expense", amount: 80, account_id: "a1", status: "voided" }),
    ]
    expect(computeAccountBalances(accounts, transactions)[0]?.balance).toBe(0)
  })
})

describe("budgets", () => {
  it("recalculates execution from posted movements", () => {
    const categories: FinancialCategory[] = [
      category({ id: "food", name: "Alimentación", group_code: "expense" }),
    ]
    const budgets: FinancialBudget[] = [
      { id: "b1", user_id: "u1", cycle_id: "c1", category_id: "food", planned_amount: 300 },
    ]
    const transactions = [
      tx({ id: "t1", kind: "expense", amount: 120, account_id: "a1", category_id: "food" }),
    ]
    const rows = computeBudgetRows(categories, budgets, transactions)
    expect(rows[0]?.executed).toBe(120)
    expect(rows[0]?.difference).toBe(180)
    expect(computeAvailableToBudget(400, rows)).toBe(100)
  })

  it("does not double-count a scheduled payment that already has a linked movement", () => {
    const categories: FinancialCategory[] = [
      category({ id: "rent", name: "Arriendo", group_code: "scheduled_payment" }),
    ]
    const budgets: FinancialBudget[] = [
      { id: "b1", user_id: "u1", cycle_id: "c1", category_id: "rent", planned_amount: 1000 },
    ]
    const payments: ScheduledPayment[] = [
      {
        id: "p1",
        user_id: "u1",
        cycle_id: "c1",
        category_id: "rent",
        preferred_account_id: "a1",
        name: "Arriendo",
        expected_amount: 800,
        due_on: "2026-04-05",
        paid_amount: 800,
        status: "paid",
        notes: null,
      },
    ]
    const transactions = [
      tx({
        id: "t1",
        kind: "expense",
        amount: 800,
        account_id: "a1",
        category_id: "rent",
        scheduled_payment_id: "p1",
      }),
    ]

    expect(computeBudgetRows(categories, budgets, transactions, payments)[0]?.executed).toBe(800)
  })

  it("attributes a linked payment to the commitment category even if the movement has none", () => {
    const categories: FinancialCategory[] = [
      category({ id: "rent", name: "Arriendo", group_code: "scheduled_payment" }),
    ]
    const payments: ScheduledPayment[] = [
      {
        id: "p1",
        user_id: "u1",
        cycle_id: "c1",
        category_id: "rent",
        preferred_account_id: "a1",
        name: "Arriendo",
        expected_amount: 500,
        due_on: "2026-04-05",
        paid_amount: 500,
        status: "paid",
        notes: null,
      },
    ]
    const transactions = [
      tx({
        id: "t1",
        kind: "expense",
        amount: 500,
        account_id: "a1",
        category_id: null,
        scheduled_payment_id: "p1",
      }),
    ]

    expect(computeBudgetRows(categories, [], transactions, payments)[0]?.executed).toBe(500)
  })

  it("keeps an unlinked expense and a linked commitment in the same category without overlap", () => {
    const categories: FinancialCategory[] = [
      category({ id: "rent", name: "Arriendo", group_code: "scheduled_payment" }),
    ]
    const payments: ScheduledPayment[] = [
      {
        id: "p1",
        user_id: "u1",
        cycle_id: "c1",
        category_id: "rent",
        preferred_account_id: "a1",
        name: "Arriendo",
        expected_amount: 400,
        due_on: "2026-04-05",
        paid_amount: 400,
        status: "paid",
        notes: null,
      },
    ]
    const transactions = [
      tx({
        id: "t1",
        kind: "expense",
        amount: 400,
        account_id: "a1",
        category_id: "rent",
        scheduled_payment_id: "p1",
      }),
      tx({
        id: "t2",
        kind: "expense",
        amount: 50,
        account_id: "a1",
        category_id: "rent",
      }),
    ]

    expect(computeBudgetRows(categories, [], transactions, payments)[0]?.executed).toBe(450)
  })
})

describe("amounts", () => {
  it("rounds money to cents", () => {
    expect(toAmount("10.129")).toBe(10.13)
  })
})
