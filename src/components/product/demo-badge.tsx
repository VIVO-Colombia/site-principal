import { DEMO_LABEL } from "@/components/product/demo-data"

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#e5eaf1] bg-white/90 px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#5b6b82] uppercase ${className ?? ""}`}
    >
      {DEMO_LABEL}
    </span>
  )
}
