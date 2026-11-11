"use client"

import { useRouter } from "next/navigation"

import { TransactionForm } from "@/components/finance/transaction-form"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  FinancialAccount,
  FinancialCategory,
  FinancialCycle,
  TransactionKind,
} from "@/types/database"

export function TransactionSheet({
  open,
  accounts,
  categories,
  cycle,
  initialKind,
  readOnly,
}: {
  open: boolean
  accounts: FinancialAccount[]
  categories: FinancialCategory[]
  cycle: FinancialCycle | null
  initialKind?: TransactionKind
  readOnly?: boolean
}) {
  const router = useRouter()

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) router.push("/app/movimientos")
      }}
    >
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle>Nuevo movimiento</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <TransactionForm
            accounts={accounts}
            categories={categories}
            cycle={cycle}
            initialKind={initialKind}
            readOnly={readOnly}
            onSaved={() => router.push("/app/movimientos")}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
