import type { Metadata } from "next"

import { LeadForm } from "@/components/commercial/lead-form"
import { ContactChannels } from "@/components/commercial/contact-channels"
import { CtaLink } from "@/components/marketing/cta-link"
import { analyticsEvents } from "@/config/analytics"
import { publicRoutes } from "@/config/routes"
import { isLeadChannelConfigured } from "@/lib/env"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Contacto | VIVO Colombia",
  description:
    "Escríbele a VIVO para cotizar transporte, pedir información de software o entrar a Planner.",
  path: publicRoutes.contact,
})

export default function ContactPage() {
  const ready = isLeadChannelConfigured()

  return (
    <article className="corporate-scope bg-[#F6F8FC]">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.04em] text-[#091B35] sm:text-5xl">
            Contacto
          </h1>
          <p className="mt-5 text-base leading-7 text-[#596579]">
            Elige el camino. Transporte recibe cotizaciones, Software recibe solicitudes de
            información y Planner abre con una cuenta.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3">
            <CtaLink href={`${publicRoutes.transport}#cotizacion`}>Solicitar cotización</CtaLink>
            <CtaLink href={`${publicRoutes.software}#informacion`} variant="secondary">
              Preguntar por Software
            </CtaLink>
            <CtaLink href={publicRoutes.register} variant="secondary" event={analyticsEvents.signupClick}>
              Crear cuenta de Planner
            </CtaLink>
          </div>
          <div className="mt-8">
            <ContactChannels />
          </div>
        </div>
        <LeadForm kind="contact" ready={ready} />
      </div>
    </article>
  )
}
