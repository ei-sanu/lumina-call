import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import ParticleBackground from "@/components/ParticleBackground";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <ParticleBackground />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Now in Public Beta
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          Connect Beyond
          <br />
          <span className="gradient-text">Boundaries</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Crystal-clear video meetings with real-time collaboration.
          Built for teams who demand excellence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/signup">
            <button className="gradient-button px-8 py-3 rounded-xl text-base flex items-center gap-2">
              Start Free <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <button className="glass-card px-8 py-3 rounded-xl text-base text-foreground flex items-center gap-2 hover-lift">
            <Play className="w-4 h-4 text-primary" />
            Watch Demo
          </button>
        </motion.div>

        {/* Mock meeting UI preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="glass-card p-2 glow-border rounded-2xl">
            <div className="bg-muted/50 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
              {/* Mock video grid */}
              <div className="grid grid-cols-3 gap-2 p-4 w-full h-full">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg flex items-center justify-center border border-border/30">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs font-medium">U{i + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Mock control bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-6 py-3 rounded-full flex items-center gap-4">
                {["🎤", "📹", "🖥️", "💬"].map((icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-muted/80 flex items-center justify-center text-sm cursor-pointer hover:bg-muted transition-colors">
                    {icon}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center text-sm cursor-pointer">
                  📞
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
