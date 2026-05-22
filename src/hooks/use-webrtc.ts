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

const createEmptyVideoTrack = ({ width = 640, height = 480 } = {}) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
    }
    const stream = canvas.captureStream();
    return stream.getVideoTracks()[0];
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
            let stream: MediaStream | null = null;
            
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                });
            } catch (err) {
                console.warn('Failed to get both media, trying audio only...', err);
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                    });
                    setVideoEnabled(false);
                } catch (err2) {
                    console.warn('Failed to get audio, trying video only...', err2);
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({
                            video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
                        });
                        setAudioEnabled(false);
                    } catch (err3) {
                        console.error('Failed to get any media devices', err3);
                        stream = new MediaStream();
                        setAudioEnabled(false);
                        setVideoEnabled(false);
                    }
                }
            }

            audioTrackRef.current = stream.getAudioTracks()[0] || null;
            videoTrackRef.current = stream.getVideoTracks()[0] || null;

            if (!videoTrackRef.current) {
                const emptyTrack = createEmptyVideoTrack();
                stream.addTrack(emptyTrack);
                videoTrackRef.current = emptyTrack;
            }

            localStreamRef.current = stream;
            setLocalStream(stream);

            return stream;
        } catch (error) {
            console.error('Error in media initialization:', error);
            throw error;
        }
    }, []);

    const createPeerConnection = useCallback((peerId: string, peerUserId: string): RTCPeerConnection => {
        console.log('Creating peer connection for:', peerId);
        const peerConnection = new RTCPeerConnection(ICE_SERVERS);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStreamRef.current!);
            });
        }

        peerConnection.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind, 'from:', peerId);
            const [remoteStream] = event.streams;

            setParticipants((prev) => {
                const updated = new Map(prev);
                const participant = updated.get(peerUserId);
                if (participant) {
                    participant.stream = remoteStream;
                    updated.set(peerUserId, { ...participant });
                }
                return updated;
            });
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice-candidate', {
                    to: peerId,
                    candidate: event.candidate,
                    from: socket.id,
                });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === 'failed') {
                peerConnection.restartIce();
            }
        };

        peersRef.current.set(peerId, { peerId, connection: peerConnection });
        return peerConnection;
    }, [socket]);

    const handleUserJoined = useCallback(async (participant: Participant) => {
        console.log('User joined:', participant.userName, participant.socketId);
        setParticipants((prev) => {
            const updated = new Map(prev);
            updated.set(participant.userId, participant);
            return updated;
        });

        if (socket && localStreamRef.current) {
            const peerConnection = createPeerConnection(participant.socketId, participant.userId);
            try {
                const offer = await peerConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
                await peerConnection.setLocalDescription(offer);
                socket.emit('offer', { to: participant.socketId, offer, from: socket.id, fromUserId: userId });
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        }
    }, [socket, createPeerConnection, userId]);

    const handleOffer = useCallback(async (data: { from: string; offer: RTCSessionDescriptionInit; fromUserId: string }) => {
        console.log('Received offer from:', data.from);
        const peerConnection = createPeerConnection(data.from, data.fromUserId);
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            if (socket) {
                socket.emit('answer', { to: data.from, answer, from: socket.id, fromUserId: userId });
            }
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }, [socket, userId, createPeerConnection]);

    const handleAnswer = useCallback(async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
        const peer = peersRef.current.get(data.from);
        if (peer) {
            try {
                await peer.connection.setRemoteDescription(new RTCSessionDescription(data.answer));
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        }
    }, []);

    const handleIceCandidate = useCallback(async (data: { from: string; candidate: RTCIceCandidateInit }) => {
        const peer = peersRef.current.get(data.from);
        if (peer) {
            try {
                await peer.connection.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    }, []);

    const handleUserLeft = useCallback((data: { userId: string; socketId: string }) => {
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

    const handleUserScreenShare = useCallback((data: { userId: string; isSharing: boolean }) => {
        setParticipants((prev) => {
            const updated = new Map(prev);
            const participant = updated.get(data.userId);
            if (participant) {
                participant.screenSharing = data.isSharing;
                updated.set(data.userId, { ...participant });
            }
            return updated;
        });
    }, []);

    const toggleAudio = useCallback(() => {
        if (audioTrackRef.current) {
            const newState = !audioTrackRef.current.enabled;
            audioTrackRef.current.enabled = newState;
            setAudioEnabled(newState);
            if (socket) {
                socket.emit('toggle-audio', { roomId, userId, audioEnabled: newState });
            }
        }
    }, [socket, roomId, userId]);

    const forceMuteAudio = useCallback(() => {
        if (audioTrackRef.current && audioTrackRef.current.enabled) {
            audioTrackRef.current.enabled = false;
            setAudioEnabled(false);
            if (socket) {
                socket.emit('toggle-audio', { roomId, userId, audioEnabled: false });
            }
        }
    }, [socket, roomId, userId]);

    const toggleVideo = useCallback(async () => {
        if (!localStreamRef.current) return;
        const newState = !videoEnabled;
        setVideoEnabled(newState);

        try {
            if (!newState) {
                if (videoTrackRef.current) {
                    videoTrackRef.current.stop();
                    localStreamRef.current.removeTrack(videoTrackRef.current);
                }
                const emptyTrack = createEmptyVideoTrack();
                localStreamRef.current.addTrack(emptyTrack);
                videoTrackRef.current = emptyTrack;
                peersRef.current.forEach(peer => {
                    const sender = peer.connection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(emptyTrack).catch(e => console.error(e));
                });
                setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
            } else {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
                });
                const newTrack = newStream.getVideoTracks()[0];
                if (videoTrackRef.current) {
                    videoTrackRef.current.stop();
                    localStreamRef.current.removeTrack(videoTrackRef.current);
                }
                localStreamRef.current.addTrack(newTrack);
                videoTrackRef.current = newTrack;
                peersRef.current.forEach(peer => {
                    const sender = peer.connection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(newTrack).catch(e => console.error(e));
                });
                setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
            }
            if (socket) {
                socket.emit('toggle-video', { roomId, userId, videoEnabled: newState });
            }
        } catch (error) {
            console.error('Error toggling video:', error);
            setVideoEnabled(!newState);
        }
    }, [videoEnabled, socket, roomId, userId]);

    const startScreenShare = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: false });
            screenStreamRef.current = stream;
            setScreenStream(stream);
            setIsScreenSharing(true);
            const screenTrack = stream.getVideoTracks()[0];

            peersRef.current.forEach((peer) => {
                const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'video');
                if (sender && screenTrack) {
                    sender.replaceTrack(screenTrack).catch(err => console.error(err));
                }
            });

            if (socket) socket.emit('start-screen-share', { roomId, userId });
            screenTrack.onended = () => stopScreenShare();
        } catch (error) {
            console.error('Error starting screen share:', error);
        }
    }, [socket, roomId, userId]);

    const stopScreenShare = useCallback(() => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
            setScreenStream(null);
            setIsScreenSharing(false);
            if (videoTrackRef.current) {
                peersRef.current.forEach((peer) => {
                    const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'video');
                    if (sender && videoTrackRef.current) {
                        sender.replaceTrack(videoTrackRef.current).catch(err => console.error(err));
                    }
                });
            }
            if (socket) socket.emit('stop-screen-share', { roomId, userId });
        }
    }, [socket, roomId, userId]);

    const cleanup = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
        }
        peersRef.current.forEach((peer) => peer.connection.close());
        peersRef.current.clear();
        setParticipants(new Map());
        setLocalStream(null);
        setScreenStream(null);
        audioTrackRef.current = null;
        videoTrackRef.current = null;
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('existing-participants', (existingParticipants: Participant[]) => {
            existingParticipants.forEach((participant) => {
                setParticipants((prev) => new Map(prev).set(participant.userId, participant));
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
        socket.on('user-started-screen-share', (data: { userId: string }) => handleUserScreenShare({ ...data, isSharing: true }));
        socket.on('user-stopped-screen-share', (data: { userId: string }) => handleUserScreenShare({ ...data, isSharing: false }));

        return () => {
            socket.off('existing-participants');
            socket.off('user-joined');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('user-left');
            socket.off('user-audio-toggled');
            socket.off('user-video-toggled');
            socket.off('user-started-screen-share');
            socket.off('user-stopped-screen-share');
        };
    }, [socket, handleUserJoined, handleOffer, handleAnswer, handleIceCandidate, handleUserLeft, handleUserAudioToggled, handleUserVideoToggled, handleUserScreenShare]);

    return {
        localStream,
        screenStream,
        participants,
        audioEnabled,
        videoEnabled,
        isScreenSharing,
        initializeMedia,
        toggleAudio,
        forceMuteAudio,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
        cleanup,
    };
};
