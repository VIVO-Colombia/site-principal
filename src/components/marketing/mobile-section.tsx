import { Bell, Home, Smartphone, Wallet, CalendarClock, Plus } from "lucide-react"

import { MobileAppPreview } from "@/components/product/mobile-app-preview"
import { PhoneFrame } from "@/components/product/phone-frame"
import { productName } from "@/config/brand"

const points = [
  { icon: Plus, text: "Registra gastos rápidamente." },
  { icon: Wallet, text: "Consulta tu disponible." },
  { icon: CalendarClock, text: "Revisa próximos pagos." },
  { icon: Home, text: "Accede a tu planeación desde cualquier lugar." },
  { icon: Bell, text: "Recibe recordatorios cuando el módulo esté activo." },
  { icon: Smartphone, text: "Agrega la aplicación a la pantalla de inicio cuando la PWA esté habilitada." },
]

export function MobileSection() {
  return (
    <section id="celular" className="scroll-mt-24 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#17243c] px-6 py-14 text-white sm:px-12 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-medium text-white/70">Diseñado para tu celular</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
              La experiencia cotidiana de {productName()} cabe en una mano.
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
            <PhoneFrame className="shadow-[0_30px_80px_-20px_rgb(0_0_0_/_0.55)]">
              <MobileAppPreview tall />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  )
}
