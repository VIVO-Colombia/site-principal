import Link from "next/link"

import { CtaLink } from "@/components/marketing/cta-link"
import { analyticsEvents } from "@/config/analytics"
import { catalogPlans, type CatalogPlan } from "@/config/plans"
import { publicRoutes } from "@/config/routes"
import { cn } from "cn"

export function PlansSection({
  compact = false,
  items = catalogPlans,
}: {
  compact?: boolean
  items?: CatalogPlan[]
}) {
  return (
    <section id="planes" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Planes</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#091B35] sm:text-4xl">
            Free para empezar. Premium cuando lo pidas.
          </h2>
          <p className="mt-3 text-[#5b6b82]">
            Activación manual con comprobante. Sin cobro automático por ahora y sin letra pequeña
            escondida en una pasarela.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col rounded-[28px] bg-white p-7 ring-1 ring-[#e5eaf1]",
                plan.highlighted && "ring-2 ring-primary"
              )}
            >
              <p className="text-sm font-medium text-primary">{plan.cadence}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{plan.name}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5b6b82]">{plan.summary}</p>
              <p className="mt-5 rounded-2xl bg-[#f7f9fc] px-4 py-3 text-sm font-medium">
                {plan.id === "gratis" ? "Incluido al crear tu cuenta" : "Precio al solicitar acceso"}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-[#3d4d66]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <CtaLink
                  href={`${publicRoutes.register}?plan=${plan.id}`}
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="w-full sm:w-auto"
                  event={plan.id === "gratis" ? analyticsEvents.signupClick : analyticsEvents.premiumRequest}
                >
                  {plan.id === "gratis" ? "Crear cuenta Free" : "Solicitar Premium"}
                </CtaLink>
              </div>
            </article>
          ))}
        </div>
        {!compact ? (
          <p className="mt-6 text-sm text-[#5b6b82]">
            Detalle y vigencias también en{" "}
            <Link href={publicRoutes.plans} className="font-medium text-primary hover:underline">
              la página de planes
            </Link>
            .
          </p>
        ) : null}
      </div>
    </section>
  )
}
