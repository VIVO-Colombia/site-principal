import { setAccountActiveAction } from "@/app/actions/finance"
import { AccountForm } from "@/components/finance/account-form"
import { Button } from "@/components/ui/button"
import { requireAppAccess } from "@/lib/auth/access"
import { computeAccountBalances } from "@/lib/finance/calculations"
import { accountKindLabels } from "@/lib/finance/labels"
import { getFinanceBootstrap, listTransactions } from "@/lib/finance/queries"
import { formatCop } from "@/lib/format"

export default async function AccountsPage() {
  const access = await requireAppAccess()
  const data = await getFinanceBootstrap(access.user!.id)
  const allTransactions = await listTransactions(access.user!.id, { limit: 2000 })
  const balances = computeAccountBalances(data.accounts, allTransactions)

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cuentas</h1>
        <p className="text-sm text-[#5b6b82]">
          Una transferencia interna mueve dinero entre cuentas propias y no es un ingreso ni un gasto.
        </p>
      </div>

      <div className="grid gap-3">
        {balances.map((item) => {
          const account = data.accounts.find((row) => row.id === item.accountId)
          if (!account) return null
          return (
            <article key={item.accountId} className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-[#5b6b82]">{accountKindLabels[item.kind]}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${item.negative ? "text-[#dc2626]" : ""}`}>
                    {formatCop(item.balance)}
                  </p>
                  {item.negative ? (
                    <p className="text-[11px] text-[#dc2626]">Saldo negativo permitido, con advertencia.</p>
                  ) : null}
                </div>
              </div>
              <p className="mt-2 text-xs text-[#5b6b82]">Saldo inicial {formatCop(item.opening)}</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <AccountForm account={account} readOnly={access.readOnly} />
                <form
                  action={async () => {
                    "use server"
                    await setAccountActiveAction(account.id, !account.is_active)
                  }}
                >
                  <Button type="submit" variant="secondary" className="h-11 rounded-xl" disabled={access.readOnly}>
                    {account.is_active ? "Desactivar" : "Reactivar"}
                  </Button>
                </form>
              </div>
            </article>
          )
        })}
      </div>

      <section className="rounded-[24px] bg-white p-4 ring-1 ring-[#e5eaf1]">
        <h2 className="mb-3 font-semibold">Nueva cuenta</h2>
        <AccountForm readOnly={access.readOnly} />
      </section>
    </div>
  )
}
