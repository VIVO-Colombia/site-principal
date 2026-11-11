"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { recordScheduledPaymentAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FinancialAccount, ScheduledPayment } from "@/types/database"

export function RecordPaymentForm({
  payment,
  accounts,
  cycleId,
  readOnly,
}: {
  payment: ScheduledPayment
  accounts: FinancialAccount[]
  cycleId: string
  readOnly?: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="mt-3 grid gap-2"
      action={async (formData) => {
        const result = await recordScheduledPaymentAction({
          scheduledPaymentId: payment.id,
          amount: String(formData.get("amount") ?? ""),
          accountId: String(formData.get("accountId") ?? ""),
          occurredOn: String(formData.get("occurredOn") ?? ""),
          cycleId,
        })
        if (result.error) setError(result.error)
        else router.refresh()
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <Input name="amount" required inputMode="decimal" placeholder="Valor pagado" className="h-11 rounded-xl" />
        <Input name="occurredOn" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 rounded-xl" />
      </div>
      <select
        name="accountId"
        required
        defaultValue={payment.preferred_account_id ?? accounts.find((item) => item.is_active)?.id}
        className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm"
      >
        {accounts
          .filter((item) => item.is_active)
          .map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
      </select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={readOnly}>
        Registrar pago
      </Button>
    </form>
  )
}
