import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { group } from "@/config/brand"
import { footerNav } from "@/config/navigation"
import { publicRoutes } from "@/config/routes"

export function CorporateFooter() {
  return (
    <footer className="border-t border-[#e5eaf1] bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link href={publicRoutes.home} className="inline-flex min-h-11 items-center">
            <Logo label={group.name} />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#5b6b82]">
            {group.description}
          </p>
        </div>
        <FooterColumn title="Soluciones" items={footerNav.solutions} />
        <FooterColumn title="Planner" items={footerNav.planner} />
        <FooterColumn title="Legal" items={footerNav.legal} />
      </div>
      <div className="border-t border-[#e5eaf1]">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-[#5b6b82] sm:px-6">
          © 2026 {group.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  items,
}: {
  title: string
  items: readonly { href: string; label: string }[]
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#142238]">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              className="inline-flex min-h-11 items-center text-sm text-[#5b6b82] hover:text-[#102A56]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
