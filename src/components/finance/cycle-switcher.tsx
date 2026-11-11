"use client"

import { setActiveCycleAction } from "@/app/actions/finance"
import type { FinancialCycle } from "@/types/database"

export function CycleSwitcher({
  cycles,
  activeId,
  readOnly,
}: {
  cycles: Pick<FinancialCycle, "id" | "name">[]
  activeId?: string
  readOnly?: boolean
}) {
  if (cycles.length === 0) {
    return <p className="text-[11px] text-[#5b6b82]">Crea tu primer ciclo</p>
  }

  return (
    <form
      action={async (formData) => {
        const id = String(formData.get("cycleId") ?? "")
        if (id) await setActiveCycleAction(id)
      }}
    >
      <label className="sr-only" htmlFor="cycle-switcher">
        Ciclo financiero
      </label>
      <select
        id="cycle-switcher"
        name="cycleId"
        defaultValue={activeId}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="max-w-[180px] truncate rounded-lg border-0 bg-transparent text-[11px] text-[#5b6b82] outline-none"
        disabled={cycles.length < 2 && readOnly}
      >
        {cycles.map((cycle) => (
          <option key={cycle.id} value={cycle.id}>
            {cycle.name}
          </option>
        ))}
      </select>
    </form>
  )
}
