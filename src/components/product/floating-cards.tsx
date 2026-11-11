import { Bell, Wallet } from "lucide-react"

import { demoFinance } from "@/components/product/demo-data"
import { formatCop } from "@/lib/format"

export function BalanceCard() {
  return (
    <div className="w-full max-w-[240px] rounded-2xl bg-white p-4 shadow-[0_18px_40px_-24px_rgb(23_36_60_/_0.4)] ring-1 ring-[#e5eaf1]">
      <div className="flex items-center gap-2 text-[#5b6b82]">
        <Wallet className="size-4" />
        <span className="text-[11px] font-medium">Saldo disponible</span>
      </div>
      <p className="mt-2 text-[22px] font-semibold tracking-tight money">
        {formatCop(demoFinance.available)}
      </p>
      <p className="mt-1 text-[11px] text-[#16a34a]">Después de gastos del ciclo</p>
    </div>
  )
}

export function UpcomingPaymentCard() {
  return (
    <div className="w-full max-w-[240px] rounded-2xl bg-white p-4 shadow-[0_18px_40px_-24px_rgb(23_36_60_/_0.4)] ring-1 ring-[#e5eaf1]">
      <div className="flex items-center gap-2 text-[#dc2626]">
        <Bell className="size-4" />
        <span className="text-[11px] font-medium">Próximo pago</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{demoFinance.nextPayment.name}</p>
      <p className="text-[12px] text-[#5b6b82]">
        {demoFinance.nextPayment.due} · en {demoFinance.nextPayment.days} días
      </p>
      <p className="mt-1 text-sm font-medium money">
        {formatCop(demoFinance.nextPayment.amount)}
      </p>
    </div>
  )
}

export function QuickActionsCard() {
  return (
    <div className="flex gap-2">
      {["Gasto", "Ingreso"].map((label) => (
        <span
          key={label}
          className="rounded-full bg-white px-3 py-2 text-[12px] font-medium shadow-[0_10px_24px_-16px_rgb(23_36_60_/_0.45)] ring-1 ring-[#e5eaf1]"
        >
          {label}
        </span>
      ))}
    </div>
  )
}
