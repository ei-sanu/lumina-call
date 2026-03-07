import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center">
            <Video className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">NexusCall</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {isLanding && navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <button className="gradient-button px-4 py-2 rounded-lg text-sm">
                Get Started
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {isLanding && navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}>
                <button className="gradient-button px-4 py-2 rounded-lg text-sm w-full">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
