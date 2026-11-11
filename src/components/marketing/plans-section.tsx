import Link from "next/link"

import { CtaLink } from "@/components/marketing/cta-link"
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
    <section id="planes" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Planes</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Elige una vigencia. El importe se confirma al solicitar acceso.
          </h2>
          <p className="mt-3 text-[#5b6b82]">
            El cobro inicial es manual. No hay pagos en línea en esta etapa ni precios publicados
            hasta que el catálogo quede definido en la base de datos.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
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
                Precio por confirmar al solicitar acceso
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
                >
                  Solicitar acceso
                </CtaLink>
              </div>
            </article>
          ))}
        </div>
        {!compact ? (
          <p className="mt-6 text-sm text-[#5b6b82]">
            También puedes revisar el detalle en{" "}
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
