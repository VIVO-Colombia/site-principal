"use client"

import { cn } from "cn"

export function ParallaxFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  function reset(event: React.MouseEvent<HTMLDivElement>) {
    const node = event.currentTarget
    node.style.setProperty("--tilt-x", "0deg")
    node.style.setProperty("--tilt-y", "0deg")
    node.style.setProperty("--shift-x", "0px")
    node.style.setProperty("--shift-y", "0px")
  }

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(hover: none)").matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty("--tilt-x", `${(y * -5).toFixed(2)}deg`)
    event.currentTarget.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`)
    event.currentTarget.style.setProperty("--shift-x", `${(x * -10).toFixed(1)}px`)
    event.currentTarget.style.setProperty("--shift-y", `${(y * -10).toFixed(1)}px`)
  }

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn("corporate-parallax", className)}
    >
      {children}
    </div>
  )
}
