const express = require('express');

const { check, validationResult, param } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all ads
router.get('/ads-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId, role } = req.user;

        let text = `
            SELECT *, 
            CASE 
                WHEN expires_at < NOW() THEN 'EXPIRED'
                ELSE 'ACTIVE' 
            END as status_derived
            FROM ads 
            WHERE 1=1
        `;

        const params = [];
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            // No filters
        } else if (branchId) {
            text += ` AND branch_id = $${params.length + 1}`;
            params.push(branchId);
        } else if (vendorId) {
            text += ` AND vendor_id = $${params.length + 1}`;
            params.push(vendorId);
        } else {
            return res.json([]);
        }

        text += ` ORDER BY created_at DESC`;

        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        console.error('[API] Error fetching ads:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create new ad
router.post('/ads-post', [
    authMiddleware,
    check('type', 'Type is required').not().isEmpty(),
    check('media_url', 'Media URL is required').not().isEmpty(),
    check('duration_hours', 'Duration must be a positive number').isInt({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { type, media_url, description, duration_hours } = req.body;
        const { branchId, vendorId } = req.user;

        if (!type || !media_url || !duration_hours) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(duration_hours));

        const text = `
            INSERT INTO ads (type, media_url, description, duration_hours, expires_at, branch_id, vendor_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await query(text, [type, media_url, description, duration_hours, expiresAt, branchId, vendorId]);
        res.status(201).json({ message: 'Ad created successfully', ad: result.rows[0] });

    } catch (err) {
        console.error('[API] Error creating ad:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Delete ad
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId, vendorId, role } = req.user;

        let authQuery = 'SELECT id FROM ads WHERE id = $1';
        const authParams = [id];

        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            // No filters
        } else if (branchId) {
            authQuery += ' AND branch_id = $2';
            authParams.push(branchId);
        } else if (vendorId) {
            authQuery += ' AND vendor_id = $2';
            authParams.push(vendorId);
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const authResult = await query(authQuery, authParams);
        if (authResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: Ad not in your scope' });
        }

        await query('DELETE FROM ads WHERE id = $1', [id]);
        res.json({ message: 'Ad deleted successfully' });
    } catch (err) {
        console.error('[API] Error deleting ad:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Toggle active status
router.patch('/:id/toggle', [
    authMiddleware,
    param('id', 'Invalid Ad ID').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { branchId, vendorId, role } = req.user;

        let authQuery = 'SELECT id FROM ads WHERE id = $1';
        const authParams = [id];

        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            // No filters
        } else if (branchId) {
            authQuery += ' AND branch_id = $2';
            authParams.push(branchId);
        } else if (vendorId) {
            authQuery += ' AND vendor_id = $2';
            authParams.push(vendorId);
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const authResult = await query(authQuery, authParams);
        if (authResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: Ad not in your scope' });
        }

        const result = await query(
            'UPDATE ads SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
            [id]
        );
        res.json({ is_active: result.rows[0].is_active });
    } catch (err) {
        console.error('[API] Error toggling ad:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
