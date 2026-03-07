import { useUser } from "@clerk/react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "FAQ", href: "/#faq" },
];

interface NavbarProps {
  onOpenAuth?: (mode: "signin" | "signup") => void;
}

const Navbar = ({ onOpenAuth }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card flex items-center justify-between h-14 px-6 rounded-full"
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display font-bold text-lg tracking-wide text-foreground">
            NOVA<span className="text-muted-foreground italic">ARC</span>
          </span>
        </Link>

        {/* Desktop nav - centered navigation links */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-1">
          {isLanding && navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <Link to="/dashboard">
              <button className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all duration-300">
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth?.("signin")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Sign in
              </button>
              <button
                onClick={() => onOpenAuth?.("signup")}
                className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all duration-300"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass-card mt-2 rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {isLanding && navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {isSignedIn ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <button className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium w-full">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onOpenAuth?.("signin");
                      setMobileOpen(false);
                    }}
                    className="text-sm text-muted-foreground w-full text-left py-2"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth?.("signup");
                      setMobileOpen(false);
                    }}
                    className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium w-full"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
