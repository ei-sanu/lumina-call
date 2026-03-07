import AuthModal from "@/components/AuthModal";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/landing/ContactSection";
import FAQSection from "@/components/landing/FAQSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import MarqueeSection from "@/components/landing/MarqueeSection";
import ServicesSection from "@/components/landing/ServicesSection";
import StatsSection from "@/components/landing/StatsSection";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Check URL parameters for auth mode
  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "signin" || authParam === "signup") {
      setAuthMode(authParam);
      setAuthModalOpen(true);
      // Clean up URL parameter
      searchParams.delete("auth");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleSwitchMode = (mode: "signin" | "signup") => {
    setAuthMode(mode);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar onOpenAuth={handleOpenAuth} />
      <HeroSection onOpenAuth={handleOpenAuth} />
      <MarqueeSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <ServicesSection />
      <FAQSection />
      <ContactSection />
      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={handleSwitchMode}
      />
    </div>
  );
};

export default Index;
