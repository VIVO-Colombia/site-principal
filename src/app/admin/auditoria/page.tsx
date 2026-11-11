import { listAuditLogs } from "@/lib/admin/queries"
import { formatDateTime } from "@/lib/format"

export default async function AdminAuditPage() {
  const logs = await listAuditLogs()

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Auditoría</h1>
        <p className="text-sm text-[#5b6b82]">Los registros no se pueden editar desde esta interfaz.</p>
      </div>
      <div className="grid gap-3">
        {logs.map((item) => (
          <article key={item.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
            <p className="font-medium">{item.action}</p>
            <p className="text-sm text-[#5b6b82]">
              {item.entity_type} {item.entity_id ?? ""} · {formatDateTime(item.created_at)}
            </p>
            {item.reason ? <p className="mt-1 text-sm">{item.reason}</p> : null}
          </article>
        ))}
      </div>
    </div>
  )
}
