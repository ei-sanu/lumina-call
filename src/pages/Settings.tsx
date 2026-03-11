import { useSession, useUser } from "@clerk/react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Camera, Lock, MapPin, Monitor, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { user } = useUser();
  const { session } = useSession();
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);
  const [privacy1, setPrivacy1] = useState(true);
  const [privacy2, setPrivacy2] = useState(false);
  const [privacy3, setPrivacy3] = useState(true);

  // Device information state
  const [deviceInfo, setDeviceInfo] = useState({
    ipAddress: "Loading...",
    browser: "Loading...",
    platform: "Loading...",
    deviceType: "Loading...",
  });

  useEffect(() => {
    // Get browser and platform info from navigator
    const getBrowserInfo = () => {
      const ua = navigator.userAgent;
      let browserName = "Unknown";
      let browserVersion = "";

      if (ua.indexOf("Firefox") > -1) {
        browserName = "Firefox";
        browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || "";
      } else if (ua.indexOf("Chrome") > -1 && ua.indexOf("Edg") === -1) {
        browserName = "Chrome";
        browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || "";
      } else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) {
        browserName = "Safari";
        browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || "";
      } else if (ua.indexOf("Edg") > -1) {
        browserName = "Edge";
        browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || "";
      }

      return `${browserName}${browserVersion ? ` ${browserVersion}` : ""}`;
    };

    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "Tablet";
      }
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "Mobile";
      }
      return "Desktop";
    };

    const getPlatform = () => {
      const platform = navigator.platform;
      const ua = navigator.userAgent;

      if (platform.indexOf("Win") > -1) return "Windows";
      if (platform.indexOf("Mac") > -1) return "macOS";
      if (platform.indexOf("Linux") > -1) return "Linux";
      if (/Android/.test(ua)) return "Android";
      if (/iPhone|iPad|iPod/.test(ua)) return "iOS";

      return platform || "Unknown";
    };

    // Fetch IP address
    const fetchIPAddress = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error("Error fetching IP:", error);
        return "Unable to fetch";
      }
    };

    // Update device info
    const updateDeviceInfo = async () => {
      const ip = await fetchIPAddress();
      setDeviceInfo({
        ipAddress: ip,
        browser: getBrowserInfo(),
        platform: getPlatform(),
        deviceType: getDeviceType(),
      });
    };

    updateDeviceInfo();
  }, []);

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
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Device & Session Information */}
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Monitor className="w-5 h-5 text-purple-500" />
              Device & Session Information
            </h3>

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  IP Address
                </label>
                <div className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm">{deviceInfo.ipAddress}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  Device Type
                </label>
                <div className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm capitalize">{deviceInfo.deviceType}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Browser & Platform</label>
                <div className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm">{deviceInfo.browser}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Platform: {deviceInfo.platform}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Session Status</label>
                <div className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${session?.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <p className="text-sm capitalize">{session?.status || "Unknown"}</p>
                  </div>
                  {session?.lastActiveAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: {new Date(session.lastActiveAt).toLocaleString()}
                    </p>
                  )}
                </div>
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
                  className={`w-11 h-6 rounded-full transition-colors relative ${notif1 ? "bg-purple-500" : "bg-border"
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notif1 ? "translate-x-6" : "translate-x-1"
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
                  className={`w-11 h-6 rounded-full transition-colors relative ${notif2 ? "bg-purple-500" : "bg-border"
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notif2 ? "translate-x-6" : "translate-x-1"
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
                  className={`w-11 h-6 rounded-full transition-colors relative ${notif3 ? "bg-purple-500" : "bg-border"
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notif3 ? "translate-x-6" : "translate-x-1"
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
                  className={`w-11 h-6 rounded-full transition-colors relative ${privacy1 ? "bg-purple-500" : "bg-border"
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${privacy1 ? "translate-x-6" : "translate-x-1"
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
                  className={`w-11 h-6 rounded-full transition-colors relative ${privacy2 ? "bg-purple-500" : "bg-border"
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${privacy2 ? "translate-x-6" : "translate-x-1"
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
                  className={`w-11 h-6 rounded-full transition-colors relative ${privacy3 ? "bg-purple-500" : "bg-border"
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${privacy3 ? "translate-x-6" : "translate-x-1"
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
