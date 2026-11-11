import { RecordPaymentForm } from "@/components/finance/record-payment-form"
import { ScheduledPaymentForm } from "@/components/finance/scheduled-payment-form"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusPill } from "@/components/shared/status-pill"
import { requireAppAccess } from "@/lib/auth/access"
import { addAmounts } from "@/lib/finance/money"
import { commitmentStatusLabels } from "@/lib/finance/labels"
import { getFinanceBootstrap } from "@/lib/finance/queries"
import { formatCop, formatShortDate } from "@/lib/format"

const tones = {
  pending: "amber",
  partial: "blue",
  paid: "green",
  overdue: "red",
  cancelled: "slate",
} as const

export default async function PaymentsPage() {
  const access = await requireAppAccess()
  const data = await getFinanceBootstrap(access.user!.id)

  if (!data.cycle) {
    return (
      <EmptyState
        title="Crea un ciclo primero"
        description="Los compromisos pertenecen a un ciclo financiero."
        action={{ href: "/app", label: "Ir al inicio" }}
      />
    )
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pagos programados</h1>
        <p className="text-sm text-[#5b6b82]">
          Un compromiso es una obligación prevista. Solo se mueve dinero cuando registras el pago.
        </p>
      </div>

      <ScheduledPaymentForm
        cycle={data.cycle}
        categories={data.categories}
        accounts={data.accounts}
        readOnly={access.readOnly}
      />

      <div className="grid gap-3">
        {data.scheduledPayments.length === 0 ? (
          <EmptyState title="Sin compromisos" description="Crea el primero para ver vencimientos en el dashboard." />
        ) : (
          data.scheduledPayments.map((item) => {
            const pending = addAmounts(item.expected_amount, -item.paid_amount)
            return (
              <article key={item.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-[#5b6b82]">Vence {formatShortDate(item.due_on)}</p>
                  </div>
                  <StatusPill tone={tones[item.status]}>{commitmentStatusLabels[item.status]}</StatusPill>
                </div>
                <p className="mt-2 text-sm">
                  {formatCop(item.paid_amount)} de {formatCop(item.expected_amount)} · pendiente {formatCop(Math.max(pending, 0))}
                </p>
                {item.status !== "paid" && item.status !== "cancelled" ? (
                  <RecordPaymentForm
                    payment={item}
                    accounts={data.accounts}
                    cycleId={data.cycle!.id}
                    readOnly={access.readOnly}
                  />
                ) : null}
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
