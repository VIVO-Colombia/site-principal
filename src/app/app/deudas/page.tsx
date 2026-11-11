import { EmptyState } from "@/components/shared/empty-state"
import { requireAppAccess } from "@/lib/auth/access"

export default async function Page() {
  await requireAppAccess()
  return (
    <EmptyState
      title="Deudas"
      description="Ya puedes registrar un pago de deuda como movimiento. El módulo de cuotas y calendarios de crédito se añadirá después."
      action={{ href: "/app/movimientos?nuevo=1&tipo=debt_payment", label: "Registrar pago de deuda" }}
    />
  )
}
