import { EmptyState } from "@/components/shared/empty-state"
import { requireAppAccess } from "@/lib/auth/access"

export default async function Page() {
  await requireAppAccess()
  return (
    <EmptyState
      title="Calculadoras"
      description="Esta sección está reservada. No se publican fórmulas hasta contrastarlas con el archivo Excel original."
    />
  )
}
