import Link from "next/link"

import { publicContact } from "@/config/contact"

export function ContactChannels({ inverted = false }: { inverted?: boolean }) {
  const { email, whatsapp } = publicContact()
  if (!email && !whatsapp) return null

  return (
    <ul className={inverted ? "space-y-2 text-sm text-white/80" : "space-y-2 text-sm text-[#596579]"}>
      {email ? (
        <li>
          <Link href={`mailto:${email}`} className="inline-flex min-h-11 items-center underline">
            {email}
          </Link>
        </li>
      ) : null}
      {whatsapp ? (
        <li>
          <Link
            href={`https://wa.me/${whatsapp}`}
            className="inline-flex min-h-11 items-center underline"
            rel="noopener noreferrer"
          >
            WhatsApp comercial
          </Link>
        </li>
      ) : null}
    </ul>
  )
}
