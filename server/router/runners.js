const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Get all runners for a branch or vendor
router.get('/runners-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId } = req.user;
        let text = 'SELECT * FROM runners WHERE 1=1';
        const params = [];

        if (branchId) {
            text += ' AND branch_id = $1';
            params.push(branchId);
        } else if (vendorId) {
            text += ' AND vendor_id = $1';
            params.push(vendorId);
        } else {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        text += ' ORDER BY created_at DESC';
        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching runners:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add a runner
router.post('/runners-post', [
    authMiddleware,
    check('full_name', 'Full name is required').not().isEmpty(),
    check('phone', 'Phone is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { branchId, vendorId } = req.user;
        const { full_name, phone, email, pro_image, id } = req.body;

        const text = `
            INSERT INTO runners (id, branch_id, vendor_id, full_name, phone, email, pro_image)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const params = [id || undefined, branchId, vendorId, full_name, phone, email, pro_image];

        const result = await query(text, params);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating runner:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update runner status
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { branchId, vendorId } = req.user;

        // Verify ownership/access
        const checkText = 'SELECT * FROM runners WHERE id = $1';
        const checkResult = await query(checkText, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Runner not found' });
        }

        const runner = checkResult.rows[0];
        if (branchId && runner.branch_id !== branchId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        if (vendorId && runner.vendor_id !== vendorId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const updateText = 'UPDATE runners SET status = $1, last_active = NOW() WHERE id = $2 RETURNING *';
        const result = await query(updateText, [status, id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating runner status:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a runner
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId, vendorId } = req.user;

        // Verify access before delete
        const checkText = 'SELECT * FROM runners WHERE id = $1';
        const checkResult = await query(checkText, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Runner not found' });
        }

        const runner = checkResult.rows[0];
        if (branchId && runner.branch_id !== branchId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        if (vendorId && runner.vendor_id !== vendorId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await query('DELETE FROM runners WHERE id = $1', [id]);
        res.json({ message: 'Runner deleted successfully' });
    } catch (err) {
        console.error('Error deleting runner:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
