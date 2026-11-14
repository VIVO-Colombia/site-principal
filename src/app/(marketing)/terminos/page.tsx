import type { Metadata } from "next"

import { productName } from "@/config/brand"
import { publicRoutes } from "@/config/routes"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Términos y condiciones | VIVO Colombia",
  description:
    "Alcance actual de VIVO Planner y de las solicitudes comerciales. No sustituye un contrato definitivo.",
  path: publicRoutes.terms,
})

export default function TermsPage() {
  return (
    <article className="corporate-scope mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium tracking-[0.14em] text-[#2457B2] uppercase">Pendiente de validación jurídica</p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-[#091B35]">
        Términos y condiciones
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-[#596579]">
        <p>
          {productName()} es una herramienta de planeación financiera personal. Al crear una cuenta y
          confirmar el correo entras al plan Free, con las funciones que ese plan incluye hoy. Premium
          se solicita aparte y se activa de forma manual. Todavía no hay una pasarela de pagos.
        </p>
        <p>
          Una cotización de transporte o una solicitud de información sobre software confirma que
          recibimos el mensaje. No reserva un servicio, no fija una tarifa y no declara que una
          integración esté en operación.
        </p>
        <p>
          Estos términos dejan constancia del alcance actual. No sustituyen un contrato comercial ni
          una política definitiva. Deben validarse jurídicamente antes de cobros continuos o de
          publicar condiciones vinculantes.
        </p>
      </div>
    </article>
  )
}
