"use client"

import { Activity, Home, Plus, X } from "lucide-react"

import { cn } from "cn"

import type { HomeAction, WorkspaceTab } from "@/components/finance-home/home-state"

const wheelActions: { id: HomeAction; label: string; premium?: boolean }[] = [
  { id: "gasto", label: "Gasto" },
  { id: "ingreso", label: "Ingreso" },
  { id: "transferencia", label: "Transferir" },
  { id: "pago", label: "Pago" },
  { id: "recibo", label: "Escanear", premium: true },
  { id: "ahorro", label: "Ahorro" },
]

export function FinanceDock({
  tab,
  wheelOpen,
  onHome,
  onActivity,
  onToggleWheel,
  onSelect,
}: {
  tab: WorkspaceTab
  wheelOpen: boolean
  onHome: () => void
  onActivity: () => void
  onToggleWheel: () => void
  onSelect: (action: HomeAction) => void
}) {
  return (
    <>
      {wheelOpen ? (
        <button
          type="button"
          aria-label="Cerrar acciones"
          className="fixed inset-0 z-40 bg-[#191a1d]/35"
          onClick={onToggleWheel}
        />
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {wheelOpen ? (
          <div className="pointer-events-auto mx-auto mb-3 grid max-w-sm grid-cols-3 gap-2 rounded-[28px] bg-white/95 p-3 shadow-[0_18px_50px_-28px_rgb(25_26_29_/_0.55)] ring-1 ring-[#eae9e6] backdrop-blur-md">
            {wheelActions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className="flex min-h-14 flex-col items-center justify-center rounded-2xl bg-[#faf9f6] px-2 text-[12px] font-medium text-[#191a1d]"
              >
                {item.label}
                {item.premium ? (
                  <span className="mt-0.5 text-[10px] tracking-wide text-[#777a80] uppercase">Premium</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}

        <nav
          aria-label="Acciones principales"
          className="pointer-events-auto mx-auto flex h-16 max-w-sm items-center justify-between rounded-full bg-[#191a1d] px-3 text-white shadow-[0_16px_40px_-20px_rgb(25_26_29_/_0.7)]"
        >
          <button
            type="button"
            onClick={onHome}
            className={cn(
              "inline-flex min-h-11 min-w-11 flex-col items-center justify-center rounded-full px-4 text-[11px]",
              tab === "movimientos" && !wheelOpen ? "text-white" : "text-white/55"
            )}
          >
            <Home className="size-5" />
            Inicio
          </button>
          <button
            type="button"
            onClick={onToggleWheel}
            aria-expanded={wheelOpen}
            aria-label={wheelOpen ? "Cerrar ruleta" : "Abrir acciones rápidas"}
            className="grid size-14 place-items-center rounded-full bg-[#3568ed] text-white shadow-[0_8px_20px_rgb(53_104_237_/_0.45)]"
          >
            {wheelOpen ? <X className="size-6" /> : <Plus className="size-6" />}
          </button>
          <button
            type="button"
            onClick={onActivity}
            className={cn(
              "inline-flex min-h-11 min-w-11 flex-col items-center justify-center rounded-full px-4 text-[11px]",
              tab !== "movimientos" ? "text-white" : "text-white/55"
            )}
          >
            <Activity className="size-5" />
            Actividad
          </button>
        </nav>
      </div>
    </>
  )
}
