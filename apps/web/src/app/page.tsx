'use client'

import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero'
import { StatsSection } from '@/components/landing/stats-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works'
import { TestimonialsSection } from '@/components/landing/testimonials'
import { PricingSection } from '@/components/landing/pricing-section'
import { FAQSection } from '@/components/landing/faq-section'
import { FinalCTASection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
