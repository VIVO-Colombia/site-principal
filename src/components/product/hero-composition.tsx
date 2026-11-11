import { BalanceCard, UpcomingPaymentCard } from "@/components/product/floating-cards"
import { DesktopDashboardPreview } from "@/components/product/desktop-dashboard-preview"
import { MobileAppPreview } from "@/components/product/mobile-app-preview"
import { PhoneFrame } from "@/components/product/phone-frame"

export function HeroComposition() {
  return (
    <div className="relative mx-auto w-full min-w-0">
      <div className="pointer-events-none absolute inset-0 hero-grid max-lg:opacity-50" />

      <div className="relative hidden h-[640px] overflow-hidden lg:block">
        <div className="absolute top-4 right-2 origin-top-right scale-[0.82] rotate-[5deg]">
          <DesktopDashboardPreview />
        </div>
        <div className="absolute top-14 left-2 z-20 animate-float">
          <BalanceCard />
        </div>
        <div className="absolute bottom-16 left-2 z-20 animate-float delay-200">
          <UpcomingPaymentCard />
        </div>
        <div className="absolute right-6 bottom-0 z-30">
          <PhoneFrame compact>
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
