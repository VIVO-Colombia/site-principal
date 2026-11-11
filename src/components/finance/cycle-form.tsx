"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createCycleAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FinancialCycle } from "@/types/database"

export function CycleForm({
  cycles,
  readOnly,
}: {
  cycles: FinancialCycle[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const monthEnd = new Date()
  monthEnd.setDate(monthEnd.getDate() + 29)

  async function onSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    const result = await createCycleAction({
      name: formData.get("name"),
      startsOn: formData.get("startsOn"),
      endsOn: formData.get("endsOn"),
      notes: formData.get("notes"),
      duplicateFromId: formData.get("duplicateFromId") || "",
    })
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  return (
    <form action={onSubmit} className="grid gap-3 rounded-[24px] bg-white p-5 ring-1 ring-[#e5eaf1]">
      <div>
        <h2 className="text-lg font-semibold">Nuevo ciclo financiero</h2>
        <p className="mt-1 text-sm text-[#5b6b82]">
          El periodo no tiene que coincidir con el mes calendario.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="cycle-name">Nombre</Label>
        <Input id="cycle-name" name="name" required className="h-11 rounded-xl" placeholder="Abril quincena 1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="startsOn">Inicio</Label>
          <Input id="startsOn" name="startsOn" type="date" required defaultValue={today} className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endsOn">Fin</Label>
          <Input
            id="endsOn"
            name="endsOn"
            type="date"
            required
            defaultValue={monthEnd.toISOString().slice(0, 10)}
            className="h-11 rounded-xl"
          />
        </div>
      </div>
      {cycles.length > 0 ? (
        <div className="grid gap-2">
          <Label htmlFor="duplicateFromId">Duplicar planeación de</Label>
          <select
            id="duplicateFromId"
            name="duplicateFromId"
            className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm"
            defaultValue=""
          >
            <option value="">No duplicar</option>
            {cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-[#5b6b82]">
            Copia presupuestos y compromisos. No copia ingresos, gastos ni transferencias.
          </p>
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="notes">Observaciones</Label>
        <Textarea id="notes" name="notes" className="rounded-xl" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={readOnly || pending}>
        {pending ? "Guardando…" : "Crear ciclo"}
      </Button>
    </form>
  )
}
