import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import {
    Hand,
    MessageSquare,
    Mic,
    MicOff,
    Monitor,
    MonitorOff,
    MoreVertical,
    Phone,
    Settings,
    Users,
    VideoIcon,
    VideoOff,
} from 'lucide-react';
import { FC } from 'react';

interface MeetingControlsProps {
    audioEnabled: boolean;
    videoEnabled: boolean;
    isScreenSharing: boolean;
    handRaised: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onToggleScreenShare: () => void;
    onToggleHandRaise: () => void;
    onToggleChat: () => void;
    onToggleParticipants: () => void;
    onLeaveMeeting: () => void;
    participantCount: number;
    isHost?: boolean;
    onOpenHostControls?: () => void;
}

export const MeetingControls: FC<MeetingControlsProps> = ({
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    handRaised,
    onToggleAudio,
    onToggleVideo,
    onToggleScreenShare,
    onToggleHandRaise,
    onToggleChat,
    onToggleParticipants,
    onLeaveMeeting,
    participantCount,
    isHost = false,
    onOpenHostControls,
}) => {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-2xl border-t border-white/10 safe-area-bottom"
        >
            <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-6">
                <div className="flex items-center justify-between gap-1 sm:gap-4">
                    {/* Left section - Desktop Only */}
                    <div className="hidden lg:flex items-center gap-3 min-w-[200px]">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Live</span>
                        </div>
                    </div>

                    {/* Center section - Main controls (Responsive) */}
                    <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-1 lg:flex-none">
                        {/* Media controls */}
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 sm:bg-white/10 p-1.5 sm:p-2 rounded-2xl border border-white/10">
                            <Button
                                onClick={onToggleAudio}
                                size="icon"
                                className={`rounded-full w-10 h-10 sm:w-14 sm:h-14 transition-all duration-300 ${audioEnabled
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    }`}
                            >
                                {audioEnabled ? <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> : <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </Button>

                            <Button
                                onClick={onToggleVideo}
                                size="icon"
                                className={`rounded-full w-10 h-10 sm:w-14 sm:h-14 transition-all duration-300 ${videoEnabled
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    }`}
                            >
                                {videoEnabled ? <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </Button>
                        </div>

                        {/* Leave button - High Contrast */}
                        <Button
                            onClick={onLeaveMeeting}
                            size="icon"
                            className="rounded-full w-12 h-10 sm:w-16 sm:h-14 bg-red-600 hover:bg-red-700 text-white transition-all shadow-xl shadow-red-600/30 border border-red-500/50"
                        >
                            <Phone className="w-6 h-6 rotate-[135deg]" />
                        </Button>

                        {/* Interaction controls */}
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 sm:bg-white/10 p-1.5 sm:p-2 rounded-2xl border border-white/10">
                            <Button
                                onClick={onToggleScreenShare}
                                size="icon"
                                className={`rounded-full w-10 h-10 sm:w-14 sm:h-14 transition-all ${isScreenSharing
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                            >
                                {isScreenSharing ? <MonitorOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </Button>

                            <Button
                                onClick={onToggleHandRaise}
                                size="icon"
                                className={`rounded-full w-10 h-10 sm:w-14 sm:h-14 transition-all ${handRaised
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                            >
                                <Hand className="w-5 h-5 sm:w-6 sm:h-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Right section - Panel controls */}
                    <div className="flex items-center gap-1 sm:gap-2 min-w-0 lg:min-w-[200px] justify-end">
                         <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl sm:hidden">
                             <Button onClick={onToggleChat} variant="ghost" size="icon" className="w-9 h-9 text-white"><MessageSquare className="w-4 h-4" /></Button>
                             <Button onClick={onToggleParticipants} variant="ghost" size="icon" className="w-9 h-9 text-white"><Users className="w-4 h-4" /></Button>
                         </div>
                         
                         <div className="hidden sm:flex items-center gap-2">
                            <Button onClick={onToggleChat} variant="ghost" size="icon" className="w-11 h-11 text-white hover:bg-white/10 rounded-full"><MessageSquare className="w-5 h-5" /></Button>
                            <Button onClick={onToggleParticipants} variant="ghost" size="icon" className="w-11 h-11 text-white hover:bg-white/10 rounded-full relative">
                                <Users className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{participantCount}</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-11 h-11 text-white hover:bg-white/10 rounded-full"><MoreVertical className="w-5 h-5" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                                    <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><Settings className="w-4 h-4 mr-2" /> Settings</DropdownMenuItem>
                                    {isHost && onOpenHostControls && (
                                        <DropdownMenuItem onClick={onOpenHostControls} className="focus:bg-white/10 cursor-pointer text-purple-400 font-bold uppercase text-[10px] tracking-widest"><Settings className="w-4 h-4 mr-2" /> Host Controls</DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
