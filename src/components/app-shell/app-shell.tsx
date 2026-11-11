"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftRight,
  Bell,
  CalendarRange,
  Home,
  LayoutGrid,
  Plus,
} from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { signOutAction } from "@/app/actions/auth"
import { appMoreNav, appNav, appSidebarNav } from "@/config/navigation"
import { appRoutes } from "@/config/routes"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CycleSwitcher } from "@/components/finance/cycle-switcher"
import type { FinancialCycle } from "@/types/database"
import { cn } from "cn"

const icons = {
  home: Home,
  arrowLeftRight: ArrowLeftRight,
  calendarRange: CalendarRange,
} as const

export function AppShell({
  children,
  userName,
  readOnly,
  cycles = [],
  activeCycle,
  unreadNotifications = 0,
}: {
  children: React.ReactNode
  userName?: string | null
  readOnly?: boolean
  cycles?: Pick<FinancialCycle, "id" | "name">[]
  activeCycle?: Pick<FinancialCycle, "id" | "name"> | null
  unreadNotifications?: number
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-[#e5eaf1] bg-white lg:flex lg:flex-col">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Portal financiero">
          {appSidebarNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center rounded-xl px-3 text-sm",
                pathname === item.href
                  ? "bg-[#eef2f7] font-medium text-[#17243c]"
                  : "text-[#5b6b82] hover:text-[#17243c]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[#e5eaf1] p-3">
          <Link
            href={appRoutes.settings}
            className="flex min-h-11 items-center rounded-xl px-3 text-sm text-[#5b6b82]"
          >
            {userName || "Mi perfil"}
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" className="h-11 w-full justify-start">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#e5eaf1] bg-white/90 px-4 backdrop-blur-md lg:h-16 lg:px-6">
          <div>
            <p className="text-sm font-semibold">{titleFromPath(pathname)}</p>
            <CycleSwitcher cycles={cycles} activeId={activeCycle?.id} readOnly={readOnly} />
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={appRoutes.notifications}
              className="relative grid size-11 place-items-center rounded-full hover:bg-[#eef2f7]"
              aria-label="Notificaciones"
            >
              <Bell className="size-5" />
              {unreadNotifications > 0 ? (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
              ) : null}
            </Link>
            <Link
              href={appRoutes.settings}
              className="grid size-11 place-items-center rounded-full hover:bg-[#eef2f7] text-sm font-medium"
              aria-label="Perfil"
            >
              {(userName || "Tú").slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        {readOnly ? (
          <div className="border-b border-[#fde68a] bg-[#fffbeb] px-4 py-2 text-xs text-[#92400e]">
            Consulta solamente. Tu plan está vencido.
          </div>
        ) : null}
        <main id="contenido" className="px-4 pb-28 pt-4 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e5eaf1] bg-white px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="grid grid-cols-4">
          {appNav.map((item) => {
            const Icon = icons[item.icon]
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px]",
                  active ? "text-primary" : "text-[#5b6b82]"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
          <MoreMenu pathname={pathname} />
        </div>
        <Link
          href={`${appRoutes.movements}?nuevo=1`}
          className="absolute -top-6 left-1/2 grid size-12 -translate-x-1/2 place-items-center rounded-full bg-primary text-white shadow-[0_10px_20px_rgb(37_99_235_/_0.28)]"
          aria-label="Registrar movimiento"
        >
          <Plus className="size-5" />
        </Link>
      </nav>
    </div>
  )
}

function MoreMenu({ pathname }: { pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] text-[#5b6b82]"
        >
          <LayoutGrid className="size-5" />
          Más
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white">
        <SheetHeader>
          <SheetTitle>Más secciones</SheetTitle>
        </SheetHeader>
        <div className="grid gap-1 px-2 pb-6">
          {appMoreNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center rounded-xl px-3 text-sm",
                pathname === item.href ? "bg-[#eef2f7] font-medium" : ""
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function titleFromPath(pathname: string) {
  const current =
    [...appSidebarNav, ...appMoreNav].find((item) => item.href === pathname)?.label ?? "Inicio"
  return current
}
