"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { completeOnboardingAction, createCycleAction, upsertAccountAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { accountKindLabels } from "@/lib/finance/labels"
import type { AccountKind, FinancialCycle } from "@/types/database"

export function OnboardingFlow({
  cycles,
  hasAccounts,
}: {
  cycles: FinancialCycle[]
  hasAccounts: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function skip() {
    setPending(true)
    await completeOnboardingAction()
    router.refresh()
  }

  return (
    <div className="rounded-[28px] bg-white p-5 ring-1 ring-[#eae9e6]">
      <p className="text-[12px] font-medium tracking-[0.16em] text-primary uppercase">Paso {step} de 4</p>
      {step === 1 ? (
        <>
          <h2 className="font-heading mt-3 text-2xl">Organicemos tu dinero.</h2>
          <p className="mt-2 text-sm text-[#777a80]">
            En un minuto creas tu primera cuenta y un ciclo. Después registras un gasto en segundos.
          </p>
          <Button className="mt-5 h-11 w-full rounded-full" onClick={() => setStep(2)}>
            Empezar
          </Button>
        </>
      ) : null}

      {step === 2 ? (
        <form
          className="mt-3 grid gap-3"
          action={async (formData) => {
            setPending(true)
            setError(null)
            const result = await upsertAccountAction({
              name: formData.get("name"),
              kind: formData.get("kind"),
              openingBalance: formData.get("openingBalance"),
            })
            setPending(false)
            if (result.error) {
              setError(result.error)
              return
            }
            setStep(3)
            router.refresh()
          }}
        >
          <h2 className="font-heading text-2xl">Tu primera cuenta</h2>
          <div className="grid gap-2">
            <Label htmlFor="onboard-name">Nombre</Label>
            <Input id="onboard-name" name="name" required defaultValue="Efectivo" className="h-11 rounded-full" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="onboard-kind">Tipo</Label>
            <select id="onboard-kind" name="kind" defaultValue="cash" className="h-11 rounded-full border border-[#eae9e6] bg-white px-3 text-sm">
              {(Object.keys(accountKindLabels) as AccountKind[]).map((kind) => (
                <option key={kind} value={kind}>
                  {accountKindLabels[kind]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="onboard-opening">Saldo inicial</Label>
            <Input id="onboard-opening" name="openingBalance" inputMode="decimal" defaultValue="0" className="h-11 rounded-full" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button className="h-11 rounded-full" disabled={pending}>
            {hasAccounts ? "Continuar" : "Crear cuenta"}
          </Button>
        </form>
      ) : null}

      {step === 3 ? (
        cycles.length > 0 ? (
          <>
            <h2 className="font-heading mt-3 text-2xl">Primer presupuesto</h2>
            <p className="mt-2 text-sm text-[#777a80]">
              Ya tienes un ciclo. Puedes ajustar categorías después, desde Presupuesto.
            </p>
            <Button className="mt-5 h-11 w-full rounded-full" onClick={() => setStep(4)}>
              Continuar
            </Button>
          </>
        ) : (
          <form
            className="mt-3 grid gap-3"
            action={async (formData) => {
              setPending(true)
              setError(null)
              const result = await createCycleAction({
                name: formData.get("name"),
                startsOn: formData.get("startsOn"),
                endsOn: formData.get("endsOn"),
              })
              setPending(false)
              if (result.error) {
                setError(result.error)
                return
              }
              setStep(4)
              router.refresh()
            }}
          >
            <h2 className="font-heading text-2xl">Tu ciclo</h2>
            <Input name="name" required defaultValue="Este periodo" className="h-11 rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <Input name="startsOn" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="h-11 rounded-full" />
              <Input
                name="endsOn"
                type="date"
                required
                defaultValue={new Date(Date.now() + 29 * 86400000).toISOString().slice(0, 10)}
                className="h-11 rounded-full"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="h-11 rounded-full" disabled={pending}>
              Crear ciclo
            </Button>
          </form>
        )
      ) : null}

      {step === 4 ? (
        <>
          <h2 className="font-heading mt-3 text-2xl">Listo para el primer movimiento.</h2>
          <p className="mt-2 text-sm text-[#777a80]">Abre la ruleta inferior, elige Gasto e introduce el valor.</p>
          <Button
            className="mt-5 h-11 w-full rounded-full"
            onClick={async () => {
              setPending(true)
              await completeOnboardingAction()
              router.refresh()
            }}
            disabled={pending}
          >
            Empezar a usar VIVO Planner
          </Button>
        </>
      ) : null}

      <button type="button" onClick={skip} className="mt-3 w-full min-h-11 text-sm text-[#777a80]">
        Omitir por ahora
      </button>
    </div>
  )
}
