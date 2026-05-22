import silkBg from "@/assets/silk-bg.jpg";
import { ChatPanel } from "@/components/meeting/ChatPanel";
import { HostControlsPanel } from "@/components/meeting/HostControlsPanel";
import { MeetingControls } from "@/components/meeting/MeetingControls";
import { ParticipantsList } from "@/components/meeting/ParticipantsList";
import { VideoParticipant } from "@/components/meeting/VideoParticipant";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";
import { useWebRTC } from "@/hooks/use-webrtc";
import { addMeetingParticipant, getMeeting, updateParticipantLeftTime } from "@/lib/supabase";
import { ChatMessage, Participant } from "@/types/meeting";
import { useUser } from "@clerk/react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MeetingRoom = () => {
  const navigate = useNavigate();
  const { id: meetingId } = useParams<{ id: string }>();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
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

  const handleLeaveMeeting = useCallback(async () => {
    if (meetingId) await updateParticipantLeftTime(meetingId, userId);
    setShowLeftDialog(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  }, [meetingId, userId, navigate]);

  // Handle Join Room Logic (Auto-rejoin on reconnect)
  const joinRoomAction = useCallback(() => {
    if (!socket || !meetingId) return;
    socket.emit("join-room", { roomId: meetingId, userId, userName, isHost });
  }, [socket, meetingId, userId, userName, isHost]);

  // Load meeting details
  useEffect(() => {
    const loadMeeting = async () => {
      if (!isUserLoaded) return;
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
  }, [meetingId, userId, isUserLoaded]);

  // Preview Media initialization
  useEffect(() => {
    const init = async () => {
      if (!socket || !isConnected || !meetingId || isLoading || mediaInitialized.current) return;
      try {
        await initializeMedia();
        mediaInitialized.current = true;
      } catch (err) {
        console.error("Error initializing preview:", err);
      }
    };
    init();
  }, [socket, isConnected, meetingId, isLoading, initializeMedia]);

  // Re-join room on socket reconnection
  useEffect(() => {
    if (isConnected && hasJoined) {
      joinRoomAction();
    }
  }, [isConnected, hasJoined, joinRoomAction]);

  const handleJoinMeeting = async () => {
    if (!socket || !meetingId) return;
    try {
      joinRoomAction();
      await addMeetingParticipant(meetingId, userId, userName);
      setHasJoined(true);
      toast({ title: "Joined Meeting", description: `You are now in ${meetingTitle}` });
    } catch (err) {
      console.error("Error joining:", err);
      toast({ title: "Join Error", description: "Failed to join the meeting room.", variant: "destructive" });
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !hasJoined) return;
    
    socket.on("chat-message", (message: ChatMessage) => setChatMessages((prev) => [...prev, message]));
    socket.on("host-muted-you", () => {
      toast({ title: "You were muted", description: "The host has muted your microphone" });
      forceMuteAudio();
    });
    socket.on("removed-by-host", () => {
      toast({ title: "Removed", description: "You have been removed by the host", variant: "destructive" });
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
  }, [socket, hasJoined, meetingId, userId, navigate, forceMuteAudio, toast, handleLeaveMeeting]);

  // Lifecycle cleanup
  useEffect(() => {
    return () => {
      if (socket && meetingId && hasJoined) {
        socket.emit("leave-room");
        updateParticipantLeftTime(meetingId, userId);
      }
      cleanup();
      mediaInitialized.current = false;
    };
  }, [socket, meetingId, hasJoined, cleanup]);

  // Participant array derivation (with blank screen fix)
  const participantArray = useMemo(() => {
    const arr: Participant[] = Array.from(participants.values());
    
    // Always ensure current user is in the list if they have joined, 
    // even if localStream is still loading (to avoid blank screen)
    if (hasJoined && !arr.some(p => p.userId === userId)) {
        arr.unshift({
            userId, 
            userName, 
            socketId: socket?.id || "local",
            audioEnabled, 
            videoEnabled, 
            screenSharing: isScreenSharing,
            handRaised, 
            isHost, 
            stream: isScreenSharing ? screenStream! : (localStream || undefined),
        });
    }
    return arr;
  }, [participants, userId, userName, audioEnabled, videoEnabled, isScreenSharing, handRaised, localStream, screenStream, isHost, socket, hasJoined]);

  const screenSharingParticipant = useMemo(() => {
    return participantArray.find(p => p.screenSharing);
  }, [participantArray]);

  const handleToggleScreenShare = () => {
    if (isScreenSharing) stopScreenShare();
    else startScreenShare();
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

  if (isLoading || !isUserLoaded) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <VideoOff className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Meeting Error</h1>
        <p className="text-gray-400 mb-8 max-w-md">{error}</p>
        <Button onClick={() => navigate("/dashboard")} className="bg-white text-black hover:bg-gray-200">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // LOBBY SCREEN
  if (!hasJoined) {
    return (
      <div className="h-screen w-screen bg-[#050505] overflow-hidden flex flex-col items-center justify-center relative p-4">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img src={silkBg} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center"
        >
          <div className="flex-1 w-full aspect-video max-w-2xl rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl relative group">
            {videoEnabled && localStream ? (
              <video 
                autoPlay 
                muted 
                playsInline 
                ref={(el) => { if (el) el.srcObject = localStream; }}
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 mb-4">
                  <VideoOff className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Camera is disabled</p>
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
              <Button 
                onClick={toggleAudio}
                size="icon"
                className={`w-12 h-12 rounded-full transition-all border shadow-lg ${audioEnabled ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-red-500 border-red-400 hover:bg-red-600'}`}
              >
                {audioEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
              </Button>
              <Button 
                onClick={toggleVideo}
                size="icon"
                className={`w-12 h-12 rounded-full transition-all border shadow-lg ${videoEnabled ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-red-500 border-red-400 hover:bg-red-600'}`}
              >
                {videoEnabled ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-96 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight tracking-tight">Ready to join?</h1>
            <p className="text-purple-400 font-bold mb-8 uppercase tracking-widest text-[10px] bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">{meetingTitle || "Untitled Meeting"}</p>
            
            <div className="space-y-4 w-full">
              <Button 
                onClick={handleJoinMeeting}
                className="w-full h-16 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-2xl shadow-purple-600/30 text-lg flex items-center justify-center gap-3"
              >
                Join Now
                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                   →
                </motion.div>
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="w-full text-white/50 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]"
              >
                Cancel and return
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex flex-col relative">
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

      <main className="flex-1 relative z-10 px-4 pt-20 pb-32 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          {screenSharingParticipant ? (
            <motion.div 
              key="sharing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full h-full flex flex-col lg:flex-row gap-4 max-w-[1600px] p-2 sm:p-4"
            >
              <div className="flex-[3] min-w-0 h-full">
                <VideoParticipant
                  participant={screenSharingParticipant}
                  isLocal={screenSharingParticipant.userId === userId}
                  stream={screenSharingParticipant.stream}
                />
              </div>
              <div className="flex-1 lg:max-w-xs flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 pr-2 custom-scrollbar">
                {participantArray.filter(p => p.userId !== screenSharingParticipant.userId).map(p => (
                  <div key={p.userId} className="aspect-video shrink-0 w-48 sm:w-64 lg:w-full">
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
              className={`w-full h-full max-w-7xl mx-auto grid gap-3 sm:gap-6 p-2 sm:p-6 content-center ${
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
        <AlertDialogContent className="bg-black/90 border-white/10 backdrop-blur-2xl rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-bold text-2xl tracking-tight">Meeting Left</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 font-medium">
              Your session has ended. Returning to dashboard...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MeetingRoom;
