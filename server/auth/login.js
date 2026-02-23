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
                v.id as vendor_id,
                v.name as vendor_name,
                v.status as vendor_status,
                v.business_type,
                b.opening_hours,
                b.closing_hours,
                (SELECT COUNT(*) FROM branches WHERE vendor_id = v.id) as branch_count
            FROM managers m
            LEFT JOIN branches b ON m.branch_id = b.id
            LEFT JOIN vendors v ON b.vendor_id = v.id
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
                vendorId: manager.vendor_id,
                businessType: manager.business_type
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
                vendorId: manager.vendor_id,
                vendorName: manager.vendor_name || 'Bezaw Vendor',
                vendorStatus: manager.vendor_status || 'active',
                businessType: manager.business_type,
                openingHours: manager.opening_hours,
                closingHours: manager.closing_hours,
                vendorBranchCount: parseInt(manager.branch_count) || 0
            }
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
