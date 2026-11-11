import type { Metadata } from "next"
import Image from "next/image"

import { CtaLink } from "@/components/marketing/cta-link"
import { ConceptBadge } from "@/components/corporate/concept-badge"
import {
  ManifestConcept,
  MessagingConcept,
  RequestFlowConcept,
} from "@/components/corporate/software-concept"
import { UnitCrumb } from "@/components/corporate/unit-crumb"
import { pageMetadata } from "@/lib/seo"
import { publicRoutes } from "@/config/routes"

export const metadata: Metadata = pageMetadata({
  title: "VIVO Software | Gestión de manifiestos",
  description:
    "Una solución digital pensada para simplificar la gestión y emisión de documentos de transporte.",
  path: publicRoutes.software,
})

const problems = [
  {
    title: "El trámite consume el tiempo de la operación.",
    body: "Cada documento pide los mismos datos, una y otra vez, mientras la carga espera.",
  },
  {
    title: "La información vive en mil lugares.",
    body: "Papeles, chats y planillas se desordenan cuando más se necesita un dato preciso.",
  },
  {
    title: "El documento tiene que estar listo a tiempo.",
    body: "Sin un flujo claro, emitir o gestionar un manifiesto se vuelve un cuello de botella.",
  },
]

export default function SoftwarePage() {
  return (
    <div className="corporate-scope bg-[#F6F8FC]">
      <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:pb-24">
        <div className="pointer-events-none absolute inset-0 corporate-hero-wash" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div>
            <UnitCrumb unit="Software" />
            <h1 className="font-heading mt-5 text-[2.15rem] leading-[1.05] font-semibold tracking-[-0.04em] text-[#142238] sm:text-5xl lg:text-[3.5rem]">
              Menos trámites. Más movimiento.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[#5b6b82] sm:text-lg">
              Una solución digital pensada para simplificar la gestión y emisión de documentos de
              transporte.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaLink href="#propuesta">Conocer la solución</CtaLink>
              <CtaLink href={publicRoutes.contact} variant="secondary">
                Solicitar información
              </CtaLink>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[32px] bg-[#EAF2FF]">
              <Image
                src="/corporate/software-documents.jpg"
                alt="Ilustración conceptual de documentos digitales conectados a una interfaz"
                width={1280}
                height={720}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full"
              />
            </div>
            <div className="relative mx-auto -mt-14 w-[min(100%,22rem)] lg:mx-0 lg:-mt-20 lg:ml-8 lg:w-[21rem]">
              <ManifestConcept compact />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">El problema</p>
          <h2 className="font-heading mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
            El documento no debería frenar la carga.
          </h2>
          <div className="mt-12 space-y-px overflow-hidden rounded-[32px] bg-[#e5eaf1]">
            {problems.map((item, index) => (
              <article key={item.title} className="bg-white px-6 py-8 sm:px-10">
                <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#142238]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5b6b82]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="propuesta" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">
              Nuestra propuesta
            </p>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
              Una plataforma que ordena el trámite y deja correr la operación.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[#5b6b82]">
              VIVO Software es el producto tecnológico del grupo para gestionar y emitir documentos
              de transporte. Está pensado para reducir pasos repetitivos, concentrar la información
              y estar disponible cuando la operación no espera.
            </p>
            <p className="mt-4 text-[15px] leading-7 text-[#5b6b82]">
              Una solicitud puede iniciarse por canales cotidianos, como WhatsApp, y continuar en la
              plataforma. Las integraciones con entidades oficiales se habilitarán cuando estén
              realmente disponibles; esta página no las presenta como operativas.
            </p>
          </div>
          <MessagingConcept />
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">
                Cómo funciona
              </p>
              <h2 className="font-heading mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
                Un flujo claro, de la solicitud al documento.
              </h2>
            </div>
            <ConceptBadge />
          </div>
          <div className="mt-12">
            <RequestFlowConcept />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">
            Para quién está diseñado
          </p>
          <h2 className="font-heading mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
            La misma necesidad, dos maneras de operar.
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[32px] bg-[#102A56] px-7 py-10 text-white sm:px-10">
              <p className="text-sm font-medium tracking-[0.16em] text-white/55 uppercase">
                Independientes
              </p>
              <h3 className="font-heading mt-4 text-2xl font-semibold tracking-tight">
                Conductores y transportadores.
              </h3>
              <p className="mt-4 text-[15px] leading-7 text-white/70">
                Para quien necesita gestionar documentos sin armar un área administrativa. El flujo
                cabe en el ritmo del oficio: solicitar, enviar datos y seguir el movimiento.
              </p>
            </article>
            <article className="rounded-[32px] bg-[#EAF2FF] px-7 py-10 sm:px-10">
              <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">
                Empresas
              </p>
              <h3 className="font-heading mt-4 text-2xl font-semibold tracking-tight text-[#142238]">
                Operaciones que concentran documentos.
              </h3>
              <p className="mt-4 text-[15px] leading-7 text-[#5b6b82]">
                Para equipos que necesitan ordenar solicitudes, validar información y emitir o
                gestionar manifiestos sin que cada trámite viva en un hilo distinto.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-[32px] bg-[#102A56] px-6 py-12 text-white sm:px-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-[0.16em] text-white/55 uppercase">
              Software conectado con la operación
            </p>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Lo digital nace de mover carga, no al revés.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-white/70">
              VIVO Software se construye junto a VIVO Transporte: la experiencia del sector alimenta
              la herramienta, y la herramienta busca devolverle tiempo a la operación.
            </p>
          </div>
          <CtaLink href={publicRoutes.transport} variant="navy">
            Conocer VIVO Transporte
          </CtaLink>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[32px] bg-white px-6 py-10 ring-1 ring-[#e5eaf1] sm:px-12 sm:py-14 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
              ¿Quieres conocer la solución?
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#5b6b82]">
              Solicita información por el canal oficial de VIVO. Si más adelante hay una demostración
              o un medio adicional, se publicará en la página de contacto.
            </p>
          </div>
          <CtaLink href={publicRoutes.contact}>Solicitar información</CtaLink>
        </div>
      </section>
    </div>
  )
}
