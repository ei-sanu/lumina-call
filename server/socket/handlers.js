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
                        host: isHost ? socket.id : null, // Store socket.id as host
                        hostUserId: isHost ? userId : null,
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

                // Create participant object
                const participant = {
                    socketId: socket.id,
                    userId,
                    userName,
                    isHost,
                    audioEnabled: true,
                    videoEnabled: true,
                    screenSharing: false,
                    handRaised: false,
                };

                // Add participant to room keyed by socketId
                room.participants.set(socket.id, participant);
                userSocketMap.set(socket.id, { roomId, userId });

                // Get existing participants (exclude current socket)
                const existingParticipants = Array.from(room.participants.values())
                    .filter(p => p.socketId !== socket.id);

                // Notify the new user about existing participants
                socket.emit('existing-participants', existingParticipants);

                // Notify existing participants about the new user
                socket.to(roomId).emit('user-joined', participant);

                console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // WebRTC Signaling - Offer
        socket.on('offer', ({ to, offer, from, fromUserId }) => {
            io.to(to).emit('offer', { from, offer, fromUserId });
        });

        // WebRTC Signaling - Answer
        socket.on('answer', ({ to, answer, from, fromUserId }) => {
            io.to(to).emit('answer', { from, answer, fromUserId });
        });

        // WebRTC Signaling - ICE Candidate
        socket.on('ice-candidate', ({ to, candidate, from }) => {
            io.to(to).emit('ice-candidate', { from, candidate });
        });

        // Toggle audio/video (identify by socket.id)
        socket.on('toggle-audio', ({ roomId, audioEnabled }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(socket.id)) {
                room.participants.get(socket.id).audioEnabled = audioEnabled;
                socket.to(roomId).emit('user-audio-toggled', { socketId: socket.id, audioEnabled });
            }
        });

        socket.on('toggle-video', ({ roomId, videoEnabled }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(socket.id)) {
                room.participants.get(socket.id).videoEnabled = videoEnabled;
                socket.to(roomId).emit('user-video-toggled', { socketId: socket.id, videoEnabled });
            }
        });

        // Screen sharing
        socket.on('start-screen-share', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(socket.id)) {
                room.participants.get(socket.id).screenSharing = true;
                socket.to(roomId).emit('user-started-screen-share', { socketId: socket.id });
            }
        });

        socket.on('stop-screen-share', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(socket.id)) {
                room.participants.get(socket.id).screenSharing = false;
                socket.to(roomId).emit('user-stopped-screen-share', { socketId: socket.id });
            }
        });

        // Raise hand
        socket.on('raise-hand', ({ roomId, raised }) => {
            const room = rooms.get(roomId);
            if (room && room.participants.has(socket.id)) {
                room.participants.get(socket.id).handRaised = raised;
                socket.to(roomId).emit('hand-raised', { socketId: socket.id, raised });
            }
        });

        // Chat messages
        socket.on('chat-message', ({ roomId, message, userId, userName, recipientId }) => {
            const chatMessage = {
                id: `${Date.now()}-${socket.id}`,
                userId,
                userName,
                message,
                timestamp: Date.now(),
                recipientId,
            };

            if (recipientId) {
                const room = rooms.get(roomId);
                if (room) {
                    // Try to find recipient by socketId (recipientId here is likely socketId now)
                    const recipient = room.participants.get(recipientId);
                    if (recipient) {
                        io.to(recipient.socketId).emit('chat-message', chatMessage);
                        socket.emit('chat-message', chatMessage);
                    }
                }
            } else {
                io.to(roomId).emit('chat-message', chatMessage);
            }
        });

        // Host controls
        socket.on('host-mute-participant', ({ roomId, targetSocketId }) => {
            const room = rooms.get(roomId);
            if (room && room.host === socket.id) {
                const target = room.participants.get(targetSocketId);
                if (target) {
                    io.to(targetSocketId).emit('host-muted-you');
                    target.audioEnabled = false;
                    socket.to(roomId).emit('user-audio-toggled', { socketId: targetSocketId, audioEnabled: false });
                }
            }
        });

        socket.on('host-remove-participant', ({ roomId, targetSocketId }) => {
            const room = rooms.get(roomId);
            if (room && room.host === socket.id) {
                const target = room.participants.get(targetSocketId);
                if (target) {
                    io.to(targetSocketId).emit('removed-by-host');
                    handleUserLeave(targetSocketId);
                }
            }
        });

        socket.on('leave-room', () => {
            handleUserLeave(socket.id);
        });

        socket.on('disconnect', () => {
            handleUserLeave(socket.id);
        });

        function handleUserLeave(socketId) {
            const userData = userSocketMap.get(socketId);
            if (!userData) return;

            const { roomId } = userData;
            const room = rooms.get(roomId);

            if (room) {
                room.participants.delete(socketId);
                socket.to(roomId).emit('user-left', { socketId });

                if (room.participants.size === 0) {
                    rooms.delete(roomId);
                } else if (room.host === socketId) {
                    const nextParticipant = Array.from(room.participants.values())[0];
                    room.host = nextParticipant.socketId;
                    nextParticipant.isHost = true;
                    io.to(roomId).emit('host-changed', { newHostId: nextParticipant.socketId });
                }
            }
            userSocketMap.delete(socketId);
        }
    });
};

export const getRooms = () => rooms;
