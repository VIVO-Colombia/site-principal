"use client"

import type { ReactNode } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function FinanceActionSheet({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] gap-0 overflow-y-auto rounded-t-[28px] border-[#eae9e6] bg-white pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:inset-auto lg:top-1/2 lg:left-1/2 lg:h-auto lg:max-h-[86vh] lg:w-[min(32rem,calc(100%-2rem))] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[28px] lg:border"
      >
        <SheetHeader className="px-1 pb-2">
          <SheetTitle className="font-heading text-xl">{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="px-1 pb-2">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
