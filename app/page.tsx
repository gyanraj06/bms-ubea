'use client'

import { ChaletHeader } from "@/components/shared/chalet-header"
import { Footer } from "@/components/shared/footer"
import { ChaletHero } from "@/components/home/chalet-hero"
import { WelcomeSection } from "@/components/home/welcome-section"
import { LivingSpaces } from "@/components/home/living-spaces"
import { AttractionsSlider } from "@/components/home/attractions-slider"
import { AudienceCards } from "@/components/home/audience-cards"
import { Testimonials } from "@/components/home/testimonials"
import { LatestUpdates } from "@/components/home/latest-updates"
import { FloatingAnnouncement } from "@/components/home/floating-announcement"

export default function Home() {
  return (
    <main className="min-h-screen">
      <ChaletHeader />
      <ChaletHero />
      <WelcomeSection />
      <LatestUpdates />
      <LivingSpaces />
      <AttractionsSlider />
      <AudienceCards />
      <Testimonials />
      <FloatingAnnouncement />
      <Footer />
    </main>
  )
}
