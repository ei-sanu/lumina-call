import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  LogOut, Menu,
  Plus,
  Settings,
  Video,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        navigate(`/meeting/${response.meeting.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex">
      {/* Navbar */}
      <Navbar />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900/90 backdrop-blur-lg border-r border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 p-6 border-b border-gray-700">
          <Video className="w-6 h-6 text-purple-500" />
          <span className="font-bold text-lg text-white">
            Lumina Call
          </span>
        </div>

        <nav className="p-4 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-purple-600 text-white font-medium"
          >
            <Video className="w-4 h-4" />
            Meetings
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-400 mb-1">Signed in as</p>
            <p className="text-white font-medium truncate">{user?.fullName || user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <header className="h-16 border-b border-gray-700/50 flex items-center justify-between px-6 sticky top-0 z-20 bg-gray-900/80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="font-semibold text-white">Dashboard</h2>
          </div>
        </header>

        <div className="p-6 space-y-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors cursor-pointer" onClick={handleInstantMeeting}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-600 rounded-lg">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">New Meeting</CardTitle>
                      <CardDescription className="text-gray-400">Start an instant meeting</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Dialog open={joinMeetingOpen} onOpenChange={setJoinMeetingOpen}>
                <DialogTrigger asChild>
                  <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-600 rounded-lg">
                          <LinkIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white">Join Meeting</CardTitle>
                          <CardDescription className="text-gray-400">Enter a meeting code</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Join Meeting</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter the meeting code to join
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="join-code" className="text-white">Meeting Code</Label>
                      <Input
                        id="join-code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="ABC123"
                        className="bg-gray-800 border-gray-700 text-white mt-2"
                        onKeyPress={(e) => e.key === 'Enter' && handleJoinMeeting()}
                      />
                    </div>
                    <Button
                      onClick={handleJoinMeeting}
                      disabled={isJoining}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isJoining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Join Meeting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={newMeetingOpen} onOpenChange={setNewMeetingOpen}>
                <DialogTrigger asChild>
                  <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-lg">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white">Schedule Meeting</CardTitle>
                          <CardDescription className="text-gray-400">Plan for later</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Meeting</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Set up a new meeting session
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-white">Meeting Title</Label>
                      <Input
                        id="title"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        placeholder="Team Standup"
                        className="bg-gray-800 border-gray-700 text-white mt-2"
                      />
                    </div>
                    <Button
                      onClick={handleCreateMeeting}
                      disabled={isCreating}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Create Meeting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Recent Meetings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Meetings</CardTitle>
                <CardDescription className="text-gray-400">Your meeting history</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMeetings ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                ) : recentMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No meetings yet</p>
                    <p className="text-sm mt-1">Start your first meeting above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentMeetings.slice(0, 5).map((meeting) => (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors group"
                      >
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{meeting.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(meeting.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Copy className="w-3 h-3" />
                              {meeting.invite_code}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyMeetingCode(meeting.invite_code)}
                            className="text-gray-400 hover:text-white"
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
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
