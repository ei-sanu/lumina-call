import silkBg from "@/assets/silk-bg.jpg";
import { ChatPanel } from "@/components/meeting/ChatPanel";
import { HostControlsPanel } from "@/components/meeting/HostControlsPanel";
import { MeetingControls } from "@/components/meeting/MeetingControls";
import { ParticipantsList } from "@/components/meeting/ParticipantsList";
import { VideoParticipant } from "@/components/meeting/VideoParticipant";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";
import { useWebRTC } from "@/hooks/use-webrtc";
import { addMeetingParticipant, endMeeting, getMeeting, updateParticipantLeftTime } from "@/lib/supabase";
import { ChatMessage, Participant } from "@/types/meeting";
import { useUser } from "@clerk/react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MeetingRoom = () => {
  const navigate = useNavigate();
  const { id: meetingId } = useParams<{ id: string }>();
  const { user } = useUser();
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [handRaised, setHandRaised] = useState(false);
  const [showLeftDialog, setShowLeftDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'spotlight' | 'sidebar'>('grid');
  const [hostControlsOpen, setHostControlsOpen] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);

  const mediaInitialized = useRef(false);

  const userId = user?.id || "guest";
  const userName = user?.fullName || user?.username || "Guest User";

  const {
    localStream,
    screenStream,
    participants,
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    initializeMedia,
    toggleAudio,
    forceMuteAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup,
  } = useWebRTC(socket, meetingId || "", userId, userName);

  // Load meeting details
  useEffect(() => {
    const loadMeeting = async () => {
      if (!meetingId) {
        setError("Invalid meeting ID");
        setIsLoading(false);
        return;
      }
      try {
        const response = await getMeeting(meetingId);
        if (response.success && response.meeting) {
          setMeetingTitle(response.meeting.title);
          setIsHost(response.meeting.host_id === userId);
          setInviteCode(response.meeting.invite_code);
        } else {
          setError("Meeting not found");
        }
      } catch (err) {
        console.error("Error loading meeting:", err);
        setError("Failed to load meeting");
      } finally {
        setIsLoading(false);
      }
    };
    loadMeeting();
  }, [meetingId, userId]);

  // Initialize media and join room
  useEffect(() => {
    const init = async () => {
      if (!socket || !isConnected || !meetingId || isLoading || mediaInitialized.current) return;
      try {
        await initializeMedia();
        mediaInitialized.current = true;
        socket.emit("join-room", { roomId: meetingId, userId, userName, isHost });
        await addMeetingParticipant(meetingId, userId, userName);
      } catch (err) {
        console.error("Error initializing:", err);
        toast({ title: "Media Access Error", description: "Failed to access camera/microphone.", variant: "destructive" });
      }
    };
    init();
    return () => {
      if (socket && meetingId && mediaInitialized.current) {
        socket.emit("leave-room");
        updateParticipantLeftTime(meetingId, userId);
      }
      cleanup();
      mediaInitialized.current = false;
    };
  }, [socket, isConnected, meetingId, isLoading, initializeMedia, userId, userName, isHost, toast, cleanup]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;
    socket.on("chat-message", (message: ChatMessage) => setChatMessages((prev) => [...prev, message]));
    socket.on("host-muted-you", () => {
      toast({ title: "You were muted", description: "The host has muted your microphone" });
      forceMuteAudio();
    });
    socket.on("removed-by-host", () => {
      toast({ title: "Removed from meeting", description: "You have been removed by the host", variant: "destructive" });
      handleLeaveMeeting();
    });
    socket.on("meeting-ended-by-host", () => {
      toast({ title: "Meeting Ended", description: "The host has ended the meeting", variant: "destructive" });
      if (meetingId) updateParticipantLeftTime(meetingId, userId);
      navigate("/dashboard");
    });
    socket.on("room-lock-changed", (data: { locked: boolean }) => setRoomLocked(data.locked));

    return () => {
      socket.off("chat-message");
      socket.off("host-muted-you");
      socket.off("removed-by-host");
      socket.off("meeting-ended-by-host");
      socket.off("room-lock-changed");
    };
  }, [socket, meetingId, userId, navigate, forceMuteAudio]);

  const participantArray = useMemo(() => {
    const arr: Participant[] = Array.from(participants.values());
    const hasCurrentUser = arr.some((p) => p.userId === userId);
    if (!hasCurrentUser && localStream) {
      arr.unshift({
        userId, userName, socketId: socket?.id || "",
        audioEnabled, videoEnabled, screenSharing: isScreenSharing,
        handRaised, isHost, stream: isScreenSharing ? screenStream! : localStream,
      });
    }
    return arr;
  }, [participants, userId, userName, audioEnabled, videoEnabled, isScreenSharing, handRaised, localStream, screenStream, isHost, socket]);

  // Determine if someone is screen sharing
  const screenSharingParticipant = useMemo(() => {
    return participantArray.find(p => p.screenSharing);
  }, [participantArray]);

  const handleToggleScreenShare = () => {
    if (isScreenSharing) stopScreenShare();
    else startScreenShare();
  };

  const handleLeaveMeeting = async () => {
    if (meetingId) await updateParticipantLeftTime(meetingId, userId);
    setShowLeftDialog(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Code copied!" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex flex-col relative">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img src={silkBg} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
      </div>

      <Navbar
        meetingTitle={meetingTitle}
        inviteCode={inviteCode}
        participantCount={participantArray.length}
        isHost={isHost}
        layout={layout}
        onLayoutChange={setLayout}
        onCopyInviteCode={copyInviteCode}
        onCopyInviteLink={copyInviteLink}
        onEndMeeting={handleLeaveMeeting}
        copied={copied}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 px-4 pt-20 pb-32 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          {screenSharingParticipant ? (
            <motion.div 
              key="sharing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full flex gap-4 max-w-[1600px]"
            >
              {/* Main Screen Share View */}
              <div className="flex-[3] min-w-0">
                <VideoParticipant
                  participant={screenSharingParticipant}
                  isLocal={screenSharingParticipant.userId === userId}
                  stream={screenSharingParticipant.stream}
                />
              </div>
              {/* Sidebar for others */}
              <div className="flex-1 hidden lg:flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {participantArray.filter(p => p.userId !== screenSharingParticipant.userId).map(p => (
                  <div key={p.userId} className="aspect-video shrink-0">
                    <VideoParticipant participant={p} isLocal={p.userId === userId} stream={p.stream} />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`w-full h-full max-w-7xl mx-auto grid gap-4 p-4 ${
                participantArray.length === 1 ? 'grid-cols-1 max-w-4xl' : 
                participantArray.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {participantArray.map((p) => (
                <VideoParticipant key={p.userId} participant={p} isLocal={p.userId === userId} stream={p.stream} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MeetingControls
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        isScreenSharing={isScreenSharing}
        handRaised={handRaised}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleHandRaise={() => setHandRaised(!handRaised)}
        onToggleChat={() => { setChatOpen(!chatOpen); setParticipantsOpen(false); }}
        onToggleParticipants={() => { setParticipantsOpen(!participantsOpen); setChatOpen(false); }}
        onLeaveMeeting={handleLeaveMeeting}
        participantCount={participantArray.length}
        isHost={isHost}
        onOpenHostControls={() => setHostControlsOpen(true)}
      />

      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        onSendMessage={(msg, recId) => socket?.emit("chat-message", { roomId: meetingId, message: msg, userId, userName, recipientId: recId })}
        currentUserId={userId}
        participants={participantArray}
      />

      <ParticipantsList
        isOpen={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        participants={participantArray}
        currentUserId={userId}
        isHost={isHost}
        onMuteParticipant={(id) => socket?.emit("host-mute-participant", { roomId: meetingId, targetUserId: id, hostId: userId })}
        onRemoveParticipant={(id) => socket?.emit("host-remove-participant", { roomId: meetingId, targetUserId: id, hostId: userId })}
      />

      <AlertDialog open={showLeftDialog}>
        <AlertDialogContent className="bg-black/90 border-white/10 backdrop-blur-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-bold text-2xl">Meeting Left</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Returning to your dashboard...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MeetingRoom;
