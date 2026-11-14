import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col bg-[#f7f9fc]">{children}</div>
}
