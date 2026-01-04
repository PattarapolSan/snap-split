import express from 'express';
import multer from 'multer';
import { ReceiptService } from '../services/receiptService';

const router = express.Router();

// Memory storage to get the buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

const receiptService = new ReceiptService();

// Post /api/rooms/:code/receipts
router.post('/:code/analyze', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const items = await receiptService.analyzeReceipt(req.file.buffer, req.file.mimetype);

        res.json({ items });
    } catch (error: any) {
        console.error('Analyze route error:', error);
        res.status(500).json({ error: error.message || 'Analysis failed' });
    }
});

export default router;
