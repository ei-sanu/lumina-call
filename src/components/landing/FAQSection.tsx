import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How many people can join a meeting?", a: "Free users can host up to 10 participants. Premium tiers support 50–100 participants per meeting with additional collaboration features." },
  { q: "Is my data secure?", a: "Yes. All meetings are protected with end-to-end encryption. We never store or access your video or audio data." },
  { q: "Can I record meetings?", a: "Cloud recording is available on premium plans. Recordings are stored securely and accessible from your dashboard." },
  { q: "Do I need to download anything?", a: "No. NexusCall works entirely in your browser. No downloads, plugins, or extensions required." },
  { q: "What about mobile support?", a: "NexusCall is fully responsive and works on any modern mobile browser. Native apps are coming soon." },
  { q: "Is there a free plan?", a: "Yes. Start free with up to 10 participants and 40-minute meetings. Upgrade anytime for unlimited access." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-32 relative">
      <div className="divider-line mb-32" />
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">Support</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            <span className="chrome-text-hero">FREQUENTLY ASKED</span>
            <br />
            <span className="chrome-text" style={{ opacity: 0.5 }}>QUESTIONS</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-border/50 px-0 rounded-none"
              >
                <AccordionTrigger className="text-foreground font-medium text-left hover:no-underline py-6 text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-sm leading-relaxed">
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
