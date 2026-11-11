import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto",
}

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Contacto</h1>
      <p className="mt-6 text-sm leading-7 text-[#3d4d66]">
        Todavía no publicamos un canal de contacto, dirección ni teléfono. Cuando exista un medio
        oficial, aparecerá en esta página.
      </p>
    </article>
  )
}
