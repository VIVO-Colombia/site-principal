import { Construction } from "lucide-react"

export function ComingSoon({
  title,
  description,
  readOnly,
}: {
  title: string
  description: string
  readOnly?: boolean
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-start justify-center px-1 py-10">
      <span className="grid size-12 place-items-center rounded-2xl bg-white ring-1 ring-[#e5eaf1]">
        <Construction className="size-5 text-primary" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-[#5b6b82]">{description}</p>
      {readOnly ? (
        <p className="mt-4 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
          Tu suscripción está vencida. Puedes consultar y exportar cuando esa función exista, pero no
          crear ni modificar registros.
        </p>
      ) : (
        <p className="mt-4 rounded-2xl bg-[#eef2f7] px-4 py-3 text-sm text-[#3d4d66]">
          Esta pantalla está en construcción. No simula saldos, pagos ni movimientos reales.
        </p>
      )}
    </div>
  )
}
