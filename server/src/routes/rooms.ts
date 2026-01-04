import { Router } from 'express';
import { roomService } from '../services/roomService';
import { io } from '../index';

const router = Router();

// Create Room
router.post('/', async (req, res) => {
    try {
        const { roomName, creatorName } = req.body;
        if (!roomName || !creatorName) {
            return res.status(400).json({ error: 'Missing roomName or creatorName' });
        }
        const room = await roomService.createRoom(roomName, creatorName);
        res.json(room);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Get Room State
router.get('/:code', async (req, res) => {
    try {
        const state = await roomService.getRoomState(req.params.code);
        if (!state) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(state);
    } catch (e) {
        res.status(500).json({ error: 'Failed to get room' });
    }
});

// Join Room
router.post('/:code/join', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });

        const participant = await roomService.joinRoom(req.params.code, name);
        if (!participant) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Notify room
        io.to(req.params.code).emit('participant-joined', participant);

        res.json(participant);
    } catch (e) {
        res.status(500).json({ error: 'Failed to join room' });
    }
});

// Add Item
router.post('/:code/items', async (req, res) => {
    try {
        const { name, price, quantity, roomId } = req.body;
        const item = await roomService.addItem(roomId, name, price, quantity);

        io.to(req.params.code).emit('item-added', item);
        res.json(item);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Update Item
router.patch('/:code/items/:itemId', async (req, res) => {
    try {
        const { name, price, quantity } = req.body;
        const item = await roomService.updateItem(req.params.itemId, { name, price, quantity });

        if (item) {
            io.to(req.params.code).emit('item-updated', item);
            res.json(item);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Remove Item
router.delete('/:code/items/:itemId', async (req, res) => {
    try {
        const success = await roomService.removeItem(req.params.itemId);
        if (success) {
            io.to(req.params.code).emit('item-removed', req.params.itemId);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Add Assignment
router.post('/:code/assignments', async (req, res) => {
    try {
        const { itemId, participantId } = req.body;
        const assignment = await roomService.assignItem(itemId, participantId);

        io.to(req.params.code).emit('assignment-added', assignment);
        res.json(assignment);
    } catch (e) {
        res.status(500).json({ error: 'Failed to assign item' });
    }
});

// Remove Assignment
router.delete('/:code/assignments/:id', async (req, res) => {
    try {
        const success = await roomService.removeAssignment(req.params.id);
        if (success) {
            io.to(req.params.code).emit('assignment-removed', req.params.id);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Assignment not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Failed to remove assignment' });
    }
});



// Delete Room
router.delete('/:code', async (req, res) => {
    try {
        const success = await roomService.deleteRoom(req.params.code);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Room not found' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

export default router;
