import { cn } from "cn"

export function ConceptBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#d5deea] bg-white/90 px-2 py-0.5 text-[10px] font-medium tracking-wide whitespace-nowrap text-[#5b6b82] uppercase",
        className
      )}
    >
      Representación conceptual
    </span>
  )
}
