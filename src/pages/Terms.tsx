import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing and using NovaArc, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service. These terms apply to all visitors, users, and others who access or use the Service."
  },
  {
    title: "2. Description of Service",
    content: "NovaArc provides a web-based video conferencing platform that enables real-time audio, video, and text communication between users. The service includes features such as screen sharing, meeting recording, live chat, and participant management. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time."
  },
  {
    title: "3. User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during the registration process. You agree to notify us immediately of any unauthorized use of your account or any other breach of security."
  },
  {
    title: "4. Privacy Policy",
    content: "Your privacy is important to us. All meetings are protected with end-to-end encryption. We do not store, access, or share your video or audio data. We collect only the minimum necessary information to provide our services, including email addresses and usage analytics. We will never sell your personal information to third parties."
  },
  {
    title: "5. Acceptable Use",
    content: "You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. You may not attempt to gain unauthorized access to any part of the Service, other accounts, or any systems or networks connected to the Service. Harassment, abuse, or harmful behavior towards other users is strictly prohibited."
  },
  {
    title: "6. Intellectual Property",
    content: "The Service and its original content, features, and functionality are owned by NexusCall and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Service without express written permission."
  },
  {
    title: "7. Payment Terms",
    content: "Certain features of the Service require a paid subscription. You agree to pay all fees associated with your chosen plan. All payments are non-refundable unless otherwise stated. We reserve the right to change our pricing with 30 days' notice. Free tier limitations apply as described on our platform."
  },
  {
    title: "8. Data Security",
    content: "We implement industry-standard security measures to protect your data, including AES-256 encryption, secure SSL/TLS connections, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security of your data."
  },
  {
    title: "9. Limitation of Liability",
    content: "In no event shall NexusCall be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Service. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim."
  },
  {
    title: "10. Changes to Terms",
    content: "We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated terms. Last updated: March 2026."
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 sticky top-0 z-20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">Legal</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold chrome-text-hero mb-4">
            TERMS & CONDITIONS
          </h1>
          <p className="text-muted-foreground text-sm mb-12">
            Last updated: March 7, 2026 · Please read these terms carefully before using NexusCall.
          </p>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">{section.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="divider-line my-12" />

          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Questions about our terms? Contact us at{" "}
              <a href="mailto:legal@nexuscall.com" className="text-foreground hover:underline">legal@nexuscall.com</a>
            </p>
            <Link to="/signup">
              <button className="gradient-button px-6 py-3 rounded-xl text-sm">
                Accept & Create Account
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
