import { redirect } from "next/navigation"

export default async function PaymentsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string }>
}) {
  const params = await searchParams
  redirect(params.nuevo === "1" ? "/app?tab=pagos&accion=pago" : "/app?tab=pagos")
}
