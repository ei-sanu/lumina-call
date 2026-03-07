import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Participant } from '@/types/meeting';
import { motion } from 'framer-motion';
import { Hand, MicOff } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';

interface VideoParticipantProps {
    participant: Participant;
    isLocal?: boolean;
    stream?: MediaStream;
}

export const VideoParticipant: FC<VideoParticipantProps> = ({
    participant,
    isLocal = false,
    stream,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const initials = participant.userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg aspect-video group"
        >
            {/* Video element */}
            {participant.videoEnabled && stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
                    <Avatar className="w-24 h-24">
                        <AvatarFallback className="text-3xl bg-purple-700 text-white">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
            )}

            {/* Overlay with participant info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium drop-shadow-lg">
                        {participant.userName}
                        {isLocal && ' (You)'}
                    </span>
                    {participant.isHost && (
                        <span className="bg-yellow-500 text-xs px-2 py-0.5 rounded-full text-black font-semibold">
                            Host
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {!participant.audioEnabled && (
                        <div className="bg-red-500 rounded-full p-1.5">
                            <MicOff className="w-3 h-3 text-white" />
                        </div>
                    )}
                    {participant.handRaised && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-yellow-500 rounded-full p-1.5"
                        >
                            <Hand className="w-3 h-3 text-white" />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Screen sharing indicator */}
            {participant.screenSharing && (
                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Sharing Screen
                </div>
            )}

            {/* Connection quality indicator (optional) */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-0.5">
                    <div className="w-1 h-2 bg-green-500 rounded-full" />
                    <div className="w-1 h-3 bg-green-500 rounded-full" />
                    <div className="w-1 h-4 bg-green-500 rounded-full" />
                </div>
            </div>
        </motion.div>
    );
};
