"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { deactivateCategoryAction, saveBudgetAction, upsertCategoryAction } from "@/app/actions/finance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { categoryGroupLabels } from "@/lib/finance/labels"
import { formatCop } from "@/lib/format"
import type { BudgetRow } from "@/lib/finance/calculations"
import type { CategoryGroup, FinancialCycle } from "@/types/database"

const groups: CategoryGroup[] = ["income", "scheduled_payment", "expense", "savings", "debt"]

export function PlanningBoard({
  cycle,
  rows,
  readOnly,
}: {
  cycle: FinancialCycle
  rows: BudgetRow[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="grid gap-5">
      <form
        className="grid gap-3 rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]"
        action={async (formData) => {
          const result = await upsertCategoryAction({
            name: formData.get("name"),
            groupCode: formData.get("groupCode"),
          })
          if (result.error) setError(result.error)
          else router.refresh()
        }}
      >
        <p className="text-sm font-medium">Nueva categoría</p>
        <div className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
          <Input name="name" required placeholder="Nombre" className="h-11 rounded-xl" />
          <select name="groupCode" className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm">
            {groups.map((group) => (
              <option key={group} value={group}>
                {categoryGroupLabels[group]}
              </option>
            ))}
          </select>
          <Button type="submit" className="h-11 rounded-xl" disabled={readOnly}>
            Agregar
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>

      {groups.map((group) => {
        const subset = rows.filter((row) => row.group === group)
        return (
          <section key={group} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
            <h2 className="font-semibold">{categoryGroupLabels[group]}</h2>
            <div className="mt-3 grid gap-3">
              {subset.length === 0 ? (
                <p className="text-sm text-[#5b6b82]">Sin categorías en este grupo.</p>
              ) : (
                subset.map((row) => (
                  <div key={row.categoryId} className="rounded-2xl bg-[#f7f9fc] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-[#5b6b82]">
                          Ejecutado {formatCop(row.executed)} · {row.percent}% · diferencia {formatCop(row.difference)}
                        </p>
                      </div>
                      <form
                        action={async () => {
                          await deactivateCategoryAction(row.categoryId)
                          router.refresh()
                        }}
                      >
                        <Button type="submit" variant="ghost" className="h-9 px-2 text-xs" disabled={readOnly}>
                          Desactivar
                        </Button>
                      </form>
                    </div>
                    <form
                      className="mt-2 flex gap-2"
                      action={async (formData) => {
                        const result = await saveBudgetAction({
                          cycleId: cycle.id,
                          categoryId: row.categoryId,
                          plannedAmount: formData.get("plannedAmount"),
                        })
                        if (result.error) setError(result.error)
                        else router.refresh()
                      }}
                    >
                      <Input
                        name="plannedAmount"
                        inputMode="decimal"
                        defaultValue={row.planned || ""}
                        placeholder="Planeado"
                        className="h-11 rounded-xl"
                      />
                      <Button type="submit" variant="secondary" className="h-11 rounded-xl" disabled={readOnly}>
                        Guardar
                      </Button>
                    </form>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                      <div
                        className={`h-full ${row.percent > 100 ? "bg-[#dc2626]" : "bg-primary"}`}
                        style={{ width: `${Math.min(row.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
