import silkBg from "@/assets/silk-bg.jpg";
import { useUser } from "@clerk/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  onOpenAuth?: (mode: "signin" | "signup") => void;
}
//enhance
const HeroSection = ({ onOpenAuth }: HeroSectionProps) => {
  const { isSignedIn } = useUser();

  return (
    <section className="relative isolate min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated grey silk background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-background hero-animated-bg">
        <motion.img
          src={silkBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover hero-silk-image"
          animate={{ scale: [1, 1.07, 1], x: [0, 12, -10, 0], y: [0, -8, 10, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="noise-bg" />
        <div className="hero-silk-layer" />
        <motion.div
          className="hero-shimmer-band"
          animate={{ x: ["-35%", "130%"] }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
        />
        <div className="hero-vignette" />

        <motion.div
          className="hero-blob hero-blob-1"
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="hero-blob hero-blob-2"
          animate={{ x: [0, -35, 25, 0], y: [0, 25, -20, 0], scale: [1, 0.94, 1.05, 1] }}
          transition={{ duration: 24, ease: "easeInOut", repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 glass-card px-5 py-2.5 mb-10 text-sm text-muted-foreground rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
            Video Conferencing Platform
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight mb-6"
        >
          <span className="chrome-text-hero block">MEETINGS THAT</span>
          <span className="chrome-text block" style={{ opacity: 0.5 }}>SPEAK FOR THEMSELVES</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          We built NovaArc because every other video tool felt bloated, slow, or just&hellip; off. This one doesn't. Try it free, no strings attached.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          {isSignedIn ? (
            <Link to="/dashboard">
              <button className="bg-foreground text-background px-8 py-3.5 rounded-full text-sm font-semibold hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-500 hover:scale-105">
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <button
              onClick={() => onOpenAuth?.("signup")}
              className="bg-foreground text-background px-8 py-3.5 rounded-full text-sm font-semibold hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-500 hover:scale-105"
            >
              Start Free Now
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
