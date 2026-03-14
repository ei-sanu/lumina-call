import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How many people can be on a call?", a: "Free accounts support up to 10 people per meeting. Paid plans bump that up to 50 or 100 depending on your tier — with breakout rooms and gallery view included." },
  { q: "Is my data actually private?", a: "Yes — all calls are end-to-end encrypted. We don't listen to, record, or store any of your audio or video. Your data stays yours, full stop." },
  { q: "Can I record my meetings?", a: "Yep. Cloud recording is available on our paid plans. Recordings land in your dashboard and you can share or download them anytime." },
  { q: "Do I need to install anything?", a: "Nope. NovaArc runs straight from your browser — Chrome, Firefox, Safari, Edge, you name it. No plugins, no desktop apps, no hassle." },
  { q: "Does it work on phones?", a: "It does. The whole interface is responsive and works great on mobile browsers. We're also working on native iOS and Android apps — stay tuned." },
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
//faq secrtion has been updated to the required ones!!


// faq
