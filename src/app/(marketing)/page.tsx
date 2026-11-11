import { FaqSection } from "@/components/marketing/faq-section"
import { FeaturesSection } from "@/components/marketing/features-section"
import { FinalCta } from "@/components/marketing/final-cta"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { MobileSection } from "@/components/marketing/mobile-section"
import { PlansSection } from "@/components/marketing/plans-section"
import { PrivacySection } from "@/components/marketing/privacy-section"
import { ProblemSection } from "@/components/marketing/problem-section"

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <MobileSection />
      <HowItWorks />
      <PlansSection />
      <PrivacySection />
      <FaqSection />
      <FinalCta />
    </>
  )
}
