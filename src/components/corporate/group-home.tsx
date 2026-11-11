import Image from "next/image"
import Link from "next/link"

import { CtaLink } from "@/components/marketing/cta-link"
import { DesktopDashboardPreview } from "@/components/product/desktop-dashboard-preview"
import { ParallaxFrame } from "@/components/corporate/parallax-frame"
import { PathsMark } from "@/components/corporate/paths-mark"
import { ManifestConcept } from "@/components/corporate/software-concept"
import { group } from "@/config/brand"
import { marketingAnchors, publicRoutes } from "@/config/routes"

export function GroupHome() {
  return (
    <div className="corporate-scope bg-[#F6F8FC]">
      <Hero />
      <Intro />
      <Ecosystem />
      <Growth />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:pt-14 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 corporate-hero-wash" aria-hidden />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
        <div className="animate-fade-up max-w-xl lg:pt-4">
          <p className="text-sm font-medium tracking-[0.2em] text-primary uppercase">{group.name}</p>
          <h1 className="font-heading mt-5 text-[2.35rem] leading-[1.02] font-semibold tracking-[-0.045em] text-[#142238] sm:text-5xl lg:text-[4rem]">
            Diferentes caminos.
            <span className="mt-1 block text-[#102A56]">Un mismo propósito.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-[#5b6b82] sm:mt-6 sm:text-lg">
            {group.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <CtaLink href={marketingAnchors.ecosystem}>Explorar nuestras soluciones</CtaLink>
            <CtaLink href={marketingAnchors.about} variant="secondary">
              Conoce VIVO
            </CtaLink>
          </div>
        </div>
        <div className="animate-fade-up min-w-0">
          <PathsMark />
        </div>
      </div>
    </section>
  )
}

function Intro() {
  return (
    <section id="vivo" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">El grupo</p>
        <h2 className="font-heading mt-4 max-w-3xl text-3xl leading-[1.1] font-semibold tracking-[-0.035em] text-[#142238] sm:text-[2.75rem]">
          Solidez para operar. Innovación para simplificar. Espacio para crecer.
        </h2>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#5b6b82] sm:text-base">
          VIVO reúne soluciones para necesidades distintas, con una visión común: simplificar
          procesos, generar oportunidades y facilitar la vida de las personas y las empresas.
        </p>
      </div>
    </section>
  )
}

function Ecosystem() {
  return (
    <div id="ecosistema" className="scroll-mt-20">
      <TransportBlock />
      <SoftwareBlock />
      <PlannerBlock />
    </div>
  )
}

function TransportBlock() {
  return (
    <section className="bg-[#102A56] text-white">
      <div className="mx-auto grid max-w-6xl items-stretch lg:grid-cols-[1.05fr_0.95fr]">
        <ParallaxFrame className="relative min-h-[18rem] overflow-hidden sm:min-h-[22rem] lg:min-h-[36rem]">
          <div className="absolute inset-0" data-parallax-layer>
            <Image
              src="/corporate/transport-highway.jpg"
              alt="Camión de carga recorriendo una carretera de montaña al anochecer"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#102A56] via-[#102A56]/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#102A56]/10 lg:to-[#102A56]/70" />
          <p className="absolute top-6 left-6 font-heading text-6xl font-semibold text-white/15 sm:text-7xl">
            01
          </p>
        </ParallaxFrame>
        <div className="flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-12">
          <p className="text-sm font-medium tracking-[0.16em] text-white/55 uppercase">
            VIVO Transporte
          </p>
          <h2 className="font-heading mt-4 max-w-md text-3xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-4xl">
            Movemos lo que impulsa tu negocio.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-white/70">
            Soluciones de transporte terrestre de carga enfocadas en conectar necesidades logísticas
            con una operación confiable y eficiente.
          </p>
          <div className="mt-8">
            <CtaLink href={publicRoutes.transport} variant="navy">
              Conocer Transporte
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  )
}

function SoftwareBlock() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="order-2 lg:order-1">
          <p className="font-heading text-6xl font-semibold text-[#EAF2FF] sm:text-7xl">02</p>
          <p className="-mt-4 text-sm font-medium tracking-[0.16em] text-primary uppercase">
            VIVO Software
          </p>
          <h2 className="font-heading mt-4 max-w-md text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
            La logística también puede ser simple.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-[#5b6b82]">
            Soluciones digitales que facilitan la gestión y emisión de documentos de transporte,
            reduciendo tareas manuales y simplificando la operación.
          </p>
          <div className="mt-8">
            <CtaLink href={publicRoutes.software}>Conocer Software</CtaLink>
          </div>
        </div>
        <div className="relative order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[32px] bg-[#EAF2FF]">
            <Image
              src="/corporate/software-documents.jpg"
              alt="Ilustración conceptual de documentos digitales conectados a una interfaz"
              width={1280}
              height={720}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-auto w-full opacity-90"
            />
          </div>
          <div className="relative mx-auto -mt-16 w-[min(100%,22rem)] sm:-mt-20">
            <ManifestConcept compact />
          </div>
        </div>
      </div>
    </section>
  )
}

function PlannerBlock() {
  return (
    <section className="bg-[#EAF2FF]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <div className="hidden lg:block">
            <DesktopDashboardPreview />
          </div>
          <div className="overflow-hidden rounded-[28px] bg-white p-3 ring-1 ring-[#d5deea] lg:hidden">
            <DesktopDashboardPreview />
          </div>
        </div>
        <div>
          <p className="font-heading text-6xl font-semibold text-white/80 sm:text-7xl">03</p>
          <p className="-mt-4 text-sm font-medium tracking-[0.16em] text-primary uppercase">
            VIVO Planner
          </p>
          <h2 className="font-heading mt-4 max-w-md text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-[#142238] sm:text-4xl">
            Tu dinero. Tus decisiones. Tu futuro.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-[#5b6b82]">
            Una herramienta de planeación financiera personal que te ayuda a organizar tus ingresos,
            controlar gastos y avanzar hacia tus objetivos.
          </p>
          <div className="mt-8">
            <CtaLink href={publicRoutes.planner}>Conocer Planner</CtaLink>
          </div>
        </div>
      </div>
    </section>
  )
}

function Growth() {
  return (
    <section id="marca" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
            Una marca, distintas posibilidades
          </p>
          <h2 className="font-heading mt-5 text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-[#142238] sm:text-5xl">
            No nos define una sola industria. Nos mueve crear soluciones.
          </h2>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#5b6b82] sm:text-lg">
            En VIVO exploramos oportunidades para desarrollar servicios y herramientas útiles,
            combinando tecnología, operación y una visión empresarial de largo plazo.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href={publicRoutes.transport}
            className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm text-[#102A56] ring-1 ring-[#d5deea] hover:ring-[#2563EB]"
          >
            Transporte
          </Link>
          <Link
            href={publicRoutes.software}
            className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm text-[#102A56] ring-1 ring-[#d5deea] hover:ring-[#2563EB]"
          >
            Software
          </Link>
          <Link
            href={publicRoutes.planner}
            className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm text-[#102A56] ring-1 ring-[#d5deea] hover:ring-[#2563EB]"
          >
            Planner
          </Link>
        </div>
      </div>
    </section>
  )
}
