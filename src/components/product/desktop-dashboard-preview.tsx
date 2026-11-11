import { DemoBadge } from "@/components/product/demo-badge"
import { demoFinance } from "@/components/product/demo-data"
import { formatCop } from "@/lib/format"

export function DesktopDashboardPreview() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_28px_70px_-36px_rgb(23_36_60_/_0.5)] ring-1 ring-[#e5eaf1]">
      <div className="flex items-center gap-3 border-b border-[#e5eaf1] bg-[#f7f9fc] px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#d7dee8]" />
          <span className="size-2.5 rounded-full bg-[#d7dee8]" />
          <span className="size-2.5 rounded-full bg-[#d7dee8]" />
        </div>
        <p className="min-w-0 truncate text-[11px] text-[#5b6b82]">
          VIVO Planner · {demoFinance.cycleLabel}
        </p>
        <DemoBadge className="ml-auto shrink-0" />
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-[20px] bg-[#17243c] px-4 py-4 text-white">
          <p className="text-[11px] text-white/65">Disponible para gastar</p>
          <p className="mt-1 text-[1.7rem] leading-none font-semibold tracking-tight money">
            {formatCop(demoFinance.available)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
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

        <div className="grid grid-cols-3 gap-2">
          {demoFinance.accounts.map((account) => (
            <div key={account.name} className="rounded-2xl bg-[#f7f9fc] px-2.5 py-2.5">
              <p className="truncate text-[11px] text-[#5b6b82]">{account.name}</p>
              <p className="mt-1 text-[12px] font-semibold tracking-tight money">
                {formatCop(account.amount)}
              </p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-[#5b6b82]">Últimos movimientos</p>
          <div className="space-y-2">
            {demoFinance.movements.slice(0, 3).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-[#f7f9fc] px-3 py-2"
              >
                <div>
                  <p className="text-[13px] font-medium">{item.name}</p>
                  <p className="text-[11px] text-[#5b6b82]">{item.date}</p>
                </div>
                <p
                  className={`text-[13px] font-medium money ${
                    item.type === "ingreso" ? "text-[#16a34a]" : "text-[#17243c]"
                  }`}
                >
                  {item.type === "ingreso" ? "+" : "−"}
                  {formatCop(item.amount)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[#fef2f2] px-3 py-2.5">
            <p className="text-[11px] font-medium text-[#dc2626]">Próximo pago</p>
            <div className="mt-0.5 flex items-baseline justify-between gap-2">
              <p className="text-[13px] font-medium">
                {demoFinance.nextPayment.name} · {demoFinance.nextPayment.due}
              </p>
              <p className="text-[13px] font-semibold money">
                {formatCop(demoFinance.nextPayment.amount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
