import { Bell, Home, Smartphone, Wallet, CalendarClock, Plus } from "lucide-react"

import { MobileAppPreview } from "@/components/product/mobile-app-preview"
import { PhoneFrame } from "@/components/product/phone-frame"
import { productName } from "@/config/brand"

const points = [
  { icon: Plus, text: "Registra un gasto en segundos." },
  { icon: Wallet, text: "Consulta el disponible del ciclo." },
  { icon: CalendarClock, text: "Mira qué vence esta semana." },
  { icon: Home, text: "Entra desde el celular o el computador." },
  { icon: Bell, text: "Notificaciones dentro del producto, cuando las actives." },
  { icon: Smartphone, text: "Pensado para el pulgar. La PWA llega después." },
]

export function MobileSection() {
  return (
    <section id="celular" className="scroll-mt-24 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#17243c] px-6 py-12 text-white sm:px-12 sm:py-14 lg:px-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div>
            <p className="text-sm font-medium text-white/70">En el bolsillo</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
              {productName()} cabe en una mano. Y se usa con una.
            </h2>
            <ul className="mt-8 space-y-4">
              {points.map((point) => (
                <li key={point.text} className="flex items-start gap-3 text-[15px] leading-6">
                  <point.icon className="mt-0.5 size-5 shrink-0 text-white/70" />
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <PhoneFrame className="w-[min(100%,16.5rem)] shadow-[0_30px_80px_-20px_rgb(0_0_0_/_0.55)]">
              <MobileAppPreview tall />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  )
}
