"use client"

import { CtaLink } from "@/components/marketing/cta-link"
import { publicRoutes } from "@/config/routes"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-start justify-center px-4">
      <h1 className="text-3xl font-semibold tracking-tight">Algo salió mal.</h1>
      <p className="mt-3 text-sm leading-6 text-[#5b6b82]">
        Puedes reintentar o volver a la página de inicio.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-white"
        >
          Reintentar
        </button>
        <CtaLink href={publicRoutes.home} variant="secondary">
          Inicio
        </CtaLink>
      </div>
    </div>
  )
}
