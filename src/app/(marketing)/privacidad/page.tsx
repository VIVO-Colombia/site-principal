import type { Metadata } from "next"

import { productName } from "@/config/brand"

export const metadata: Metadata = {
  title: "Privacidad",
}

export default function PrivacyPage() {
  return (
    <article className="corporate-scope mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Privacidad</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-[#3d4d66]">
        <p>
          {productName()} está diseñado para que cada persona tenga un espacio financiero
          independiente. Los datos de una cuenta no se muestran a otros usuarios.
        </p>
        <p>
          El acceso a las áreas privadas se valida en el servidor. Las contraseñas las administra el
          proveedor de autenticación; no se almacenan en texto plano en nuestra base de datos.
        </p>
        <p>
          Esta página describe el alcance actual. No afirma certificaciones, auditorías externas ni
          controles que todavía no existan. Actualizaremos este texto cuando el tratamiento de datos
          y las políticas definitivas estén publicados.
        </p>
      </div>
    </article>
  )
}
