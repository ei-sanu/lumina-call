import { Participant, PeerConnection } from '@/types/meeting';
import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const useWebRTC = (
    socket: Socket | null,
    roomId: string,
    userId: string,
    userName: string
) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const peersRef = useRef<Map<string, PeerConnection>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    // Initialize local media stream
    const initializeMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 },
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    };

    // Create peer connection
    const createPeerConnection = (peerId: string): RTCPeerConnection => {
        const peerConnection = new RTCPeerConnection(ICE_SERVERS);

        // Add local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            setParticipants((prev) => {
                const updated = new Map(prev);
                const participant = updated.get(peerId);
                if (participant) {
                    participant.stream = remoteStream;
                    updated.set(peerId, { ...participant });
                }
                return updated;
            });
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice-candidate', {
                    to: peerId,
                    candidate: event.candidate,
                    from: socket.id,
                });
            }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Peer connection state (${peerId}):`, peerConnection.connectionState);

            if (peerConnection.connectionState === 'failed') {
                console.log('Attempting ICE restart...');
                peerConnection.restartIce();
            }
        };

        peersRef.current.set(peerId, {
            peerId,
            connection: peerConnection,
        });

        return peerConnection;
    };

    // Handle new user joined
    const handleUserJoined = async (participant: Participant) => {
        console.log('User joined:', participant.userName);

        setParticipants((prev) => {
            const updated = new Map(prev);
            updated.set(participant.userId, participant);
            return updated;
        });

        // Create offer for new peer
        if (socket) {
            const peerConnection = createPeerConnection(participant.socketId);

            try {
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);

                socket.emit('offer', {
                    to: participant.socketId,
                    offer,
                    from: socket.id,
                });
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        }
    };

    // Handle offer received
    const handleOffer = async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
        console.log('Received offer from:', data.from);

        const peerConnection = createPeerConnection(data.from);

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            if (socket) {
                socket.emit('answer', {
                    to: data.from,
                    answer,
                    from: socket.id,
                });
            }
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };

    // Handle answer received
    const handleAnswer = async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
        console.log('Received answer from:', data.from);

        const peer = peersRef.current.get(data.from);
        if (peer) {
            try {
                await peer.connection.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        }
    };

    // Handle ICE candidate
    const handleIceCandidate = async (data: { from: string; candidate: RTCIceCandidateInit }) => {
        const peer = peersRef.current.get(data.from);
        if (peer) {
            try {
                await peer.connection.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    };

    // Handle user left
    const handleUserLeft = (data: { userId: string }) => {
        console.log('User left:', data.userId);

        setParticipants((prev) => {
            const updated = new Map(prev);
            const participant = updated.get(data.userId);

            if (participant) {
                const peer = peersRef.current.get(participant.socketId);
                if (peer) {
                    peer.connection.close();
                    peersRef.current.delete(participant.socketId);
                }
                updated.delete(data.userId);
            }

            return updated;
        });
    };

    // Toggle audio
    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setAudioEnabled(audioTrack.enabled);

                if (socket) {
                    socket.emit('toggle-audio', {
                        roomId,
                        userId,
                        audioEnabled: audioTrack.enabled,
                    });
                }
            }
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoEnabled(videoTrack.enabled);

                if (socket) {
                    socket.emit('toggle-video', {
                        roomId,
                        userId,
                        videoEnabled: videoTrack.enabled,
                    });
                }
            }
        }
    };

    // Start screen sharing
    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                },
                audio: false,
            });

            screenStreamRef.current = stream;
            setScreenStream(stream);
            setIsScreenSharing(true);

            // Replace video track with screen share
            const screenTrack = stream.getVideoTracks()[0];

            peersRef.current.forEach((peer) => {
                const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'video');
                if (sender && screenTrack) {
                    sender.replaceTrack(screenTrack);
                }
            });

            if (socket) {
                socket.emit('start-screen-share', { roomId, userId });
            }

            // Handle screen share stop
            screenTrack.onended = () => {
                stopScreenShare();
            };
        } catch (error) {
            console.error('Error starting screen share:', error);
        }
    };

    // Stop screen sharing
    const stopScreenShare = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
            setScreenStream(null);
            setIsScreenSharing(false);

            // Restore camera video track
            if (localStreamRef.current) {
                const videoTrack = localStreamRef.current.getVideoTracks()[0];

                peersRef.current.forEach((peer) => {
                    const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'video');
                    if (sender && videoTrack) {
                        sender.replaceTrack(videoTrack);
                    }
                });
            }

            if (socket) {
                socket.emit('stop-screen-share', { roomId, userId });
            }
        }
    };

    // Cleanup
    const cleanup = () => {
        // Stop local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Stop screen share
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Close all peer connections
        peersRef.current.forEach((peer) => {
            peer.connection.close();
        });

        peersRef.current.clear();
        setParticipants(new Map());
    };

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('existing-participants', (existingParticipants: Participant[]) => {
            console.log('Existing participants:', existingParticipants);
            existingParticipants.forEach((participant) => {
                setParticipants((prev) => {
                    const updated = new Map(prev);
                    updated.set(participant.userId, participant);
                    return updated;
                });
                handleUserJoined(participant);
            });
        });

        socket.on('user-joined', handleUserJoined);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('user-left', handleUserLeft);

        socket.on('user-audio-toggled', (data: { userId: string; audioEnabled: boolean }) => {
            setParticipants((prev) => {
                const updated = new Map(prev);
                const participant = updated.get(data.userId);
                if (participant) {
                    participant.audioEnabled = data.audioEnabled;
                    updated.set(data.userId, { ...participant });
                }
                return updated;
            });
        });

        socket.on('user-video-toggled', (data: { userId: string; videoEnabled: boolean }) => {
            setParticipants((prev) => {
                const updated = new Map(prev);
                const participant = updated.get(data.userId);
                if (participant) {
                    participant.videoEnabled = data.videoEnabled;
                    updated.set(data.userId, { ...participant });
                }
                return updated;
            });
        });

        return () => {
            socket.off('existing-participants');
            socket.off('user-joined');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('user-left');
            socket.off('user-audio-toggled');
            socket.off('user-video-toggled');
        };
    }, [socket]);

    return {
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
    };
};
