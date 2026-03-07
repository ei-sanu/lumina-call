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
import { motion } from "framer-motion";
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
        console.log('Initializing media and joining room...');
        await initializeMedia();
        mediaInitialized.current = true;

        // Join the room via socket
        socket.emit("join-room", {
          roomId: meetingId,
          userId,
          userName,
          isHost,
        });

        // Track participant in database
        await addMeetingParticipant(meetingId, userId, userName);

        console.log("Joined meeting room:", meetingId);
      } catch (err) {
        console.error("Error initializing:", err);
        toast({
          title: "Media Access Error",
          description: "Failed to access camera/microphone. Please check permissions.",
          variant: "destructive",
        });
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

  // Socket event listeners for chat and other features
  useEffect(() => {
    if (!socket) return;

    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on("hand-raised", (data: { userId: string; raised: boolean }) => {
      console.log("Hand raised:", data);
    });

    socket.on("host-muted-you", () => {
      toast({
        title: "You were muted",
        description: "The host has muted your microphone",
      });
    });

    socket.on("removed-by-host", () => {
      toast({
        title: "Removed from meeting",
        description: "You have been removed by the host",
        variant: "destructive",
      });
      handleLeaveMeeting();
    });

    socket.on("room-locked", () => {
      toast({
        title: "Room Locked",
        description: "This meeting room is currently locked",
        variant: "destructive",
      });
      navigate("/dashboard");
    });

    socket.on("meeting-ended-by-host", () => {
      toast({
        title: "Meeting Ended",
        description: "The host has ended the meeting for all participants",
        variant: "destructive",
      });
      if (meetingId) {
        updateParticipantLeftTime(meetingId, userId);
      }
      navigate("/dashboard");
    });

    socket.on("room-lock-changed", (data: { locked: boolean }) => {
      setRoomLocked(data.locked);
    });

    return () => {
      socket.off("chat-message");
      socket.off("hand-raised");
      socket.off("host-muted-you");
      socket.off("removed-by-host");
      socket.off("room-locked");
      socket.off("meeting-ended-by-host");
      socket.off("room-lock-changed");
    };
  }, [socket, meetingId, userId, navigate]);

  // Convert participants Map to array for display
  const participantArray = useMemo(() => {
    const arr: Participant[] = Array.from(participants.values());
    const hasCurrentUser = arr.some((p) => p.userId === userId);
    if (!hasCurrentUser && localStream) {
      arr.unshift({
        userId,
        userName,
        socketId: socket?.id || "",
        audioEnabled,
        videoEnabled,
        screenSharing: isScreenSharing,
        handRaised,
        isHost,
        stream: localStream,
      });
    }
    return arr;
  }, [participants, userId, userName, audioEnabled, videoEnabled, isScreenSharing, handRaised, localStream, isHost, socket]);

  const handleSendMessage = (message: string, recipientId?: string) => {
    if (socket && meetingId) {
      socket.emit("chat-message", {
        roomId: meetingId,
        message,
        userId,
        userName,
        recipientId,
      });
    }
  };

  const handleToggleHandRaise = () => {
    const newState = !handRaised;
    setHandRaised(newState);
    if (socket && meetingId) {
      socket.emit("raise-hand", {
        roomId: meetingId,
        userId,
        raised: newState,
      });
    }
  };

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const handleMuteParticipant = (targetUserId: string) => {
    if (socket && meetingId && isHost) {
      socket.emit("host-mute-participant", {
        roomId: meetingId,
        targetUserId,
        hostId: userId,
      });
    }
  };

  const handleRemoveParticipant = (targetUserId: string) => {
    if (socket && meetingId && isHost) {
      socket.emit("host-remove-participant", {
        roomId: meetingId,
        targetUserId,
        hostId: userId,
      });
    }
  };

  const handleToggleRoomLock = () => {
    if (socket && meetingId && isHost) {
      const newLockState = !roomLocked;
      setRoomLocked(newLockState);
      socket.emit("host-lock-room", {
        roomId: meetingId,
        locked: newLockState,
      });
      toast({
        title: newLockState ? "Room Locked" : "Room Unlocked",
        description: newLockState
          ? "New participants cannot join"
          : "Room is now open to new participants",
      });
    }
  };

  const handleMuteAll = () => {
    if (socket && meetingId && isHost) {
      socket.emit("host-mute-all", {
        roomId: meetingId,
        hostId: userId,
      });
      toast({
        title: "All Participants Muted",
        description: "All participants have been muted",
      });
    }
  };

  const handleLeaveMeeting = async () => {
    if (meetingId) {
      await updateParticipantLeftTime(meetingId, userId);
    }
    setShowLeftDialog(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleEndMeetingForAll = async () => {
    if (!isHost || !meetingId) return;

    try {
      await endMeeting(meetingId, userId);
      socket?.emit("end-meeting-for-all", { roomId: meetingId });
      toast({
        title: "Meeting Ended",
        description: "The meeting has been ended for all participants",
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error ending meeting:", err);
      toast({
        title: "Error",
        description: "Failed to end meeting",
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Meeting invite link copied to clipboard",
    });
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Code copied!",
      description: "Meeting invite code copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center">
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
          <div className="hero-vignette" />
        </div>
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 text-foreground/50 animate-spin mx-auto mb-4" />
          <p className="text-foreground text-lg font-display">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center">
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
          <div className="hero-vignette" />
        </div>
        <div className="text-center max-w-md relative z-10 glass-card p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl chrome-text-hero mb-2">UNABLE TO JOIN</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/dashboard")} className="bg-foreground text-background">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getGridCols = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count <= 4) return "grid-cols-1 sm:grid-cols-2";
    if (count <= 6) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (count <= 9) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
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

      {/* Navbar with meeting controls */}
      <Navbar
        meetingTitle={meetingTitle}
        inviteCode={inviteCode}
        participantCount={participantArray.length}
        isHost={isHost}
        layout={layout}
        onLayoutChange={setLayout}
        onCopyInviteCode={copyInviteCode}
        onCopyInviteLink={copyInviteLink}
        onEndMeeting={handleEndMeetingForAll}
        copied={copied}
      />

      {/* Video Grid - Properly sized layout */}
      <div className="fixed top-24 left-0 right-0 bottom-0 z-10 pb-44 sm:pb-48 px-3 sm:px-6 pt-3 sm:pt-4 overflow-hidden">
        {layout === 'grid' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={`h-full w-full grid gap-3 sm:gap-4 ${getGridCols(participantArray.length)} max-w-6xl mx-auto [&>*]:max-h-[280px] sm:[&>*]:max-h-[320px] lg:[&>*]:max-h-[350px]`}
            style={{ gridAutoRows: 'minmax(0, 1fr)' }}
          >
            {participantArray.map((participant) => (
              <VideoParticipant
                key={participant.userId}
                participant={participant}
                isLocal={participant.userId === userId}
                stream={participant.stream}
              />
            ))}
          </motion.div>
        )}

        {layout === 'spotlight' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-full flex flex-col gap-3 sm:gap-4 max-w-6xl mx-auto"
          >
            <div className="flex-1 min-h-0 max-h-[calc(100%-10rem)]">
              {participantArray[0] && (
                <VideoParticipant
                  key={participantArray[0].userId}
                  participant={participantArray[0]}
                  isLocal={participantArray[0].userId === userId}
                  stream={participantArray[0].stream}
                />
              )}
            </div>
            {participantArray.length > 1 && (
              <div className="h-28 sm:h-32 flex gap-3 overflow-x-auto pb-2">
                {participantArray.slice(1).map((participant) => (
                  <div key={participant.userId} className="w-36 sm:w-40 md:w-44 flex-shrink-0">
                    <VideoParticipant
                      participant={participant}
                      isLocal={participant.userId === userId}
                      stream={participant.stream}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {layout === 'sidebar' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-full flex gap-3 sm:gap-4 max-w-6xl mx-auto"
          >
            <div className="flex-1 min-h-0 max-h-full">
              {participantArray[0] && (
                <VideoParticipant
                  key={participantArray[0].userId}
                  participant={participantArray[0]}
                  isLocal={participantArray[0].userId === userId}
                  stream={participantArray[0].stream}
                />
              )}
            </div>
            {participantArray.length > 1 && (
              <div className="flex flex-col gap-3 overflow-y-auto w-52 sm:w-60 md:w-64 pr-2">
                {participantArray.slice(1).map((participant) => (
                  <div key={participant.userId} className="aspect-video flex-shrink-0">
                    <VideoParticipant
                      participant={participant}
                      isLocal={participant.userId === userId}
                      stream={participant.stream}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <MeetingControls
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        isScreenSharing={isScreenSharing}
        handRaised={handRaised}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleHandRaise={handleToggleHandRaise}
        onToggleChat={() => {
          setChatOpen(!chatOpen);
          setParticipantsOpen(false);
        }}
        onToggleParticipants={() => {
          setParticipantsOpen(!participantsOpen);
          setChatOpen(false);
        }}
        onLeaveMeeting={handleLeaveMeeting}
        participantCount={participantArray.length}
        isHost={isHost}
        onOpenHostControls={() => setHostControlsOpen(true)}
      />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        currentUserId={userId}
        participants={participantArray}
      />

      {/* Participants List */}
      <ParticipantsList
        isOpen={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        participants={participantArray}
        currentUserId={userId}
        isHost={isHost}
        onMuteParticipant={handleMuteParticipant}
        onRemoveParticipant={handleRemoveParticipant}
      />

      {/* Host Controls Panel */}
      <HostControlsPanel
        isOpen={hostControlsOpen}
        onClose={() => setHostControlsOpen(false)}
        participants={participantArray}
        roomLocked={roomLocked}
        onToggleRoomLock={handleToggleRoomLock}
        onMuteAll={handleMuteAll}
        onMuteParticipant={handleMuteParticipant}
        onRemoveParticipant={handleRemoveParticipant}
        currentUserId={userId}
      />

      {/* Left Meeting Dialog */}
      <AlertDialog open={showLeftDialog}>
        <AlertDialogContent className="glass border border-foreground/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl chrome-text-hero">MEETING LEFT</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              You have successfully left the meeting. Returning to dashboard...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => navigate("/dashboard")}
              className="bg-foreground text-background"
            >
              Go to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MeetingRoom;
