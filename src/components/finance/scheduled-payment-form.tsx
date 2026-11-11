"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { upsertScheduledPaymentAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FinancialAccount, FinancialCategory, FinancialCycle } from "@/types/database"

export function ScheduledPaymentForm({
  cycle,
  categories,
  accounts,
  readOnly,
}: {
  cycle: FinancialCycle
  categories: FinancialCategory[]
  accounts: FinancialAccount[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const paymentCategories = categories.filter(
    (item) => item.is_active && (item.group_code === "scheduled_payment" || item.group_code === "debt" || item.group_code === "expense")
  )

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await upsertScheduledPaymentAction({
      name: formData.get("name"),
      categoryId: formData.get("categoryId") || "",
      expectedAmount: formData.get("expectedAmount"),
      dueOn: formData.get("dueOn"),
      preferredAccountId: formData.get("preferredAccountId") || "",
      cycleId: cycle.id,
      notes: formData.get("notes"),
    })
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.refresh()
  }

  return (
    <form action={onSubmit} className="grid gap-3 rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
      <h2 className="font-semibold">Nuevo compromiso</h2>
      <div className="grid gap-2">
        <Label htmlFor="payment-name">Nombre</Label>
        <Input id="payment-name" name="name" required className="h-11 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="expectedAmount">Valor esperado</Label>
          <Input id="expectedAmount" name="expectedAmount" required inputMode="decimal" className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dueOn">Vence</Label>
          <Input id="dueOn" name="dueOn" type="date" required className="h-11 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="categoryId">Categoría</Label>
        <select id="categoryId" name="categoryId" className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm">
          <option value="">Sin categoría</option>
          {paymentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="preferredAccountId">Cuenta preferida</Label>
        <select
          id="preferredAccountId"
          name="preferredAccountId"
          className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm"
        >
          <option value="">Sin preferencia</option>
          {accounts
            .filter((item) => item.is_active)
            .map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="payment-notes">Observaciones</Label>
        <Textarea id="payment-notes" name="notes" className="rounded-xl" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={readOnly || pending}>
        {pending ? "Guardando…" : "Crear compromiso"}
      </Button>
    </form>
  )
}
