import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { AuthCard } from "@/components/auth/auth-card"
import { CtaLink } from "@/components/marketing/cta-link"
import { getAccessContext } from "@/lib/auth/session"
import { publicRoutes } from "@/config/routes"
import { catalogPlans } from "@/config/plans"
import { signOutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Activar acceso",
}

export default function ActivatePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f7f9fc]">
      <Suspense>
        <ActivateContent />
      </Suspense>
    </div>
  )
}

async function ActivateContent() {
  const context = await getAccessContext()

  return (
    <AuthCard
      title="Activa tu acceso"
      description="Tu cuenta existe, pero el portal financiero se habilita cuando un Super Admin aprueba el plan o concede una prueba."
      footer={
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="h-11 px-0">
            Cerrar sesión
          </Button>
        </form>
      }
    >
      <p className="text-sm leading-6 text-[#3d4d66]">
        {context.user?.email
          ? `Sesión iniciada como ${context.user.email}.`
          : "Inicia sesión para solicitar la activación."}
      </p>
      <div className="mt-5 space-y-3">
        {catalogPlans.map((plan) => (
          <div key={plan.id} className="rounded-2xl bg-[#f7f9fc] px-4 py-3">
            <p className="font-medium">{plan.name}</p>
            <p className="text-sm text-[#5b6b82]">{plan.cadence}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-[#5b6b82]">
        El envío de comprobantes y la revisión de solicitudes se completarán en la siguiente fase.
        Mientras tanto, puedes revisar los planes y dejar tu cuenta lista.
      </p>
      <div className="mt-6">
        <CtaLink href={publicRoutes.plans}>Ver planes</CtaLink>
      </div>
      <p className="mt-4 text-sm">
        <Link href={publicRoutes.login} className="text-primary hover:underline">
          Usar otra cuenta
        </Link>
      </p>
    </AuthCard>
  )
}
