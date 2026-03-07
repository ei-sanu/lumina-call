import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-32 relative">
      <div className="divider-line mb-32" />
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">Get In Touch</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="chrome-text-hero">LET'S START</span>
            <br />
            <span className="chrome-text" style={{ opacity: 0.5 }}>A CONVERSATION</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-12"
        >
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">Ready to transform your meetings?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Whether you have questions about features, pricing, or need a demo — our team is ready to help you get started.
              </p>
            </div>
            {[
              { label: "Email", value: "hello@novaarc.com" },
              { label: "Response Time", value: "Within 24 hours" },
              { label: "Support", value: "24/7 for premium users" },
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ x: 4 }}
                className="glass-card p-5 rounded-xl"
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">{item.label}</span>
                <span className="text-foreground font-medium">{item.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: "name", label: "Your Name", type: "text", placeholder: "John Doe" },
              { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  required
                  value={formData[field.name as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Message</label>
              <textarea
                placeholder="Tell us about your needs..."
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors resize-none"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-shadow duration-500"
            >
              {submitted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Message Sent!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
