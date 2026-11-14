import Image from "next/image"

import { CtaLink } from "@/components/marketing/cta-link"
import { PathsMark } from "@/components/corporate/paths-mark"
import { DesktopDashboardPreview } from "@/components/product/desktop-dashboard-preview"
import { ManifestConcept } from "@/components/corporate/software-concept"
import { AdvanceChoices } from "@/components/corporate/advance-choices"
import { analyticsEvents } from "@/config/analytics"
import { group } from "@/config/brand"
import { publicRoutes } from "@/config/routes"

export function GroupHome() {
  return (
    <div className="corporate-scope bg-[#F6F8FC]">
      <Hero />
      <Solutions />
      <Vision />
      <Principles />
      <Choose />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#091B35] text-white">
      <div className="pointer-events-none absolute inset-0 vivo-lines" aria-hidden />
      <div className="pointer-events-none absolute inset-0 corporate-hero-wash" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-24">
        <div className="animate-fade-up max-w-xl">
          <p className="text-sm font-medium tracking-[0.22em] text-[#508BEB] uppercase">{group.name}</p>
          <h1 className="font-heading mt-5 text-[2.6rem] leading-[0.98] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-[4.4rem]">
            Hacemos que las cosas avancen.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/75 sm:text-lg">
            Tres formas de simplificar tu mundo: transporte, tecnología y finanzas.
          </p>
          <div className="mt-8">
            <CtaLink href="#soluciones" variant="navy">
              Explorar soluciones
            </CtaLink>
          </div>
        </div>
        <div className="animate-fade-up rounded-[32px] bg-white px-3 py-6 text-[#091B35] sm:px-6">
          <PathsMark />
        </div>
      </div>
    </section>
  )
}

function Solutions() {
  return (
    <div id="soluciones" className="scroll-mt-20">
      <section className="bg-[#102C52] text-white">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[18rem] sm:min-h-[24rem] lg:min-h-[40rem]">
            <Image
              src="/corporate/transport-highway.jpg"
              alt="Camión de carga en una carretera de montaña al anochecer"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-12">
            <p className="text-sm font-medium tracking-[0.16em] text-[#508BEB] uppercase">
              VIVO Transporte
            </p>
            <h2 className="font-heading mt-4 text-3xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-4xl">
              Tu carga en movimiento. Tu negocio avanzando.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-white/75">
              Transporte de carga adaptado a las necesidades de tu operación.
            </p>
            <div className="mt-8">
              <CtaLink
                href={publicRoutes.transport}
                variant="navy"
                event={analyticsEvents.transportClick}
              >
                Solicitar cotización
              </CtaLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-[0.16em] text-[#2457B2] uppercase">
              VIVO Software
            </p>
            <h2 className="font-heading mt-4 text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-[#091B35] sm:text-4xl">
              Menos trámites. Más movimiento.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[#596579]">
              Simplifica la gestión documental y concentra la información que necesita tu operación
              logística.
            </p>
            <div className="mt-8">
              <CtaLink href={publicRoutes.software} event={analyticsEvents.softwareClick}>
                Conocer la solución
              </CtaLink>
            </div>
          </div>
          <div className="min-w-0">
            <p className="mb-3 text-xs tracking-[0.14em] text-[#596579] uppercase">
              Ilustración del flujo. No es una captura del producto en producción.
            </p>
            <div className="min-w-0 overflow-hidden">
              <ManifestConcept />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F8FC]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="overflow-hidden rounded-[32px] bg-white p-3 ring-1 ring-[#e3e9f2] lg:p-5">
            <DesktopDashboardPreview />
          </div>
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-[#2457B2] uppercase">
              VIVO Planner
            </p>
            <h2 className="font-heading mt-4 text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-[#091B35] sm:text-4xl">
              Que tu dinero tenga un plan.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[#596579]">
              Controla ingresos, gastos y pagos para saber cuánto puedes gastar y planear lo que
              viene.
            </p>
            <div className="mt-8">
              <CtaLink href={publicRoutes.planner} event={analyticsEvents.plannerClick}>
                Empezar gratis
              </CtaLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Vision() {
  return (
    <section id="vision" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <p className="text-sm font-medium tracking-[0.18em] text-[#2457B2] uppercase">El grupo</p>
        <div>
          <h2 className="font-heading text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-[#091B35] sm:text-5xl">
            Una visión. Distintas soluciones.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#596579] sm:text-lg">
            Creemos que las mejores soluciones son las que simplifican la vida de las personas y el
            trabajo de las empresas. Por eso desarrollamos servicios y herramientas que ayudan a
            avanzar.
          </p>
        </div>
      </div>
    </section>
  )
}

const principles = [
  {
    title: "Claridad",
    body: "Procesos y servicios comprensibles. Decimos qué está disponible y qué todavía se está construyendo.",
  },
  {
    title: "Simplicidad",
    body: "Menos pasos innecesarios para cotizar un viaje, ordenar un trámite o ver cuánto dinero queda.",
  },
  {
    title: "Evolución",
    body: "Las soluciones pueden mejorar cuando cambian las necesidades. No presentamos una promesa como si ya estuviera lista.",
  },
]

function Principles() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading max-w-xl text-3xl font-semibold tracking-[-0.035em] text-[#091B35] sm:text-4xl">
          Tres principios. Sin cifras que no podamos sostener.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {principles.map((item, index) => (
            <li key={item.title}>
              <p className="font-heading text-sm tracking-[0.18em] text-[#2457B2]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#091B35]">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#596579]">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Choose() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-[#091B35] sm:text-5xl">
          ¿Qué necesitas hacer avanzar?
        </h2>
        <AdvanceChoices />
      </div>
    </section>
  )
}
