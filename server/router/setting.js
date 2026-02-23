const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Change Password API
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user.id;

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' });
        }

        // 1. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 2. Update password in database
        await query('UPDATE managers SET password_hash = $1 WHERE id = $2', [hashedNewPassword, userId]);

        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error('[Settings API] Change Password Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Toggle Branch Busy Status
router.patch('/toggle-busy', authMiddleware, async (req, res) => {
    try {
        const { branchId } = req.user;
        const { isBusy } = req.body;

        if (!branchId) {
            return res.status(403).json({ message: 'Only branch managers can toggle busy status' });
        }

        await query('UPDATE branches SET is_busy = $1 WHERE id = $2', [isBusy, branchId]);

        if (isBusy) {
            await query(
                'INSERT INTO audit_logs (admin_id, branch_id, vendor_id, action, severity) VALUES ($1, $2, $3, $4, $5)',
                [
                    req.user.id,
                    req.user.branchId,
                    req.user.vendorId,
                    'BRANCH_BUSY_ON',
                    'WARNING'
                ]
            );
        }

        res.json({ message: `Branch status updated to ${isBusy ? 'Busy' : 'Available'}`, isBusy });
    } catch (err) {
        console.error('[Settings API] Toggle Busy Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update Branch Opening/Closing Hours
router.patch('/update-hours', authMiddleware, async (req, res) => {
    try {
        const { branchId } = req.user;
        const { openingHours, closingHours } = req.body;

        if (!branchId) {
            return res.status(403).json({ message: 'Only branch managers can update hours' });
        }

        await query(
            'UPDATE branches SET opening_hours = $1, closing_hours = $2 WHERE id = $3',
            [openingHours, closingHours, branchId]
        );

        await query(
            'INSERT INTO audit_logs (admin_id, branch_id, vendor_id, action, severity) VALUES ($1, $2, $3, $4, $5)',
            [
                req.user.id,
                req.user.branchId,
                req.user.vendorId,
                'BRANCH_HOURS_UPDATE',
                'INFO'
            ]
        );

        res.json({ message: 'Branch hours updated successfully', openingHours, closingHours });
    } catch (err) {
        console.error('[Settings API] Update Hours Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
