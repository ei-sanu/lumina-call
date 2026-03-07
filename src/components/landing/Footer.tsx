import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <span className="font-display font-bold text-lg tracking-wide text-foreground block mb-3">
              NOVA<span className="text-muted-foreground italic">ARC</span>
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Next-generation video conferencing for teams who demand excellence.
            </p>
          </div>
          {[
            { title: "Product", links: [
              { label: "Features", href: "/#features" },
              { label: "How It Works", href: "/#how-it-works" },
              { label: "FAQ", href: "/#faq" },
            ]},
            { title: "Company", links: [
              { label: "About", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Careers", href: "#" },
            ]},
            { title: "Legal", links: [
              { label: "Privacy Policy", href: "/terms" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Cookie Policy", href: "/terms" },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-foreground mb-4 text-sm tracking-wide uppercase">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="divider-line mt-12 mb-8" />
        <div className="text-center text-xs text-muted-foreground">
          © 2026 NovaArc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
