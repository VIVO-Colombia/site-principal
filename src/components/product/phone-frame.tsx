import { cn } from "cn"

export function PhoneFrame({
  children,
  className,
  compact = false,
}: {
  children: React.ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[min(100%,272px)] rounded-[36px] bg-[#1b283c] p-[9px] shadow-[0_30px_60px_-28px_rgb(23_36_60_/_0.55)]",
        compact && "w-[min(100%,240px)] rounded-[32px] p-[8px]",
        className
      )}
    >
      <div className="absolute top-3 left-1/2 z-10 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-black/80" />
      <div className="overflow-hidden rounded-[28px] bg-[#f7f9fc] ring-1 ring-white/10">
        {children}
      </div>
    </div>
  )
}
