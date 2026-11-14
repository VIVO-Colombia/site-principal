import { CtaLink } from "@/components/marketing/cta-link"
import { UnitCrumb } from "@/components/corporate/unit-crumb"
import { HeroComposition } from "@/components/product/hero-composition"
import { analyticsEvents } from "@/config/analytics"
import { brand } from "@/config/brand"
import { marketingAnchors, publicRoutes } from "@/config/routes"

export function Hero() {
  return (
    <section className="relative overflow-x-clip px-4 pt-6 pb-10 sm:px-6 sm:pt-14 lg:pt-12 lg:pb-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-8 lg:pt-2">
        <div className="animate-fade-up relative z-10 max-w-xl lg:pt-8">
          <UnitCrumb unit="Planner" />
          <h1 className="font-heading mt-4 text-[2.15rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#091B35] sm:text-5xl lg:text-[3.35rem]">
            {brand.tagline}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-6 text-[#596579] sm:mt-5 sm:text-lg sm:leading-7">
            {brand.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href={publicRoutes.register} event={analyticsEvents.signupClick}>
              Crear cuenta gratis
            </CtaLink>
            <CtaLink href={marketingAnchors.howItWorks} variant="secondary">
              Descubrir cómo funciona
            </CtaLink>
          </div>
        </div>
        <div className="animate-fade-up min-w-0">
          <HeroComposition />
        </div>
      </div>
    </section>
  )
}
