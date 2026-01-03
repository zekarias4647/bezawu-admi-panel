const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const text = `
            SELECT m.*, b.supermarket_id 
            FROM managers m 
            LEFT JOIN branches b ON m.branch_id = b.id 
            WHERE m.email = $1
        `;
        const result = await query(text, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const manager = result.rows[0];
        const isMatch = await bcrypt.compare(password, manager.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: manager.id,
                email: manager.email,
                role: manager.role,
                branchId: manager.branch_id,
                supermarketId: manager.supermarket_id
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: manager.id,
                email: manager.email,
                role: manager.role
            }
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
