import { Bell, Wallet } from "lucide-react"

import { demoFinance } from "@/components/product/demo-data"
import { formatCop } from "@/lib/format"
import { cn } from "cn"

export function BalanceCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgb(23_36_60_/_0.4)] ring-1 ring-[#e5eaf1]",
        compact ? "max-w-none p-3" : "max-w-[240px] p-4"
      )}
    >
      <div className="flex items-center gap-2 text-[#5b6b82]">
        <Wallet className={compact ? "size-3.5" : "size-4"} />
        <span className="text-[11px] font-medium">Saldo disponible</span>
      </div>
      <p className={cn("mt-1.5 font-semibold tracking-tight money", compact ? "text-[18px]" : "text-[22px]")}>
        {formatCop(demoFinance.available)}
      </p>
      {compact ? null : <p className="mt-0.5 text-[11px] text-[#16a34a]">Después de gastos del ciclo</p>}
    </div>
  )
}

export function UpcomingPaymentCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgb(23_36_60_/_0.4)] ring-1 ring-[#e5eaf1]",
        compact ? "max-w-none p-3" : "max-w-[240px] p-4"
      )}
    >
      <div className="flex items-center gap-2 text-[#dc2626]">
        <Bell className={compact ? "size-3.5" : "size-4"} />
        <span className="text-[11px] font-medium">Próximo pago</span>
      </div>
      <p className={cn("mt-1.5 font-semibold", compact ? "text-[13px]" : "text-sm")}>
        {demoFinance.nextPayment.name}
      </p>
      <p className="text-[12px] text-[#5b6b82]">
        {demoFinance.nextPayment.due} · {demoFinance.nextPayment.when}
      </p>
      <p className="mt-1 text-sm font-medium money">{formatCop(demoFinance.nextPayment.amount)}</p>
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
