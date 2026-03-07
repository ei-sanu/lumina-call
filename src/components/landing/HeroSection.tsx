import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mouse } from "lucide-react";
import silkBg from "@/assets/silk-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Silk background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={silkBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="silk-overlay" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 glass-card px-5 py-2.5 mb-10 text-sm text-muted-foreground rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
            Video Conferencing Platform
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight mb-6"
        >
          <span className="chrome-text-hero block">MEETINGS THAT</span>
          <span className="chrome-text block" style={{ opacity: 0.6 }}>SPEAK FOR THEMSELVES</span>
        </motion.h1>

        {/* Sub text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Crystal-clear video conferencing built for teams who demand
          excellence, so you can focus on what matters.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <Link to="/signup">
            <button className="ghost-button text-sm">
              Start Free Now
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="relative z-10 pb-10 flex flex-col items-center gap-3"
      >
        <div className="divider-line w-32" />
        <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll down</span>
        <Mouse className="w-5 h-5 text-muted-foreground animate-scroll-hint" />
        <span className="text-xs text-muted-foreground tracking-widest uppercase">to explore</span>
        <div className="divider-line w-32" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
