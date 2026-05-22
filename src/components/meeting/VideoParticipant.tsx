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
        const videoElement = videoRef.current;
        const audioElement = audioRef.current;

        if (videoElement && stream && participant.videoEnabled) {
            videoElement.srcObject = stream;
            // Production fix: explicit play to handle browser autoplay policies
            videoElement.play().catch(err => console.warn("Video play interrupted:", err));
        }
        
        if (audioElement && stream && !isLocal) {
            audioElement.srcObject = stream;
            audioElement.play().catch(err => console.warn("Audio play interrupted:", err));
        }

        // Voice animation logic using Web Audio API
        if (stream && stream.getAudioTracks().length > 0) {
            try {
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
                    if (audioContext.state !== 'closed') audioContext.close();
                };
            } catch (e) {
                console.error("Audio animation error:", e);
            }
        }
    }, [stream, isLocal, participant.videoEnabled]);

    const initials = participant.userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

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
            className={`relative bg-black/60 backdrop-blur-md border-2 rounded-2xl overflow-hidden shadow-2xl aspect-video group transition-all duration-300 ${isSpeaking ? 'ring-2 ring-purple-500/50' : 'border-white/10'}`}
        >
            {/* Audio tag for remote participants - ensure it's always there for sound */}
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
                        className={`w-full h-full object-cover ${isLocal ? 'mirror' : ''}`}
                    />
                ) : (
                    <motion.div 
                        key="avatar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/40 to-black"
                    >
                        {/* Voice waves for speaking state */}
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
                        
                        <Avatar className={`w-20 h-20 sm:w-28 sm:h-28 shadow-2xl border-2 transition-transform duration-300 ${isSpeaking ? 'scale-110 border-purple-500' : 'border-white/10'}`}>
                            <AvatarFallback className="text-3xl sm:text-4xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Overlay - Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-20">
                {participant.screenSharing && (
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-green-600/90 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold shadow-lg flex items-center gap-1.5 border border-green-400/30"
                    >
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        PRESENTING
                    </motion.div>
                )}
                {isSpeaking && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-purple-600/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-lg border border-purple-400/30"
                    >
                        LIVE
                    </motion.div>
                )}
            </div>

            {/* Bottom Overlay - Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between z-20">
                <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-white text-xs sm:text-sm font-semibold truncate shadow-2xl">
                        {participant.userName} {isLocal && "(You)"}
                    </span>
                    {participant.isHost && (
                        <span className="bg-yellow-500/90 text-black text-[10px] px-2 py-1 rounded-md font-bold shadow-lg uppercase tracking-wider">
                            Host
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!participant.audioEnabled && (
                        <div className="bg-red-500/90 backdrop-blur-md rounded-full p-2 shadow-lg border border-red-400/30">
                            <MicOff className="w-3.5 h-3.5 text-white" />
                        </div>
                    )}
                    {participant.handRaised && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-yellow-500/90 backdrop-blur-md rounded-full p-2 shadow-lg border border-yellow-400/30"
                        >
                            <Hand className="w-3.5 h-3.5 text-black" />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
