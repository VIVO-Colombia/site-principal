import type { Metadata } from "next"

import { PlansSection } from "@/components/marketing/plans-section"
import { productName } from "@/config/brand"

export const metadata: Metadata = {
  title: "Planes",
  description: `Solicita acceso a ${productName()}. El cobro inicial es manual y el importe se confirma al activar el plan.`,
}

export default function PlansPage() {
  return (
    <div className="pt-6">
      <PlansSection compact />
    </div>
  )
}
