import type { Metadata } from "next"
import Link from "next/link"

import { CtaLink } from "@/components/marketing/cta-link"
import { publicRoutes } from "@/config/routes"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Contacto | VIVO Colombia",
  description:
    "Canal oficial de contacto de VIVO. Cuando exista un medio publicado, aparecerá en esta página.",
  path: publicRoutes.contact,
})

export default function ContactPage() {
  return (
    <article className="corporate-scope mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-[#142238]">Contacto</h1>
      <p className="mt-6 text-sm leading-7 text-[#3d4d66]">
        Todavía no publicamos un teléfono, un correo ni un formulario de atención. Cuando exista un
        medio oficial para cotizaciones, demostraciones o solicitudes, aparecerá en esta página.
      </p>
      <p className="mt-4 text-sm leading-7 text-[#3d4d66]">
        Esta es la ruta de contacto de VIVO Transporte, VIVO Software y el grupo empresarial. No
        inventamos canales que aún no estén en operación.
      </p>
      <div className="mt-10 rounded-[28px] bg-white p-6 ring-1 ring-[#e5eaf1]">
        <h2 className="text-lg font-semibold tracking-tight text-[#142238]">VIVO Planner</h2>
        <p className="mt-2 text-sm leading-6 text-[#5b6b82]">
          Si buscas la herramienta de planeación financiera, puedes crear una cuenta o entrar con la
          que ya tienes.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <CtaLink href={publicRoutes.register}>Crear cuenta</CtaLink>
          <CtaLink href={publicRoutes.login} variant="secondary">
            Iniciar sesión
          </CtaLink>
        </div>
        <p className="mt-4 text-sm text-[#5b6b82]">
          También puedes volver a{" "}
          <Link href={publicRoutes.planner} className="font-medium text-primary hover:underline">
            VIVO Planner
          </Link>
          .
        </p>
      </div>
    </article>
  )
}
