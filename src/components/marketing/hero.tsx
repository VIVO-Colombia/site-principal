import { CtaLink } from "@/components/marketing/cta-link"
import { HeroComposition } from "@/components/product/hero-composition"
import { brand, productName } from "@/config/brand"
import { marketingAnchors, publicRoutes } from "@/config/routes"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:pt-12 lg:pb-24">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10">
        <div className="relative z-10 max-w-xl lg:pt-8">
          <p className="animate-fade-up text-sm font-medium tracking-[0.18em] text-primary uppercase">
            {productName()}
          </p>
          <h1 className="animate-fade-up delay-100 mt-4 text-[2.35rem] leading-[1.08] font-semibold tracking-[-0.045em] text-[#17243c] sm:text-5xl lg:text-[3.4rem]">
            {brand.tagline}
          </h1>
          <p className="animate-fade-up delay-200 mt-5 max-w-md text-base leading-7 text-[#5b6b82] sm:text-lg">
            {brand.description}
          </p>
          <div className="animate-fade-up delay-300 mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href={publicRoutes.register}>Comenzar a organizarme</CtaLink>
            <CtaLink href={marketingAnchors.features} variant="secondary">
              Conocer la herramienta
            </CtaLink>
          </div>
        </div>
        <div className="animate-fade-up delay-200">
          <HeroComposition />
        </div>
      </div>
    </section>
  )
}
