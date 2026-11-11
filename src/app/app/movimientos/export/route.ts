import { connection } from "next/server"
import { NextResponse } from "next/server"

import { requireAppAccess } from "@/lib/auth/access"
import { toCsv } from "@/lib/finance/csv"
import { transactionKindLabels } from "@/lib/finance/labels"
import { listAccounts, listCategories, listCycles, listTransactions } from "@/lib/finance/queries"

export async function GET() {
  await connection()
  const access = await requireAppAccess()
  const userId = access.user!.id
  const [rows, accounts, categories, cycles] = await Promise.all([
    listTransactions(userId),
    listAccounts(userId),
    listCategories(userId),
    listCycles(userId),
  ])

  const accountNames = new Map(accounts.map((item) => [item.id, item.name]))
  const categoryNames = new Map(categories.map((item) => [item.id, item.name]))
  const cycleNames = new Map(cycles.map((item) => [item.id, item.name]))

  const csv = toCsv(
    [
      "fecha",
      "tipo",
      "valor",
      "cuenta",
      "cuenta_destino",
      "categoria",
      "ciclo",
      "descripcion",
      "estado",
    ],
    rows.map((row) => [
      row.occurred_on,
      transactionKindLabels[row.kind] ?? row.kind,
      row.amount,
      accountNames.get(row.account_id) ?? row.account_id,
      row.counterparty_account_id
        ? (accountNames.get(row.counterparty_account_id) ?? row.counterparty_account_id)
        : "",
      row.category_id ? (categoryNames.get(row.category_id) ?? row.category_id) : "",
      cycleNames.get(row.cycle_id) ?? row.cycle_id,
      row.description ?? "",
      row.status,
    ])
  )

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=movimientos.csv",
    },
  })
}
