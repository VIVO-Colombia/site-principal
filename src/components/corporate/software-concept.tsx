import { ConceptBadge } from "@/components/corporate/concept-badge"

export function ManifestConcept({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_60px_-32px_rgb(16_42_86_/_0.45)] ring-1 ring-[#dbe7f5]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5eaf1] bg-[#F6F8FC] px-4 py-2.5">
          <p className="min-w-0 text-[11px] tracking-[0.14em] text-[#5b6b82] uppercase">
            Documento de transporte
          </p>
          <ConceptBadge className="shrink-0" />
        </div>
        <div className={compact ? "space-y-3 p-4" : "space-y-3.5 p-5 sm:p-6"}>
          <Field label="Origen" hint="Ciudad de cargue" />
          <Field label="Destino" hint="Ciudad de descargue" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Placa" hint="Vehículo" />
            <Field label="Fecha" hint="Operación" />
          </div>
          <div className="rounded-2xl bg-[#EAF2FF] px-4 py-3">
            <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
              Estado
            </p>
            <p className="mt-1 text-sm text-[#142238]">Información en validación</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RequestFlowConcept() {
  const steps = [
    { n: "01", title: "Solicitud", body: "El trámite empieza con lo que la operación necesita mover." },
    { n: "02", title: "Datos", body: "Origen, destino y la información del documento, en un solo lugar." },
    { n: "03", title: "Validación", body: "Se revisa que el requerimiento esté completo antes de seguir." },
    { n: "04", title: "Gestión documental", body: "El documento se organiza según lo que ya esté habilitado." },
    { n: "05", title: "Seguimiento", body: "El estado deja de vivir solo en chats y planillas sueltas." },
  ]

  return (
    <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {steps.map((step, index) => (
        <li
          key={step.n}
          className="relative rounded-[28px] bg-white p-5 ring-1 ring-[#e5eaf1] md:p-6"
        >
          <p className="font-heading text-3xl font-semibold tracking-tight text-[#2563EB]/80">
            {step.n}
          </p>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#142238]">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#5b6b82]">{step.body}</p>
          {index < steps.length - 1 ? (
            <span
              className="pointer-events-none absolute top-10 -right-2 hidden h-px w-4 bg-[#d5deea] xl:block"
              aria-hidden
            />
          ) : null}
        </li>
      ))}
    </ol>
  )
}

export function MessagingConcept() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#102A56] p-5 text-white shadow-[0_24px_60px_-32px_rgb(16_42_86_/_0.55)] sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] tracking-[0.16em] text-white/60 uppercase">Canal de solicitud</p>
        <ConceptBadge className="border-white/15 bg-white/10 text-white/80" />
      </div>
      <div className="space-y-3 text-sm leading-6">
        <Bubble side="user">Necesito gestionar un documento de transporte.</Bubble>
        <Bubble side="vivo">Envía origen, destino y los datos del vehículo.</Bubble>
        <Bubble side="user">Datos listos.</Bubble>
        <Bubble side="vivo">Validamos la información y preparamos el documento.</Bubble>
      </div>
      <p className="mt-5 text-[11px] leading-5 text-white/55">
        Ilustración del flujo. No es una captura de WhatsApp ni un número de atención publicado.
      </p>
    </div>
  )
}

function Field({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-[#F6F8FC] px-4 py-3">
      <p className="text-[11px] font-medium tracking-wide text-[#5b6b82] uppercase">{label}</p>
      <p className="mt-1 text-sm text-[#7c93b5]">{hint}</p>
    </div>
  )
}

function Bubble({
  children,
  side,
}: {
  children: React.ReactNode
  side: "user" | "vivo"
}) {
  const isUser = side === "user"
  return (
    <p
      className={
        isUser
          ? "ml-8 rounded-2xl rounded-tr-md bg-white/12 px-3.5 py-2.5"
          : "mr-8 rounded-2xl rounded-tl-md bg-[#2563EB] px-3.5 py-2.5"
      }
    >
      {children}
    </p>
  )
}
