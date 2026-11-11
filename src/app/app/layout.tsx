import { Suspense } from "react"

import { AppShell } from "@/components/app-shell/app-shell"
import { requireAppAccess } from "@/lib/auth/access"
import { getFinanceBootstrap } from "@/lib/finance/queries"

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <GuardedApp>{children}</GuardedApp>
    </Suspense>
  )
}

async function GuardedApp({ children }: { children: React.ReactNode }) {
  const access = await requireAppAccess()
  const bootstrap = await getFinanceBootstrap(access.user!.id).catch(() => null)

  return (
    <AppShell
      userName={access.profile?.full_name}
      readOnly={access.readOnly}
      cycles={bootstrap?.cycles ?? []}
      activeCycle={bootstrap?.cycle ?? null}
      unreadNotifications={bootstrap?.unreadNotifications ?? 0}
    >
      {children}
    </AppShell>
  )
}

function ShellFallback() {
  return <div className="min-h-full bg-[#f7f9fc]" />
}
