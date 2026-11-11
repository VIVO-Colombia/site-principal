import Image from "next/image"

import { cn } from "cn"

import { productName } from "@/config/brand"

type LogoProps = {
  className?: string
  markClassName?: string
  showWordmark?: boolean
  inverted?: boolean
  priority?: boolean
  label?: string
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  inverted = false,
  priority = false,
  label,
}: LogoProps) {
  const name = label ?? productName()

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid size-8 place-items-center overflow-hidden rounded-[9px]",
          inverted && "bg-white",
          markClassName
        )}
      >
        <Image
          src="/brand/vivo-mark.png"
          alt=""
          width={32}
          height={32}
          priority={priority}
          className="size-8"
        />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-heading text-[17px] font-semibold tracking-[-0.03em] whitespace-nowrap text-foreground",
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
