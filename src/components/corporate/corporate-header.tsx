"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { analyticsEvents, type AnalyticsEvent } from "@/config/analytics"
import { group } from "@/config/brand"
import { corporateNav, isCorporateNavActive, marketingNav } from "@/config/navigation"
import { isPlannerMarketingPath, publicRoutes } from "@/config/routes"
import { track } from "@/lib/analytics"
import { cn } from "cn"

type HeaderAction = {
  href: string
  label: string
  event?: AnalyticsEvent
}

function headerAction(pathname: string): HeaderAction | null {
  if (isPlannerMarketingPath(pathname)) {
    return {
      href: publicRoutes.register,
      label: "Crear cuenta gratis",
      event: analyticsEvents.signupClick,
    }
  }
  if (pathname.startsWith(publicRoutes.transport)) {
    return {
      href: "#cotizacion",
      label: "Solicitar cotización",
      event: analyticsEvents.quoteStart,
    }
  }
  if (pathname.startsWith(publicRoutes.software)) {
    return {
      href: "#informacion",
      label: "Solicitar información",
      event: analyticsEvents.infoRequest,
    }
  }
  if (pathname.startsWith(publicRoutes.contact)) return null
  return { href: "/#soluciones", label: "Explorar soluciones" }
}

export function CorporateHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const plannerContext = isPlannerMarketingPath(pathname)
  const action = headerAction(pathname)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#091B35] text-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href={publicRoutes.home}
            className="min-h-11 rounded-lg"
            aria-label={`${group.name}, ir al inicio`}
          >
            <Logo label={group.name} inverted priority />
          </Link>
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Principal">
            {corporateNav.map((item) => {
              const active = isCorporateNavActive(item.id, pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-11 items-center rounded-lg px-3 text-sm transition-colors",
                    active
                      ? "font-semibold text-white after:absolute after:right-3 after:bottom-1.5 after:left-3 after:h-0.5 after:rounded-full after:bg-[#508BEB]"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {action ? (
          <Link
            href={action.href}
            onClick={() => {
              if (action.event) track(action.event)
            }}
            className="hidden h-11 items-center rounded-full bg-white px-4 text-sm font-medium text-[#091B35] hover:bg-[#F6F8FC] lg:inline-flex"
          >
            {action.label}
          </Link>
        ) : (
          <span className="hidden lg:block" />
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 text-white hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent id="menu-movil" side="right" className="w-[min(100%,22rem)] bg-[#F6F8FC]">
            <SheetHeader>
              <SheetTitle>
                <Logo label={group.name} />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-3 pb-8" aria-label="Móvil">
              {corporateNav.map((item) => {
                const active = isCorporateNavActive(item.id, pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center rounded-xl px-3 text-base",
                      active ? "bg-white font-semibold text-[#091B35]" : "text-[#102C52]"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {plannerContext
                ? marketingNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-12 items-center rounded-xl px-3 text-base text-[#596579]"
                    >
                      {item.label}
                    </Link>
                  ))
                : null}
              {action ? (
                <Link
                  href={action.href}
                  onClick={() => {
                    if (action.event) track(action.event)
                    setOpen(false)
                  }}
                  className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-[#2457B2] px-4 text-base font-medium text-white"
                >
                  {action.label}
                </Link>
              ) : null}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
