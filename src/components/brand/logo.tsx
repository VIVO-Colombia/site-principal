import { cn } from "cn"

import { productName } from "@/config/brand"

type LogoProps = {
  className?: string
  markClassName?: string
  showWordmark?: boolean
  inverted?: boolean
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  inverted = false,
}: LogoProps) {
  const name = productName()

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-[0_1px_0_rgb(255_255_255_/_0.25)_inset]",
          inverted && "bg-white text-primary",
          markClassName
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none">
          <path
            d="M6 15.5c2.2-0.2 3.4-2.6 5-5.2 1.4-2.2 2.7-3.6 5-3.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14.2 7h4.3v4.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-heading text-[17px] font-semibold tracking-[-0.03em] text-foreground",
            inverted && "text-white"
          )}
        >
          {name}
        </span>
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </span>
  )
}
