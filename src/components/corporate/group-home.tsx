import Image from "next/image"
import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { CtaLink } from "@/components/marketing/cta-link"
import { group } from "@/config/brand"
import { publicRoutes } from "@/config/routes"

const products = [
  {
    href: publicRoutes.software,
    kicker: "Empresas",
    title: "VIVO Manifiestos",
    body: "Organiza la información de documentos de transporte y el estado de cada solicitud.",
  },
  {
    href: publicRoutes.planner,
    kicker: "Personas",
    title: "VIVO Planner",
    body: "Planeación financiera personal para ver el dinero disponible y anticipar obligaciones.",
  },
]

export function GroupHome() {
  return (
    <div className="corporate-scope bg-[#F3F7FF]">
      <section className="holo-sheen relative overflow-hidden text-white">
        <div className="relative mx-auto grid w-full max-w-6xl items-end gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <Logo label={group.name} inverted priority />
            <h1 className="font-heading mt-8 max-w-3xl text-[2.7rem] leading-[0.96] font-medium tracking-[-0.045em] sm:text-6xl lg:text-[4.6rem]">
              Movemos negocios. Creamos soluciones.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
              Transporte que conecta oportunidades. Tecnología que simplifica procesos y transforma la manera de trabajar y vivir.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaLink href={`${publicRoutes.transport}#cotizacion`} variant="navy">Cotizar transporte</CtaLink>
              <CtaLink href={publicRoutes.software} variant="invert">Explorar soluciones de software</CtaLink>
            </div>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-[2rem] border border-white/15">
            <Image
              src="/corporate/transport-highway.jpg"
              alt="Camión de carga en carretera al anochecer"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07152C]/70 to-transparent" />
            <p className="absolute right-5 bottom-5 left-5 text-sm text-white/90">Carga en movimiento. Software para lo que sigue.</p>
          </div>
        </div>
      </section>

      <section id="vivo" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-sm tracking-[0.18em] text-[#315BFF] uppercase">VIVO</p>
        <h2 className="font-heading mt-3 max-w-3xl text-4xl leading-tight text-[#07152C] sm:text-5xl">Dos divisiones. Una misma forma de avanzar.</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#07152C]/70">
          VIVO opera transporte terrestre de carga y desarrolla software para empresas y personas. Cada conversación comercial empieza por una de esas dos puertas.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-8 sm:px-6 lg:grid-cols-2">
        <Link href={publicRoutes.transport} className="rounded-[2rem] bg-[#07152C] p-8 text-white">
          <p className="text-sm tracking-[0.16em] text-[#8DDBFF] uppercase">VIVO Transporte</p>
          <h2 className="font-heading mt-4 text-4xl">Tu carga en movimiento.</h2>
          <p className="mt-4 max-w-md text-white/75">Estima el viaje desde Popayán o Cali y pide la confirmación del servicio.</p>
        </Link>
        <Link href={publicRoutes.software} className="rounded-[2rem] border border-[#07152C]/10 bg-white p-8">
          <p className="text-sm tracking-[0.16em] text-[#315BFF] uppercase">VIVO Soluciones de Software</p>
          <h2 className="font-heading mt-4 text-4xl text-[#07152C]">Tecnología para empresas y personas.</h2>
          <p className="mt-4 text-[#07152C]/70">Manifiestos para la operación. Planner para las finanzas personales.</p>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-4xl text-[#07152C]">Productos tecnológicos</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <Link key={product.title} href={product.href} className="rounded-3xl bg-white p-6 ring-1 ring-[#07152C]/10">
              <p className="text-xs tracking-[0.14em] text-[#B7A7FF] uppercase">{product.kicker}</p>
              <h3 className="mt-3 text-2xl text-[#07152C]">{product.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#07152C]/70">{product.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            ["Claridad", "Cada página pide una acción: cotizar un viaje o conocer un producto."],
            ["Confirmación", "La estimación de transporte no reserva el servicio. VIVO confirma el valor."],
            ["Continuidad", "Los productos nuevos entran en la misma división de software, sin rehacer el sitio."],
          ].map(([title, body]) => (
            <article key={title}>
              <h2 className="text-xl text-[#07152C]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#07152C]/70">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-20 sm:px-6">
        <h2 className="font-heading text-4xl text-[#07152C]">Hablemos del siguiente movimiento.</h2>
        <CtaLink href={publicRoutes.contact}>Contacto comercial</CtaLink>
      </section>
    </div>
  )
}
