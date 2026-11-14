import {
  Bell,
  Home,
  LayoutGrid,
  Plus,
  ArrowLeftRight,
  CalendarRange,
} from "lucide-react"

import { DemoBadge } from "@/components/product/demo-badge"
import { demoFinance } from "@/components/product/demo-data"
import { formatCop } from "@/lib/format"

export function MobileAppPreview({ tall = false }: { tall?: boolean }) {
  const usedWidth = `${demoFinance.budgetPercent}%`

  return (
    <div className={`flex flex-col bg-[#f7f9fc] ${tall ? "min-h-[560px]" : "min-h-[480px]"}`}>
      <div className="flex items-center justify-between px-5 pt-4 pb-1 text-[11px] font-medium text-[#5b6b82]">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded-[2px] border border-current" />
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-[#5b6b82]">Ejemplo</p>
            <DemoBadge />
          </div>
          <p className="mt-0.5 whitespace-nowrap text-[13px] font-semibold tracking-tight text-[#17243c]">
            {demoFinance.cycleLabel}
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[#e5eaf1]">
          <Bell className="size-4 text-[#17243c]" />
        </span>
      </div>

      <div className="mx-4 mt-4 rounded-3xl bg-[#17243c] px-5 py-5 text-white">
        <p className="text-[12px] text-white/70">Disponible para gastar</p>
        <p className="mt-1 text-[28px] leading-none font-semibold tracking-tight money">
          {formatCop(demoFinance.available)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-2xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10">
            <p className="text-white/60">Ingresos</p>
            <p className="mt-0.5 font-medium text-[#86efac] money">
              +{formatCop(demoFinance.income)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10">
            <p className="text-white/60">Gastos</p>
            <p className="mt-0.5 font-medium text-[#fca5a5] money">
              −{formatCop(demoFinance.expenses)}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        {["Gasto", "Ingreso", "Pago"].map((label) => (
          <div
            key={label}
            className="flex h-11 items-center justify-center rounded-2xl bg-white text-[12px] font-medium text-[#17243c] ring-1 ring-[#e5eaf1]"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="mx-4 mt-3 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-[#e5eaf1]">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-medium text-[#17243c]">Presupuesto del ciclo</p>
          <p className="text-[12px] text-[#5b6b82]">{demoFinance.budgetPercent}%</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef2f7]">
          <div
            className="h-full rounded-full bg-[#2563eb]"
            style={{ width: usedWidth }}
          />
        </div>
        <p className="mt-2 text-[11px] text-[#5b6b82]">
          {formatCop(demoFinance.budgetUsed)} de {formatCop(demoFinance.budgetPlanned)}
        </p>
      </div>

      <div className="mx-4 mt-3 mb-16 flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-[#e5eaf1]">
        <div>
          <p className="text-[11px] text-[#5b6b82]">Próximo pago</p>
          <p className="text-[13px] font-medium text-[#17243c]">
            {demoFinance.nextPayment.name} · {demoFinance.nextPayment.due}
          </p>
        </div>
        <p className="text-[13px] font-semibold money text-[#17243c]">
          {formatCop(demoFinance.nextPayment.amount)}
        </p>
      </div>

      <div className="relative mt-auto border-t border-[#e5eaf1] bg-white px-2 pt-2 pb-3">
        <div className="grid grid-cols-4 text-[10px] text-[#5b6b82]">
          <div className="flex flex-col items-center gap-1 text-[#2563eb]">
            <Home className="size-4" />
            Inicio
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowLeftRight className="size-4" />
            Movimientos
          </div>
          <div className="flex flex-col items-center gap-1">
            <CalendarRange className="size-4" />
            Planeación
          </div>
          <div className="flex flex-col items-center gap-1">
            <LayoutGrid className="size-4" />
            Más
          </div>
        </div>
        <span className="pointer-events-none absolute -top-5 left-1/2 grid size-11 -translate-x-1/2 place-items-center rounded-full bg-[#2563eb] text-white shadow-[0_8px_16px_rgb(37_99_235_/_0.28)]">
          <Plus className="size-5" />
        </span>
      </div>
    </div>
  )
}
