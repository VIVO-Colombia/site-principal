"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { CtaLink } from "@/components/marketing/cta-link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { group } from "@/config/brand"
import { corporateNav, isCorporateNavActive, marketingNav } from "@/config/navigation"
import { isPlannerMarketingPath, publicRoutes } from "@/config/routes"
import { cn } from "cn"

export function CorporateHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const plannerContext = isPlannerMarketingPath(pathname)

  return (
    <header className="sticky top-0 z-50 border-b border-[#dbe4f0]/80 bg-[#F6F8FC]/88 backdrop-blur-md supports-backdrop-filter:bg-[#F6F8FC]/78">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href={publicRoutes.home}
            className="min-h-11 rounded-lg"
            aria-label={`${group.name}, ir al inicio`}
          >
            <Logo label={group.name} priority />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
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
                      ? "font-semibold text-[#102A56] after:absolute after:right-3 after:bottom-1.5 after:left-3 after:h-0.5 after:rounded-full after:bg-primary"
                      : "text-[#3d4d66] hover:text-[#102A56]"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {plannerContext ? (
            <>
              <Link
                href={publicRoutes.login}
                className="inline-flex h-11 items-center px-3 text-sm font-medium text-[#3d4d66] hover:text-[#102A56]"
              >
                Iniciar sesión
              </Link>
              <CtaLink href={publicRoutes.register}>Crear cuenta</CtaLink>
            </>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent id="menu-movil" side="right" className="w-[min(100%,20rem)] bg-white">
            <SheetHeader>
              <SheetTitle>
                <Logo label={group.name} />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-2" aria-label="Móvil">
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
                      active ? "bg-[#EAF2FF] font-medium text-[#102A56]" : "text-[#142238]"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {plannerContext ? (
                <>
                  <div className="mx-3 my-3 h-px bg-[#e5eaf1]" />
                  {marketingNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center rounded-xl px-3 text-base text-[#3d4d66]"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href={publicRoutes.login}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center rounded-xl px-3 text-base"
                  >
                    Iniciar sesión
                  </Link>
                  <div className="px-3 pt-3">
                    <CtaLink href={publicRoutes.register} className="w-full">
                      Crear cuenta
                    </CtaLink>
                  </div>
                </>
              ) : null}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {plannerContext ? (
        <div className="hidden border-t border-[#e5eaf1]/80 lg:block">
          <nav
            className="mx-auto flex h-11 w-full max-w-6xl items-center gap-1 px-4 sm:px-6"
            aria-label="VIVO Planner"
          >
            {marketingNav.map((item) => {
              const active = pathname === publicRoutes.plans && item.href === publicRoutes.plans
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 items-center px-3 text-sm",
                    active ? "font-medium text-[#102A56]" : "text-[#5b6b82] hover:text-[#102A56]"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
