import { CtaLink } from "@/components/marketing/cta-link"
import { UnitCrumb } from "@/components/corporate/unit-crumb"
import { HeroComposition } from "@/components/product/hero-composition"
import { brand } from "@/config/brand"
import { marketingAnchors, publicRoutes } from "@/config/routes"

export function Hero() {
  return (
    <section className="relative overflow-x-clip px-4 pt-6 pb-10 sm:px-6 sm:pt-14 lg:pt-12 lg:pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-8 lg:pt-2">
        <div className="animate-fade-up relative z-10 max-w-xl lg:pt-8">
          <UnitCrumb unit="Planner" />
          <p className="mt-4 text-sm font-medium tracking-[0.18em] text-primary uppercase">
            Finanzas personales
          </p>
          <h1 className="font-heading mt-4 text-[2.15rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#17243c] sm:text-5xl lg:text-[3.35rem]">
            {brand.tagline}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-[#5b6b82] sm:mt-5 sm:text-lg sm:leading-7">
            {brand.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href={publicRoutes.register}>Crear mi cuenta</CtaLink>
            <CtaLink href={marketingAnchors.howItWorks} variant="secondary">
              Ver cómo funciona
            </CtaLink>
          </div>
          <p className="mt-5 text-sm text-[#7c93b5]">
            Ciclos propios · Cuentas y saldos · Pagos a la vista
          </p>
        </div>
        <div className="animate-fade-up min-w-0">
          <HeroComposition />
        </div>
      </div>
    </section>
  )
}
