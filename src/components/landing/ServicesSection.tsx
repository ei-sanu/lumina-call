import { motion } from "framer-motion";
import { Video, Users, Monitor, MessageSquare, Calendar, BarChart3 } from "lucide-react";

const services = [
  {
    icon: Video,
    title: "Video Conferencing",
    description: "Rock-solid HD calls that just work — whether you're presenting to 5 people or 100.",
    stats: "99.9% Uptime",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Breakout rooms for brainstorming, whiteboarding for sketching ideas, and docs you can edit live.",
    stats: "50+ Integrations",
  },
  {
    icon: Monitor,
    title: "Screen Sharing",
    description: "Show your screen, a specific tab, or a window — draw on it if you need to make a point.",
    stats: "4K Support",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Send messages, share files, and keep the conversation going — even after the call ends.",
    stats: "Real-time",
  },
  {
    icon: Calendar,
    title: "Scheduling",
    description: "Sync with Google Calendar or Outlook. Set recurring meetings. Send invites with one click.",
    stats: "Auto-sync",
  },
  {
    icon: BarChart3,
    title: "Meeting Insights",
    description: "See who attended, how long calls ran, and which meetings could've been emails.",
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
