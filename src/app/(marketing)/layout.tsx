import Script from "next/script"

import { CorporateFooter } from "@/components/corporate/corporate-footer"
import { CorporateHeader } from "@/components/corporate/corporate-header"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim()

  return (
    <div className="flex flex-1 flex-col">
      {plausibleDomain ? (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      ) : null}
      <CorporateHeader />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <CorporateFooter />
    </div>
  )
}
