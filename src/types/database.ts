import type { SubscriptionStatus, UserRole } from "@/lib/auth/roles"

export type AccountStatus = "enabled" | "suspended"

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: UserRole
  account_status: AccountStatus
  timezone: string
  onboarding_completed_at?: string | null
  created_at: string
  updated_at: string
}

export type PlanCadence = "monthly" | "quarterly" | "semiannual" | "annual" | "custom"
export type PlanTier = "free" | "premium"

export type Plan = {
  id: string
  code: string
  name: string
  description: string | null
  cadence: PlanCadence
  duration_days: number
  price_amount: number | string | null
  currency: string
  is_active: boolean
  visible_on_landing: boolean
  sort_order: number
  features: unknown
  tier?: PlanTier
  capabilities?: unknown
  created_at: string
  updated_at: string
}

export type PaymentMethod = {
  id: string
  name: string
  instructions: string | null
  is_active: boolean
  sort_order: number
}

export type Subscription = {
  id: string
  user_id: string
  plan_id: string | null
  status: SubscriptionStatus
  starts_at: string | null
  ends_at: string | null
  source: "manual" | "trial" | "payment"
  plan_name_snapshot: string | null
  duration_days_snapshot: number | null
  price_amount_snapshot: number | string | null
  currency_snapshot: string | null
  created_at: string
  updated_at: string
}

export type PaymentRequestStatus = "submitted" | "approved" | "rejected" | "cancelled"

export type PaymentRequest = {
  id: string
  user_id: string
  plan_id: string
  payment_method_id: string | null
  expected_amount: number | string | null
  declared_amount: number | string
  currency: string
  paid_on: string | null
  reference: string | null
  receipt_path: string | null
  status: PaymentRequestStatus
  notes: string | null
  review_notes: string | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

export type Payment = {
  id: string
  user_id: string
  request_id: string | null
  subscription_id: string | null
  amount: number | string
  currency: string
  paid_at: string | null
  recorded_by: string | null
  created_at: string
}

export type AuditLog = {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  previous_state: unknown
  new_state: unknown
  reason: string | null
  metadata: unknown
  created_at: string
}

export type InAppNotification = {
  id: string
  user_id: string
  kind: string
  title: string
  body: string | null
  payload: unknown
  read_at: string | null
  created_at: string
}

export type CycleStatus = "open" | "closed"
export type AccountKind = "cash" | "bank" | "digital_wallet" | "pocket" | "savings" | "other"
export type CategoryGroup = "income" | "scheduled_payment" | "expense" | "savings" | "debt"
export type TransactionKind =
  | "income"
  | "expense"
  | "transfer"
  | "savings_contribution"
  | "debt_payment"
export type TransactionStatus = "posted" | "voided"
export type CommitmentStatus = "pending" | "partial" | "paid" | "overdue" | "cancelled"

export type FinancialCycle = {
  id: string
  user_id: string
  name: string
  starts_on: string
  ends_on: string
  status: CycleStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type FinancialAccount = {
  id: string
  user_id: string
  name: string
  kind: AccountKind
  currency: string
  opening_balance: number | string
  allow_negative: boolean
  is_active: boolean
  include_in_total?: boolean
  color?: string | null
  icon?: string | null
  notes: string | null
}

export type FinancialCategory = {
  id: string
  user_id: string
  name: string
  group_code: CategoryGroup
  color: string | null
  icon: string | null
  is_active: boolean
  sort_order: number
}

export type FinancialBudget = {
  id: string
  user_id: string
  cycle_id: string
  category_id: string
  planned_amount: number | string
}

export type FinancialTransaction = {
  id: string
  user_id: string
  cycle_id: string
  account_id: string
  counterparty_account_id: string | null
  category_id: string | null
  scheduled_payment_id: string | null
  scheduled_income_id: string | null
  kind: TransactionKind
  status: TransactionStatus
  amount: number | string
  occurred_on: string
  description: string | null
  notes: string | null
  voided_at: string | null
  created_at: string
}

export type ScheduledPayment = {
  id: string
  user_id: string
  cycle_id: string
  category_id: string | null
  preferred_account_id: string | null
  name: string
  expected_amount: number | string
  due_on: string
  paid_amount: number | string
  status: CommitmentStatus
  notes: string | null
}

export type AccessContext = {
  user: {
    id: string
    email: string | null
    emailConfirmed: boolean
  } | null
  profile: Profile | null
  subscription: Subscription | null
  configured: boolean
}
