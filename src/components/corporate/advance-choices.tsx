"use client"

import Link from "next/link"

import { analyticsEvents } from "@/config/analytics"
import { publicRoutes } from "@/config/routes"
import { track } from "@/lib/analytics"

const paths = [
  {
    href: publicRoutes.transport,
    title: "Transportar mercancía",
    body: "Cuéntanos origen, destino y tipo de carga.",
    event: analyticsEvents.transportClick,
  },
  {
    href: publicRoutes.software,
    title: "Simplificar la gestión logística",
    body: "Conoce cómo se plantea la gestión documental.",
    event: analyticsEvents.softwareClick,
  },
  {
    href: publicRoutes.register,
    title: "Organizar mis finanzas",
    body: "Crea una cuenta gratis de VIVO Planner.",
    event: analyticsEvents.signupClick,
  },
] as const

export function AdvanceChoices() {
  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-3">
      {paths.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => track(item.event)}
          className="flex min-h-44 flex-col justify-between rounded-[28px] bg-[#091B35] p-6 text-white transition-colors hover:bg-[#102C52]"
        >
          <span className="text-xl font-semibold tracking-tight">{item.title}</span>
          <span className="mt-6 text-sm leading-6 text-white/70">{item.body}</span>
        </Link>
      ))}
    </div>
  )
}
