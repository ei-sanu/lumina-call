import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated grey background */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="noise-bg" />
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Badge */}
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

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight mb-6"
        >
          <span className="chrome-text-hero block">MEETINGS THAT</span>
          <span className="chrome-text block" style={{ opacity: 0.5 }}>SPEAK FOR THEMSELVES</span>
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

        {/* CTA - White button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <Link to="/signup">
            <button className="bg-foreground text-background px-8 py-3.5 rounded-full text-sm font-semibold hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-500 hover:scale-105">
              Start Free Now
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
