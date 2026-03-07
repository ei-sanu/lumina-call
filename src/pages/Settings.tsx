import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Bell, Volume2, Shield, User, Mail, Lock } from "lucide-react";
import { useUser } from "@clerk/react";

const Settings = () => {
  const { user } = useUser();
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);
  const [privacy1, setPrivacy1] = useState(true);
  const [privacy2, setPrivacy2] = useState(false);
  const [privacy3, setPrivacy3] = useState(true);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients matching home page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="text-4xl font-bold chrome-text-hero">Settings</h1>

          {/* Profile Section */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl font-bold text-purple-500">
                {user?.firstName?.[0] || user?.username?.[0] || "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.fullName || user?.username}</h2>
                <p className="text-muted-foreground text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.fullName || ""}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Managed by Clerk authentication</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Managed by Clerk authentication</p>
              </div>
            </div>
          </div>

          {/* Audio/Video Settings */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-500" />
              Audio & Video
            </h3>
            
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Camera</label>
                <select className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <option>Default Camera</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Microphone</label>
                <select className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <option>Default Microphone</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Speaker</label>
                <select className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <option>Default Speaker</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-500" />
              Notifications
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Meeting Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified before meetings start</p>
                </div>
                <button
                  onClick={() => setNotif1(!notif1)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    notif1 ? "bg-purple-500" : "bg-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notif1 ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chat Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                </div>
                <button
                  onClick={() => setNotif2(!notif2)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    notif2 ? "bg-purple-500" : "bg-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notif2 ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Summaries</p>
                  <p className="text-sm text-muted-foreground">Weekly summary of your meetings</p>
                </div>
                <button
                  onClick={() => setNotif3(!notif3)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    notif3 ? "bg-purple-500" : "bg-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notif3 ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Privacy & Security
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">End-to-End Encryption</p>
                  <p className="text-sm text-muted-foreground">Encrypt all your meetings</p>
                </div>
                <button
                  onClick={() => setPrivacy1(!privacy1)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    privacy1 ? "bg-purple-500" : "bg-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      privacy1 ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add extra layer of security</p>
                </div>
                <button
                  onClick={() => setPrivacy2(!privacy2)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    privacy2 ? "bg-purple-500" : "bg-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      privacy2 ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                </div>
                <button
                  onClick={() => setPrivacy3(!privacy3)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    privacy3 ? "bg-purple-500" : "bg-border"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      privacy3 ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Terms Link */}
            <div className="pt-4 border-t border-border/50">
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
              >
                <Lock className="w-3 h-3 group-hover:text-purple-500 transition-colors" />
                View Terms & Privacy Policy →
              </Link>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="gradient-button px-8 py-3 rounded-xl text-sm font-medium">
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
