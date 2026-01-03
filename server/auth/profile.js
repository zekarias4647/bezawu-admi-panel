const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get current logged-in user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const text = `
            SELECT 
                m.id,
                m.name,
                m.email,
                m.role,
                m.branch_id,
                b.name as branch_name,
                b.is_busy,
                s.id as supermarket_id,
                s.name as supermarket_name
            FROM managers m
            LEFT JOIN branches b ON m.branch_id = b.id
            LEFT JOIN supermarkets s ON b.supermarket_id = s.id
            WHERE m.id = $1
        `;
        const result = await query(text, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const manager = result.rows[0];
        res.json({
            id: manager.id,
            name: manager.name,
            email: manager.email,
            role: manager.role,
            branchId: manager.branch_id,
            branchName: manager.branch_name || 'Individual Branch',
            isBusy: manager.is_busy || false,
            supermarketId: manager.supermarket_id,
            supermarketName: manager.supermarket_name || 'Bezaw Supermarket'
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
