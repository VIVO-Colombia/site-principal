import { ActivationForm } from "@/components/activate/activation-form"
import { StatusPill } from "@/components/shared/status-pill"
import { listPaymentMethods } from "@/lib/admin/queries"
import { requireAppAccess } from "@/lib/auth/access"
import { accessStateLabel } from "@/lib/billing/status"
import { listSelectablePlans, listUserPaymentRequests, listUserSubscriptions } from "@/lib/billing/queries"
import { cadenceLabels } from "@/lib/finance/labels"
import { formatDateTime, formatLongDate } from "@/lib/format"

export default async function SubscriptionPage() {
  const access = await requireAppAccess()
  const [subscriptions, requests, plans, methods] = await Promise.all([
    listUserSubscriptions(access.user!.id),
    listUserPaymentRequests(access.user!.id),
    listSelectablePlans(),
    listPaymentMethods(),
  ])

  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mi suscripción</h1>
        <p className="text-sm text-[#5b6b82]">{accessStateLabel(access)}</p>
      </div>
      {access.subscription ? (
        <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
          <p className="font-semibold">{access.subscription.plan_name_snapshot ?? "Plan"}</p>
          <p className="mt-1 text-sm text-[#5b6b82]">
            {access.subscription.starts_at ? formatLongDate(access.subscription.starts_at) : "—"} →{" "}
            {access.subscription.ends_at ? formatLongDate(access.subscription.ends_at) : "sin vencimiento definido"}
          </p>
          <p className="mt-2 text-xs text-[#5b6b82]">
            Origen: {access.subscription.source}. Las fechas se almacenan en UTC y se muestran en tu zona.
          </p>
        </section>
      ) : null}

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <h2 className="font-semibold">Historial</h2>
        <ul className="mt-3 grid gap-2">
          {subscriptions.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span>
                {item.plan_name_snapshot ?? "Plan"} · {item.status}
                <span className="block text-xs text-[#5b6b82]">{formatDateTime(item.created_at)}</span>
              </span>
              <StatusPill>{item.status}</StatusPill>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <h2 className="mb-3 font-semibold">Solicitudes</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-[#5b6b82]">Todavía no has enviado solicitudes.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {requests.map((item) => (
              <li key={item.id} className="rounded-2xl bg-[#f7f9fc] p-3">
                {item.status} · {cadenceLabels.monthly} · {formatDateTime(item.created_at)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <h2 className="mb-3 font-semibold">Nueva solicitud</h2>
        <ActivationForm plans={plans} methods={methods} />
      </section>
    </div>
  )
}
