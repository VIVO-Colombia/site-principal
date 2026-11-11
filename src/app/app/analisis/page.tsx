import { EmptyState } from "@/components/shared/empty-state"
import { requireAppAccess } from "@/lib/auth/access"

export default async function Page() {
  await requireAppAccess()
  return (
    <EmptyState
      title="Análisis"
      description="Los saldos y presupuestos del dashboard ya usan datos reales. Los gráficos comparativos se añadirán después de validar el Excel original."
      action={{ href: "/app", label: "Ver dashboard" }}
    />
  )
}
