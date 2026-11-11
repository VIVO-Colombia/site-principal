import { EmptyState } from "@/components/shared/empty-state"
import { requireAppAccess } from "@/lib/auth/access"

export default async function Page() {
  await requireAppAccess()
  return (
    <EmptyState
      title="Calendario"
      description="Los vencimientos ya se listan en Pagos y en el inicio. La vista de calendario se activará cuando esa capa esté lista."
      action={{ href: "/app/pagos", label: "Ver pagos programados" }}
    />
  )
}
