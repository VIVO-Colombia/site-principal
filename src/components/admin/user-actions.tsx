"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  grantTrialAction,
  setAccountStatusAction,
  setSubscriptionStatusAction,
  extendSubscriptionAction,
} from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Plan } from "@/types/database"

export function UserActions({
  userId,
  accountStatus,
  subscriptionId,
  plans,
}: {
  userId: string
  accountStatus: "enabled" | "suspended"
  subscriptionId?: string | null
  plans: Plan[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const nextStatus = accountStatus === "enabled" ? "suspended" : "enabled"

  return (
    <div className="grid gap-4">
      <form
        className="grid gap-2 rounded-2xl bg-[#f7f9fc] p-3"
        action={async (formData) => {
          const result = await setAccountStatusAction({
            userId,
            status: nextStatus,
            reason: formData.get("reason"),
          })
          if (result.error) setError(result.error)
          else router.refresh()
        }}
      >
        <p className="text-sm font-medium">{nextStatus === "suspended" ? "Suspender cuenta" : "Reactivar cuenta"}</p>
        <Textarea name="reason" required placeholder="Motivo" className="rounded-xl" />
        <Button type="submit" variant={nextStatus === "suspended" ? "destructive" : "default"} className="h-11 rounded-xl">
          Confirmar
        </Button>
      </form>

      <form
        className="grid gap-2 rounded-2xl bg-[#f7f9fc] p-3"
        action={async (formData) => {
          const result = await grantTrialAction({
            userId,
            planId: formData.get("planId"),
            startsAt: formData.get("startsAt"),
            endsAt: formData.get("endsAt"),
            reason: formData.get("reason"),
          })
          if (result.error) setError(result.error)
          else router.refresh()
        }}
      >
        <p className="text-sm font-medium">Conceder prueba gratuita</p>
        <select name="planId" required className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm">
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <Input name="startsAt" type="datetime-local" required className="h-11 rounded-xl" />
          <Input name="endsAt" type="datetime-local" required className="h-11 rounded-xl" />
        </div>
        <Textarea name="reason" required placeholder="Motivo" className="rounded-xl" />
        <Button type="submit" className="h-11 rounded-xl">
          Conceder prueba
        </Button>
      </form>

      {subscriptionId ? (
        <form
          className="grid gap-2 rounded-2xl bg-[#f7f9fc] p-3"
          action={async (formData) => {
            const intent = String(formData.get("intent"))
            const payload = {
              subscriptionId,
              reason: formData.get("reason"),
              days: formData.get("days"),
            }
            const result =
              intent === "extend"
                ? await extendSubscriptionAction(payload)
                : await setSubscriptionStatusAction(payload, intent as "active" | "suspended" | "cancelled")
            if (result.error) setError(result.error)
            else router.refresh()
          }}
        >
          <p className="text-sm font-medium">Suscripción</p>
          <Input name="days" type="number" min={1} placeholder="Días a extender" className="h-11 rounded-xl" />
          <Textarea name="reason" required placeholder="Motivo" className="rounded-xl" />
          <div className="flex flex-wrap gap-2">
            <Button name="intent" value="extend" type="submit" className="h-11 rounded-xl">
              Extender
            </Button>
            <Button name="intent" value="active" type="submit" variant="secondary" className="h-11 rounded-xl">
              Reactivar
            </Button>
            <Button name="intent" value="suspended" type="submit" variant="secondary" className="h-11 rounded-xl">
              Suspender
            </Button>
            <Button name="intent" value="cancelled" type="submit" variant="ghost" className="h-11 rounded-xl">
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
