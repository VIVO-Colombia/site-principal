import { CtaLink } from "@/components/marketing/cta-link"
import { publicRoutes } from "@/config/routes"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-start justify-center px-4">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Esta página no existe.</h1>
      <p className="mt-3 text-sm leading-6 text-[#5b6b82]">
        El enlace puede estar incompleto o la sección todavía no está publicada.
      </p>
      <div className="mt-6">
        <CtaLink href={publicRoutes.home}>Volver al inicio</CtaLink>
      </div>
    </div>
  )
}
