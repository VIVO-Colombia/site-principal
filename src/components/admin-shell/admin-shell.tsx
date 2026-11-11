"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { signOutAction } from "@/app/actions/auth"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { adminNav } from "@/config/navigation"
import { appRoutes } from "@/config/routes"
import { cn } from "cn"

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode
  userName?: string | null
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-full bg-[#f7f9fc]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-[#e5eaf1] bg-white md:flex md:flex-col">
        <div className="px-5 py-5">
          <Logo />
          <p className="mt-2 text-[11px] font-medium tracking-[0.14em] text-[#5b6b82] uppercase">
            Super Admin
          </p>
        </div>
        <AdminNav pathname={pathname} />
        <div className="border-t border-[#e5eaf1] p-3">
          <Link href={appRoutes.home} className="flex min-h-11 items-center px-3 text-sm">
            Mis finanzas
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" className="h-11 w-full justify-start">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>
      <div className="md:pl-60">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#e5eaf1] bg-white/90 px-4 backdrop-blur-md">
          <p className="text-sm font-semibold">
            {adminNav.find((item) => item.href === pathname)?.label ?? "Administración"}
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-[#5b6b82] sm:inline">{userName}</span>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-11 md:hidden" aria-label="Menú">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-white">
                <SheetHeader>
                  <SheetTitle>Super Admin</SheetTitle>
                </SheetHeader>
                <AdminNav pathname={pathname} />
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main id="contenido" className="px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function AdminNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 space-y-1 px-3" aria-label="Administración">
      {adminNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex min-h-11 items-center rounded-xl px-3 text-sm",
            pathname === item.href
              ? "bg-[#eef2f7] font-medium"
              : "text-[#5b6b82] hover:text-[#17243c]"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
