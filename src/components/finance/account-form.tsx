"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { upsertAccountAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { accountKindLabels } from "@/lib/finance/labels"
import type { AccountKind, FinancialAccount } from "@/types/database"

export function AccountForm({
  account,
  readOnly,
}: {
  account?: FinancialAccount
  readOnly?: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await upsertAccountAction({
      id: account?.id,
      name: formData.get("name"),
      kind: formData.get("kind"),
      openingBalance: formData.get("openingBalance"),
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
    <form action={onSubmit} className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="account-name">Nombre</Label>
        <Input id="account-name" name="name" required defaultValue={account?.name ?? ""} className="h-11 rounded-xl" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="kind">Tipo</Label>
        <select
          id="kind"
          name="kind"
          defaultValue={account?.kind ?? "cash"}
          className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm"
        >
          {(Object.keys(accountKindLabels) as AccountKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {accountKindLabels[kind]}
            </option>
          ))}
        </select>
      </div>
      {!account ? (
        <div className="grid gap-2">
          <Label htmlFor="openingBalance">Saldo inicial</Label>
          <Input id="openingBalance" name="openingBalance" inputMode="decimal" defaultValue="0" className="h-11 rounded-xl" />
          <p className="text-xs text-[#5b6b82]">El saldo puede quedar negativo; se mostrará una advertencia.</p>
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="account-notes">Observaciones</Label>
        <Textarea id="account-notes" name="notes" defaultValue={account?.notes ?? ""} className="rounded-xl" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={readOnly || pending}>
        {pending ? "Guardando…" : account ? "Guardar cambios" : "Crear cuenta"}
      </Button>
    </form>
  )
}
