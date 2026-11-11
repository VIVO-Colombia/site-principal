import { BalanceCard, UpcomingPaymentCard } from "@/components/product/floating-cards"
import { DesktopDashboardPreview } from "@/components/product/desktop-dashboard-preview"
import { MobileAppPreview } from "@/components/product/mobile-app-preview"
import { PhoneFrame } from "@/components/product/phone-frame"

export function HeroComposition() {
  return (
    <div className="relative mx-auto w-full min-w-0">
      <div className="pointer-events-none absolute inset-0 hero-grid max-lg:opacity-50" />

      <div className="relative hidden items-stretch gap-4 lg:flex">
        <div className="min-w-0 flex-1">
          <DesktopDashboardPreview />
        </div>
        <div className="relative z-10 w-[15.5rem] shrink-0">
          <PhoneFrame compact className="w-full max-w-none">
            <MobileAppPreview />
          </PhoneFrame>
        </div>
      </div>

      <div className="relative mx-auto w-[min(100%,16.5rem)] pt-1 lg:hidden">
        <PhoneFrame compact className="w-full max-w-none shadow-[0_24px_50px_-28px_rgb(23_36_60_/_0.5)]">
          <MobileAppPreview />
        </PhoneFrame>
        <div className="pointer-events-none absolute top-[32%] left-0 z-20 w-[9.75rem]">
          <BalanceCard compact />
        </div>
        <div className="pointer-events-none absolute top-[46%] right-0 z-20 w-[9.9rem]">
          <UpcomingPaymentCard compact />
        </div>
      </div>
    </div>
  )
}
