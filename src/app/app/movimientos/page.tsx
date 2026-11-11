import { voidTransactionAction } from "@/app/actions/finance"
import { TransactionForm } from "@/components/finance/transaction-form"
import { TransactionSheet } from "@/components/finance/transaction-sheet"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { requireAppAccess } from "@/lib/auth/access"
import { transactionKindLabels } from "@/lib/finance/labels"
import { getFinanceBootstrap, listTransactions } from "@/lib/finance/queries"
import { formatCop, formatShortDate } from "@/lib/format"
import type { TransactionKind } from "@/types/database"

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<{
    nuevo?: string
    tipo?: string
    q?: string
    cuenta?: string
    categoria?: string
    clase?: string
  }>
}) {
  const access = await requireAppAccess()
  const params = await searchParams
  const data = await getFinanceBootstrap(access.user!.id)
  const transactions = data.cycle
    ? await listTransactions(access.user!.id, {
        cycleId: data.cycle.id,
        accountId: params.cuenta,
        categoryId: params.categoria,
        kind: params.clase,
      })
    : []

  const query = params.q?.toLowerCase().trim()
  const filtered = transactions.filter((item) => {
    if (!query) return true
    return `${item.description ?? ""} ${item.notes ?? ""}`.toLowerCase().includes(query)
  })

  const initialKind = (params.tipo as TransactionKind | undefined) ?? "expense"

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Movimientos</h1>
          <p className="text-sm text-[#5b6b82]">Los más recientes primero. Las transferencias no son ingreso ni gasto.</p>
        </div>
        <Button asChild className="h-11 rounded-xl">
          <a href="/app/movimientos?nuevo=1">Agregar</a>
        </Button>
      </div>

      <form className="grid gap-2 rounded-[24px] bg-white p-3 ring-1 ring-[#e5eaf1] sm:grid-cols-4">
        <input name="q" defaultValue={params.q} placeholder="Buscar" className="h-11 rounded-xl border border-[#e5eaf1] px-3 text-sm" />
        <select name="clase" defaultValue={params.clase ?? ""} className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm">
          <option value="">Todos los tipos</option>
          {Object.entries(transactionKindLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="cuenta" defaultValue={params.cuenta ?? ""} className="h-11 rounded-xl border border-[#e5eaf1] bg-white px-3 text-sm">
          <option value="">Todas las cuentas</option>
          {data.accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <button type="submit" className="h-11 rounded-xl bg-[#eef2f7] text-sm font-medium">
          Filtrar
        </button>
      </form>

      {access.readOnly ? (
        <p className="rounded-2xl bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
          Consulta y exportación disponibles. La suscripción vencida no permite crear ni editar movimientos.
        </p>
      ) : null}

      <a href="/app/movimientos/export" className="text-sm font-medium text-primary">
        Exportar CSV
      </a>

      {!data.cycle ? (
        <EmptyState
          title="Necesitas un ciclo"
          description="Crea un ciclo financiero para registrar movimientos."
          action={{ href: "/app", label: "Ir al inicio" }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Sin movimientos"
          description="Registra el primero. El valor se guarda en la base de datos, no se simula."
        />
      ) : (
        <ul className="grid gap-2">
          {filtered.map((item) => {
            const account = data.accounts.find((account) => account.id === item.account_id)
            const category = data.categories.find((category) => category.id === item.category_id)
            const tone =
              item.status === "voided"
                ? "text-[#5b6b82] line-through"
                : item.kind === "income"
                  ? "text-[#16a34a]"
                  : item.kind === "transfer"
                    ? "text-[#3d4d66]"
                    : "text-[#dc2626]"
            return (
              <li key={item.id} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.description || transactionKindLabels[item.kind]}</p>
                    <p className="text-xs text-[#5b6b82]">
                      {formatShortDate(item.occurred_on)} · {account?.name} · {category?.name ?? transactionKindLabels[item.kind]}
                    </p>
                  </div>
                  <p className={`font-semibold ${tone}`}>{formatCop(item.amount)}</p>
                </div>
                {item.status === "posted" && !access.readOnly ? (
                  <form
                    className="mt-3"
                    action={async () => {
                      "use server"
                      await voidTransactionAction(item.id)
                    }}
                  >
                    <Button type="submit" variant="ghost" className="h-9 px-0 text-xs">
                      Anular
                    </Button>
                  </form>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <div className="hidden lg:block">
        {params.nuevo ? null : (
          <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
            <h2 className="mb-3 font-semibold">Registro rápido</h2>
            <TransactionForm
              accounts={data.accounts}
              categories={data.categories}
              cycle={data.cycle}
              readOnly={access.readOnly}
            />
          </div>
        )}
      </div>

      <TransactionSheet
        open={params.nuevo === "1"}
        accounts={data.accounts}
        categories={data.categories}
        cycle={data.cycle}
        initialKind={initialKind}
        readOnly={access.readOnly}
      />
    </div>
  )
}
