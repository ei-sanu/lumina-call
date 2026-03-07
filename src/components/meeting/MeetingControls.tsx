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
}) => {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent backdrop-blur-sm"
        >
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    {/* Left section - Meeting info */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-white text-sm font-medium">Recording</span>
                        </div>
                    </div>

                    {/* Center section - Main controls */}
                    <div className="flex items-center gap-3">
                        {/* Audio control */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onToggleAudio}
                                    size="lg"
                                    className={`rounded-full w-14 h-14 ${audioEnabled
                                            ? 'bg-gray-700 hover:bg-gray-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {audioEnabled ? (
                                        <Mic className="w-6 h-6 text-white" />
                                    ) : (
                                        <MicOff className="w-6 h-6 text-white" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {audioEnabled ? 'Mute' : 'Unmute'}
                            </TooltipContent>
                        </Tooltip>

                        {/* Video control */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onToggleVideo}
                                    size="lg"
                                    className={`rounded-full w-14 h-14 ${videoEnabled
                                            ? 'bg-gray-700 hover:bg-gray-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    {videoEnabled ? (
                                        <VideoIcon className="w-6 h-6 text-white" />
                                    ) : (
                                        <VideoOff className="w-6 h-6 text-white" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                            </TooltipContent>
                        </Tooltip>

                        {/* Screen share control */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onToggleScreenShare}
                                    size="lg"
                                    className={`rounded-full w-14 h-14 ${isScreenSharing
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                >
                                    {isScreenSharing ? (
                                        <MonitorOff className="w-6 h-6 text-white" />
                                    ) : (
                                        <Monitor className="w-6 h-6 text-white" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isScreenSharing ? 'Stop sharing' : 'Share screen'}
                            </TooltipContent>
                        </Tooltip>

                        {/* Raise hand */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onToggleHandRaise}
                                    size="lg"
                                    className={`rounded-full w-14 h-14 ${handRaised
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                >
                                    <Hand className="w-6 h-6 text-white" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {handRaised ? 'Lower hand' : 'Raise hand'}
                            </TooltipContent>
                        </Tooltip>

                        {/* Leave meeting */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onLeaveMeeting}
                                    size="lg"
                                    className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
                                >
                                    <Phone className="w-6 h-6 text-white rotate-135" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Leave meeting</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Right section - Additional controls */}
                    <div className="flex items-center gap-3">
                        {/* Chat */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onToggleChat}
                                    size="lg"
                                    variant="ghost"
                                    className="rounded-full w-12 h-12 text-white hover:bg-white/10"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle chat</TooltipContent>
                        </Tooltip>

                        {/* Participants */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onToggleParticipants}
                                    size="lg"
                                    variant="ghost"
                                    className="rounded-full w-12 h-12 text-white hover:bg-white/10 relative"
                                >
                                    <Users className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {participantCount}
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Participants ({participantCount})</TooltipContent>
                        </Tooltip>

                        {/* More options */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="rounded-full w-12 h-12 text-white hover:bg-white/10"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Monitor className="w-4 h-4 mr-2" />
                                    Change layout
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    End meeting for all
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
