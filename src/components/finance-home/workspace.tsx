"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { RecordPaymentForm } from "@/components/finance/record-payment-form"
import { categoryGroupLabels, commitmentStatusLabels, transactionKindLabels } from "@/lib/finance/labels"
import { formatCop, formatShortDate } from "@/lib/format"
import type { BudgetRow } from "@/lib/finance/calculations"
import type {
  FinancialAccount,
  FinancialCategory,
  FinancialCycle,
  FinancialTransaction,
  ScheduledPayment,
} from "@/types/database"
import type { WorkspaceTab } from "@/components/finance-home/home-state"
import { cn } from "cn"

const tabLabels: Record<WorkspaceTab, string> = {
  movimientos: "Movimientos",
  pagos: "Pagos",
  presupuesto: "Presupuesto",
  analisis: "Análisis",
}

export function WorkspaceTabs({
  tab,
  onChange,
}: {
  tab: WorkspaceTab
  onChange: (tab: WorkspaceTab) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-full bg-white p-1 ring-1 ring-[#eae9e6]">
      {(Object.keys(tabLabels) as WorkspaceTab[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "min-h-10 flex-1 rounded-full px-3 text-[13px] font-medium whitespace-nowrap",
            tab === item ? "bg-[#191a1d] text-white" : "text-[#777a80]"
          )}
        >
          {tabLabels[item]}
        </button>
      ))}
    </div>
  )
}

export function TransactionList({
  transactions,
  accounts,
  categories,
  onOpen,
}: {
  transactions: FinancialTransaction[]
  accounts: FinancialAccount[]
  categories: FinancialCategory[]
  onOpen: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const visible = transactions
    .filter((item) => item.status === "posted")
    .filter((item) => {
      if (!query.trim()) return true
      const haystack = `${item.description ?? ""} ${transactionKindLabels[item.kind]}`.toLowerCase()
      return haystack.includes(query.trim().toLowerCase())
    })

  const grouped = useMemo(() => {
    const map = new Map<string, FinancialTransaction[]>()
    for (const item of visible) {
      const list = map.get(item.occurred_on) ?? []
      list.push(item)
      map.set(item.occurred_on, list)
    }
    return [...map.entries()]
  }, [visible])

  return (
    <div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar movimiento"
        className="h-11 w-full rounded-full border border-[#eae9e6] bg-white px-4 text-sm"
      />
      {grouped.length === 0 ? (
        <p className="mt-6 text-sm text-[#777a80]">Todavía no hay movimientos en este ciclo.</p>
      ) : (
        <div className="mt-4 space-y-5">
          {grouped.map(([date, items]) => (
            <section key={date}>
              <p className="text-[12px] font-medium tracking-wide text-[#777a80] uppercase">
                {formatShortDate(date)}
              </p>
              <ul className="mt-2 space-y-2">
                {items.map((item) => {
                  const account = accounts.find((row) => row.id === item.account_id)
                  const category = categories.find((row) => row.id === item.category_id)
                  const positive = item.kind === "income"
                  const transfer = item.kind === "transfer"
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onOpen(item.id)}
                        className="flex w-full items-center justify-between rounded-[22px] bg-white px-4 py-3 text-left ring-1 ring-[#eae9e6]"
                      >
                        <span>
                          <span className="block text-sm font-medium">
                            {item.description || category?.name || transactionKindLabels[item.kind]}
                          </span>
                          <span className="block text-[12px] text-[#777a80]">
                            {account?.name}
                            {category ? ` · ${category.name}` : ""}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold money",
                            positive ? "text-[#20a474]" : transfer ? "text-[#777a80]" : "text-[#191a1d]"
                          )}
                        >
                          {positive ? "+" : transfer ? "" : "−"}
                          {formatCop(item.amount)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export function PaymentBoard({
  payments,
  cycle,
  accounts,
  onOpen,
}: {
  payments: ScheduledPayment[]
  cycle: FinancialCycle | null
  accounts: FinancialAccount[]
  onOpen: (id: string) => void
}) {
  if (!cycle) return <p className="text-sm text-[#777a80]">Crea un ciclo para ver pagos.</p>
  if (payments.length === 0) {
    return <p className="text-sm text-[#777a80]">No hay compromisos en este ciclo.</p>
  }

  return (
    <ul className="space-y-2">
      {payments.map((item) => {
        const pending = Number(item.expected_amount) - Number(item.paid_amount)
        return (
          <li key={item.id} className="rounded-[22px] bg-white p-4 ring-1 ring-[#eae9e6]">
            <button type="button" onClick={() => onOpen(item.id)} className="flex w-full items-start justify-between text-left">
              <span>
                <span className="block text-sm font-medium">{item.name}</span>
                <span className="block text-[12px] text-[#777a80]">
                  {formatShortDate(item.due_on)} · {commitmentStatusLabels[item.status]}
                </span>
              </span>
              <span className="text-sm font-semibold money">{formatCop(pending > 0 ? pending : 0)}</span>
            </button>
            {item.status !== "paid" && item.status !== "cancelled" ? (
              <div className="mt-3 border-t border-[#f3f1ec] pt-3">
                <RecordPaymentForm payment={item} accounts={accounts} cycleId={cycle.id} />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function BudgetBoard({
  rows,
  onOpen,
}: {
  rows: BudgetRow[]
  onOpen: (id: string) => void
}) {
  const [group, setGroup] = useState<BudgetRow["group"]>("expense")
  const groups = ["expense", "scheduled_payment", "savings", "debt", "income"] as const
  const visible = rows.filter((row) => row.group === group)

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {groups.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setGroup(item)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-[12px]",
              group === item ? "bg-[#191a1d] text-white" : "bg-white text-[#777a80] ring-1 ring-[#eae9e6]"
            )}
          >
            {categoryGroupLabels[item]}
          </button>
        ))}
      </div>
      <ul className="mt-2 space-y-2">
        {visible.map((row) => (
          <li key={row.categoryId}>
            <button
              type="button"
              onClick={() => onOpen(row.categoryId)}
              className="w-full rounded-[22px] bg-white p-4 text-left ring-1 ring-[#eae9e6]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-[12px] text-[#777a80] money">
                  {formatCop(row.executed)} / {formatCop(row.planned)}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f3f1ec]">
                <div
                  className="h-full rounded-full bg-[#3568ed]"
                  style={{ width: `${Math.min(row.percent, 100)}%` }}
                />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AnalysisBoard({
  transactions,
  rows,
}: {
  transactions: FinancialTransaction[]
  rows: BudgetRow[]
}) {
  const posted = transactions.filter((item) => item.status === "posted")
  const byDay = posted.reduce<Record<string, { date: string; ingresos: number; gastos: number }>>((acc, item) => {
    const bucket = acc[item.occurred_on] ?? { date: item.occurred_on.slice(5), ingresos: 0, gastos: 0 }
    if (item.kind === "income") bucket.ingresos += Number(item.amount)
    if (item.kind === "expense" || item.kind === "debt_payment" || item.kind === "savings_contribution") {
      bucket.gastos += Number(item.amount)
    }
    acc[item.occurred_on] = bucket
    return acc
  }, {})
  const series = Object.keys(byDay)
    .sort()
    .map((key) => byDay[key])
  const top = rows
    .filter((row) => row.group !== "income")
    .sort((a, b) => b.executed - a.executed)
    .slice(0, 5)

  if (posted.length === 0) {
    return (
      <p className="text-sm text-[#777a80]">
        Cuando registres movimientos, aquí verás ingresos frente a gastos y las categorías que más pesan.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#eae9e6]">
        <p className="text-sm font-medium">Ingresos frente a gastos</p>
        <div className="mt-3 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <CartesianGrid stroke="#f3f1ec" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="ingresos" stroke="#20a474" fill="#20a47433" />
              <Area type="monotone" dataKey="gastos" stroke="#e45353" fill="#e4535333" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-[22px] bg-white p-4 ring-1 ring-[#eae9e6]">
        <p className="text-sm font-medium">Mayores salidas</p>
        <div className="mt-3 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="executed" fill="#3568ed" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
