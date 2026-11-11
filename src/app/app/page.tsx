import { Suspense } from "react"

import { FinancialHome } from "@/components/finance-home/financial-home"
import { requireAppAccess } from "@/lib/auth/access"
import { resolveCapabilities, resolveEntitlement } from "@/lib/auth/capabilities"
import { getFinanceBootstrap } from "@/lib/finance/queries"

export default function AppHomePage() {
  return (
    <Suspense fallback={<div className="h-40 rounded-[28px] bg-white" />}>
      <HomeContent />
    </Suspense>
  )
}

async function HomeContent() {
  const access = await requireAppAccess()
  const data = await getFinanceBootstrap(access.user!.id)
  const userName = access.profile?.full_name || access.user?.email || "Hola"

  return (
    <FinancialHome
      data={data}
      userName={userName}
      entitlement={resolveEntitlement(access)}
      capabilities={resolveCapabilities(access)}
      onboardingCompleted={Boolean(access.profile?.onboarding_completed_at)}
    />
  )
}
