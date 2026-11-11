import { redirect } from "next/navigation"

export default async function MovementsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string; tipo?: string }>
}) {
  const params = await searchParams
  const next = new URLSearchParams()
  next.set("tab", "movimientos")
  if (params.nuevo === "1") {
    next.set(
      "accion",
      params.tipo === "income" ? "ingreso" : params.tipo === "transfer" ? "transferencia" : "gasto"
    )
  }
  redirect(`/app?${next.toString()}`)
}
