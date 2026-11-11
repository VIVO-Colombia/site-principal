import type { Metadata } from "next"

import { productName } from "@/config/brand"

export const metadata: Metadata = {
  title: "Términos y condiciones",
}

export default function TermsPage() {
  return (
    <article className="corporate-scope mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Términos y condiciones</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-[#3d4d66]">
        <p>
          {productName()} es una plataforma de planeación financiera personal en construcción. Al
          crear una cuenta aceptas usar el servicio de acuerdo con las funciones realmente
          disponibles en cada etapa.
        </p>
        <p>
          El acceso completo depende de una suscripción activa o de una prueba concedida por un Super
          Admin. El registro por sí solo no habilita el módulo financiero.
        </p>
        <p>
          Estos términos se publicarán de forma definitiva antes de cobrar suscripciones de manera
          continua. Hasta entonces, esta página deja constancia del alcance actual y no sustituye un
          contrato comercial.
        </p>
      </div>
    </article>
  )
}
