import Link from "next/link"

import { getAdminMetrics, listAuditLogs, listPaymentRequests } from "@/lib/admin/queries"
import { adminRoutes } from "@/config/routes"
import { formatDateTime } from "@/lib/format"

export default async function AdminHomePage() {
  const [metrics, requests, logs] = await Promise.all([
    getAdminMetrics(),
    listPaymentRequests("submitted"),
    listAuditLogs(),
  ])

  const cards = [
    { label: "Usuarios registrados", value: metrics.users, href: adminRoutes.users },
    { label: "Habilitados", value: metrics.enabled, href: adminRoutes.users },
    { label: "Suspendidos", value: metrics.suspended, href: adminRoutes.users },
    { label: "Usuarios Free", value: metrics.freeUsers, href: adminRoutes.users },
    { label: "Usuarios Premium", value: metrics.premiumUsers, href: adminRoutes.subscriptions },
    { label: "Pruebas Premium", value: metrics.trials, href: adminRoutes.subscriptions },
    { label: "Premium por vencer", value: metrics.upcoming, href: adminRoutes.subscriptions },
    { label: "Vencidas históricas", value: metrics.expiredSubs, href: adminRoutes.subscriptions },
    { label: "Solicitudes pendientes", value: metrics.pendingRequests, href: adminRoutes.requests },
    { label: "Pagos registrados", value: metrics.approvedPayments, href: adminRoutes.payments },
  ]

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="text-sm text-[#5b6b82]">Indicadores calculados desde la base de datos. Sin cifras ficticias.</p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
            <p className="text-xs text-[#5b6b82]">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
          <h2 className="font-semibold">Solicitudes pendientes</h2>
          {requests.length === 0 ? (
            <p className="mt-3 text-sm text-[#5b6b82]">No hay solicitudes por revisar.</p>
          ) : (
            <ul className="mt-3 grid gap-2 text-sm">
              {requests.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <Link href={`${adminRoutes.requests}#${item.id}`} className="text-primary">
                    {item.reference || item.id.slice(0, 8)} · {formatDateTime(item.created_at)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
          <h2 className="font-semibold">Actividad reciente</h2>
          {logs.length === 0 ? (
            <p className="mt-3 text-sm text-[#5b6b82]">Todavía no hay auditoría.</p>
          ) : (
            <ul className="mt-3 grid gap-2 text-sm">
              {logs.slice(0, 8).map((item) => (
                <li key={item.id}>
                  {item.action}
                  <span className="block text-xs text-[#5b6b82]">{formatDateTime(item.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
