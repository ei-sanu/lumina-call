import { Participant, PeerConnection } from '@/types/meeting';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
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
    const audioTrackRef = useRef<MediaStreamTrack | null>(null);
    const videoTrackRef = useRef<MediaStreamTrack | null>(null);

    // Initialize local media stream
    const initializeMedia = useCallback(async () => {
        try {
            console.log('Initializing media devices...');
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

            console.log('Media stream obtained:', stream.getTracks());

            // Store track references
            audioTrackRef.current = stream.getAudioTracks()[0];
            videoTrackRef.current = stream.getVideoTracks()[0];

            localStreamRef.current = stream;
            setLocalStream(stream);

            // Set initial enabled states to true
            if (audioTrackRef.current) audioTrackRef.current.enabled = true;
            if (videoTrackRef.current) videoTrackRef.current.enabled = true;

            console.log('Media tracks enabled - Audio:', audioTrackRef.current?.enabled, 'Video:', videoTrackRef.current?.enabled);

            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }, []);

    // Create peer connection
    const createPeerConnection = useCallback((peerId: string, peerUserId: string): RTCPeerConnection => {
        console.log('Creating peer connection for:', peerId);

        const peerConnection = new RTCPeerConnection(ICE_SERVERS);

        // Add local stream tracks to peer connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                console.log('Adding track to peer:', track.kind, track.id);
                peerConnection.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle incoming remote tracks
        peerConnection.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind, 'from:', peerId);
            const [remoteStream] = event.streams;

            setParticipants((prev) => {
                const updated = new Map(prev);
                const participant = updated.get(peerUserId);
                if (participant) {
                    console.log('Updating participant stream:', peerUserId);
                    participant.stream = remoteStream;
                    updated.set(peerUserId, { ...participant });
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
                console.log('Connection failed, restarting ICE...');
                peerConnection.restartIce();
            }

            if (peerConnection.connectionState === 'connected') {
                console.log('Peer connection established successfully');
            }
        };

        // Handle ICE connection state
        peerConnection.oniceconnectionstatechange = () => {
            console.log(`ICE connection state (${peerId}):`, peerConnection.iceConnectionState);
        };

        peersRef.current.set(peerId, {
            peerId,
            connection: peerConnection,
        });

        return peerConnection;
    }, [socket]);

    // Handle new user joined
    const handleUserJoined = useCallback(async (participant: Participant) => {
        console.log('User joined:', participant.userName, participant.socketId);

        setParticipants((prev) => {
            const updated = new Map(prev);
            updated.set(participant.userId, participant);
            return updated;
        });

        // Create offer for new peer
        if (socket && localStreamRef.current) {
            const peerConnection = createPeerConnection(participant.socketId, participant.userId);

            try {
                const offer = await peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                });

                await peerConnection.setLocalDescription(offer);

                socket.emit('offer', {
                    to: participant.socketId,
                    offer,
                    from: socket.id,
                });

                console.log('Sent offer to:', participant.socketId);
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        }
    }, [socket, createPeerConnection]);

    // Handle offer received
    const handleOffer = useCallback(async (data: { from: string; offer: RTCSessionDescriptionInit; fromUserId: string }) => {
        console.log('Received offer from:', data.from);

        const peerConnection = createPeerConnection(data.from, data.fromUserId || data.from);

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            if (socket) {
                socket.emit('answer', {
                    to: data.from,
                    answer,
                    from: socket.id,
                    fromUserId: userId,
                });

                console.log('Sent answer to:', data.from);
            }
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }, [socket, userId, createPeerConnection]);

    // Handle answer received
    const handleAnswer = useCallback(async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
        console.log('Received answer from:', data.from);

        const peer = peersRef.current.get(data.from);
        if (peer) {
            try {
                await peer.connection.setRemoteDescription(new RTCSessionDescription(data.answer));
                console.log('Set remote description from answer');
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        } else {
            console.warn('Peer not found for answer:', data.from);
        }
    }, []);

    // Handle ICE candidate
    const handleIceCandidate = useCallback(async (data: { from: string; candidate: RTCIceCandidateInit }) => {
        const peer = peersRef.current.get(data.from);
        if (peer) {
            try {
                await peer.connection.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log('Added ICE candidate from:', data.from);
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        } else {
            console.warn('Peer not found for ICE candidate:', data.from);
        }
    }, []);

    // Handle user left
    const handleUserLeft = useCallback((data: { userId: string; socketId: string }) => {
        console.log('User left:', data.userId);

        setParticipants((prev) => {
            const updated = new Map(prev);
            const participant = updated.get(data.userId);

            if (participant) {
                const peer = peersRef.current.get(data.socketId || participant.socketId);
                if (peer) {
                    peer.connection.close();
                    peersRef.current.delete(data.socketId || participant.socketId);
                }
                updated.delete(data.userId);
            }

            return updated;
        });
    }, []);

    // Handle remote user audio/video toggle
    const handleUserAudioToggled = useCallback((data: { userId: string; audioEnabled: boolean }) => {
        setParticipants((prev) => {
            const updated = new Map(prev);
            const participant = updated.get(data.userId);
            if (participant) {
                participant.audioEnabled = data.audioEnabled;
                updated.set(data.userId, { ...participant });
            }
            return updated;
        });
    }, []);

    const handleUserVideoToggled = useCallback((data: { userId: string; videoEnabled: boolean }) => {
        setParticipants((prev) => {
            const updated = new Map(prev);
            const participant = updated.get(data.userId);
            if (participant) {
                participant.videoEnabled = data.videoEnabled;
                updated.set(data.userId, { ...participant });
            }
            return updated;
        });
    }, []);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (audioTrackRef.current) {
            const newState = !audioTrackRef.current.enabled;
            audioTrackRef.current.enabled = newState;
            setAudioEnabled(newState);

            if (socket) {
                socket.emit('toggle-audio', {
                    roomId,
                    userId,
                    audioEnabled: newState,
                });
            }

            console.log('Audio toggled:', newState);
        }
    }, [socket, roomId, userId]);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (videoTrackRef.current) {
            const newState = !videoTrackRef.current.enabled;
            videoTrackRef.current.enabled = newState;
            setVideoEnabled(newState);

            if (socket) {
                socket.emit('toggle-video', {
                    roomId,
                    userId,
                    videoEnabled: newState,
                });
            }

            console.log('Video toggled:', newState);
        }
    }, [socket, roomId, userId]);

    // Start screen sharing
    const startScreenShare = useCallback(async () => {
        try {
            console.log('Starting screen share...');
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor',
                },
                audio: false,
            });

            screenStreamRef.current = stream;
            setScreenStream(stream);
            setIsScreenSharing(true);

            // Replace video track with screen share for all peers
            const screenTrack = stream.getVideoTracks()[0];

            peersRef.current.forEach((peer) => {
                const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'video');
                if (sender && screenTrack) {
                    sender.replaceTrack(screenTrack).then(() => {
                        console.log('Replaced video track with screen share');
                    }).catch(err => console.error('Error replacing track:', err));
                }
            });

            if (socket) {
                socket.emit('start-screen-share', { roomId, userId });
            }

            // Handle screen share stop (user clicks browser "Stop sharing" button)
            screenTrack.onended = () => {
                console.log('Screen share ended by user');
                stopScreenShare();
            };
        } catch (error) {
            console.error('Error starting screen share:', error);
        }
    }, [socket, roomId, userId]);

    // Stop screen sharing
    const stopScreenShare = useCallback(() => {
        if (screenStreamRef.current) {
            console.log('Stopping screen share...');
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
            setScreenStream(null);
            setIsScreenSharing(false);

            // Restore camera video track
            if (videoTrackRef.current) {
                peersRef.current.forEach((peer) => {
                    const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'video');
                    if (sender && videoTrackRef.current) {
                        sender.replaceTrack(videoTrackRef.current).then(() => {
                            console.log('Restored camera video track');
                        }).catch(err => console.error('Error restoring track:', err));
                    }
                });
            }

            if (socket) {
                socket.emit('stop-screen-share', { roomId, userId });
            }
        }
    }, [socket, roomId, userId]);

    // Cleanup
    const cleanup = useCallback(() => {
        console.log('Cleaning up WebRTC connections...');

        // Stop local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
            localStreamRef.current = null;
        }

        // Stop screen share
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
        }

        // Close all peer connections
        peersRef.current.forEach((peer) => {
            peer.connection.close();
        });

        peersRef.current.clear();
        setParticipants(new Map());
        setLocalStream(null);
        setScreenStream(null);

        audioTrackRef.current = null;
        videoTrackRef.current = null;
    }, []);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('existing-participants', (existingParticipants: Participant[]) => {
            console.log('Existing participants:', existingParticipants.length);
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
        socket.on('user-audio-toggled', handleUserAudioToggled);
        socket.on('user-video-toggled', handleUserVideoToggled);

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
    }, [socket, handleUserJoined, handleOffer, handleAnswer, handleIceCandidate, handleUserLeft, handleUserAudioToggled, handleUserVideoToggled]);

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
