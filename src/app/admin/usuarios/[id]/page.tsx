import Link from "next/link"
import { notFound } from "next/navigation"

import { UserActions } from "@/components/admin/user-actions"
import { getAdminUser, listPlans } from "@/lib/admin/queries"
import { formatDateTime, formatLongDate } from "@/lib/format"
import { adminRoutes } from "@/config/routes"

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [{ profile, subscriptions, requests, payments }, plans] = await Promise.all([
    getAdminUser(id),
    listPlans(true),
  ])
  if (!profile) notFound()

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-4">
        <div>
          <Link href={adminRoutes.users} className="text-sm text-primary">
            Volver
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{profile.full_name || profile.email}</h1>
          <p className="text-sm text-[#5b6b82]">{profile.email}</p>
        </div>
        <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
          <p className="text-sm">Rol: {profile.role}</p>
          <p className="text-sm">Cuenta: {profile.account_status}</p>
          <p className="text-sm">Registro: {formatLongDate(profile.created_at)}</p>
        </section>
        <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
          <h2 className="font-semibold">Suscripciones</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {subscriptions.map((item) => (
              <li key={item.id}>
                {item.plan_name_snapshot ?? "Plan"} · {item.status} · {item.ends_at ? formatLongDate(item.ends_at) : "—"}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
          <h2 className="font-semibold">Solicitudes y pagos</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {requests.map((item) => (
              <li key={item.id}>
                Solicitud {item.status} · {formatDateTime(item.created_at)}
              </li>
            ))}
            {payments.map((item) => (
              <li key={item.id}>
                Pago {item.amount} {item.currency} · {item.paid_at ? formatDateTime(item.paid_at) : ""}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <UserActions
          userId={profile.id}
          accountStatus={profile.account_status}
          subscriptionId={subscriptions[0]?.id}
          plans={plans}
        />
      </aside>
    </div>
  )
}
