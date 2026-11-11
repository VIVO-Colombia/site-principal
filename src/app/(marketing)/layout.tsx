import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-scope flex flex-1 flex-col">
      <SiteHeader />
      <div id="contenido" className="flex-1">
        {children}
      </div>
      <SiteFooter />
    </div>
  )
}
