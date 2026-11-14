import type { Metadata } from "next"

import { LeadForm } from "@/components/commercial/lead-form"
import { ConceptBadge } from "@/components/corporate/concept-badge"
import {
  MessagingConcept,
  RequestFlowConcept,
} from "@/components/corporate/software-concept"
import { CtaLink } from "@/components/marketing/cta-link"
import { JsonLd } from "@/components/seo/json-ld"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { publicContact } from "@/config/contact"
import { site } from "@/config/brand"
import { publicRoutes } from "@/config/routes"
import { isLeadChannelConfigured } from "@/lib/env"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Software para gestión documental de transporte | VIVO Software",
  description:
    "Centraliza solicitudes y organiza la información de documentos de transporte. Conoce el estado real del producto y pide información.",
  path: publicRoutes.software,
})

const problems = [
  { title: "Datos dispersos", body: "La misma información vive en papeles, chats y planillas." },
  { title: "Trámites repetitivos", body: "Cada documento vuelve a pedir lo que ya se escribió." },
  { title: "Solicitudes en varios canales", body: "El requerimiento se parte y nadie ve el estado completo." },
  { title: "Poca claridad del estado", body: "No queda claro si el documento está en datos, validación o seguimiento." },
]

const audiences = [
  {
    title: "Conductor o transportador independiente",
    body: "Quien necesita pedir un documento sin montar un área administrativa.",
  },
  {
    title: "Empresa transportadora",
    body: "Equipos que concentran solicitudes y quieren una sola fuente de información.",
  },
  {
    title: "Equipo de operaciones",
    body: "Quienes coordinan el día a día y necesitan saber en qué va cada trámite.",
  },
]

const faqs = [
  {
    question: "¿El software ya está en operación?",
    answer:
      "Esta página presenta la solución y el flujo previsto. No afirma que todas las funciones, ni las integraciones con entidades, estén habilitadas. Por eso el llamado es a solicitar información o conocer la disponibilidad.",
  },
  {
    question: "¿Hay un bot de WhatsApp activo?",
    answer:
      "No. WhatsApp forma parte de la visión para iniciar solicitudes cuando esa integración exista. Hoy no hay un bot, un número de producto ni una conexión regulatoria publicados como operativos.",
  },
  {
    question: "¿Para qué sirve pedir información?",
    answer:
      "Para contarte el alcance disponible en ese momento: qué se puede mostrar, qué sigue en desarrollo y cómo se podría usar en tu operación.",
  },
]

export default function SoftwarePage() {
  const ready = isLeadChannelConfigured()
  const contact = publicContact()

  return (
    <div className="corporate-scope bg-[#F6F8FC]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "VIVO Software",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: `${site.url}${publicRoutes.software}`,
          description:
            "Solución para centralizar solicitudes y organizar documentos de transporte.",
        }}
      />

      <section className="relative overflow-hidden bg-[#091B35] text-white">
        <div className="pointer-events-none absolute inset-0 vivo-lines" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl items-end gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:py-24">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-[#508BEB] uppercase">
              VIVO Software
            </p>
            <h1 className="font-heading mt-4 text-[2.4rem] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-5xl lg:text-[3.5rem]">
              Menos trámites. Más movimiento.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
              La gestión de documentos de transporte puede ser más sencilla. Centraliza solicitudes,
              organiza información y reduce tareas repetitivas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaLink href="#informacion" variant="navy">
                Conocer disponibilidad
              </CtaLink>
              <CtaLink href="#flujo" variant="invert">
                Ver el flujo
              </CtaLink>
            </div>
          </div>
          <MessagingConcept />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-[#091B35] sm:text-4xl">
            El documento no debería frenar la carga.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] bg-[#e3e9f2] sm:grid-cols-2">
            {problems.map((item) => (
              <article key={item.title} className="bg-white px-6 py-8">
                <h3 className="text-xl font-semibold text-[#091B35]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#596579]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="flujo" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-heading max-w-xl text-3xl font-semibold tracking-[-0.035em] text-[#091B35] sm:text-4xl">
              De la solicitud al seguimiento.
            </h2>
            <ConceptBadge />
          </div>
          <div className="mt-12">
            <RequestFlowConcept />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {audiences.map((item) => (
            <article key={item.title} className="border-t border-[#091B35] pt-5">
              <h2 className="text-xl font-semibold tracking-tight text-[#091B35]">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#596579]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#102C52] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em]">
            WhatsApp, como visión. No como canal activo.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/75">
            La idea es que una solicitud pueda empezar por un canal cotidiano y seguir en la
            plataforma. Eso no está publicado como una integración operativa: no hay bot, conexión
            regulatoria ni número de producto anunciado.
            {contact.whatsapp
              ? " Si aparece un WhatsApp en Contacto, es un medio comercial del grupo, no el producto."
              : ""}
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-semibold text-[#091B35]">Preguntas frecuentes</h2>
          <Accordion type="single" collapsible className="mt-6">
            {faqs.map((item, index) => (
              <AccordionItem key={item.question} value={`s-${index}`}>
                <AccordionTrigger className="min-h-11 py-4 text-left text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="leading-6 text-[#596579]">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-[#091B35]">
              Solicita información
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#596579]">
              Cuéntanos quién eres y qué parte de la operación quieres ordenar. La respuesta depende
              de lo que esté disponible en ese momento.
            </p>
            <div className="mt-6">
              <CtaLink href={publicRoutes.transport} variant="secondary">
                Ver VIVO Transporte
              </CtaLink>
            </div>
          </div>
          <LeadForm id="informacion" kind="software" ready={ready} />
        </div>
      </section>
    </div>
  )
}
