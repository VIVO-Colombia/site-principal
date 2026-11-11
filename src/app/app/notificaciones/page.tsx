import { markNotificationReadAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { requireAppAccess } from "@/lib/auth/access"
import { getFinanceBootstrap } from "@/lib/finance/queries"
import { formatDateTime, formatShortDate } from "@/lib/format"

export default async function NotificationsPage() {
  const access = await requireAppAccess()
  const data = await getFinanceBootstrap(access.user!.id)
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = data.scheduledPayments.filter((item) => {
    if (item.status === "paid" || item.status === "cancelled") return false
    const due = item.due_on
    const limit = new Date()
    limit.setDate(limit.getDate() + 7)
    return due <= limit.toISOString().slice(0, 10)
  })
  const subscriptionNotice =
    access.status === "expired"
      ? "Tu suscripción está vencida. Puedes consultar y exportar, pero no modificar registros."
      : access.subscription?.ends_at
        ? `Tu acceso vence el ${formatDateTime(access.subscription.ends_at)}.`
        : null

  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notificaciones</h1>
        <p className="text-sm text-[#5b6b82]">
          Avisos internos. Los recordatorios por correo o push todavía no están configurados.
        </p>
      </div>

      {subscriptionNotice ? (
        <div className="rounded-[24px] bg-[#fffbeb] p-4 text-sm text-[#92400e]">{subscriptionNotice}</div>
      ) : null}

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <h2 className="font-semibold">Vencimientos</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-[#5b6b82]">No hay pagos próximos o vencidos en este ciclo.</p>
        ) : (
          <ul className="mt-3 grid gap-2 text-sm">
            {upcoming.map((item) => (
              <li key={item.id}>
                {item.due_on < today ? "Vencido" : "Próximo"}: {item.name} · {formatShortDate(item.due_on)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <h2 className="font-semibold">Avisos guardados</h2>
        {data.notifications.length === 0 ? (
          <EmptyState title="Bandeja vacía" description="Cuando un administrador revise tu acceso, el aviso aparecerá aquí." />
        ) : (
          <ul className="mt-3 grid gap-3">
            {data.notifications.map((item) => (
              <li key={item.id} className="rounded-2xl bg-[#f7f9fc] p-3">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-[#5b6b82]">{item.body}</p>
                <p className="mt-1 text-xs text-[#7c93b5]">{formatDateTime(item.created_at)}</p>
                {!item.read_at ? (
                  <form
                    className="mt-2"
                    action={async () => {
                      "use server"
                      await markNotificationReadAction(item.id)
                    }}
                  >
                    <Button type="submit" variant="ghost" className="h-9 px-0 text-xs">
                      Marcar como leída
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
