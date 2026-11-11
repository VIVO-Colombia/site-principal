import { listAdminUsers, listPayments } from "@/lib/admin/queries"
import { formatCop, formatDateTime } from "@/lib/format"

export default async function AdminPaymentsPage() {
  const [payments, users] = await Promise.all([listPayments(), listAdminUsers()])
  const userMap = new Map(users.map((row) => [row.profile.id, row.profile]))

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pagos</h1>
        <p className="text-sm text-[#5b6b82]">Registro de cobros manuales verificados. La pasarela se incorporará después.</p>
      </div>
      <div className="grid gap-3">
        {payments.map((item) => {
          const user = userMap.get(item.user_id)
          return (
            <article key={item.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
              <p className="font-semibold">{user?.full_name || user?.email}</p>
              <p className="text-sm text-[#5b6b82]">
                {formatCop(item.amount)} {item.currency} · {item.paid_at ? formatDateTime(item.paid_at) : formatDateTime(item.created_at)}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
