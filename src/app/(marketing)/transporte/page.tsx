import type { Metadata } from "next"
import Image from "next/image"

import { CtaLink } from "@/components/marketing/cta-link"
import { ParallaxFrame } from "@/components/corporate/parallax-frame"
import { UnitCrumb } from "@/components/corporate/unit-crumb"
import { pageMetadata } from "@/lib/seo"
import { publicRoutes } from "@/config/routes"

export const metadata: Metadata = pageMetadata({
  title: "VIVO Transporte | Transporte de carga",
  description:
    "Soluciones de transporte terrestre de carga pensadas para las necesidades de tu operación.",
  path: publicRoutes.transport,
})

const steps = [
  {
    n: "01",
    title: "Cuéntanos qué necesitas transportar.",
    body: "El requerimiento parte de tu operación, no de un catálogo cerrado.",
  },
  {
    n: "02",
    title: "Evaluamos tu requerimiento.",
    body: "Revisamos origen, destino, carga y tiempos para entender el servicio.",
  },
  {
    n: "03",
    title: "Definimos la alternativa de transporte.",
    body: "Te proponemos el camino que mejor se ajusta a lo que necesitas mover.",
  },
  {
    n: "04",
    title: "Coordinamos el servicio.",
    body: "Alineamos la operación para que la carga avance con claridad.",
  },
]

export default function TransportPage() {
  return (
    <div className="corporate-scope bg-[#F6F8FC]">
      <section className="relative isolate min-h-[32rem] overflow-hidden sm:min-h-[38rem] lg:min-h-[42rem]">
        <Image
          src="/corporate/transport-highway.jpg"
          alt="Camión de carga recorriendo una carretera de montaña al anochecer"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#102A56]/72" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102A56] via-[#102A56]/70 to-transparent" />
        <div className="relative mx-auto flex min-h-[32rem] w-full max-w-6xl flex-col justify-end px-4 py-14 sm:min-h-[38rem] sm:px-6 lg:min-h-[42rem] lg:py-20">
          <UnitCrumb unit="Transporte" inverted />
          <h1 className="font-heading mt-5 max-w-3xl text-[2.15rem] leading-[1.05] font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.6rem]">
            Tu carga en movimiento. Tu negocio avanzando.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/75 sm:text-lg">
            Soluciones de transporte de carga pensadas para las necesidades de tu operación.
          </p>
          <div className="mt-8">
            <CtaLink href={publicRoutes.contact} variant="navy">
              Solicitar cotización
            </CtaLink>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">
              Nuestra operación
            </p>
            <h2 className="font-heading mt-4 text-3xl leading-[1.1] font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
              Transporte terrestre de carga, con una operación pensada para servir.
            </h2>
          </div>
          <p className="max-w-xl text-[15px] leading-7 text-[#5b6b82] sm:text-base">
            VIVO Transporte es la unidad del grupo dedicada a conectar necesidades logísticas con un
            servicio de carga confiable. Coordinamos cada requerimiento a partir de lo que tu
            operación necesita mover, sin presentar una flota, una cobertura o una capacidad que no
            esté confirmada para tu caso.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <ParallaxFrame className="relative min-h-[18rem] overflow-hidden rounded-[32px] sm:min-h-[24rem]">
            <div className="absolute inset-0" data-parallax-layer>
              <Image
                src="/corporate/transport-cargo.jpg"
                alt="Carga paletizada y asegurada en el interior de un tráiler"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </ParallaxFrame>
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">
              Soluciones de transporte
            </p>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
              Un servicio que se arma alrededor de tu carga.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[#5b6b82]">
              Evaluamos origen, destino y tipo de mercancía para definir la alternativa de
              transporte. El alcance, los tiempos y las condiciones se acuerdan con cada cliente.
              No afirmamos cobertura nacional, tipos de vehículo ni servicios especializados hasta
              confirmarlos para tu operación.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">
            Cómo trabajamos
          </p>
          <h2 className="font-heading mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
            Un proceso comercial claro, de principio a fin.
          </h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[32px] bg-[#e5eaf1] sm:grid-cols-2">
            {steps.map((step) => (
              <li key={step.n} className="bg-[#F6F8FC] px-6 py-8 sm:px-8">
                <p className="font-heading text-2xl font-semibold text-[#2563EB]">{step.n}</p>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#142238]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5b6b82]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#102A56] px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-[0.16em] text-white/55 uppercase">
              Tecnología que nos conecta
            </p>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              También desarrollamos herramientas para el sector.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/70">
              VIVO Software nace de la misma operación: simplificar la gestión de documentos de
              transporte para que el movimiento no se detenga en el trámite.
            </p>
          </div>
          <CtaLink href={publicRoutes.software} variant="navy">
            Conocer VIVO Software
          </CtaLink>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[32px] bg-white px-6 py-10 ring-1 ring-[#e5eaf1] sm:px-12 sm:py-14 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
              Hablemos de tu próximo envío.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#5b6b82]">
              Solicita información o una cotización por el canal oficial de VIVO. Cuando exista un
              medio de contacto adicional, se publicará en la misma página.
            </p>
          </div>
          <CtaLink href={publicRoutes.contact}>Solicitar cotización</CtaLink>
        </div>
      </section>
    </div>
  )
}
