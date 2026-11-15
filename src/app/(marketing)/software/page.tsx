import type { Metadata } from "next"

import { LeadForm } from "@/components/commercial/lead-form"
import { JsonLd } from "@/components/seo/json-ld"
import { site } from "@/config/brand"
import { publicRoutes } from "@/config/routes"
import { softwareProducts } from "@/config/software-products"
import { isWeb3FormsConfigured } from "@/lib/env"
import { pageMetadata } from "@/lib/seo"
import Link from "next/link"

export const metadata: Metadata = pageMetadata({
  title: "Soluciones de software | VIVO",
  description:
    "Software de VIVO para empresas y personas: VIVO Manifiestos y VIVO Planner. La estructura admite productos nuevos.",
  path: publicRoutes.software,
})

export default function SoftwarePage() {
  const formsReady = isWeb3FormsConfigured()

  return (
    <div className="corporate-scope bg-[#F3F7FF]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "VIVO Soluciones de Software",
          url: `${site.url}${publicRoutes.software}`,
          description: "Software de VIVO para empresas y personas.",
        }}
      />
      <section className="holo-sheen text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-sm tracking-[0.16em] text-[#8DDBFF] uppercase">VIVO Soluciones de Software</p>
          <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.02] sm:text-6xl">Tecnología para la operación y para la vida diaria.</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/75">Desarrollamos productos para empresas y para personas. Hoy puedes conocer Manifiestos y Planner. Los siguientes entran en la misma estructura.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6">
        {softwareProducts.map((product) => (
          <article key={product.id} id={product.id} className="rounded-[2rem] bg-white p-8">
            <p className="text-xs tracking-[0.16em] text-[#315BFF] uppercase">{product.audience}</p>
            <h2 className="font-heading mt-3 text-4xl text-[#07152C]">{product.name}</h2>
            <p className="mt-4 max-w-2xl text-[#07152C]/75">{product.summary}</p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-[#07152C]/80">
              {product.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <Link href={product.href} className="mt-6 inline-flex h-12 items-center rounded-full bg-[#07152C] px-5 text-sm text-white">{product.cta}</Link>
          </article>
        ))}
      </section>
      <section id="informacion" className="scroll-mt-24 px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-heading text-4xl text-[#07152C]">Pide información</h2>
            {formsReady ? null : <p className="mt-4 text-sm text-[#315BFF]">Falta WEB3FORMS_ACCESS_KEY. El envío no se simula.</p>}
          </div>
          <LeadForm kind="software" ready />
        </div>
      </section>
    </div>
  )
}
