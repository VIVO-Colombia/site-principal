"use client"

import Link from "next/link"
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
  SheetTrigger,
} from "@/components/ui/sheet"
import { marketingNav } from "@/config/navigation"
import { publicRoutes } from "@/config/routes"
import { cn } from "cn"

export function SiteHeader({ inverted = false }: { inverted?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[#e5eaf1]/80 bg-[#f7f9fc]/85 backdrop-blur-md",
        "supports-backdrop-filter:bg-[#f7f9fc]/80"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={publicRoutes.home} className="min-h-11 min-w-11 rounded-lg">
          <Logo inverted={inverted} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-11 items-center rounded-lg px-3 text-sm text-[#3d4d66] transition-colors hover:text-[#17243c]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={publicRoutes.login}
            className="inline-flex h-11 items-center px-3 text-sm font-medium text-[#3d4d66] hover:text-[#17243c]"
          >
            Iniciar sesión
          </Link>
          <CtaLink href={publicRoutes.register}>Comenzar</CtaLink>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,20rem)] bg-white">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-2" aria-label="Móvil">
              {marketingNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-3 text-base text-[#17243c]"
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
                  Comenzar
                </CtaLink>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
