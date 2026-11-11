"use client"

import Link from "next/link"
import { useState } from "react"

import { publicRoutes } from "@/config/routes"
import { cn } from "cn"

const units = [
  {
    id: "transporte",
    label: "Transporte",
    href: publicRoutes.transport,
    color: "#102A56",
  },
  {
    id: "software",
    label: "Software",
    href: publicRoutes.software,
    color: "#2563EB",
  },
  {
    id: "planner",
    label: "Planner",
    href: publicRoutes.planner,
    color: "#38BDF8",
  },
] as const

export function PathsMark() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="relative mx-auto w-full max-w-[34rem]">
      <svg
        viewBox="0 0 520 460"
        className="h-auto w-full"
        role="img"
        aria-labelledby="paths-mark-title"
      >
        <title id="paths-mark-title">Tres caminos de VIVO que convergen en un mismo propósito</title>
        <defs>
          <linearGradient id="vivo-path-software" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="vivo-path-planner" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <filter id="vivo-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="390" cy="118" r="92" fill="#EAF2FF" opacity="0.7" />
        <circle cx="140" cy="320" r="70" fill="#EAF2FF" opacity="0.45" />

        <path
          d="M72 392 C 148 360, 210 300, 268 228 C 318 168, 352 132, 402 96"
          fill="none"
          stroke="#102A56"
          strokeWidth={active && active !== "transporte" ? 6 : 10}
          strokeLinecap="round"
          className="corporate-path"
          opacity={active && active !== "transporte" ? 0.28 : 1}
        />
        <path
          d="M96 248 C 170 236, 230 210, 292 168 C 338 138, 368 118, 408 94"
          fill="none"
          stroke="url(#vivo-path-software)"
          strokeWidth={active && active !== "software" ? 6 : 10}
          strokeLinecap="round"
          className="corporate-path"
          style={{ animationDelay: "0.12s" }}
          opacity={active && active !== "software" ? 0.28 : 1}
        />
        <path
          d="M168 428 C 210 340, 250 250, 312 176 C 352 128, 382 108, 414 92"
          fill="none"
          stroke="url(#vivo-path-planner)"
          strokeWidth={active && active !== "planner" ? 6 : 10}
          strokeLinecap="round"
          className="corporate-path"
          style={{ animationDelay: "0.24s" }}
          opacity={active && active !== "planner" ? 0.28 : 1}
        />

        <polygon
          points="398,52 468,108 392,128"
          fill="#2563EB"
          filter="url(#vivo-soft)"
          className="corporate-arrow"
        />
        <polygon points="404,64 454,106 398,118" fill="#102A56" />

        <circle cx="72" cy="392" r="7" fill="#102A56" />
        <circle cx="96" cy="248" r="7" fill="#2563EB" />
        <circle cx="168" cy="428" r="7" fill="#38BDF8" />
      </svg>

      <ul className="mt-2 flex flex-wrap justify-center gap-2 sm:absolute sm:right-0 sm:bottom-6 sm:mt-0 sm:flex-col sm:items-end">
        {units.map((unit) => (
          <li key={unit.id}>
            <Link
              href={unit.href}
              onMouseEnter={() => setActive(unit.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(unit.id)}
              onBlur={() => setActive(null)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full bg-white/80 px-3.5 text-sm font-medium text-[#142238] ring-1 ring-[#d5deea] backdrop-blur-sm transition-colors hover:bg-white",
                active === unit.id && "ring-[#2563EB]"
              )}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: unit.color }}
                aria-hidden
              />
              {unit.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
