import type { SubscriptionStatus, UserRole } from "@/lib/auth/roles"

export type Profile = {
  id: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type Plan = {
  id: string
  code: string
  name: string
  cadence: "monthly" | "yearly" | "custom"
  duration_days: number
  price_cents: number | null
  currency: string
  is_active: boolean
  description: string | null
}

export type Subscription = {
  id: string
  user_id: string
  plan_id: string | null
  status: SubscriptionStatus
  starts_at: string | null
  ends_at: string | null
  source: "manual" | "trial" | "payment"
  created_at: string
}

export type AccessContext = {
  user: {
    id: string
    email: string | null
  } | null
  profile: Profile | null
  subscription: Subscription | null
  configured: boolean
}
