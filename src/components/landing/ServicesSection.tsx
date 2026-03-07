import { motion } from "framer-motion";
import { Video, Users, Monitor, MessageSquare, Calendar, BarChart3 } from "lucide-react";

const services = [
  {
    icon: Video,
    title: "Video Conferencing",
    description: "HD video calls with up to 100 participants, adaptive bitrate, and gallery view.",
    stats: "99.9% Uptime",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Breakout rooms, whiteboarding, and real-time document collaboration during calls.",
    stats: "50+ Integrations",
  },
  {
    icon: Monitor,
    title: "Screen Sharing",
    description: "Share your entire screen or specific windows with built-in annotation tools.",
    stats: "4K Support",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Rich messaging with file sharing, reactions, and threaded conversations.",
    stats: "Real-time",
  },
  {
    icon: Calendar,
    title: "Meeting Scheduling",
    description: "Calendar integration, recurring meetings, and smart scheduling assistant.",
    stats: "Auto-sync",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Meeting insights, participation reports, and usage analytics for your team.",
    stats: "Deep Insights",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-32 relative">
      <div className="divider-line mb-32" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">Our Services</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="chrome-text-hero">COMPREHENSIVE</span>
            <br />
            <span className="chrome-text" style={{ opacity: 0.5 }}>SOLUTIONS</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="glass-card p-8 rounded-2xl group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <service.icon className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors duration-500" />
                  <span className="text-xs text-muted-foreground/60 font-mono">{service.stats}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
