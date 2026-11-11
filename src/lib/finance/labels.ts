import type {
  AccountKind,
  CategoryGroup,
  CommitmentStatus,
  TransactionKind,
} from "@/types/database"

export const accountKindLabels: Record<AccountKind, string> = {
  cash: "Efectivo",
  bank: "Cuenta bancaria",
  digital_wallet: "Billetera digital",
  pocket: "Bolsillo",
  savings: "Ahorro",
  other: "Otra",
}

export const categoryGroupLabels: Record<CategoryGroup, string> = {
  income: "Ingresos",
  scheduled_payment: "Pagos programados",
  expense: "Gastos",
  savings: "Ahorros",
  debt: "Deudas",
}

export const transactionKindLabels: Record<TransactionKind, string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
  savings_contribution: "Aporte de ahorro",
  debt_payment: "Pago de deuda",
}

export const commitmentStatusLabels: Record<CommitmentStatus, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  overdue: "Vencido",
  cancelled: "Cancelado",
}

export const cadenceLabels = {
  monthly: "Mensual",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
  custom: "Personalizado",
} as const
