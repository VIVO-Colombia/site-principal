"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

import { QuoteLauncher, QuoteWidget } from "@/components/transport/quote-widget"
import { publicRoutes } from "@/config/routes"
import { TRANSPORT_DRAFT_KEY, type TransportDraft } from "@/lib/transport/draft"
import { transportWhatsappUrl } from "@/lib/transport/whatsapp"

export function CorporateFloats() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const quotePages = pathname === publicRoutes.home || pathname.startsWith(publicRoutes.transport)
  const transportPage = pathname.startsWith(publicRoutes.transport)
  if (!quotePages) return null

  function whatsappHref() {
    try {
      const raw = sessionStorage.getItem(TRANSPORT_DRAFT_KEY)
      if (!raw) return transportWhatsappUrl()
      const draft = JSON.parse(raw) as TransportDraft
      return transportWhatsappUrl({
        origin: draft.originLabel,
        destination: draft.destinationLabel,
        cargo: draft.cargo,
        date: draft.date,
        distance: draft.distance,
        estimate: draft.estimate,
        helpers: draft.helpers,
      })
    } catch {
      return transportWhatsappUrl()
    }
  }

  return (
    <>
      <div className={`fixed right-3 z-[60] flex flex-col items-end gap-2 sm:right-5 ${open ? "bottom-[max(1rem,env(safe-area-inset-bottom))] hidden sm:flex" : "bottom-[max(1rem,env(safe-area-inset-bottom))]"}`}>
        {transportPage && !open ? (
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#07152C] px-4 text-sm text-white shadow-lg"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-6 text-[#25D366]" fill="currentColor">
              <path d="M20 11.5A8.5 8.5 0 0 1 7.1 18.4L4 20l1.7-3A8.5 8.5 0 1 1 20 11.5Zm-8.5 7a7 7 0 0 0 3.6-1l.3-.2 2.1.6-.6-2 .2-.3a7 7 0 1 0-5.6 2.9Zm3.8-5.2c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.5.1-.5.7-.7.8-.2.2-.4.1a5.7 5.7 0 0 1-1.7-1 6.3 6.3 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.4l.3-.4.1-.2a.4.4 0 0 0 0-.4c0-.1-.5-1.2-.7-1.6s-.3-.4-.5-.4h-.4a.8.8 0 0 0-.6.3 2.4 2.4 0 0 0-.8 1.8 4.2 4.2 0 0 0 .9 2.2 9.6 9.6 0 0 0 3.6 3.2 4 4 0 0 0 2.5.5 2.1 2.1 0 0 0 1.4-.9 1.7 1.7 0 0 0 .1-1c-.1-.1-.2-.1-.4-.2Z" />
            </svg>
            <span className="hidden sm:inline">Hablemos por WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        ) : null}
        {!open ? <QuoteLauncher onOpen={() => setOpen(true)} /> : null}
      </div>
      <QuoteWidget open={open} onOpenChange={setOpen} />
    </>
  )
}
