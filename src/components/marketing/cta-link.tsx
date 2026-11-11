import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function CtaLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: "primary" | "secondary" | "navy"
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: variant === "secondary" ? "outline" : "default" }),
        "h-11 min-h-11 rounded-xl px-5 text-[15px] font-medium",
        variant === "primary" && "bg-primary text-white hover:bg-[#1d4ed8]",
        variant === "secondary" && "border-[#d5deea] bg-white text-foreground hover:bg-[#f7f9fc]",
        variant === "navy" &&
          "border-transparent bg-white text-[#17243c] hover:bg-white/90",
        className
      )}
    >
      {children}
    </Link>
  )
}
