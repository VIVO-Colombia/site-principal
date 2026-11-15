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
  /** Marca corporativa nueva. Planner conserva el símbolo anterior si se omite. */
  variant?: "planner" | "vivo"
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  inverted = false,
  priority = false,
  label,
  variant = "planner",
}: LogoProps) {
  const name = label ?? productName()

  if (variant === "vivo") {
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <Image
          src={inverted ? "/brand/vivo-v-white.png" : "/brand/vivo-v-navy.png"}
          alt=""
          width={114}
          height={72}
          priority={priority}
          className={cn("h-8 w-auto", markClassName)}
        />
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
