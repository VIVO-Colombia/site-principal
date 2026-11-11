import Link from "next/link"

import { StatusPill } from "@/components/shared/status-pill"
import { listAdminUsers, listSubscriptions } from "@/lib/admin/queries"
import { formatLongDate } from "@/lib/format"
import { adminRoutes } from "@/config/routes"

export default async function AdminSubscriptionsPage() {
  const [subscriptions, users] = await Promise.all([listSubscriptions(), listAdminUsers()])
  const userMap = new Map(users.map((row) => [row.profile.id, row.profile]))

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suscripciones</h1>
        <p className="text-sm text-[#5b6b82]">Las renovaciones anticipadas extienden desde el vencimiento actual si sigue vigente.</p>
      </div>
      <div className="grid gap-3">
        {subscriptions.map((item) => {
          const user = userMap.get(item.user_id)
          return (
            <article key={item.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{user?.full_name || user?.email}</p>
                  <p className="text-sm text-[#5b6b82]">
                    {item.plan_name_snapshot ?? "Plan"} · {item.source} · {item.starts_at ? formatLongDate(item.starts_at) : "—"} →{" "}
                    {item.ends_at ? formatLongDate(item.ends_at) : "—"}
                  </p>
                </div>
                <StatusPill>{item.status}</StatusPill>
              </div>
              <Link href={`${adminRoutes.users}/${item.user_id}`} className="mt-3 inline-block text-sm text-primary">
                Gestionar
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}
