import { motion } from "framer-motion";
import { Video, Shield, Zap, Users, MessageSquare, Monitor, Globe, Lock, Smartphone, Headphones } from "lucide-react";

const features = [
  { icon: Video, label: "HD Video Calls" },
  { icon: Shield, label: "End-to-End Encryption" },
  { icon: Zap, label: "Ultra-Low Latency" },
  { icon: Users, label: "100+ Participants" },
  { icon: MessageSquare, label: "Live Chat" },
  { icon: Monitor, label: "Screen Sharing" },
  { icon: Globe, label: "Global Edge Network" },
  { icon: Lock, label: "Enterprise Security" },
  { icon: Smartphone, label: "Mobile Ready" },
  { icon: Headphones, label: "Crystal Audio" },
];

const MarqueeRow = ({ direction = "left", speed = 30 }: { direction?: "left" | "right"; speed?: number }) => {
  const items = [...features, ...features];

  return (
    <div className="overflow-hidden py-4">
      <motion.div
        className="flex gap-6 w-max"
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
            className="flex items-center gap-3 glass-card px-6 py-3.5 rounded-full whitespace-nowrap group hover:bg-accent/50 transition-colors duration-300"
          >
            <feature.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
              {feature.label}
            </span>
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
        <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
          What We Offer
        </span>
      </motion.div>
      <MarqueeRow direction="left" speed={40} />
      <MarqueeRow direction="right" speed={35} />
    </section>
  );
};

export default MarqueeSection;
