import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { ContactChannels } from "@/components/commercial/contact-channels"
import { group } from "@/config/brand"
import { footerNav } from "@/config/navigation"
import { publicRoutes } from "@/config/routes"

export function CorporateFooter() {
  return (
    <footer className="bg-[#091B35] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href={publicRoutes.home} className="inline-flex min-h-11 items-center">
            <Logo label={group.name} inverted />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">{group.tagline}</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">{group.description}</p>
          <div className="mt-5">
            <ContactChannels inverted />
          </div>
        </div>
        <FooterColumn title="Soluciones" items={footerNav.solutions} />
        <FooterColumn title="Planner" items={footerNav.planner} />
        <FooterColumn title="Legal" items={footerNav.legal} />
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs leading-5 text-white/50 sm:px-6">
          © 2026 {group.legalName}. Las páginas legales describen el alcance
          actual y todavía requieren validación jurídica.
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
      <p className="text-sm font-semibold text-white">{title}</p>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              className="inline-flex min-h-11 items-center text-sm text-white/65 hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
