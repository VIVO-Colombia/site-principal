import Link from "next/link"

import { StatusPill } from "@/components/shared/status-pill"
import { listAdminUsers } from "@/lib/admin/queries"
import { effectiveSubscriptionStatus } from "@/lib/billing/status"
import { formatLongDate } from "@/lib/format"
import { adminRoutes } from "@/config/routes"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>
}) {
  const params = await searchParams
  const rows = await listAdminUsers()
  const query = params.q?.toLowerCase().trim()
  const filtered = rows.filter(({ profile, subscription }) => {
    const status = effectiveSubscriptionStatus(subscription)
    if (params.estado === "suspendida" && profile.account_status !== "suspended") return false
    if (params.estado === "habilitada" && profile.account_status !== "enabled") return false
    if (params.estado === "activa" && status !== "active" && status !== "trialing") return false
    if (!query) return true
    return `${profile.full_name ?? ""} ${profile.email ?? ""}`.toLowerCase().includes(query)
  })

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-[#5b6b82]">No se muestran contraseñas ni finanzas privadas.</p>
      </div>
      <form className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
        <input name="q" defaultValue={params.q} placeholder="Buscar nombre o correo" className="h-11 rounded-xl border border-[#e5eaf1] px-3 text-sm" />
        <select name="estado" defaultValue={params.estado ?? ""} className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm">
          <option value="">Todos</option>
          <option value="habilitada">Habilitados</option>
          <option value="suspendida">Suspendidos</option>
          <option value="activa">Con acceso vigente</option>
        </select>
        <button type="submit" className="h-11 rounded-xl bg-[#17243c] text-sm text-white">
          Filtrar
        </button>
      </form>
      <div className="hidden overflow-x-auto rounded-[24px] bg-white ring-1 ring-[#e5eaf1] md:block">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs text-[#5b6b82]">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3">Cuenta</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Suscripción</th>
              <th className="px-4 py-3">Vence</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ profile, subscription }) => (
              <tr key={profile.id} className="border-t border-[#e5eaf1]">
                <td className="px-4 py-3">{profile.full_name || "—"}</td>
                <td className="px-4 py-3">{profile.email}</td>
                <td className="px-4 py-3">{formatLongDate(profile.created_at)}</td>
                <td className="px-4 py-3">{profile.account_status}</td>
                <td className="px-4 py-3">{subscription?.plan_name_snapshot ?? "—"}</td>
                <td className="px-4 py-3">{effectiveSubscriptionStatus(subscription) ?? "sin plan"}</td>
                <td className="px-4 py-3">{subscription?.ends_at ? formatLongDate(subscription.ends_at) : "—"}</td>
                <td className="px-4 py-3">
                  <Link href={`${adminRoutes.users}/${profile.id}`} className="text-primary">
                    Detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {filtered.map(({ profile, subscription }) => (
          <article key={profile.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
            <p className="font-semibold">{profile.full_name || profile.email}</p>
            <p className="text-sm text-[#5b6b82]">{profile.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusPill>{profile.account_status}</StatusPill>
              <StatusPill tone="blue">{effectiveSubscriptionStatus(subscription) ?? "sin plan"}</StatusPill>
            </div>
            <Link href={`${adminRoutes.users}/${profile.id}`} className="mt-3 inline-block text-sm text-primary">
              Ver detalle
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
