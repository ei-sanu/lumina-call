import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Clock, Users, Settings, LogOut,
  Calendar, BarChart3, ChevronRight, Copy, Menu, X, Video
} from "lucide-react";

const recentMeetings = [
  { id: 1, title: "Design Review", participants: 5, duration: "45 min", date: "Today, 2:00 PM" },
  { id: 2, title: "Sprint Planning", participants: 8, duration: "1h 20min", date: "Yesterday, 10:00 AM" },
  { id: 3, title: "Client Sync", participants: 3, duration: "30 min", date: "Mar 5, 3:30 PM" },
  { id: 4, title: "Team Standup", participants: 6, duration: "15 min", date: "Mar 4, 9:00 AM" },
];

const stats = [
  { label: "Meetings This Week", value: "12", icon: Calendar },
  { label: "Total Minutes", value: "840", icon: Clock },
  { label: "Participants", value: "47", icon: Users },
  { label: "Avg Duration", value: "35m", icon: BarChart3 },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border/50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 p-6 border-b border-border/50">
          <span className="font-display font-bold text-lg tracking-wide text-foreground">
            NOVA<span className="text-muted-foreground italic">ARC</span>
          </span>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { icon: BarChart3, label: "Dashboard", href: "/dashboard", active: true },
            { icon: Calendar, label: "Meetings", href: "/dashboard" },
            { icon: Users, label: "Contacts", href: "/dashboard" },
            { icon: Settings, label: "Settings", href: "/settings" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors duration-300 ${
                item.active
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-20 bg-background/80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="font-display font-semibold text-foreground">Dashboard</h2>
          </div>
          <Link to="/settings">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border/50">
              <span className="text-xs text-muted-foreground font-medium">AM</span>
            </div>
          </Link>
        </header>

        <div className="p-6 space-y-8">
          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button onClick={() => navigate("/meeting/new")} className="gradient-button px-6 py-3.5 rounded-xl text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Meeting
            </button>
            <button className="ghost-button flex items-center gap-2 text-sm">
              <Copy className="w-4 h-4" /> Join with Code
            </button>
            <button className="ghost-button flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" /> Schedule
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card border border-border/50 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Recent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-4">Recent Meetings</h3>
            <div className="space-y-2">
              {recentMeetings.map((m) => (
                <div
                  key={m.id}
                  className="bg-card border border-border/50 p-4 rounded-xl flex items-center justify-between hover:border-foreground/10 transition-colors duration-300 cursor-pointer"
                  onClick={() => navigate("/meeting/new")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                      <Video className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.date} · {m.participants} participants · {m.duration}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
