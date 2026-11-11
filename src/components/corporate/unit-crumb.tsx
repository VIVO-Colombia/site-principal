import Link from "next/link"

import { group } from "@/config/brand"
import { publicRoutes } from "@/config/routes"
import { cn } from "cn"

export function UnitCrumb({
  unit,
  inverted = false,
}: {
  unit: string
  inverted?: boolean
}) {
  return (
    <p
      className={cn(
        "text-sm font-medium tracking-[0.16em] uppercase",
        inverted ? "text-white/70" : "text-primary"
      )}
    >
      <Link
        href={publicRoutes.home}
        className={cn(
          "rounded-sm underline-offset-4 hover:underline",
          inverted ? "text-white/80 hover:text-white" : "text-primary"
        )}
      >
        {group.name}
      </Link>
      <span className="mx-2 opacity-40" aria-hidden>
        /
      </span>
      <span className={inverted ? "text-white" : "text-[#102A56]"}>{unit}</span>
    </p>
  )
}
