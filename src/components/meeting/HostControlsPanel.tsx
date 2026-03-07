import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Participant } from '@/types/meeting';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Crown,
    Lock,
    LockOpen,
    MicOff,
    MonitorOff,
    Shield,
    UserMinus,
    UserX,
    Users,
    Video,
    VideoOff,
    Volume2,
    VolumeX,
    X
} from 'lucide-react';
import { FC, useState } from 'react';

interface HostControlsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Participant[];
    currentUserId: string;
    isHost: boolean;
    onMuteParticipant: (userId: string) => void;
    onRemoveParticipant: (userId: string) => void;
    onToggleRoomLock: (locked: boolean) => void;
    onMuteAll: () => void;
    onSpotlightParticipant?: (userId: string) => void;
    roomLocked?: boolean;
}

export const HostControlsPanel: FC<HostControlsPanelProps> = ({
    isOpen,
    onClose,
    participants,
    currentUserId,
    isHost,
    onMuteParticipant,
    onRemoveParticipant,
    onToggleRoomLock,
    onMuteAll,
    onSpotlightParticipant,
    roomLocked = false,
}) => {
    const [selectedTab, setSelectedTab] = useState<'participants' | 'security' | 'settings'>('participants');
    const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

    if (!isHost) return null;

    const otherParticipants = participants.filter(p => p.userId !== currentUserId);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-[450px] bg-black/30 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Crown className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                            Host Controls
                                        </h3>
                                        <p className="text-xs text-gray-400">Manage your meeting</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={onClose}
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedTab('participants')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTab === 'participants'
                                            ? 'bg-purple-500/20 backdrop-blur-md border border-purple-500/30 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Users className="w-4 h-4 inline mr-2" />
                                    Participants
                                </button>
                                <button
                                    onClick={() => setSelectedTab('security')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTab === 'security'
                                            ? 'bg-purple-500/20 backdrop-blur-md border border-purple-500/30 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Shield className="w-4 h-4 inline mr-2" />
                                    Security
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1 p-6">
                            {selectedTab === 'participants' && (
                                <div className="space-y-3">
                                    {/* Quick Actions */}
                                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 mb-6">
                                        <h4 className="text-white text-sm font-semibold mb-3">Quick Actions</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={onMuteAll}
                                                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-all hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                                            >
                                                <MicOff className="w-4 h-4" />
                                                Mute All
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-all hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
                                            >
                                                <MonitorOff className="w-4 h-4" />
                                                Stop All Videos
                                            </button>
                                        </div>
                                    </div>

                                    {/* Participant List */}
                                    <h4 className="text-white text-sm font-semibold mb-3">
                                        Participants ({participants.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {participants.map((participant) => {
                                            const isCurrentUser = participant.userId === currentUserId;
                                            const isConfirmingRemove = confirmRemove === participant.userId;

                                            return (
                                                <motion.div
                                                    key={participant.userId}
                                                    layout
                                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            {/* Avatar */}
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                                                {participant.userName.charAt(0).toUpperCase()}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-white font-medium text-sm">
                                                                        {participant.userName}
                                                                    </p>
                                                                    {participant.isHost && (
                                                                        <Crown className="w-3 h-3 text-yellow-500" />
                                                                    )}
                                                                    {isCurrentUser && (
                                                                        <span className="text-xs text-gray-400">(You)</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {participant.audioEnabled ? (
                                                                        <Volume2 className="w-3 h-3 text-green-400" />
                                                                    ) : (
                                                                        <VolumeX className="w-3 h-3 text-red-400" />
                                                                    )}
                                                                    {participant.videoEnabled ? (
                                                                        <Video className="w-3 h-3 text-green-400" />
                                                                    ) : (
                                                                        <VideoOff className="w-3 h-3 text-red-400" />
                                                                    )}
                                                                    {participant.screenSharing && (
                                                                        <span className="text-xs text-blue-400">Sharing screen</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        {!isCurrentUser && (
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {isConfirmingRemove ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                onRemoveParticipant(participant.userId);
                                                                                setConfirmRemove(null);
                                                                            }}
                                                                            className="p-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all text-red-400"
                                                                        >
                                                                            <UserX className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setConfirmRemove(null)}
                                                                            className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all text-white"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => onMuteParticipant(participant.userId)}
                                                                            className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all text-white"
                                                                            title="Mute participant"
                                                                        >
                                                                            <MicOff className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setConfirmRemove(participant.userId)}
                                                                            className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-red-500/20 transition-all text-white hover:text-red-400"
                                                                            title="Remove participant"
                                                                        >
                                                                            <UserMinus className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedTab === 'security' && (
                                <div className="space-y-4">
                                    {/* Room Lock */}
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {roomLocked ? (
                                                    <Lock className="w-5 h-5 text-red-400" />
                                                ) : (
                                                    <LockOpen className="w-5 h-5 text-green-400" />
                                                )}
                                                <div>
                                                    <h4 className="text-white font-semibold">Lock Meeting</h4>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Prevent new participants from joining
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onToggleRoomLock(!roomLocked)}
                                                className={`w-12 h-6 rounded-full transition-all relative ${roomLocked ? 'bg-red-500' : 'bg-white/20'
                                                    }`}
                                            >
                                                <div
                                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${roomLocked ? 'translate-x-7' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                        {roomLocked && (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3">
                                                <p className="text-red-400 text-xs">
                                                    🔒 Meeting is locked. New participants cannot join.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Waiting Room (Placeholder) */}
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h4 className="text-white font-semibold">Waiting Room</h4>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Approve participants before they join
                                                </p>
                                            </div>
                                            <button
                                                className="w-12 h-6 rounded-full transition-all relative bg-white/20"
                                            >
                                                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Recording Controls (Placeholder) */}
                                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-xl p-5">
                                        <h4 className="text-white font-semibold mb-3">Recording</h4>
                                        <button className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                                            Start Recording
                                        </button>
                                        <p className="text-xs text-gray-400 mt-2 text-center">
                                            Cloud recording feature coming soon
                                        </p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
