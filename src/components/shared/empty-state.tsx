import Link from "next/link"

import { Button } from "@/components/ui/button"

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 ring-1 ring-[#e5eaf1]">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#5b6b82]">{description}</p>
      {action ? (
        <Button asChild className="mt-4 h-11 rounded-xl">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  )
}
