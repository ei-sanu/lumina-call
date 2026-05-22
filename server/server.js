import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import meetingsRouter from './routes/meetings.js';
import roomsRouter from './routes/rooms.js';
import { setupSocketHandlers } from './socket/handlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://novaarc.vercel.app',
    'http://localhost:8080',
    'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io configuration
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// API Routes
app.use('/api/meetings', meetingsRouter);
app.use('/api/rooms', roomsRouter);

// Root route for Render health checks
app.get('/', (req, res) => {
    res.send('NovaArc Server is running!');
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io server ready`);
});

export { io };
