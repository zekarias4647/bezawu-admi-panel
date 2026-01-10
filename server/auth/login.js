const express = require('express');

const { check, validationResult } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        const text = `
            SELECT 
                m.id, m.name, m.email, m.role, m.password_hash, m.branch_id,
                b.name as branch_name,
                b.is_busy,
                b.status as branch_status,
                s.id as supermarket_id,
                s.name as supermarket_name,
                s.status as supermarket_status,
                (SELECT COUNT(*) FROM branches WHERE supermarket_id = s.id) as branch_count
            FROM managers m
            LEFT JOIN branches b ON m.branch_id = b.id
            LEFT JOIN supermarkets s ON b.supermarket_id = s.id
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
            { expiresIn: '4h' }
        );

        res.json({
            token,
            user: {
                id: manager.id,
                name: manager.name,
                email: manager.email,
                role: manager.role,
                branchId: manager.branch_id,
                branchName: manager.branch_name || 'Individual Branch',
                isBusy: manager.is_busy || false,
                branchStatus: manager.branch_status || 'active',
                supermarketId: manager.supermarket_id,
                supermarketName: manager.supermarket_name || 'Bezaw Supermarket',
                supermarketStatus: manager.supermarket_status || 'active',
                supermarketBranchCount: parseInt(manager.branch_count) || 0
            }
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
