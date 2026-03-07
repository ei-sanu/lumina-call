import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Video, ArrowLeft, Camera, Bell, Shield, Monitor, Volume2, Save
} from "lucide-react";

const Settings = () => {
  const [name, setName] = useState("John Doe");
  const [email] = useState("john@example.com");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 glass border-b border-border/50 flex items-center px-6 sticky top-0 z-20">
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Settings</h1>

          {/* Profile */}
          <div className="glass-card p-6 rounded-2xl mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" /> Profile
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <span className="font-display text-xl font-semibold text-foreground">JD</span>
              </div>
              <button className="text-sm text-primary hover:underline">Change avatar</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Audio/Video */}
          <div className="glass-card p-6 rounded-2xl mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" /> Audio & Video
            </h2>
            <div className="space-y-4">
              {[
                { label: "Camera", value: "MacBook Pro Camera" },
                { label: "Microphone", value: "MacBook Pro Microphone" },
                { label: "Speaker", value: "MacBook Pro Speakers" },
              ].map((d) => (
                <div key={d.label}>
                  <label className="text-sm font-medium text-foreground block mb-2">{d.label}</label>
                  <select className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                    <option>{d.value}</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card p-6 rounded-2xl mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Notifications
            </h2>
            <div className="space-y-3">
              {["Meeting reminders", "Chat notifications", "Email summaries"].map((n) => (
                <label key={n} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm text-foreground">{n}</span>
                  <div className="w-10 h-6 bg-primary/30 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-primary rounded-full absolute top-1 right-1" />
                  </div>
                </label>
              ))}
            </div>
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
