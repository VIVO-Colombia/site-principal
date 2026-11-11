import { DemoBadge } from "@/components/product/demo-badge"
import { demoFinance } from "@/components/product/demo-data"
import { formatCop } from "@/lib/format"

export function DesktopDashboardPreview() {
  return (
    <div className="w-[380px] overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_-32px_rgb(23_36_60_/_0.45)] ring-1 ring-[#e5eaf1]">
      <div className="flex items-center justify-between border-b border-[#e5eaf1] px-5 py-3">
        <div>
          <p className="text-[11px] text-[#5b6b82]">Resumen del ciclo</p>
          <p className="text-sm font-semibold tracking-tight">{demoFinance.cycleLabel}</p>
        </div>
        <DemoBadge />
      </div>
      <div className="grid grid-cols-3 gap-3 px-5 py-4">
        <MiniStat label="Disponible" value={formatCop(demoFinance.available)} />
        <MiniStat label="Ingresos" value={formatCop(demoFinance.income)} tone="positive" />
        <MiniStat label="Gastos" value={formatCop(demoFinance.expenses)} tone="alert" />
      </div>
      <div className="px-5 pb-5">
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
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "positive" | "alert"
}) {
  return (
    <div className="rounded-2xl bg-[#f7f9fc] px-3 py-3">
      <p className="text-[11px] text-[#5b6b82]">{label}</p>
      <p
        className={`mt-1 text-[13px] font-semibold tracking-tight money ${
          tone === "positive"
            ? "text-[#16a34a]"
            : tone === "alert"
              ? "text-[#dc2626]"
              : "text-[#17243c]"
        }`}
      >
        {value}
      </p>
    </div>
  )
}
