import { CtaLink } from "@/components/marketing/cta-link"
import { publicRoutes } from "@/config/routes"

export function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[32px] bg-[#17243c] px-8 py-12 text-white sm:flex-row sm:items-center sm:px-12">
        <h2 className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
          Empieza a tomar el control de tu dinero.
        </h2>
        <CtaLink href={publicRoutes.register} variant="navy" className="shrink-0">
          Crear mi cuenta
        </CtaLink>
      </div>
    </section>
  )
}
