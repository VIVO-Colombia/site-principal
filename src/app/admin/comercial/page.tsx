import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/env"
import { formatDateTime } from "@/lib/format"

type LeadRow = {
  id: string
  kind: string
  name: string
  company: string | null
  email: string
  phone: string | null
  origin_city: string | null
  destination_city: string | null
  cargo_type: string | null
  weight_volume: string | null
  estimated_date: string | null
  message: string | null
  created_at: string
}

const kindLabel: Record<string, string> = {
  quote: "Cotización",
  software: "Software",
  contact: "Contacto",
}

export default async function CommercialLeadsPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-sm text-[#596579]">Supabase no está configurado en este entorno.</p>
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase!
    .from("commercial_leads")
    .select(
      "id, kind, name, company, email, phone, origin_city, destination_city, cargo_type, weight_volume, estimated_date, message, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Solicitudes comerciales</h1>
        <p className="text-sm text-[#596579]">
          Cotizaciones, información de Software y mensajes de contacto. No incluye datos financieros
          de Planner.
        </p>
      </div>
      {error ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-[#596579] ring-1 ring-[#e3e9f2]">
          No pudimos leer las solicitudes. Aplica la migración `0007_commercial_leads.sql` si todavía
          no está en el proyecto.
        </p>
      ) : (data as LeadRow[] | null)?.length ? (
        (data as LeadRow[]).map((lead) => (
          <article key={lead.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e3e9f2]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{lead.name}</p>
                <p className="text-sm text-[#596579]">
                  {kindLabel[lead.kind] ?? lead.kind}
                  {lead.company ? ` · ${lead.company}` : ""} · {lead.email}
                  {lead.phone ? ` · ${lead.phone}` : ""}
                </p>
              </div>
              <p className="text-xs text-[#596579]">{formatDateTime(lead.created_at)}</p>
            </div>
            {lead.kind === "quote" ? (
              <p className="mt-3 text-sm text-[#102C52]">
                {lead.origin_city} → {lead.destination_city} · {lead.cargo_type}
                {lead.weight_volume ? ` · ${lead.weight_volume}` : ""}
                {lead.estimated_date ? ` · ${lead.estimated_date}` : ""}
              </p>
            ) : null}
            {lead.message ? <p className="mt-2 text-sm leading-6 text-[#596579]">{lead.message}</p> : null}
          </article>
        ))
      ) : (
        <p className="text-sm text-[#596579]">Todavía no hay solicitudes.</p>
      )}
    </div>
  )
}
