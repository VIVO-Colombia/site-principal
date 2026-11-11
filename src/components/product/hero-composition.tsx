import { BalanceCard, UpcomingPaymentCard } from "@/components/product/floating-cards"
import { DesktopDashboardPreview } from "@/components/product/desktop-dashboard-preview"
import { MobileAppPreview } from "@/components/product/mobile-app-preview"
import { PhoneFrame } from "@/components/product/phone-frame"

export function HeroComposition() {
  return (
    <div className="relative mx-auto w-full">
      <div className="pointer-events-none absolute inset-0 hero-grid" />

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

      <div className="relative flex flex-col items-center lg:hidden">
        <PhoneFrame>
          <MobileAppPreview />
        </PhoneFrame>
        <div className="mt-5 grid w-full grid-cols-1 justify-items-center gap-3 sm:grid-cols-2">
          <BalanceCard />
          <UpcomingPaymentCard />
        </div>
      </div>
    </div>
  )
}
