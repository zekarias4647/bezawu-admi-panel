const express = require('express');

const { check, validationResult, param } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get chat history for an order
router.get('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await query(
            'SELECT * FROM order_chats WHERE order_id = $1 ORDER BY created_at ASC',
            [orderId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[API] Error fetching chat history:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Send a message (Admin side)
router.post('/:orderId', [
    authMiddleware,
    param('orderId', 'Invalid Order ID').isUUID(),
    check('message', 'Message is required').not().isEmpty().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { orderId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const result = await query(
            `INSERT INTO order_chats (order_id, sender_type, message) 
             VALUES ($1, 'ADMIN', $2) 
             RETURNING *`,
            [orderId, message]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[API] Error sending message:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
