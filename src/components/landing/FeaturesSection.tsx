import { motion } from "framer-motion";
import { Video, Shield, Zap, Users, MessageSquare, Monitor } from "lucide-react";

const features = [
  { icon: Video, title: "HD Video & Audio", description: "Crystal-clear quality with adaptive bitrate streaming that adjusts to your network conditions." },
  { icon: Shield, title: "End-to-End Encryption", description: "Enterprise-grade security ensures your conversations remain private and protected." },
  { icon: Zap, title: "Ultra-Low Latency", description: "Sub-100ms latency powered by our global edge network for real-time communication." },
  { icon: Users, title: "Up to 100 Participants", description: "Host large meetings with gallery view, speaker focus, and breakout rooms." },
  { icon: MessageSquare, title: "Live Chat & Reactions", description: "Rich messaging with emojis, file sharing, and threaded conversations during calls." },
  { icon: Monitor, title: "Screen Sharing", description: "Share your entire screen or specific windows with annotation tools built in." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything you need to <span className="gradient-text">connect</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful features designed for seamless collaboration across teams of any size.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item} className="glass-card p-6 hover-lift group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
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
