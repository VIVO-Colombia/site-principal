"use client"

import { Area, AreaChart, ResponsiveContainer } from "recharts"

import { demoFinance } from "@/components/product/demo-data"
import { formatCop } from "@/lib/format"

export function BudgetMini() {
  return (
    <div className="space-y-2.5">
      {demoFinance.categories.map((category) => {
        const percent = Math.min(100, Math.round((category.used / category.planned) * 100))
        return (
          <div key={category.name}>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="font-medium">{category.name}</span>
              <span className="text-[#5b6b82]">{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#eef2f7]">
              <div
                className="h-full rounded-full bg-[#2563eb]"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function MovementsMini() {
  return (
    <div className="space-y-2">
      {demoFinance.movements.map((item) => (
        <div key={item.name} className="flex items-center justify-between text-[13px]">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-[11px] text-[#5b6b82]">{item.date}</p>
          </div>
          <p className={`money ${item.type === "ingreso" ? "text-[#16a34a]" : ""}`}>
            {item.type === "ingreso" ? "+" : "−"}
            {formatCop(item.amount)}
          </p>
        </div>
      ))}
    </div>
  )
}

export function PaymentsMini() {
  return (
    <div className="rounded-2xl bg-[#f7f9fc] p-3">
      <p className="text-[11px] text-[#5b6b82]">Vence {demoFinance.nextPayment.due}</p>
      <p className="mt-1 text-sm font-semibold">{demoFinance.nextPayment.name}</p>
      <p className="money text-sm">{formatCop(demoFinance.nextPayment.amount)}</p>
      <span className="mt-2 inline-flex rounded-full bg-[#fef2f2] px-2 py-1 text-[11px] font-medium text-[#dc2626]">
        En {demoFinance.nextPayment.days} días
      </span>
    </div>
  )
}

export function AccountsMini() {
  return (
    <div className="space-y-2">
      {demoFinance.accounts.map((account) => (
        <div key={account.name} className="flex items-center justify-between text-[13px]">
          <span>{account.name}</span>
          <span className="font-medium money">{formatCop(account.amount)}</span>
        </div>
      ))}
    </div>
  )
}

export function GoalsMini() {
  return (
    <div className="grid grid-cols-2 gap-2 text-[12px]">
      <div className="rounded-2xl bg-[#f0fdf4] p-3">
        <p className="text-[#16a34a]">Ahorro</p>
        <p className="mt-1 font-semibold money">{formatCop(850_000)}</p>
        <p className="text-[#5b6b82]">Meta 2.000.000</p>
      </div>
      <div className="rounded-2xl bg-[#fff7ed] p-3">
        <p className="text-[#c2410c]">Deuda</p>
        <p className="mt-1 font-semibold money">{formatCop(3_400_000)}</p>
        <p className="text-[#5b6b82]">2 obligaciones</p>
      </div>
    </div>
  )
}

export function AnalysisMini() {
  return (
    <div className="h-[92px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={demoFinance.trend} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="gastos"
            stroke="#2563EB"
            strokeWidth={2}
            fill="url(#gastos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
