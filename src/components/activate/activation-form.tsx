"use client"

import { useState } from "react"

import { submitPaymentRequestAction } from "@/app/actions/billing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cadenceLabels } from "@/lib/finance/labels"
import { formatCop } from "@/lib/format"
import type { PaymentMethod, Plan } from "@/types/database"

export function ActivationForm({
  plans,
  methods,
}: {
  plans: Plan[]
  methods: PaymentMethod[]
}) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const selected = plans.find((plan) => plan.id === planId)

  if (plans.length === 0) {
    return (
      <p className="text-sm text-[#5b6b82]">
        Todavía no hay planes publicados. Un Super Admin debe crearlos antes de que puedas solicitar acceso.
      </p>
    )
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault()
        setPending(true)
        setError(null)
        setSuccess(null)
        const formData = new FormData(event.currentTarget)
        const result = await submitPaymentRequestAction(formData)
        setPending(false)
        if (result.error) setError(result.error)
        if (result.success) setSuccess(result.success)
      }}
    >
      <input type="hidden" name="planId" value={planId} />
      <div className="grid gap-2">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setPlanId(plan.id)}
            className={`rounded-2xl px-4 py-3 text-left ring-1 ${
              planId === plan.id ? "bg-white ring-primary" : "bg-[#f7f9fc] ring-[#e5eaf1]"
            }`}
          >
            <p className="font-medium">{plan.name}</p>
            <p className="text-sm text-[#5b6b82]">
              {cadenceLabels[plan.cadence]} · {plan.duration_days} días
              {plan.price_amount != null ? ` · ${formatCop(plan.price_amount)}` : " · valor por confirmar"}
            </p>
          </button>
        ))}
      </div>
      {selected?.description ? <p className="text-sm text-[#5b6b82]">{selected.description}</p> : null}
      {methods.length > 0 ? (
        <div className="grid gap-2">
          <Label htmlFor="paymentMethodId">Medio de pago</Label>
          <select
            id="paymentMethodId"
            name="paymentMethodId"
            className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm"
            defaultValue={methods[0]?.id}
          >
            {methods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
          <div className="rounded-2xl bg-[#f7f9fc] p-3 text-sm text-[#3d4d66]">
            {methods.find((item) => item.id === methods[0]?.id)?.instructions ||
              "Sigue las instrucciones del medio de pago seleccionado. Un comprobante no confirma el pago de forma automática."}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#5b6b82]">
          Aún no hay instrucciones de pago publicadas. Puedes registrar la referencia y el valor; el administrador las
          verificará de forma externa.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="declaredAmount">Valor pagado</Label>
          <Input id="declaredAmount" name="declaredAmount" required inputMode="decimal" className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paidOn">Fecha de pago</Label>
          <Input id="paidOn" name="paidOn" type="date" required className="h-11 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reference">Referencia</Label>
        <Input id="reference" name="reference" className="h-11 rounded-xl" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="receipt">Comprobante (opcional, privado)</Label>
        <Input id="receipt" name="receipt" type="file" accept="image/*,application/pdf" className="h-11 rounded-xl" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Observaciones</Label>
        <Textarea id="notes" name="notes" className="rounded-xl" />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-[#16a34a]">{success}</p> : null}
      <Button type="submit" className="h-11 rounded-xl" disabled={pending}>
        {pending ? "Enviando…" : "Enviar solicitud"}
      </Button>
    </form>
  )
}
