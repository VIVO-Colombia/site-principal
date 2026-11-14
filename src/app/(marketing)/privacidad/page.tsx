import type { Metadata } from "next"

import { pageMetadata } from "@/lib/seo"
import { publicRoutes } from "@/config/routes"

export const metadata: Metadata = pageMetadata({
  title: "Privacidad | VIVO Colombia",
  description:
    "Alcance actual del tratamiento de datos en VIVO. Este texto no sustituye una política definitiva y requiere validación jurídica.",
  path: publicRoutes.privacy,
})

export default function PrivacyPage() {
  return (
    <article className="corporate-scope mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium tracking-[0.14em] text-[#2457B2] uppercase">Pendiente de validación jurídica</p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-[#091B35]">Privacidad</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-[#596579]">
        <p>
          Este texto describe el alcance actual. No es la política definitiva de tratamiento de datos
          personales ni declara cumplimiento de la Ley 1581 de 2012, sus decretos o instrucciones de
          la Superintendencia de Industria y Comercio. Debe revisarlo un asesor jurídico antes de
          usarse como documento legal.
        </p>
        <p>
          VIVO Planner separa el espacio de cada cuenta. Las rutas privadas se validan en el servidor.
          Las contraseñas las administra el proveedor de autenticación y no se guardan en texto plano
          en nuestra base de datos. No enviamos movimientos, saldos ni contraseñas a herramientas de
          analítica.
        </p>
        <p>
          Los formularios de cotización, software y contacto piden nombre, empresa si aplica, correo,
          teléfono y el detalle de la solicitud. Solo se almacenan cuando el canal está configurado.
          Sirven para responder esa solicitud. No publicamos un encargado, una dirección ni un plazo
          de conservación mientras no estén confirmados.
        </p>
        <p>
          Si más adelante se publica un correo de contacto, será el canal para pedir información sobre
          estos datos. Hasta entonces, esta página no inventa un procedimiento de consulta o supresión.
        </p>
      </div>
    </article>
  )
}
