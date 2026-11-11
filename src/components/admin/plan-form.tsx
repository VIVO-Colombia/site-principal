"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { savePlanAction } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Plan } from "@/types/database"

export function PlanForm({ plan }: { plan?: Plan }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  return (
    <form
      className="grid gap-3"
      action={async (formData) => {
        setError(null)
        setSuccess(null)
        const result = await savePlanAction({
          id: plan?.id,
          code: formData.get("code"),
          name: formData.get("name"),
          description: formData.get("description"),
          cadence: formData.get("cadence"),
          durationDays: formData.get("durationDays"),
          priceAmount: formData.get("priceAmount"),
          currency: formData.get("currency") || "COP",
          isActive: formData.get("isActive") === "on",
          visibleOnLanding: formData.get("visibleOnLanding") === "on",
          sortOrder: formData.get("sortOrder"),
        })
        if (result.error) setError(result.error)
        else {
          setSuccess(result.success ?? "Guardado.")
          router.refresh()
        }
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`code-${plan?.id ?? "new"}`}>Identificador</Label>
          <Input id={`code-${plan?.id ?? "new"}`} name="code" required defaultValue={plan?.code ?? ""} className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`name-${plan?.id ?? "new"}`}>Nombre</Label>
          <Input id={`name-${plan?.id ?? "new"}`} name="name" required defaultValue={plan?.name ?? ""} className="h-11 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Descripción</Label>
        <Textarea name="description" defaultValue={plan?.description ?? ""} className="rounded-xl" />
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        <select name="cadence" defaultValue={plan?.cadence ?? "monthly"} className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm">
          <option value="monthly">Mensual</option>
          <option value="quarterly">Trimestral</option>
          <option value="semiannual">Semestral</option>
          <option value="annual">Anual</option>
          <option value="custom">Personalizado</option>
        </select>
        <Input name="durationDays" type="number" min={1} defaultValue={plan?.duration_days ?? 30} className="h-11 rounded-xl" />
        <Input name="priceAmount" placeholder="Precio (opcional)" defaultValue={plan?.price_amount ? String(plan.price_amount) : ""} className="h-11 rounded-xl" />
        <Input name="currency" defaultValue={plan?.currency ?? "COP"} className="h-11 rounded-xl" />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Input name="sortOrder" type="number" defaultValue={plan?.sort_order ?? 100} className="h-11 rounded-xl" />
        <label className="flex h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={plan?.is_active ?? true} />
          Activo
        </label>
        <label className="flex h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="visibleOnLanding" defaultChecked={plan?.visible_on_landing ?? true} />
          Visible en landing
        </label>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-[#16a34a]">{success}</p> : null}
      <Button type="submit" className="h-11 rounded-xl">
        {plan ? "Actualizar plan" : "Crear plan"}
      </Button>
    </form>
  )
}
