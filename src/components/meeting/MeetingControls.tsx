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
            className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-xl border-t border-white/10"
        >
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    {/* Left section - Meeting info */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                            <span className="text-white text-sm font-medium">Recording</span>
                        </div>
                    </div>

                    {/* Center section - Main controls */}
                    <div className="flex items-center gap-2">
                        {/* Media controls group */}
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2">
                            {/* Audio control */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onToggleAudio}
                                        size="lg"
                                        className={`rounded-full w-14 h-14 transition-all duration-300 ${audioEnabled
                                                ? 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-white/30'
                                                : 'bg-red-500/20 backdrop-blur-md border border-red-500/30 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/30'
                                            }`}
                                    >
                                        {audioEnabled ? (
                                            <Mic className="w-6 h-6 text-white" />
                                        ) : (
                                            <MicOff className="w-6 h-6 text-white" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black/60 backdrop-blur-md border border-white/20">
                                    {audioEnabled ? 'Mute' : 'Unmute'}
                                </TooltipContent>
                            </Tooltip>

                            {/* Video control */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onToggleVideo}
                                        size="lg"
                                        className={`rounded-full w-14 h-14 transition-all duration-300 ${videoEnabled
                                                ? 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-white/30'
                                                : 'bg-red-500/20 backdrop-blur-md border border-red-500/30 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/30'
                                            }`}
                                    >
                                        {videoEnabled ? (
                                            <VideoIcon className="w-6 h-6 text-white" />
                                        ) : (
                                            <VideoOff className="w-6 h-6 text-white" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black/60 backdrop-blur-md border border-white/20">
                                    {videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Glass divider */}
                        <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                        {/* Sharing controls group */}
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2">
                            {/* Screen share control */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onToggleScreenShare}
                                        size="lg"
                                        className={`rounded-full w-14 h-14 transition-all duration-300 ${isScreenSharing
                                                ? 'bg-purple-500/20 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20 hover:bg-purple-500/30 hover:shadow-xl hover:shadow-purple-500/30'
                                                : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-white/30'
                                            }`}
                                    >
                                        {isScreenSharing ? (
                                            <MonitorOff className="w-6 h-6 text-white" />
                                        ) : (
                                            <Monitor className="w-6 h-6 text-white" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black/60 backdrop-blur-md border border-white/20">
                                    {isScreenSharing ? 'Stop sharing' : 'Share screen'}
                                </TooltipContent>
                            </Tooltip>

                            {/* Raise hand */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onToggleHandRaise}
                                        size="lg"
                                        className={`rounded-full w-14 h-14 transition-all duration-300 ${handRaised
                                                ? 'bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 shadow-lg shadow-yellow-500/20 hover:bg-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/30'
                                                : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-white/30'
                                            }`}
                                    >
                                        <Hand className="w-6 h-6 text-white" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black/60 backdrop-blur-md border border-white/20">
                                    {handRaised ? 'Lower hand' : 'Raise hand'}
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Glass divider */}
                        <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

                        {/* Leave meeting - standalone */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onLeaveMeeting}
                                    size="lg"
                                    className="rounded-full w-14 h-14 bg-red-500/20 backdrop-blur-md border border-red-500/30 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                                >
                                    <Phone className="w-6 h-6 text-white rotate-135" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black/60 backdrop-blur-md border border-white/20">
                                Leave meeting
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Right section - Additional controls */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2">
                            {/* Host controls - only visible if user is host */}
                            {isHost && onOpenHostControls && (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={onOpenHostControls}
                                                size="lg"
                                                variant="ghost"
                                                className="rounded-full w-12 h-12 text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-purple-500/20 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-black/60 backdrop-blur-md border border-white/20">
                                            Host controls
                                        </TooltipContent>
                                    </Tooltip>
                                    <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                                </>
                            )}

                            {/* Chat */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onToggleChat}
                                        size="lg"
                                        variant="ghost"
                                        className="rounded-full w-12 h-12 text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-white/30 transition-all duration-300"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black/60 backdrop-blur-md border border-white/20">
                                    Toggle chat
                                </TooltipContent>
                            </Tooltip>

                            {/* Participants */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={onToggleParticipants}
                                        size="lg"
                                        variant="ghost"
                                        className="rounded-full w-12 h-12 text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-white/30 transition-all duration-300 relative"
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="absolute -top-1 -right-1 bg-purple-500/80 backdrop-blur-sm border border-purple-500/50 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                            {participantCount}
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black/60 backdrop-blur-md border border-white/20">
                                    Participants ({participantCount})
                                </TooltipContent>
                            </Tooltip>

                            {/* More options */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="rounded-full w-12 h-12 text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg hover:shadow-white/30 transition-all duration-300"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48 bg-black/60 backdrop-blur-xl border border-white/20"
                                >
                                    <DropdownMenuItem className="text-white hover:bg-white/10 focus:bg-white/10">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-white hover:bg-white/10 focus:bg-white/10">
                                        <Monitor className="w-4 h-4 mr-2" />
                                        Change layout
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                                        <Phone className="w-4 h-4 mr-2" />
                                        End meeting for all
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
