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

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomCode) => {
        socket.join(roomCode);
        console.log(`Socket ${socket.id} joined room ${roomCode}`);
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
