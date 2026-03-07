import { motion } from "framer-motion";
import { Video, Shield, Zap, Users, MessageSquare, Monitor } from "lucide-react";

const features = [
  { icon: Video, title: "HD Video & Audio", description: "Crystal-clear quality with adaptive bitrate streaming that adjusts to your network." },
  { icon: Shield, title: "End-to-End Encryption", description: "Enterprise-grade security ensures your conversations remain private." },
  { icon: Zap, title: "Ultra-Low Latency", description: "Sub-100ms latency powered by our global edge network." },
  { icon: Users, title: "100 Participants", description: "Host large meetings with gallery view and breakout rooms." },
  { icon: MessageSquare, title: "Live Chat & Reactions", description: "Rich messaging with file sharing during calls." },
  { icon: Monitor, title: "Screen Sharing", description: "Share your screen with built-in annotation tools." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">Capabilities</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="chrome-text-hero">EVERYTHING YOU</span>
            <br />
            <span className="chrome-text" style={{ opacity: 0.5 }}>NEED TO CONNECT</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="bg-card p-8 group hover:bg-accent/50 transition-colors duration-500"
            >
              <f.icon className="w-6 h-6 text-muted-foreground mb-5 group-hover:text-foreground transition-colors duration-500" />
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
