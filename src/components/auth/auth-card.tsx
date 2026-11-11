import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { publicRoutes } from "@/config/routes"

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <Link href={publicRoutes.planner} className="mb-8">
        <Logo />
      </Link>
      <div className="w-full max-w-[400px] rounded-[28px] bg-white p-6 shadow-[0_16px_40px_-28px_rgb(23_36_60_/_0.35)] ring-1 ring-[#e5eaf1] sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#5b6b82]">{description}</p>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 text-sm text-[#5b6b82]">{footer}</div> : null}
      </div>
    </div>
  )
}
