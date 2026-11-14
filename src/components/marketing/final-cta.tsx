import { CtaLink } from "@/components/marketing/cta-link"
import { analyticsEvents } from "@/config/analytics"
import { publicRoutes } from "@/config/routes"

export function FinalCta() {
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[32px] bg-[#091B35] px-8 py-12 text-white sm:flex-row sm:items-center sm:px-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Empieza por saber cuánto puedes gastar.
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Crea la cuenta gratis, confirma el correo y arma tu primer ciclo. Premium se pide solo
            si lo necesitas.
          </p>
        </div>
        <CtaLink
          href={publicRoutes.register}
          variant="navy"
          className="shrink-0"
          event={analyticsEvents.signupClick}
        >
          Crear cuenta gratis
        </CtaLink>
      </div>
    </section>
  )
}
