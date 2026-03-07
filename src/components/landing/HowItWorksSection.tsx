import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Create an Account", description: "Sign up in seconds with your email. No credit card required." },
  { number: "02", title: "Start or Join", description: "Create an instant meeting or schedule one. Share the link." },
  { number: "03", title: "Collaborate", description: "Video, chat, screen share — all in one seamless experience." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 relative">
      <div className="divider-line mb-32" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">Process</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="chrome-text-hero">GET STARTED</span>
            <br />
            <span className="chrome-text" style={{ opacity: 0.5 }}>IN MINUTES</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center relative group"
            >
              <div className="text-7xl font-display font-bold chrome-text opacity-20 mb-6 group-hover:opacity-40 transition-opacity duration-500">{step.number}</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
