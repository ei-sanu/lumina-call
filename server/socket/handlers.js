// Store active rooms and their participants
const rooms = new Map();
const userSocketMap = new Map();

export const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join room
        socket.on('join-room', async ({ roomId, userId, userName, isHost }) => {
            try {
                socket.join(roomId);

                // Initialize room if it doesn't exist
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, {
                        participants: new Map(),
                        host: isHost ? userId : null,
                        locked: false,
                        createdAt: Date.now(),
                    });
                }

                const room = rooms.get(roomId);

                // Check if room is locked
                if (room.locked && !isHost) {
                    socket.emit('room-locked');
                    return;
                }

                // Add participant to room
                room.participants.set(userId, {
                    socketId: socket.id,
                    userId,
                    userName,
                    isHost,
                    audioEnabled: true,
                    videoEnabled: true,
                    screenSharing: false,
                    handRaised: false,
                });

                userSocketMap.set(socket.id, { roomId, userId });

                // Get existing participants
                const existingParticipants = Array.from(room.participants.values())
                    .filter(p => p.userId !== userId);

                // Notify the new user about existing participants
                socket.emit('existing-participants', existingParticipants);

                // Notify existing participants about the new user
                socket.to(roomId).emit('user-joined', {
                    userId,
                    userName,
                    socketId: socket.id,
                    audioEnabled: true,
                    videoEnabled: true,
                });

                console.log(`User ${userName} joined room ${roomId}`);
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // WebRTC Signaling - Offer
        socket.on('offer', ({ to, offer, from }) => {
            io.to(to).emit('offer', { from, offer });
        });

        // WebRTC Signaling - Answer
        socket.on('answer', ({ to, answer, from }) => {
            io.to(to).emit('answer', { from, answer });
        });

        // WebRTC Signaling - ICE Candidate
        socket.on('ice-candidate', ({ to, candidate, from }) => {
            io.to(to).emit('ice-candidate', { from, candidate });
        });

        // Toggle audio
        socket.on('toggle-audio', ({ roomId, userId, audioEnabled }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(userId)) {
                room.participants.get(userId).audioEnabled = audioEnabled;
                socket.to(roomId).emit('user-audio-toggled', { userId, audioEnabled });
            }
        });

        // Toggle video
        socket.on('toggle-video', ({ roomId, userId, videoEnabled }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(userId)) {
                room.participants.get(userId).videoEnabled = videoEnabled;
                socket.to(roomId).emit('user-video-toggled', { userId, videoEnabled });
            }
        });

        // Screen sharing
        socket.on('start-screen-share', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(userId)) {
                room.participants.get(userId).screenSharing = true;
                socket.to(roomId).emit('user-started-screen-share', { userId });
            }
        });

        socket.on('stop-screen-share', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(userId)) {
                room.participants.get(userId).screenSharing = false;
                socket.to(roomId).emit('user-stopped-screen-share', { userId });
            }
        });

        // Raise hand
        socket.on('raise-hand', ({ roomId, userId, raised }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(userId)) {
                room.participants.get(userId).handRaised = raised;
                socket.to(roomId).emit('hand-raised', { userId, raised });
            }
        });

        // Chat messages
        socket.on('chat-message', ({ roomId, message, userId, userName }) => {
            const chatMessage = {
                id: `${Date.now()}-${userId}`,
                userId,
                userName,
                message,
                timestamp: Date.now(),
            };
            io.to(roomId).emit('chat-message', chatMessage);
        });

        // Host controls - Mute participant
        socket.on('host-mute-participant', ({ roomId, targetUserId, hostId }) => {
            const room = rooms.get(roomId);
            if (room && room.host === hostId) {
                const targetParticipant = room.participants.get(targetUserId);
                if (targetParticipant) {
                    io.to(targetParticipant.socketId).emit('host-muted-you');
                    targetParticipant.audioEnabled = false;
                    socket.to(roomId).emit('user-audio-toggled', {
                        userId: targetUserId,
                        audioEnabled: false
                    });
                }
            }
        });

        // Host controls - Remove participant
        socket.on('host-remove-participant', ({ roomId, targetUserId, hostId }) => {
            const room = rooms.get(roomId);
            if (room && room.host === hostId) {
                const targetParticipant = room.participants.get(targetUserId);
                if (targetParticipant) {
                    io.to(targetParticipant.socketId).emit('removed-by-host');
                    handleUserLeave(targetParticipant.socketId);
                }
            }
        });

        // Host controls - Lock room
        socket.on('host-lock-room', ({ roomId, locked, hostId }) => {
            const room = rooms.get(roomId);
            if (room && room.host === hostId) {
                room.locked = locked;
                socket.to(roomId).emit('room-lock-changed', { locked });
            }
        });

        // Leave room
        socket.on('leave-room', () => {
            handleUserLeave(socket.id);
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            handleUserLeave(socket.id);
        });

        // Helper function to handle user leaving
        function handleUserLeave(socketId) {
            const userData = userSocketMap.get(socketId);
            if (!userData) return;

            const { roomId, userId } = userData;
            const room = rooms.get(roomId);

            if (room) {
                room.participants.delete(userId);
                socket.to(roomId).emit('user-left', { userId });

                // Clean up empty rooms
                if (room.participants.size === 0) {
                    rooms.delete(roomId);
                    console.log(`Room ${roomId} deleted (empty)`);
                } else if (room.host === userId) {
                    // Transfer host to another participant
                    const newHost = Array.from(room.participants.values())[0];
                    room.host = newHost.userId;
                    newHost.isHost = true;
                    io.to(roomId).emit('host-changed', { newHostId: newHost.userId });
                }
            }

            userSocketMap.delete(socketId);
        }
    });
};

// Export room data for API access
export const getRooms = () => rooms;
