import type { Metadata } from "next"
import Image from "next/image"

import { LeadForm } from "@/components/commercial/lead-form"
import { ContactChannels } from "@/components/commercial/contact-channels"
import { CtaLink } from "@/components/marketing/cta-link"
import { JsonLd } from "@/components/seo/json-ld"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { site } from "@/config/brand"
import { publicRoutes } from "@/config/routes"
import { isLeadChannelConfigured } from "@/lib/env"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Transporte de carga terrestre en Colombia | VIVO Transporte",
  description:
    "Solicita una cotización de transporte terrestre de carga. Evaluamos origen, destino y tipo de mercancía según tu operación.",
  path: publicRoutes.transport,
})

const needs = [
  "Carga entre ciudades que requiere coordinación.",
  "Operaciones recurrentes que necesitan un canal claro de solicitud.",
  "Mercancía cuyo tipo, peso o volumen todavía se está definiendo.",
]

const steps = [
  { n: "01", title: "Cuéntanos el viaje", body: "Origen, destino, tipo de carga y, si lo tienes, peso o fecha." },
  { n: "02", title: "Revisamos el requerimiento", body: "Evaluamos si podemos atenderlo. No hay un catálogo cerrado." },
  { n: "03", title: "Te respondemos la cotización", body: "La respuesta confirma la recepción. El servicio se acuerda después." },
]

const faqs = [
  {
    question: "¿Qué tipo de carga pueden evaluar?",
    answer:
      "Cualquier requerimiento de transporte terrestre de carga que puedas describir. El tipo de vehículo, la cobertura y las condiciones se confirman caso por caso.",
  },
  {
    question: "¿Enviar el formulario reserva el servicio?",
    answer:
      "No. El formulario registra la solicitud de cotización. No promete disponibilidad, tiempo de respuesta ni un viaje ya coordinado.",
  },
  {
    question: "¿Qué información conviene tener a mano?",
    answer:
      "Ciudad de origen, ciudad de destino, tipo de carga y un teléfono. El peso, el volumen y la fecha ayudan si ya los conoces.",
  },
]

export default function TransportPage() {
  const ready = isLeadChannelConfigured()

  return (
    <div className="corporate-scope bg-[#F6F8FC]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "VIVO Transporte",
          serviceType: "Transporte terrestre de carga",
          provider: { "@type": "Organization", name: "VIVO Colombia", url: site.url },
          url: `${site.url}${publicRoutes.transport}`,
          description:
            "Transporte terrestre de carga evaluado según el requerimiento de cada operación.",
        }}
      />
      <section className="relative isolate min-h-[28rem] overflow-hidden sm:min-h-[36rem]">
        <Image
          src="/corporate/transport-highway.jpg"
          alt="Camión de carga recorriendo una carretera de montaña al anochecer"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#091B35]/78" />
        <div className="relative mx-auto flex min-h-[28rem] w-full max-w-6xl flex-col justify-end px-4 py-14 sm:min-h-[36rem] sm:px-6 lg:py-20">
          <p className="text-sm font-medium tracking-[0.16em] text-[#508BEB] uppercase">
            VIVO Transporte
          </p>
          <h1 className="font-heading mt-4 max-w-3xl text-[2.3rem] leading-[1.02] font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.6rem]">
            Tu carga en movimiento. Tu negocio avanzando.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/80">
            Transporte de carga adaptado a las necesidades de tu operación. Cotizamos a partir de lo
            que necesitas mover.
          </p>
          <div className="mt-8">
            <CtaLink href="#cotizacion" variant="navy">
              Solicitar cotización
            </CtaLink>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-[#091B35] sm:text-4xl">
              Lo que podemos evaluar
            </h2>
            <ul className="mt-8 space-y-4">
              {needs.map((need) => (
                <li key={need} className="border-t border-[#e3e9f2] pt-4 text-[15px] leading-7 text-[#596579]">
                  {need}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-[18rem] overflow-hidden rounded-[32px] sm:min-h-[24rem]">
            <Image
              src="/corporate/transport-cargo.jpg"
              alt="Carga paletizada y asegurada dentro de un tráiler"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading max-w-xl text-3xl font-semibold tracking-[-0.035em] text-[#091B35] sm:text-4xl">
            Cómo pedimos la cotización
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n}>
                <p className="font-heading text-sm tracking-[0.16em] text-[#2457B2]">{step.n}</p>
                <h3 className="mt-3 text-xl font-semibold text-[#091B35]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#596579]">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-2xl text-sm leading-6 text-[#596579]">
            No publicamos cobertura, flota ni tiempos de respuesta. Esos datos se confirman cuando
            existe un requerimiento concreto.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[32px] bg-[#102C52] px-6 py-10 text-white sm:px-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em]">
              El trámite también puede avanzar.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/75">
              VIVO Software es la unidad tecnológica del grupo para ordenar documentos de transporte.
              Las integraciones oficiales se anuncian solo cuando están habilitadas.
            </p>
          </div>
          <CtaLink href={publicRoutes.software} variant="navy">
            Conocer VIVO Software
          </CtaLink>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-[#091B35]">
            Preguntas frecuentes
          </h2>
          <Accordion type="single" collapsible className="mt-6">
            {faqs.map((item, index) => (
              <AccordionItem key={item.question} value={`t-${index}`}>
                <AccordionTrigger className="min-h-11 py-4 text-left text-base">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="leading-6 text-[#596579]">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-[#091B35] sm:text-4xl">
              Solicita la cotización
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#596579]">
              Nombre, contacto y el recorrido de la carga. Si ya existe un correo o WhatsApp
              oficial, también aparece aquí.
            </p>
            <div className="mt-6">
              <ContactChannels />
            </div>
          </div>
          <LeadForm id="cotizacion" kind="quote" ready={ready} />
        </div>
      </section>
    </div>
  )
}
