"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { saveTransactionAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { transactionKindLabels } from "@/lib/finance/labels"
import type {
  FinancialAccount,
  FinancialCategory,
  FinancialCycle,
  FinancialTransaction,
  TransactionKind,
} from "@/types/database"

const kinds: TransactionKind[] = [
  "expense",
  "income",
  "transfer",
  "savings_contribution",
  "debt_payment",
]

export function TransactionForm({
  accounts,
  categories,
  cycle,
  initialKind = "expense",
  transaction,
  onSaved,
  readOnly,
  lockKind,
}: {
  accounts: FinancialAccount[]
  categories: FinancialCategory[]
  cycle: FinancialCycle | null
  initialKind?: TransactionKind
  transaction?: FinancialTransaction | null
  onSaved?: () => void
  readOnly?: boolean
  lockKind?: boolean
}) {
  const router = useRouter()
  const amountRef = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState<TransactionKind>(transaction?.kind ?? initialKind)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    amountRef.current?.focus()
  }, [])

  const filteredCategories = useMemo(() => {
    const group =
      kind === "income"
        ? "income"
        : kind === "savings_contribution"
          ? "savings"
          : kind === "debt_payment"
            ? "debt"
            : kind === "expense"
              ? "expense"
              : null
    if (!group) return []
    return categories.filter((item) => item.is_active && item.group_code === group)
  }, [categories, kind])

  const activeAccounts = accounts.filter((item) => item.is_active)

  async function onSubmit(formData: FormData) {
    setError(null)
    setPending(true)
    const result = await saveTransactionAction({
      id: transaction?.id,
      kind,
      amount: formData.get("amount"),
      occurredOn: formData.get("occurredOn"),
      accountId: formData.get("accountId"),
      counterpartyAccountId: formData.get("counterpartyAccountId") || "",
      categoryId: formData.get("categoryId") || "",
      cycleId: cycle?.id,
      description: formData.get("description"),
      notes: formData.get("notes"),
    })
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onSaved?.()
    router.refresh()
  }

  if (!cycle) {
    return <p className="text-sm text-[#5b6b82]">Crea un ciclo financiero antes de registrar movimientos.</p>
  }

  if (activeAccounts.length === 0) {
    return <p className="text-sm text-[#5b6b82]">Crea una cuenta antes de registrar movimientos.</p>
  }

  return (
    <form action={onSubmit} className="grid gap-3">
      {lockKind ? null : (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {kinds.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setKind(item)}
            className={`h-10 shrink-0 rounded-full px-3 text-sm ${
              kind === item ? "bg-foreground text-white" : "bg-secondary text-muted-foreground"
            }`}
          >
            {transactionKindLabels[item]}
          </button>
        ))}
      </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="amount">Valor</Label>
        <Input
          ref={amountRef}
          id="amount"
          name="amount"
          inputMode="decimal"
          required
          defaultValue={transaction ? String(transaction.amount) : ""}
          placeholder="0"
          className="h-14 rounded-xl text-2xl"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="occurredOn">Fecha</Label>
          <Input
            id="occurredOn"
            name="occurredOn"
            type="date"
            required
            defaultValue={transaction?.occurred_on ?? new Date().toISOString().slice(0, 10)}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="accountId">{kind === "transfer" ? "Sale de" : "Cuenta"}</Label>
          <select
            id="accountId"
            name="accountId"
            required
            defaultValue={transaction?.account_id ?? activeAccounts[0]?.id}
            className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm"
          >
            {activeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {kind === "transfer" ? (
        <div className="grid gap-2">
          <Label htmlFor="counterpartyAccountId">Entra a</Label>
          <select
            id="counterpartyAccountId"
            name="counterpartyAccountId"
            required
            defaultValue={transaction?.counterparty_account_id ?? activeAccounts[1]?.id ?? ""}
            className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm"
          >
            {activeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={transaction?.category_id ?? filteredCategories[0]?.id ?? ""}
            className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm"
          >
            <option value="">Sin categoría</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          name="description"
          defaultValue={transaction?.description ?? ""}
          className="h-11 rounded-xl"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Observaciones</Label>
        <Textarea id="notes" name="notes" defaultValue={transaction?.notes ?? ""} className="rounded-xl" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={readOnly || pending}>
        {pending ? "Guardando…" : "Guardar movimiento"}
      </Button>
    </form>
  )
}
