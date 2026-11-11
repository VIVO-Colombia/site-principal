import { CtaLink } from "@/components/marketing/cta-link"
import { publicRoutes } from "@/config/routes"

export function FinalCta() {
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[32px] bg-[#17243c] px-8 py-12 text-white sm:flex-row sm:items-center sm:px-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Este mes, con las cuentas claras.
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Crea la cuenta, activa el plan y registra el primer movimiento. El saldo deja de ser una
            intuición.
          </p>
        </div>
        <CtaLink href={publicRoutes.register} variant="navy" className="shrink-0">
          Crear mi cuenta
        </CtaLink>
      </div>
    </section>
  )
}
