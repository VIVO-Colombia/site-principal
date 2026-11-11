"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { appRoutes } from "@/config/routes"

export function AppShell({
  children,
}: {
  children: React.ReactNode
  userName?: string | null
  readOnly?: boolean
  cycles?: unknown
  activeCycle?: unknown
  unreadNotifications?: number
}) {
  const pathname = usePathname()
  const isHome = pathname === appRoutes.home

  return (
    <div className="app-scope min-h-full">
      {isHome ? null : (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[#eae9e6] bg-[#faf9f6]/90 px-4 backdrop-blur-md">
          <Link href={appRoutes.home} className="grid size-11 place-items-center rounded-full" aria-label="Volver al inicio">
            <ChevronLeft className="size-5" />
          </Link>
          <Logo />
        </header>
      )}
      <div className={isHome ? "px-4 pt-4" : "px-4 py-5"}>{children}</div>
    </div>
  )
}
