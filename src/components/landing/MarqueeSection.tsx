import { motion } from "framer-motion";
import { Video, Shield, Zap, Users, MessageSquare, Monitor, Globe, Lock, Smartphone, Headphones } from "lucide-react";

import hdVideo from "@/assets/features/hd-video.jpg";
import encryption from "@/assets/features/encryption.jpg";
import lowLatency from "@/assets/features/low-latency.jpg";
import participants from "@/assets/features/participants.jpg";
import liveChat from "@/assets/features/live-chat.jpg";
import screenShare from "@/assets/features/screen-share.jpg";
import globalNetwork from "@/assets/features/global-network.jpg";
import enterpriseSecurity from "@/assets/features/enterprise-security.jpg";
import mobileReady from "@/assets/features/mobile-ready.jpg";
import crystalAudio from "@/assets/features/crystal-audio.jpg";

const features = [
  { icon: Video, label: "HD Video Calls", image: hdVideo },
  { icon: Shield, label: "End-to-End Encryption", image: encryption },
  { icon: Zap, label: "Ultra-Low Latency", image: lowLatency },
  { icon: Users, label: "100+ Participants", image: participants },
  { icon: MessageSquare, label: "Live Chat", image: liveChat },
  { icon: Monitor, label: "Screen Sharing", image: screenShare },
  { icon: Globe, label: "Global Edge Network", image: globalNetwork },
  { icon: Lock, label: "Enterprise Security", image: enterpriseSecurity },
  { icon: Smartphone, label: "Mobile Ready", image: mobileReady },
  { icon: Headphones, label: "Crystal Audio", image: crystalAudio },
];

const MarqueeRow = ({ direction = "left", speed = 30 }: { direction?: "left" | "right"; speed?: number }) => {
  const items = [...features, ...features];

  return (
    <div className="overflow-hidden py-3">
      <motion.div
        className="flex gap-5 w-max"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {items.map((feature, i) => (
          <div
            key={i}
            className="group relative w-56 flex-shrink-0 glass-card rounded-2xl overflow-hidden hover:scale-[1.03] transition-transform duration-300"
          >
            {/* Image */}
            <div className="relative h-36 overflow-hidden">
              <img
                src={feature.image}
                alt={feature.label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            </div>
            {/* Label */}
            <div className="px-4 py-3 flex items-center gap-2.5">
              <feature.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium truncate">
                {feature.label}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const MarqueeSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-10 text-center"
      >
        <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3 block">
          What We Offer
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          <span className="chrome-text-hero">POWERFUL FEATURES</span>
        </h2>
      </motion.div>
      <MarqueeRow direction="left" speed={45} />
      <MarqueeRow direction="right" speed={40} />
    </section>
  );
};

export default MarqueeSection;
