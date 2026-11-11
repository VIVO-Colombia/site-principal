import { RequestReview } from "@/components/admin/request-review"
import { StatusPill } from "@/components/shared/status-pill"
import { listAdminUsers, listPaymentRequests, listPlans } from "@/lib/admin/queries"
import { formatCop, formatDateTime, formatLongDate } from "@/lib/format"

export default async function AdminRequestsPage() {
  const [requests, users, plans] = await Promise.all([
    listPaymentRequests(),
    listAdminUsers(),
    listPlans(true),
  ])
  const userMap = new Map(users.map((row) => [row.profile.id, row.profile]))
  const planMap = new Map(plans.map((plan) => [plan.id, plan]))

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Solicitudes</h1>
        <p className="text-sm text-[#5b6b82]">
          Un comprobante no confirma el pago. La aprobación registra el cobro y activa o renueva la suscripción juntas.
        </p>
      </div>
      {requests.map((item) => {
        const user = userMap.get(item.user_id)
        const plan = planMap.get(item.plan_id)
        return (
          <article id={item.id} key={item.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{user?.full_name || user?.email || item.user_id}</p>
                <p className="text-sm text-[#5b6b82]">
                  {plan?.name ?? "Plan"} · declarado {formatCop(item.declared_amount)}
                  {item.expected_amount != null ? ` · esperado ${formatCop(item.expected_amount)}` : ""}
                </p>
                <p className="text-xs text-[#5b6b82]">
                  {item.paid_on ? formatLongDate(item.paid_on) : "sin fecha"} · ref {item.reference || "—"} ·{" "}
                  {formatDateTime(item.created_at)}
                </p>
              </div>
              <StatusPill tone={item.status === "submitted" ? "amber" : item.status === "approved" ? "green" : "red"}>
                {item.status}
              </StatusPill>
            </div>
            {item.receipt_path ? (
              <p className="mt-2 text-xs text-[#5b6b82]">Comprobante privado: {item.receipt_path}</p>
            ) : null}
            <div className="mt-4">
              <RequestReview requestId={item.id} status={item.status} />
            </div>
          </article>
        )
      })}
    </div>
  )
}
