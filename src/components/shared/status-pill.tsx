import { cn } from "cn"

const tones = {
  green: "bg-[#ecfdf3] text-[#166534]",
  blue: "bg-[#eff6ff] text-[#1d4ed8]",
  amber: "bg-[#fffbeb] text-[#92400e]",
  red: "bg-[#fef2f2] text-[#b91c1c]",
  slate: "bg-[#eef2f7] text-[#3d4d66]",
} as const

export function StatusPill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode
  tone?: keyof typeof tones
}) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium", tones[tone])}>
      {children}
    </span>
  )
}
