"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Bell, Settings } from "lucide-react"

import { AccountForm } from "@/components/finance/account-form"
import { CycleForm } from "@/components/finance/cycle-form"
import { CycleSwitcher } from "@/components/finance/cycle-switcher"
import { ScheduledPaymentForm } from "@/components/finance/scheduled-payment-form"
import { TransactionForm } from "@/components/finance/transaction-form"
import { FinanceActionSheet } from "@/components/finance-home/finance-action-sheet"
import { FinanceDock } from "@/components/finance-home/finance-dock"
import { OnboardingFlow } from "@/components/finance-home/onboarding-flow"
import {
  AnalysisBoard,
  BudgetBoard,
  PaymentBoard,
  TransactionList,
  WorkspaceTabs,
} from "@/components/finance-home/workspace"
import {
  homeHref,
  parseAction,
  parseTab,
  type HomeAction,
  type WorkspaceTab,
} from "@/components/finance-home/home-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signOutAction } from "@/app/actions/auth"
import { markNotificationReadAction, saveBudgetAction } from "@/app/actions/finance"
import type { Capability } from "@/lib/auth/capabilities"
import type { Entitlement } from "@/lib/auth/capabilities"
import {
  computeBudgetRows,
  computeCycleMetrics,
  computeIncludedBalance,
  computeAccountBalances,
  computeAvailableToBudget,
} from "@/lib/finance/calculations"
import { accountKindLabels } from "@/lib/finance/labels"
import { formatCop } from "@/lib/format"
import type {
  FinancialAccount,
  FinancialBudget,
  FinancialCategory,
  FinancialCycle,
  FinancialTransaction,
  InAppNotification,
  ScheduledPayment,
} from "@/types/database"
import { cn } from "cn"

const accountColors = ["#3568ED", "#20A474", "#F49A52", "#7C6CF6", "#E45353", "#191A1D"]

export type HomeData = {
  cycles: FinancialCycle[]
  cycle: FinancialCycle | null
  accounts: FinancialAccount[]
  categories: FinancialCategory[]
  budgets: FinancialBudget[]
  transactions: FinancialTransaction[]
  ledgerTransactions: FinancialTransaction[]
  scheduledPayments: ScheduledPayment[]
  notifications: InAppNotification[]
  unreadNotifications: number
}

export function FinancialHome({
  data,
  userName,
  entitlement,
  capabilities,
  onboardingCompleted,
}: {
  data: HomeData
  userName: string
  entitlement: Entitlement
  capabilities: Capability[]
  onboardingCompleted: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = parseTab(searchParams.get("tab"))
  const accion = parseAction(searchParams.get("accion"))
  const cuentaId = searchParams.get("cuenta")
  const movimientoId = searchParams.get("movimiento")
  const pagoId = searchParams.get("pago")
  const categoriaId = searchParams.get("categoria")
  const [wheelOpen, setWheelOpen] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setWheelOpen(false)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = wheelOpen ? "hidden" : ""
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [wheelOpen])

  const firstName = userName.split(" ")[0] || "Hola"
  const initials = firstName.slice(0, 1).toUpperCase()
  const needsOnboarding =
    !onboardingCompleted && (!data.accounts.some((item) => item.is_active) || !data.cycle)

  const balances = useMemo(
    () => computeAccountBalances(data.accounts, data.ledgerTransactions),
    [data.accounts, data.ledgerTransactions]
  )
  const total = computeIncludedBalance(balances)
  const cycleMetrics = computeCycleMetrics(data.transactions)
  const budgetRows = computeBudgetRows(
    data.categories,
    data.budgets,
    data.transactions,
    data.scheduledPayments
  )
  const availableToBudget = computeAvailableToBudget(cycleMetrics.incomes, budgetRows)
  const selectedAccount = data.accounts.find((item) => item.id === cuentaId) ?? null
  const selectedTx = data.transactions.find((item) => item.id === movimientoId) ?? null
  const selectedCategory = data.categories.find((item) => item.id === categoriaId) ?? null

  function go(next: {
    tab?: WorkspaceTab
    accion?: HomeAction | null
    cuenta?: string | null
    movimiento?: string | null
    pago?: string | null
    categoria?: string | null
  }) {
    const href = homeHref({
      tab: next.tab ?? tab,
      accion: next.accion === undefined ? accion : next.accion,
      cuenta: next.cuenta === undefined ? cuentaId : next.cuenta,
      movimiento: next.movimiento === undefined ? movimientoId : next.movimiento,
      pago: next.pago === undefined ? pagoId : next.pago,
      categoria: next.categoria === undefined ? categoriaId : next.categoria,
    })
    router.replace(href, { scroll: false })
  }

  function closeSheets() {
    go({ accion: null, cuenta: null, movimiento: null, pago: null, categoria: null })
    setWheelOpen(false)
  }

  function openAction(next: HomeAction) {
    setWheelOpen(false)
    go({ accion: next, cuenta: null, movimiento: null, pago: null, categoria: null })
  }

  const kindFromAction =
    accion === "ingreso"
      ? "income"
      : accion === "transferencia"
        ? "transfer"
        : accion === "ahorro"
          ? "savings_contribution"
          : "expense"

  return (
    <div className="mx-auto w-full max-w-xl pb-28 lg:max-w-3xl">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="sm" className="size-10 bg-[#191a1d] text-white">
            <AvatarFallback className="bg-[#191a1d] text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[12px] text-[#777a80]">Hola</p>
            <p className="truncate font-heading text-[17px] leading-tight">{firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Notificaciones"
            onClick={() => openAction("avisos")}
            className="relative grid size-11 place-items-center rounded-full"
          >
            <Bell className="size-5" />
            {data.unreadNotifications > 0 ? (
              <span className="absolute top-2 right-2 size-2 rounded-full bg-[#e45353]" />
            ) : null}
          </button>
          <button
            type="button"
            aria-label="Ajustes"
            onClick={() => openAction("ajustes")}
            className="grid size-11 place-items-center rounded-full"
          >
            <Settings className="size-5" />
          </button>
        </div>
      </header>

      {needsOnboarding ? (
        <div className="mt-5">
          <OnboardingFlow cycles={data.cycles} hasAccounts={data.accounts.length > 0} />
        </div>
      ) : null}

      <section className="mt-5 rounded-[28px] bg-[#191a1d] px-5 py-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] text-white/55">Saldo total</p>
            <p className="font-heading mt-1 text-[2.15rem] leading-none tracking-tight money">
              {formatCop(total)}
            </p>
          </div>
          <CycleSwitcher cycles={data.cycles} activeId={data.cycle?.id} inverted />
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-2xl bg-white/8 px-3 py-2.5">
            <dt className="text-white/50">Disponible</dt>
            <dd className="mt-1 text-sm font-medium money">{formatCop(cycleMetrics.cycleBalance)}</dd>
          </div>
          <div className="rounded-2xl bg-white/8 px-3 py-2.5">
            <dt className="text-white/50">Ingresos</dt>
            <dd className="mt-1 text-sm font-medium money text-[#8de0bf]">{formatCop(cycleMetrics.incomes)}</dd>
          </div>
          <div className="rounded-2xl bg-white/8 px-3 py-2.5">
            <dt className="text-white/50">Gastos</dt>
            <dd className="mt-1 text-sm font-medium money text-[#f3b4b4]">{formatCop(cycleMetrics.outflows)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4">
        <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
          {data.accounts
            .filter((item) => item.is_active)
            .map((account, index) => {
              const balance = balances.find((row) => row.accountId === account.id)
              const color = account.color || accountColors[index % accountColors.length]
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => go({ cuenta: account.id, accion: "cuenta" })}
                  className="min-w-[168px] shrink-0 rounded-[24px] bg-white p-4 text-left ring-1 ring-[#eae9e6]"
                >
                  <span className="block size-8 rounded-2xl" style={{ background: color }} />
                  <p className="mt-3 text-sm font-medium">{account.name}</p>
                  <p className="text-[11px] text-[#777a80]">{accountKindLabels[account.kind]}</p>
                  <p className="mt-2 text-base font-semibold money">{formatCop(balance?.balance ?? 0)}</p>
                </button>
              )
            })}
          <button
            type="button"
            onClick={() => openAction("cuenta")}
            className="min-w-[132px] shrink-0 rounded-[24px] border border-dashed border-[#d9d6cf] bg-transparent p-4 text-left text-sm text-[#777a80]"
          >
            + Nueva cuenta
          </button>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-3 gap-2">
        {[
          { id: "gasto" as const, label: "Gasto" },
          { id: "ingreso" as const, label: "Ingreso" },
          { id: "transferencia" as const, label: "Transferir" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openAction(item.id)}
            className={cn(
              "min-h-11 rounded-full text-sm font-medium",
              item.id === "gasto" ? "bg-[#3568ed] text-white" : "bg-white text-[#191a1d] ring-1 ring-[#eae9e6]"
            )}
          >
            {item.label}
          </button>
        ))}
      </section>

      <div className="mt-5">
        <WorkspaceTabs tab={tab} onChange={(next) => go({ tab: next, accion: null })} />
        <div className="mt-4">
          {tab === "movimientos" ? (
            <TransactionList
              transactions={data.transactions}
              accounts={data.accounts}
              categories={data.categories}
              onOpen={(id) => go({ movimiento: id, accion: "gasto" })}
            />
          ) : null}
          {tab === "pagos" ? (
            <PaymentBoard
              payments={data.scheduledPayments}
              cycle={data.cycle}
              accounts={data.accounts}
              onOpen={(id) => go({ pago: id, accion: "pago" })}
            />
          ) : null}
          {tab === "presupuesto" ? (
            <>
              <p className="mb-3 text-sm text-[#777a80]">
                Disponible para presupuestar {formatCop(availableToBudget)}
              </p>
              <BudgetBoard rows={budgetRows} onOpen={(id) => go({ categoria: id, accion: "categoria" })} />
            </>
          ) : null}
          {tab === "analisis" ? (
            <AnalysisBoard transactions={data.transactions} rows={budgetRows} />
          ) : null}
        </div>
      </div>

      <FinanceDock
        tab={tab}
        wheelOpen={wheelOpen}
        onHome={() => {
          setWheelOpen(false)
          go({ tab: "movimientos", accion: null })
        }}
        onActivity={() => {
          setWheelOpen(false)
          go({ tab: tab === "movimientos" ? "pagos" : tab })
        }}
        onToggleWheel={() => setWheelOpen((open) => !open)}
        onSelect={openAction}
      />

      <FinanceActionSheet
        open={accion === "gasto" || accion === "ingreso" || accion === "transferencia" || accion === "ahorro"}
        title={
          accion === "ingreso"
            ? "Registrar ingreso"
            : accion === "transferencia"
              ? "Transferir"
              : accion === "ahorro"
                ? "Aporte de ahorro"
                : selectedTx
                  ? "Movimiento"
                  : "Registrar gasto"
        }
        onClose={closeSheets}
      >
        <TransactionForm
          key={`${accion}-${movimientoId ?? "new"}`}
          accounts={data.accounts}
          categories={data.categories}
          cycle={data.cycle}
          initialKind={kindFromAction}
          transaction={selectedTx}
          lockKind
          onSaved={closeSheets}
        />
      </FinanceActionSheet>

      <FinanceActionSheet open={accion === "pago"} title="Programar pago" onClose={closeSheets}>
        {data.cycle ? (
          <ScheduledPaymentForm cycle={data.cycle} categories={data.categories} accounts={data.accounts} />
        ) : (
          <p className="text-sm text-[#777a80]">Crea un ciclo antes de programar un pago.</p>
        )}
      </FinanceActionSheet>

      <FinanceActionSheet
        open={accion === "cuenta"}
        title={selectedAccount ? selectedAccount.name : "Nueva cuenta"}
        onClose={closeSheets}
      >
        {selectedAccount ? (
          <div className="space-y-4">
            <p className="text-3xl font-semibold money">{formatCop(balances.find((row) => row.accountId === selectedAccount.id)?.balance ?? 0)}</p>
            <AccountForm account={selectedAccount} />
          </div>
        ) : (
          <AccountForm />
        )}
      </FinanceActionSheet>

      <FinanceActionSheet open={accion === "ciclo"} title="Nuevo ciclo" onClose={closeSheets}>
        <CycleForm cycles={data.cycles} />
      </FinanceActionSheet>

      <FinanceActionSheet open={accion === "categoria"} title="Categoría" onClose={closeSheets}>
        {selectedCategory ? (
          <form
            className="grid gap-3"
            action={async (formData) => {
              await saveBudgetAction({
                cycleId: data.cycle?.id,
                categoryId: selectedCategory.id,
                plannedAmount: formData.get("plannedAmount"),
              })
              closeSheets()
            }}
          >
            <p className="text-sm font-medium">{selectedCategory.name}</p>
            <div className="grid gap-2">
              <Label htmlFor="plannedAmount">Presupuesto</Label>
              <Input
                id="plannedAmount"
                name="plannedAmount"
                inputMode="decimal"
                defaultValue={String(data.budgets.find((item) => item.category_id === selectedCategory.id)?.planned_amount ?? 0)}
                className="h-11 rounded-full"
              />
            </div>
            <Button type="submit" className="h-11 rounded-full">
              Guardar
            </Button>
          </form>
        ) : (
          <p className="text-sm text-[#777a80]">Selecciona una categoría.</p>
        )}
      </FinanceActionSheet>

      <FinanceActionSheet open={accion === "recibo"} title="Registra tus gastos con una foto." onClose={closeSheets}>
        <p className="text-sm leading-6 text-[#777a80]">
          Toma una fotografía de tu recibo y deja que la aplicación prepare los datos del gasto.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>Detectar importe</li>
          <li>Reconocer fecha</li>
          <li>Identificar comercio</li>
          <li>Sugerir categoría</li>
          <li>Guardar comprobante</li>
        </ul>
        {capabilities.includes("receipt_ocr") ? (
          <p className="mt-4 rounded-2xl bg-[#faf9f6] p-3 text-sm">Próximamente. El OCR todavía no está conectado.</p>
        ) : (
          <div className="mt-5 grid gap-2">
            <Button className="h-11 rounded-full" onClick={() => openAction("premium")}>
              Conocer Premium
            </Button>
            <Button variant="outline" className="h-11 rounded-full" onClick={() => openAction("gasto")}>
              Continuar registrando manualmente
            </Button>
          </div>
        )}
      </FinanceActionSheet>

      <FinanceActionSheet open={accion === "premium"} title="VIVO Planner Premium" onClose={closeSheets}>
        <p className="text-sm leading-6 text-[#777a80]">
          El plan Free ya cubre cuentas, movimientos, presupuesto y pagos. Premium suma comprobantes, OCR y analítica
          avanzada cuando esas piezas estén activas.
        </p>
        <p className="mt-3 text-sm">Estado actual: {entitlement === "premium" ? "Premium" : "Free"}</p>
        <Button className="mt-4 h-11 w-full rounded-full" onClick={() => router.push("/app/mi-suscripcion")}>
          Ver planes y solicitar acceso
        </Button>
      </FinanceActionSheet>

      <FinanceActionSheet open={accion === "avisos"} title="Avisos" onClose={closeSheets}>
        {data.notifications.length === 0 ? (
          <p className="text-sm text-[#777a80]">No hay avisos por ahora.</p>
        ) : (
          <ul className="space-y-2">
            {data.notifications.map((item) => (
              <li key={item.id} className="rounded-2xl bg-[#faf9f6] p-3">
                <p className="text-sm font-medium">{item.title}</p>
                {item.body ? <p className="mt-1 text-[13px] text-[#777a80]">{item.body}</p> : null}
                {!item.read_at ? (
                  <button
                    type="button"
                    className="mt-2 text-sm text-primary"
                    onClick={() => markNotificationReadAction(item.id)}
                  >
                    Marcar leído
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </FinanceActionSheet>

      <FinanceActionSheet open={accion === "ajustes"} title="Ajustes" onClose={closeSheets}>
        <div className="grid gap-2">
          <Button variant="outline" className="h-11 rounded-full" onClick={() => router.push("/app/configuracion")}>
            Perfil
          </Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => router.push("/app/mi-suscripcion")}>
            Mi plan
          </Button>
          <Button variant="outline" className="h-11 rounded-full" onClick={() => openAction("ciclo")}>
            Nuevo ciclo
          </Button>
          <form action={signOutAction}>
            <Button variant="ghost" className="h-11 w-full rounded-full">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </FinanceActionSheet>
    </div>
  )
}
