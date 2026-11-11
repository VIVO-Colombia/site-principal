import { CorporateFooter } from "@/components/corporate/corporate-footer"
import { CorporateHeader } from "@/components/corporate/corporate-header"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col">
      <CorporateHeader />
      <div id="contenido" className="flex-1">
        {children}
      </div>
      <CorporateFooter />
    </div>
  )
}
