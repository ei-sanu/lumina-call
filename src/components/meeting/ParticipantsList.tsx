import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Participant } from '@/types/meeting';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Hand, Mic, MicOff, MoreVertical, UserX, VideoIcon, VideoOff, VolumeX, X } from 'lucide-react';
import { FC } from 'react';

interface ParticipantsListProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[];
    currentUserId: string;
    isHost: boolean;
    onMuteParticipant?: (userId: string) => void;
    onRemoveParticipant?: (userId: string) => void;
}

export const ParticipantsList: FC<ParticipantsListProps> = ({
    isOpen,
    onClose,
    participants,
    currentUserId,
    isHost,
    onMuteParticipant,
    onRemoveParticipant,
}) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900/95 backdrop-blur-lg border-l border-gray-700 shadow-2xl z-40 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="text-white font-semibold text-lg">
                            Participants ({participants.length})
                        </h3>
                        <Button
                            onClick={onClose}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Participants list */}
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-2">
                            {participants.map((participant) => {
                                const isCurrentUser = participant.userId === currentUserId;
                                return (
                                    <motion.div
                                        key={participant.userId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group"
                                    >
                                        {/* Avatar */}
                                        <Avatar className="w-10 h-10">
                                            <AvatarFallback className="bg-purple-600 text-white">
                                                {getInitials(participant.userName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-medium truncate">
                                                    {participant.userName}
                                                    {isCurrentUser && ' (You)'}
                                                </p>
                                                {participant.isHost && (
                                                    <Crown className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {participant.audioEnabled ? (
                                                    <Mic className="w-3 h-3 text-green-500" />
                                                ) : (
                                                    <MicOff className="w-3 h-3 text-red-500" />
                                                )}
                                                {participant.videoEnabled ? (
                                                    <VideoIcon className="w-3 h-3 text-green-500" />
                                                ) : (
                                                    <VideoOff className="w-3 h-3 text-red-500" />
                                                )}
                                                {participant.handRaised && (
                                                    <Hand className="w-3 h-3 text-yellow-500" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Host controls */}
                                        {isHost && !isCurrentUser && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => onMuteParticipant?.(participant.userId)}
                                                        disabled={!participant.audioEnabled}
                                                    >
                                                        <VolumeX className="w-4 h-4 mr-2" />
                                                        Mute participant
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onRemoveParticipant?.(participant.userId)}
                                                        className="text-red-600"
                                                    >
                                                        <UserX className="w-4 h-4 mr-2" />
                                                        Remove from meeting
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
