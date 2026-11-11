import { Suspense } from "react"

import { AdminShell } from "@/components/admin-shell/admin-shell"
import { requireAdminAccess } from "@/lib/auth/access"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-full bg-[#f7f9fc]" />}>
      <GuardedAdmin>{children}</GuardedAdmin>
    </Suspense>
  )
}

async function GuardedAdmin({ children }: { children: React.ReactNode }) {
  const access = await requireAdminAccess()

  return <AdminShell userName={access.profile?.full_name}>{children}</AdminShell>
}
