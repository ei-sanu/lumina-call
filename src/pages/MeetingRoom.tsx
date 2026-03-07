import { ChatPanel } from "@/components/meeting/ChatPanel";
import { HostControlsPanel } from "@/components/meeting/HostControlsPanel";
import { MeetingControls } from "@/components/meeting/MeetingControls";
import { ParticipantsList } from "@/components/meeting/ParticipantsList";
import { VideoParticipant } from "@/components/meeting/VideoParticipant";
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
import { AlertCircle, Check, Copy, Grid, Loader2, Monitor, Sidebar as SidebarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
      if (!socket || !isConnected || !meetingId || isLoading) return;

      try {
        await initializeMedia();

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
      if (socket && meetingId) {
        socket.emit("leave-room");
        updateParticipantLeftTime(meetingId, userId);
      }
      cleanup();
    };
  }, [socket, isConnected, meetingId, isLoading]);

  // Socket event listeners for chat and other features
  useEffect(() => {
    if (!socket) return;

    socket.on("chat-message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on("hand-raised", (data: { userId: string; raised: boolean }) => {
      // Handle other participants raising hand (could show notification)
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

    return () => {
      socket.off("chat-message");
      socket.off("hand-raised");
      socket.off("host-muted-you");
      socket.off("removed-by-host");
      socket.off("room-locked");
      socket.off("meeting-ended-by-host");
    };
  }, [socket]);

  // Convert participants Map to array for display
  const participantArray = useMemo(() => {
    const arr: Participant[] = Array.from(participants.values());
    // Add current user if not in list
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
  }, [participants, userId, userName, audioEnabled, videoEnabled, isScreenSharing, handRaised, localStream, isHost]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Unable to Join Meeting</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Calculate grid layout based on number of participants
  const getGridCols = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Background Gradient Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {meetingTitle}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={copyInviteCode}
                className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white hover:bg-white/20 flex items-center gap-2 transition-all"
              >
                <span className="font-mono">{inviteCode}</span>
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={copyInviteLink}
                className="text-sm text-gray-300 hover:text-white transition-colors underline decoration-dotted"
              >
                Share invite link
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
              <button
                onClick={() => setLayout('grid')}
                className={`p-2 rounded transition-all ${layout === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('spotlight')}
                className={`p-2 rounded transition-all ${layout === 'spotlight' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                title="Spotlight View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('sidebar')}
                className={`p-2 rounded transition-all ${layout === 'sidebar' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                title="Sidebar View"
              >
                <SidebarIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">
                {participantArray.length} in call
              </span>
            </div>
            {isHost && (
              <Button
                onClick={handleEndMeetingForAll}
                variant="destructive"
                size="sm"
                className="bg-red-500/80 hover:bg-red-600 backdrop-blur-sm"
              >
                End for All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Video Grid - Different Layouts */}
      <div className="h-screen pt-20 pb-32 px-6">
        {layout === 'grid' && (
          <div
            className={`h-full grid gap-4 ${getGridCols(
              participantArray.length
            )} auto-rows-fr max-w-7xl mx-auto`}
          >
            {participantArray.map((participant) => (
              <VideoParticipant
                key={participant.userId}
                participant={participant}
                isLocal={participant.userId === userId}
                stream={participant.stream}
              />
            ))}
          </div>
        )}

        {layout === 'spotlight' && (
          <div className="h-full flex flex-col gap-4 max-w-7xl mx-auto">
            {/* Main spotlight participant */}
            <div className="flex-1">
              {participantArray[0] && (
                <VideoParticipant
                  key={participantArray[0].userId}
                  participant={participantArray[0]}
                  isLocal={participantArray[0].userId === userId}
                  stream={participantArray[0].stream}
                />
              )}
            </div>
            {/* Thumbnail row */}
            {participantArray.length > 1 && (
              <div className="h-32 flex gap-2 overflow-x-auto pb-2">
                {participantArray.slice(1).map((participant) => (
                  <div key={participant.userId} className="w-40 flex-shrink-0">
                    <VideoParticipant
                      participant={participant}
                      isLocal={participant.userId === userId}
                      stream={participant.stream}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {layout === 'sidebar' && (
          <div className="h-full flex gap-4 max-w-7xl mx-auto">
            {/* Main view */}
            <div className="flex-1">
              {participantArray[0] && (
                <VideoParticipant
                  key={participantArray[0].userId}
                  participant={participantArray[0]}
                  isLocal={participantArray[0].userId === userId}
                  stream={participantArray[0].stream}
                />
              )}
            </div>
            {/* Sidebar */}
            {participantArray.length > 1 && (
              <div className="w-64 flex flex-col gap-2 overflow-y-auto">
                {participantArray.slice(1).map((participant) => (
                  <div key={participant.userId} className="aspect-video">
                    <VideoParticipant
                      participant={participant}
                      isLocal={participant.userId === userId}
                      stream={participant.stream}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You left the meeting</AlertDialogTitle>
            <AlertDialogDescription>
              You have successfully left the meeting. Returning to dashboard...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MeetingRoom;
