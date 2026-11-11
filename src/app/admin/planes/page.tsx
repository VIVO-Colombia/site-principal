import { PlanForm } from "@/components/admin/plan-form"
import { listPlans } from "@/lib/admin/queries"
import { cadenceLabels } from "@/lib/finance/labels"
import { formatCop } from "@/lib/format"

export default async function AdminPlansPage() {
  const plans = await listPlans(true)

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Planes</h1>
        <p className="text-sm text-[#5b6b82]">
          Un cambio de precio no modifica las suscripciones ya concedidas. Los importes se confirman aquí, no en la landing.
        </p>
      </div>
      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <h2 className="mb-3 font-semibold">Nuevo plan</h2>
        <PlanForm />
      </section>
      {plans.map((plan) => (
        <section key={plan.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
          <p className="text-sm text-[#5b6b82]">
            {cadenceLabels[plan.cadence]} · {plan.duration_days} días ·{" "}
            {plan.price_amount != null ? formatCop(plan.price_amount) : "precio por definir"}
          </p>
          <div className="mt-4">
            <PlanForm plan={plan} />
          </div>
        </section>
      ))}
    </div>
  )
}
