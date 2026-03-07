import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Bell, Volume2, Save, Shield } from "lucide-react";

const Settings = () => {
  const [name, setName] = useState("Arjun Mehta");
  const [email] = useState("arjun@novaarc.com");

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border/50 flex items-center px-6 sticky top-0 z-20 bg-background/80 backdrop-blur-lg">
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Settings</h1>

          {/* Profile */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl mb-4">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Camera className="w-4 h-4 text-muted-foreground" /> Profile
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center border border-border/50">
                <span className="font-display text-xl font-semibold text-foreground">AM</span>
              </div>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Change avatar</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2 uppercase tracking-wider">Display Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/20 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2 uppercase tracking-wider">Email</label>
                <input type="email" value={email} disabled className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Audio/Video */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl mb-4">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-muted-foreground" /> Audio & Video
            </h2>
            <div className="space-y-4">
              {[
                { label: "Camera", value: "MacBook Pro Camera" },
                { label: "Microphone", value: "MacBook Pro Microphone" },
                { label: "Speaker", value: "MacBook Pro Speakers" },
              ].map((d) => (
                <div key={d.label}>
                  <label className="text-xs font-medium text-muted-foreground block mb-2 uppercase tracking-wider">{d.label}</label>
                  <select className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-foreground/20 appearance-none">
                    <option>{d.value}</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl mb-4">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Bell className="w-4 h-4 text-muted-foreground" /> Notifications
            </h2>
            <div className="space-y-1">
              {["Meeting reminders", "Chat notifications", "Email summaries"].map((n) => (
                <label key={n} className="flex items-center justify-between py-3 cursor-pointer border-b border-border/30 last:border-0">
                  <span className="text-sm text-foreground">{n}</span>
                  <div className="w-10 h-6 bg-accent rounded-full relative cursor-pointer border border-border/50">
                    <div className="w-4 h-4 bg-foreground rounded-full absolute top-0.5 right-0.5 transition-all" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Shield className="w-4 h-4 text-muted-foreground" /> Privacy
            </h2>
            <div className="space-y-1">
              {["End-to-end encryption", "Two-factor authentication", "Login notifications"].map((n) => (
                <label key={n} className="flex items-center justify-between py-3 cursor-pointer border-b border-border/30 last:border-0">
                  <span className="text-sm text-foreground">{n}</span>
                  <div className="w-10 h-6 bg-accent rounded-full relative cursor-pointer border border-border/50">
                    <div className="w-4 h-4 bg-foreground rounded-full absolute top-0.5 right-0.5 transition-all" />
                  </div>
                </label>
              ))}
            </div>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground mt-4 inline-block transition-colors">
              View Terms & Conditions →
            </Link>
          </div>

          <button className="gradient-button px-6 py-3 rounded-xl text-sm flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
