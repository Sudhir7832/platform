import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ShowcaseSection from '@/components/landing/ShowcaseSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import PricingSection from '@/components/landing/PricingSection';
import FooterSection from '@/components/landing/FooterSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050510]">
      <Navbar />
      <HeroSection />
      <ShowcaseSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <FooterSection />
    </main>
  );
}
