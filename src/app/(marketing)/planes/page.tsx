import type { Metadata } from "next"
import { Suspense } from "react"

import { PlansSection } from "@/components/marketing/plans-section"
import { catalogPlans, type CatalogPlan } from "@/config/plans"
import { productName } from "@/config/brand"
import { cadenceLabels } from "@/lib/finance/labels"
import { listPlans } from "@/lib/admin/queries"

export const metadata: Metadata = {
  title: "Planes",
  description: `Elige vigencia y solicita acceso a ${productName()}. El cobro es manual y el valor se confirma al activar.`,
}

export default function PlansPage() {
  return (
    <div className="marketing-scope pt-6">
      <Suspense fallback={<PlansSection compact />}>
        <PublishedPlans />
      </Suspense>
    </div>
  )
}

async function PublishedPlans() {
  const published = await listPlans(false).catch(() => [])
  const items: CatalogPlan[] =
    published.length > 0
      ? published.map((plan, index) => ({
          id: plan.id,
          name: plan.name,
          cadence: cadenceLabels[plan.cadence],
          summary: plan.description || "Acceso al planeador con activación manual.",
          features: Array.isArray(plan.features)
            ? (plan.features as string[])
            : catalogPlans[0]?.features ?? [],
          highlighted: index === published.length - 1,
          availability: "available-to-request",
        }))
      : catalogPlans

  return <PlansSection compact items={items} />
}
