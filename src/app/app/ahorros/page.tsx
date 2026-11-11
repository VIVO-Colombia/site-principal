import { EmptyState } from "@/components/shared/empty-state"
import { requireAppAccess } from "@/lib/auth/access"

export default async function Page() {
  await requireAppAccess()
  return (
    <EmptyState
      title="Ahorros"
      description="La estructura de categorías y aportes de ahorro ya existe. El módulo de metas se construirá sobre esos registros, sin datos simulados."
      action={{ href: "/app/planeacion", label: "Ir a planeación" }}
    />
  )
}
