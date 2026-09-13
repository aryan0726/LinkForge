import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import HowItWorks from "../components/landing/HowItWorks";
import FeaturesSection from "../components/landing/FeaturesSection";
import WhyLinkForge from "../components/landing/WhyLinkForge";
import SecuritySection from "../components/landing/SecuritySection";
import FinalCta from "../components/landing/FinalCta";
import Footer from "../components/landing/Footer";

/** Marketing landing page. */
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main id="main">
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <WhyLinkForge />
        <SecuritySection />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
