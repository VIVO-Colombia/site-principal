import { Suspense } from "react"

import { AppShell } from "@/components/app-shell/app-shell"
import { requireAppAccess } from "@/lib/auth/access"

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="app-scope min-h-full" />}>
      <GuardedApp>{children}</GuardedApp>
    </Suspense>
  )
}

async function GuardedApp({ children }: { children: React.ReactNode }) {
  await requireAppAccess()
  return <AppShell>{children}</AppShell>
}
