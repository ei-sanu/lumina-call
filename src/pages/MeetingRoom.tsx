import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, VideoIcon, VideoOff, Monitor,
  MessageSquare, Users, Phone, MoreVertical,
  Send, X, Info, Hand, Smile
} from "lucide-react";

const mockParticipants = [
  { id: 1, name: "You", initials: "AM", muted: false, videoOn: true },
  { id: 2, name: "Priya Sharma", initials: "PS", muted: true, videoOn: true },
  { id: 3, name: "Ravi Kapoor", initials: "RK", muted: false, videoOn: false },
  { id: 4, name: "Neha Gupta", initials: "NG", muted: true, videoOn: true },
  { id: 5, name: "Aditya Rao", initials: "AR", muted: false, videoOn: true },
  { id: 6, name: "Meera Joshi", initials: "MJ", muted: true, videoOn: false },
];

const mockMessages = [
  { id: 1, sender: "Sarah Chen", text: "Can everyone see my screen?", time: "2:05 PM" },
  { id: 2, sender: "Mike Peters", text: "Yes, looks great!", time: "2:05 PM" },
  { id: 3, sender: "Lisa Wong", text: "Could you zoom in on the chart?", time: "2:06 PM" },
];

const MeetingRoom = () => {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      sender: "You",
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatMessage("");
  };

  const closePanels = () => { setChatOpen(false); setParticipantsOpen(false); setInfoOpen(false); };

  const togglePanel = (panel: "chat" | "participants" | "info") => {
    setChatOpen(panel === "chat" ? !chatOpen : false);
    setParticipantsOpen(panel === "participants" ? !participantsOpen : false);
    setInfoOpen(panel === "info" ? !infoOpen : false);
  };

  const anyPanelOpen = chatOpen || participantsOpen || infoOpen;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-12 border-b border-border/50 flex items-center justify-between px-4 flex-shrink-0 bg-card">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">Design Review</span>
          <span className="text-xs text-muted-foreground font-mono">45:32</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => togglePanel("info")}
            className={`p-2 rounded-lg transition-colors duration-200 ${infoOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Info className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-2">
          <div className={`grid gap-2 h-full ${
            mockParticipants.length <= 2 ? "grid-cols-1 md:grid-cols-2" :
            mockParticipants.length <= 4 ? "grid-cols-2" :
            "grid-cols-2 lg:grid-cols-3"
          }`}>
            {mockParticipants.map((p) => (
              <motion.div
                key={p.id}
                layout
                className="bg-card rounded-xl border border-border/30 relative flex items-center justify-center min-h-[100px] overflow-hidden group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent flex items-center justify-center border border-border/50">
                  <span className="text-lg md:text-xl font-display font-semibold text-foreground">{p.initials}</span>
                </div>
                {/* Name tag */}
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-border/30">
                  {p.muted && <MicOff className="w-3 h-3 text-destructive" />}
                  <span className="text-xs text-foreground">{p.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Side panels */}
        <AnimatePresence>
          {anyPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-l border-border/50 bg-card flex flex-col overflow-hidden flex-shrink-0"
            >
              <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 flex-shrink-0">
                <span className="font-display font-semibold text-sm text-foreground">
                  {chatOpen ? "Chat" : participantsOpen ? `Participants (${mockParticipants.length})` : "Meeting Info"}
                </span>
                <button onClick={closePanels} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {chatOpen && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={msg.sender === "You" ? "text-right" : ""}>
                        <p className="text-xs text-muted-foreground mb-1">{msg.sender} · {msg.time}</p>
                        <div className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                          msg.sender === "You" ? "bg-accent text-foreground" : "bg-muted/50 text-foreground"
                        }`}>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border/50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/20"
                      />
                      <button onClick={sendMessage} className="gradient-button p-2.5 rounded-xl">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {participantsOpen && (
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  {mockParticipants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border border-border/50">
                          <span className="text-xs font-medium text-foreground">{p.initials}</span>
                        </div>
                        <span className="text-sm text-foreground">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {p.muted ? <MicOff className="w-3.5 h-3.5 text-destructive" /> : <Mic className="w-3.5 h-3.5 text-muted-foreground" />}
                        {p.videoOn ? <VideoIcon className="w-3.5 h-3.5 text-muted-foreground" /> : <VideoOff className="w-3.5 h-3.5 text-destructive" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {infoOpen && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-border/30">
                    {[
                      { label: "Meeting ID", value: "NXC-482-719" },
                      { label: "Host", value: "You (John Doe)" },
                      { label: "Started", value: "2:00 PM" },
                      { label: "Encryption", value: "End-to-end" },
                    ].map((info) => (
                      <div key={info.label}>
                        <span className="text-xs text-muted-foreground">{info.label}</span>
                        <p className="text-sm text-foreground font-mono">{info.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control bar */}
      <div className="h-20 border-t border-border/50 bg-card flex items-center justify-center gap-2 px-4 flex-shrink-0">
        <button
          onClick={() => setMicOn(!micOn)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            micOn ? "bg-accent text-foreground hover:bg-accent/80" : "bg-destructive text-destructive-foreground"
          }`}
        >
          {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setCamOn(!camOn)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            camOn ? "bg-accent text-foreground hover:bg-accent/80" : "bg-destructive text-destructive-foreground"
          }`}
        >
          {camOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>
        <button className="w-11 h-11 rounded-full bg-accent text-foreground hover:bg-accent/80 flex items-center justify-center transition-colors">
          <Monitor className="w-4 h-4" />
        </button>
        <button className="w-11 h-11 rounded-full bg-accent text-foreground hover:bg-accent/80 flex items-center justify-center transition-colors">
          <Hand className="w-4 h-4" />
        </button>
        <button className="w-11 h-11 rounded-full bg-accent text-foreground hover:bg-accent/80 flex items-center justify-center transition-colors">
          <Smile className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-border mx-1" />

        <button
          onClick={() => togglePanel("chat")}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            chatOpen ? "bg-foreground text-background" : "bg-accent text-foreground hover:bg-accent/80"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button
          onClick={() => togglePanel("participants")}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            participantsOpen ? "bg-foreground text-background" : "bg-accent text-foreground hover:bg-accent/80"
          }`}
        >
          <Users className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-border mx-1" />

        <button
          onClick={() => navigate("/dashboard")}
          className="w-11 h-11 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
        >
          <Phone className="w-4 h-4 rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
};

export default MeetingRoom;
