import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/rooms';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

import receiptRoutes from './routes/receipts';

app.use('/api/rooms', roomRoutes);
app.use('/api/rooms', receiptRoutes); // Mount at /api/rooms too for /:code/analyze

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve static files from the client
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    // Assuming structure: root/server/dist/index.js -> root/client/dist
    const clientDist = path.join(__dirname, '../../client/dist');

    app.use(express.static(clientDist));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

const getOnlineParticipants = (roomCode: string) => {
    const sockets = io.sockets.adapter.rooms.get(roomCode);
    if (!sockets) return [];

    const participantIds = new Set<string>();
    sockets.forEach(socketId => {
        const s = io.sockets.sockets.get(socketId);
        if (s?.data?.participantId) {
            participantIds.add(s.data.participantId);
        }
    });
    return Array.from(participantIds);
};

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomCode, participantId) => {
        socket.join(roomCode);
        socket.data.participantId = participantId;
        console.log(`Socket ${socket.id} (Participant ${participantId}) joined room ${roomCode}`);

        // Notify everyone about new presence
        io.to(roomCode).emit('online-participants', getOnlineParticipants(roomCode));
    });

    socket.on('disconnecting', () => {
        // Rooms are still available here
        socket.rooms.forEach(room => {
            // Wait a tiny bit for the socket to actually leave the room in adapter
            // Or just filter out the current socket manually
            const online = getOnlineParticipants(room).filter(id => id !== socket.data.participantId);
            io.to(room).emit('online-participants', online);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export { app, httpServer, io };
