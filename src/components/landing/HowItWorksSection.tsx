import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Create an Account", description: "Sign up in seconds with just your email. No credit card required." },
  { number: "02", title: "Start or Join a Meeting", description: "Create an instant meeting or schedule one for later. Share the link with anyone." },
  { number: "03", title: "Collaborate in Real-Time", description: "Video, chat, screen share, and more — all in one seamless experience." },
];

const HowItWorksSection = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Get started in <span className="gradient-text">minutes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three simple steps to better meetings.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="text-6xl font-display font-bold gradient-text opacity-30 mb-4">{step.number}</div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-[1px] bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
