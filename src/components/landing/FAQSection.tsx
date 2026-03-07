import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How many people can join a meeting?", a: "Free users can host up to 10 participants. Pro supports 50, and Enterprise supports up to 100 participants per meeting." },
  { q: "Is my data secure?", a: "Yes. All meetings are protected with end-to-end encryption. We never store or access your video/audio data." },
  { q: "Can I record meetings?", a: "Cloud recording is available on Pro and Enterprise plans. Recordings are stored securely and accessible from your dashboard." },
  { q: "Do I need to download anything?", a: "No. NexusCall works entirely in your browser. No downloads, plugins, or extensions required." },
  { q: "What about mobile support?", a: "NexusCall is fully responsive and works on any modern mobile browser. Native apps are coming soon." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-32 relative">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card px-6 rounded-xl border-none">
                <AccordionTrigger className="text-foreground font-medium text-left hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
