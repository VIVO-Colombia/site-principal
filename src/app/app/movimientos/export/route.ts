import { NextResponse } from "next/server"

import { requireAppAccess } from "@/lib/auth/access"
import { listTransactions } from "@/lib/finance/queries"

export async function GET() {
  const access = await requireAppAccess()
  const rows = await listTransactions(access.user!.id, { limit: 1000 })
  const header = [
    "fecha",
    "tipo",
    "valor",
    "cuenta",
    "cuenta_destino",
    "categoria",
    "descripcion",
    "estado",
  ]
  const body = rows
    .map((row) =>
      [
        row.occurred_on,
        row.kind,
        row.amount,
        row.account_id,
        row.counterparty_account_id ?? "",
        row.category_id ?? "",
        JSON.stringify(row.description ?? ""),
        row.status,
      ].join(",")
    )
    .join("\n")

  return new NextResponse(`${header.join(",")}\n${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=movimientos.csv",
    },
  })
}
