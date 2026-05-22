import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Participant } from '@/types/meeting';
import { AnimatePresence, motion } from 'framer-motion';
import { Hand, MicOff } from 'lucide-react';
import { FC, useEffect, useRef, useState } from 'react';

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
    const audioRef = useRef<HTMLAudioElement>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
        if (audioRef.current && stream && !isLocal) {
            audioRef.current.srcObject = stream;
        }

        // Voice animation logic
        if (stream && stream.getAudioTracks().length > 0) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);
            analyzerRef.current = analyzer;

            const updateLevel = () => {
                const dataArray = new Uint8Array(analyzer.frequencyBinCount);
                analyzer.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average);
                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();

            return () => {
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                audioContext.close();
            };
        }
    }, [stream, isLocal]);

    const initials = participant.userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Dynamic wave animation based on audio level
    const isSpeaking = audioLevel > 15 && participant.audioEnabled;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
                borderColor: isSpeaking ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isSpeaking ? '0 0 20px rgba(168, 85, 247, 0.3)' : '0 0 0px rgba(0,0,0,0)'
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative bg-black/40 backdrop-blur-md border-2 rounded-xl overflow-hidden shadow-2xl aspect-video group transition-all duration-300 ${isSpeaking ? 'ring-2 ring-purple-500/50' : ''}`}
        >
            {!isLocal && (
                <audio ref={audioRef} autoPlay playsInline />
            )}

            <AnimatePresence mode="wait">
                {participant.videoEnabled && stream ? (
                    <motion.video
                        key="video"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={isLocal}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <motion.div 
                        key="avatar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-black"
                    >
                        {/* Voice waves */}
                        <AnimatePresence>
                            {isSpeaking && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.5, opacity: 0.2 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute w-32 h-32 rounded-full border-2 border-purple-500"
                                    />
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 2, opacity: 0.1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        className="absolute w-32 h-32 rounded-full border-2 border-purple-400"
                                    />
                                </>
                            )}
                        </AnimatePresence>
                        
                        <Avatar className={`w-24 h-24 shadow-2xl border-2 transition-transform duration-300 ${isSpeaking ? 'scale-110 border-purple-500' : 'border-white/10'}`}>
                            <AvatarFallback className="text-3xl bg-purple-700 text-white font-display">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Overlay - Status Badges */}
            <div className="absolute top-3 left-3 flex gap-2 z-20">
                {participant.screenSharing && (
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-green-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center gap-1"
                    >
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        SHARING SCREEN
                    </motion.div>
                )}
                {isSpeaking && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-purple-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-lg"
                    >
                        SPEAKING
                    </motion.div>
                )}
            </div>

            {/* Bottom Overlay - Participant Name */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                    <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-white text-xs sm:text-sm font-medium shadow-xl">
                        {participant.userName} {isLocal && "(You)"}
                    </span>
                    {participant.isHost && (
                        <span className="bg-yellow-500/90 text-black text-[10px] px-2 py-0.5 rounded-md font-bold shadow-lg">
                            HOST
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!participant.audioEnabled && (
                        <div className="bg-red-500/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-red-400/50">
                            <MicOff className="w-3 h-3 text-white" />
                        </div>
                    )}
                    {participant.handRaised && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-yellow-500/90 rounded-full p-1.5 shadow-lg border border-yellow-400/50"
                        >
                            <Hand className="w-3 h-3 text-black" />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
