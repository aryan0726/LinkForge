import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import URLShortenerDemo from "../components/URLShortenerDemo";
import StatsSection from "../components/StatsSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <URLShortenerDemo />
      <StatsSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}

export default Home;