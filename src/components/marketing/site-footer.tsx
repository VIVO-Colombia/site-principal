import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { footerNav } from "@/config/navigation"
import { productName } from "@/config/brand"

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e5eaf1] bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#5b6b82]">
            Planeación financiera personal, pensada para usarse todos los días desde el celular.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Producto</p>
          <ul className="mt-3 space-y-2">
            {footerNav.product.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-[#5b6b82] hover:text-[#17243c]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Legal</p>
          <ul className="mt-3 space-y-2">
            {footerNav.legal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-[#5b6b82] hover:text-[#17243c]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[#e5eaf1]">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-[#5b6b82] sm:px-6">
          {productName()} · Los módulos financieros se irán habilitando por etapas.
        </p>
      </div>
    </footer>
  )
}
