import type { Metadata } from "next"
import Image from "next/image"

import { LeadForm } from "@/components/commercial/lead-form"
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
import { isWeb3FormsConfigured } from "@/lib/env"
import { pageMetadata } from "@/lib/seo"
import { transportWhatsappUrl } from "@/lib/transport/whatsapp"

export const metadata: Metadata = pageMetadata({
  title: "Transporte de carga | VIVO Transporte",
  description:
    "Calcula un valor estimado para tu transporte desde Popayán o Cali y solicita la confirmación del viaje con VIVO.",
  path: publicRoutes.transport,
})

const services = [
  { title: "Carga urbana", body: "Recorridos dentro de Popayán o dentro de Cali, según la ciudad de origen." },
  { title: "Carga regional", body: "Viajes entre Popayán y Cali, y desde esas ciudades hacia otros destinos terrestres de Colombia." },
  { title: "Apoyo en cargue", body: "Personal de apoyo cotizado aparte, según piso y ascensor. Si la condición no está configurada, se confirma manualmente." },
]

const benefits = [
  "Origen limitado a las ciudades desde las que VIVO opera.",
  "Distancia por carretera cuando el servicio de rutas responde.",
  "El valor sale de parámetros operativos, no de una tabla fija por ciudad.",
  "Puedes pedir confirmación o escribir por WhatsApp con el resumen del viaje.",
]

const steps = [
  { n: "01", title: "Arma el recorrido", body: "Origen en Popayán o Cali, destino, carga y fecha." },
  { n: "02", title: "Revisa la estimación", body: "Si faltan datos o la ruta no se puede calcular, no mostramos un total inventado." },
  { n: "03", title: "Pide confirmación", body: "El formulario o WhatsApp llevan la solicitud. Ninguno reserva el viaje." },
]

const faqs = [
  {
    question: "¿Desde dónde pueden salir los viajes?",
    answer: "Solo desde Popayán o Cali. El destino puede ser la misma ciudad o un punto de Colombia con recorrido terrestre.",
  },
  {
    question: "¿La estimación reserva el camión?",
    answer: "No. Es un valor estimado sujeto a confirmación de VIVO.",
  },
  {
    question: "¿Qué pasa si el mapa no responde?",
    answer: "No inventamos la distancia. Puedes enviar la solicitud para una cotización personalizada.",
  },
]

export default function TransportPage() {
  const formsReady = isWeb3FormsConfigured()

  return (
    <div className="corporate-scope bg-[#F3F7FF]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "VIVO Transporte",
          serviceType: "Transporte terrestre de carga",
          provider: { "@type": "Organization", name: "VIVO Colombia", url: site.url },
          url: `${site.url}${publicRoutes.transport}`,
          areaServed: "CO",
        }}
      />
      <section className="relative isolate min-h-[32rem] overflow-hidden">
        <Image src="/corporate/transport-cargo.jpg" alt="Operación de cargue de mercancía" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[#07152C]/72" />
        <div className="relative mx-auto flex min-h-[32rem] w-full max-w-6xl flex-col justify-end px-4 py-16 sm:px-6">
          <p className="text-sm tracking-[0.16em] text-[#8DDBFF] uppercase">VIVO Transporte</p>
          <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.02] text-white sm:text-6xl">Tu carga en movimiento. Tu negocio avanzando.</h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">Calcula un valor estimado para tu transporte y solicita la confirmación de tu viaje con VIVO.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="#cotizacion" variant="navy">Cotizar mi viaje</CtaLink>
            <a href={transportWhatsappUrl()} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-5 text-white">Hablar por WhatsApp</a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
        {services.map((item) => (
          <article key={item.title} className="rounded-3xl bg-white p-6">
            <h2 className="text-2xl text-[#07152C]">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#07152C]/70">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-4xl text-[#07152C]">Lo que el cliente gana</h2>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-[#07152C]/80">
              {benefits.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-4xl text-[#07152C]">Cómo cotizar</h2>
            <ol className="mt-6 space-y-4">
              {steps.map((step) => (
                <li key={step.n}>
                  <p className="text-xs tracking-[0.14em] text-[#315BFF]">{step.n}</p>
                  <p className="text-lg text-[#07152C]">{step.title}</p>
                  <p className="text-sm text-[#07152C]/70">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-4xl text-[#07152C]">Preguntas frecuentes</h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((item, index) => (
            <AccordionItem key={item.question} value={`t-${index}`}>
              <AccordionTrigger className="min-h-11 text-left text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="leading-6 text-[#07152C]/70">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section id="cotizacion" className="scroll-mt-24 px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-heading text-4xl text-[#07152C]">Solicita la confirmación</h2>
            <p className="mt-4 text-sm leading-7 text-[#07152C]/70">Si ya usaste el cotizador, los datos del recorrido se completan aquí. El botón flotante sigue disponible mientras navegas.</p>
            {formsReady ? null : (
              <p className="mt-4 text-sm text-[#315BFF]">WEB3FORMS_ACCESS_KEY todavía no está definida. El formulario no enviará datos.</p>
            )}
          </div>
          <LeadForm id="formulario-transporte" kind="quote" ready />
        </div>
      </section>
    </div>
  )
}
