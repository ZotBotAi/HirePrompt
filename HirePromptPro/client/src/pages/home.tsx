import { FC } from "react";
import { UserContext } from "../App";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import TrustedBySection from "@/components/home/trusted-by-section";
import FeaturesSection from "@/components/home/features-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import PricingSection from "@/components/home/pricing-section";
import FaqSection from "@/components/home/faq-section";
import CtaSection from "@/components/home/cta-section";

interface HomeProps {
  userContext: UserContext;
}

const Home: FC<HomeProps> = ({ userContext }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userContext={userContext} />
      <main className="flex-grow">
        <HeroSection userContext={userContext} />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection userContext={userContext} />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
