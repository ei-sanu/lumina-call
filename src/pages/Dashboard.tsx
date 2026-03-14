import silkBg from "@/assets/silk-bg.jpg";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createMeeting, getUserMeetings, joinMeetingByCode } from "@/lib/supabase";
import { Meeting } from "@/types/meeting";
import { useUser } from "@clerk/react";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  Copy,
  Link as LinkIcon,
  Loader2,
  LogOut,
  Plus,
  Settings,
  UserCircle,
  Video
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [joinMeetingOpen, setJoinMeetingOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserMeetings();
    }
  }, [user]);

  const loadUserMeetings = async () => {
    try {
      const response = await getUserMeetings(user?.id || "");
      if (response.success) {
        setRecentMeetings(response.meetings);
      }
    } catch (error) {
      console.error("Error loading meetings:", error);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a meeting",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await createMeeting(
        user.id,
        user.fullName || user.username || "User",
        meetingTitle || "Untitled Meeting"
      );

      if (response.success && response.meeting) {
        toast({
          title: "Meeting created!",
          description: `Meeting code: ${response.meeting.invite_code}`,
        });

        setNewMeetingOpen(false);
        setMeetingTitle("");
        setRecentMeetings((prev) => [response.meeting, ...prev.filter((m) => m.id !== response.meeting.id)]);

        navigate(`/meeting/${response.meeting.id}`);
      } else {
        throw new Error("Failed to create meeting");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!joinCode.trim()) {
      toast({
        title: "Enter a code",
        description: "Please enter a valid meeting code",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const response = await joinMeetingByCode(joinCode.trim());

      if (response.success && response.meeting) {
        toast({
          title: "Joining meeting...",
          description: `Joining "${response.meeting.title}"`,
        });

        setJoinMeetingOpen(false);
        setJoinCode("");

        navigate(`/meeting/${response.meeting.id}`);
      } else {
        toast({
          title: "Invalid code",
          description: "Meeting not found. Please check the code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast({
        title: "Error",
        description: "Failed to join meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleInstantMeeting = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to start a meeting",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsCreating(true);
    try {
      const response = await createMeeting(
        user.id,
        user.fullName || user.username || "User",
        "Instant Meeting"
      );

      if (response.success && response.meeting) {
        setRecentMeetings((prev) => [response.meeting, ...prev.filter((m) => m.id !== response.meeting.id)]);
        navigate(`/meeting/${response.meeting.id}`);
      } else {
        throw new Error("Failed to start meeting");
      }
    } catch (error) {
      console.error("Error creating instant meeting:", error);
      toast({
        title: "Error",
        description: "Failed to start meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyMeetingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: "Meeting code copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInHours < 48) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="min-h-screen relative isolate overflow-hidden">
      {/* Animated silk background - matching hero section */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-background hero-animated-bg">
        <motion.img
          src={silkBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover hero-silk-image"
          animate={{ scale: [1, 1.07, 1], x: [0, 12, -10, 0], y: [0, -8, 10, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="noise-bg" />
        <div className="hero-silk-layer" />
        <motion.div
          className="hero-shimmer-band"
          animate={{ x: ["-35%", "130%"] }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
        />
        <div className="hero-vignette" />

        <motion.div
          className="hero-blob hero-blob-1"
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className="hero-blob hero-blob-2"
          animate={{ x: [0, -35, 25, 0], y: [0, 25, -20, 0], scale: [1, 0.94, 1.05, 1] }}
          transition={{ duration: 24, ease: "easeInOut", repeat: Infinity }}
        />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 glass-card px-5 py-2.5 mb-6 text-sm text-muted-foreground rounded-full">
              <UserCircle className="w-4 h-4" />
              Signed in as {user?.fullName || user?.username}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight mb-4">
              <span className="chrome-text-hero block">YOUR MEETINGS</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Start an instant meeting, schedule for later, or join with a code
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid gap-4 md:grid-cols-3 mb-12"
          >
            {/* New Meeting */}
            <motion.button
              onClick={handleInstantMeeting}
              disabled={isCreating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-6 text-left hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 disabled:opacity-50"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-foreground/10 rounded-xl">
                  <Video className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">New Meeting</h3>
                  <p className="text-muted-foreground text-sm">Start an instant meeting</p>
                </div>
              </div>
              {isCreating && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </motion.button>

            {/* Join Meeting */}
            <Dialog open={joinMeetingOpen} onOpenChange={setJoinMeetingOpen}>
              <DialogTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-6 text-left hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-foreground/10 rounded-xl">
                      <LinkIcon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Join Meeting</h3>
                      <p className="text-muted-foreground text-sm">Enter a meeting code</p>
                    </div>
                  </div>
                </motion.button>
              </DialogTrigger>
              <DialogContent className="glass border border-foreground/10">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl chrome-text-hero">JOIN MEETING</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Enter the meeting code to join
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="join-code" className="text-foreground text-sm uppercase tracking-wide mb-2 block">Meeting Code</Label>
                    <Input
                      id="join-code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      className="bg-background/50 border-foreground/20 text-foreground h-12 text-lg font-mono"
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinMeeting()}
                    />
                  </div>
                  <Button
                    onClick={handleJoinMeeting}
                    disabled={isJoining}
                    className="w-full bg-foreground text-background hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] h-12 font-semibold"
                  >
                    {isJoining && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Join Meeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Schedule Meeting */}
            <Dialog open={newMeetingOpen} onOpenChange={setNewMeetingOpen}>
              <DialogTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-6 text-left hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-foreground/10 rounded-xl">
                      <Plus className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">Schedule Meeting</h3>
                      <p className="text-muted-foreground text-sm">Plan for later</p>
                    </div>
                  </div>
                </motion.button>
              </DialogTrigger>
              <DialogContent className="glass border border-foreground/10">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl chrome-text-hero">CREATE MEETING</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Set up a new meeting session
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-foreground text-sm uppercase tracking-wide mb-2 block">Meeting Title</Label>
                    <Input
                      id="title"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      placeholder="Team Standup"
                      className="bg-background/50 border-foreground/20 text-foreground h-12"
                    />
                  </div>
                  <Button
                    onClick={handleCreateMeeting}
                    disabled={isCreating}
                    className="w-full bg-foreground text-background hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] h-12 font-semibold"
                  >
                    {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Create Meeting
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Recent Meetings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="mb-6">
              <h2 className="font-display text-2xl chrome-text-hero mb-1">RECENT MEETINGS</h2>
              <p className="text-muted-foreground text-sm">Your meeting history</p>
            </div>

            {loadingMeetings ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-foreground/50 animate-spin" />
              </div>
            ) : recentMeetings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-1">No meetings yet</p>
                <p className="text-sm">Start your first meeting above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMeetings.slice(0, 5).map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-background/30 border border-foreground/5 hover:border-foreground/20 hover:bg-background/50 transition-all group"
                  >
                    <div className="flex-1">
                      <h4 className="text-foreground font-semibold text-lg">{meeting.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(meeting.created_at)}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono">
                          <Copy className="w-3.5 h-3.5" />
                          {meeting.invite_code}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMeetingCode(meeting.invite_code)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedCode === meeting.invite_code ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      {meeting.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/meeting/${meeting.id}`)}
                          className="bg-foreground text-background hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="grid gap-4 md:grid-cols-2 mt-8"
          >
            <Link to="/settings">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-card p-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground font-medium">Settings</span>
                </div>
              </motion.div>
            </Link>
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-card p-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground font-medium">Back to Home</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
