import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { signOutAction } from "@/app/actions/auth"
import { ActivationForm } from "@/components/activate/activation-form"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { listPaymentMethods } from "@/lib/admin/queries"
import { isSuperAdminRole } from "@/lib/auth/roles"
import { currentStatus } from "@/lib/auth/access"
import { getAccessContext } from "@/lib/auth/session"
import { accessStateLabel } from "@/lib/billing/status"
import { listSelectablePlans, listUserPaymentRequests } from "@/lib/billing/queries"
import { publicRoutes } from "@/config/routes"

export const metadata: Metadata = {
  title: "Activar acceso",
}

export default function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f7f9fc]">
      <Suspense>
        <ActivateContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function ActivateContent({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const context = await getAccessContext()
  const { estado } = await searchParams
  const status = currentStatus(context)

  if (context.user && context.user.emailConfirmed && context.profile?.account_status !== "suspended") {
    if (isSuperAdminRole(context.profile?.role)) {
      redirect("/admin")
    }
    if (status !== "suspended") {
      redirect("/app")
    }
  }

  const [plans, methods, requests] = context.user
    ? await Promise.all([
        listSelectablePlans().catch(() => []),
        listPaymentMethods().catch(() => []),
        listUserPaymentRequests(context.user.id).catch(() => []),
      ])
    : [[], [], []]

  const headline =
    estado === "correo" || (context.user && !context.user.emailConfirmed)
      ? "Confirma tu correo"
      : estado === "suspendida" || context.profile?.account_status === "suspended"
        ? "Cuenta suspendida"
        : "Activa tu acceso"

  return (
    <AuthCard
      title={headline}
      description={accessStateLabel(context)}
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

      {!context.user?.emailConfirmed ? (
        <p className="mt-4 rounded-2xl bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
          Revisa tu bandeja y confirma el correo antes de solicitar un plan.
        </p>
      ) : context.profile?.account_status === "suspended" ? (
        <p className="mt-4 rounded-2xl bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
          Tu cuenta está suspendida. Un Super Admin debe reactivarla.
        </p>
      ) : (
        <div className="mt-5">
          {requests.some((item) => item.status === "submitted") ? (
            <p className="mb-4 rounded-2xl bg-[#eef2f7] px-4 py-3 text-sm">
              Ya tienes una solicitud en revisión. Conservamos el historial; un administrador confirmará el pago de
              forma externa.
            </p>
          ) : null}
          <ActivationForm plans={plans} methods={methods} />
        </div>
      )}

      <p className="mt-4 text-sm">
        <Link href={publicRoutes.plans} className="text-primary hover:underline">
          Ver planes
        </Link>
      </p>
    </AuthCard>
  )
}
