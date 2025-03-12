import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/landing/hero';
import { Stats } from '@/components/landing/stats';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { DashboardPreview } from '@/components/landing/dashboard-preview';
import { Pricing } from '@/components/landing/pricing';
import { CTA } from '@/components/landing/cta';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
