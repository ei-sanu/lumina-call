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

// CORS configuration for Production
const allowedOrigins = [
    'https://novaarc.vercel.app',
    process.env.CLIENT_URL,
    'http://localhost:8080',
    'http://localhost:5173'
].filter(Boolean);

console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked for origin:', origin);
            callback(null, true); // Allow for trial, log the issue
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io configuration
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Root route
app.get('/', (req, res) => {
    res.send('NovaArc Server is running!');
});

// API Routes
app.use('/api/meetings', meetingsRouter);
app.use('/api/rooms', roomsRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io server ready`);
});

export { io };
