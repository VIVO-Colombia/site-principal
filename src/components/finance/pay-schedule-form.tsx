"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { savePayScheduleAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calendarDateInTimeZone } from "@/lib/finance/pay-periods"

export function PayScheduleForm({
  accounts,
  submitLabel = "Guardar fecha de pago",
  onDone,
}: {
  accounts: { id: string; name: string }[]
  submitLabel?: string
  onDone?: () => void
}) {
  const router = useRouter()
  const today = calendarDateInTimeZone("America/Bogota")
  const defaultDay = String(Number(today.slice(8, 10)))
  const [frequency, setFrequency] = useState("monthly")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await savePayScheduleAction({
      frequency: formData.get("frequency"),
      payDay: formData.get("payDay"),
      payDay2: formData.get("payDay2"),
      intervalDays: formData.get("intervalDays"),
      anchorDate: formData.get("anchorDate"),
      expectedAmount: formData.get("expectedAmount"),
      accountId: formData.get("accountId"),
      variable: formData.get("variable") ? "on" : "",
    })
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.refresh()
    onDone?.()
  }

  return (
    <form action={onSubmit} className="grid gap-3">
      <div>
        <h2 className="text-lg font-semibold">Fecha de pago</h2>
        <p className="mt-1 text-sm text-[#777a80]">
          El periodo empieza el día que te pagan y termina el día anterior al siguiente pago. Lo ya creado no se reescribe.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pay-frequency">Frecuencia</Label>
        <select
          id="pay-frequency"
          name="frequency"
          value={frequency}
          onChange={(event) => setFrequency(event.target.value)}
          className="h-11 rounded-full border border-[#eae9e6] bg-white px-3 text-sm"
        >
          <option value="monthly">Mensual</option>
          <option value="semimonthly">Quincenal, dos fechas</option>
          <option value="every_n_days">Cada cierto número de días</option>
        </select>
      </div>
      {frequency === "every_n_days" ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Label htmlFor="intervalDays">Cada cuántos días</Label>
            <Input id="intervalDays" name="intervalDays" type="number" min={2} max={366} defaultValue={14} required className="h-11 rounded-full" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="anchorDate">Un día de pago</Label>
            <Input id="anchorDate" name="anchorDate" type="date" required defaultValue={today} className="h-11 rounded-full" />
          </div>
        </div>
      ) : (
        <div className={frequency === "semimonthly" ? "grid grid-cols-2 gap-2" : "grid gap-2"}>
          <div className="grid gap-2">
            <Label htmlFor="payDay">{frequency === "semimonthly" ? "Primer día" : "Día de pago"}</Label>
            <Input id="payDay" name="payDay" type="number" min={1} max={31} required defaultValue={defaultDay} className="h-11 rounded-full" />
          </div>
          {frequency === "semimonthly" ? (
            <div className="grid gap-2">
              <Label htmlFor="payDay2">Segundo día</Label>
              <Input id="payDay2" name="payDay2" type="number" min={1} max={31} required defaultValue="30" className="h-11 rounded-full" />
            </div>
          ) : null}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="expectedAmount">Ingreso estimado</Label>
        <Input id="expectedAmount" name="expectedAmount" inputMode="decimal" placeholder="0" className="h-11 rounded-full" />
        <p className="text-xs text-[#777a80]">Queda como previsto. El saldo no sube hasta que registres el ingreso recibido.</p>
      </div>
      {accounts.length > 0 ? (
        <div className="grid gap-2">
          <Label htmlFor="pay-account">Cuenta donde llega</Label>
          <select id="pay-account" name="accountId" className="h-11 rounded-full border border-[#eae9e6] bg-white px-3 text-sm" defaultValue={accounts[0]?.id}>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="variable" className="size-4" />
        El valor cambia en cada pago
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 rounded-full" disabled={pending}>
        {pending ? "Guardando…" : submitLabel}
      </Button>
    </form>
  )
}
