
const express = require('express');
const { check, validationResult, param } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all gifts
router.get('/gifts-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId } = req.user;
        let text = `
            SELECT 
                g.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', gi.id,
                            'product_id', gi.product_id,
                            'name', p.name,
                            'price', p.price,
                            'quantity', gi.quantity,
                            'image_url', p.image_url,
                            'selected_addons', gi.selected_addons
                        )
                    ) FILTER (WHERE gi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM gifts g
            LEFT JOIN gift_items gi ON g.id = gi.gift_id
            LEFT JOIN products p ON gi.product_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (branchId) {
            text += ` AND g.branch_id = $${params.length + 1}`;
            params.push(branchId);
        } else if (vendorId) {
            text += ` AND g.vendor_id = $${params.length + 1}`;
            params.push(vendorId);
        }

        text += ' GROUP BY g.id ORDER BY g.created_at DESC';
        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        console.error('[Gifts API] Error fetching gifts:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create new gift
router.post('/gifts-post', [
    authMiddleware,
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('price', 'Price must be a positive number').isFloat({ min: 0 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, price, image_url, items, gift_addons } = req.body;
        const { branchId, vendorId } = req.user;

        // Start transaction
        await query('BEGIN');

        const giftText = `
            INSERT INTO gifts (name, description, price, image_url, branch_id, vendor_id, gift_addons)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const giftValues = [name, description, price, image_url, branchId, vendorId, JSON.stringify(gift_addons || [])];
        const giftResult = await query(giftText, giftValues);
        const giftId = giftResult.rows[0].id;

        if (items && Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                await query(
                    'INSERT INTO gift_items (gift_id, product_id, quantity, selected_addons) VALUES ($1, $2, $3, $4)',
                    [giftId, item.product_id, parseInt(item.quantity) || 1, JSON.stringify(item.selected_addons || [])]
                );
            }
        }

        await query('COMMIT');
        res.status(201).json(giftResult.rows[0]);
    } catch (err) {
        await query('ROLLBACK');
        console.error('[Gifts API] Error creating gift:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Toggle visibility
router.patch('/:id/toggle', [
    authMiddleware,
    param('id', 'Invalid Gift ID').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const result = await query(
            'UPDATE gifts SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Gift not found' });
        }

        res.json({ is_active: result.rows[0].is_active });
    } catch (err) {
        console.error('[Gifts API] Error toggling gift:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete gift
router.delete('/:id', [
    authMiddleware,
    param('id', 'Invalid Gift ID').isInt()
], async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM gifts WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Gift not found' });
        }

        res.json({ message: 'Gift deleted successfully' });
    } catch (err) {
        console.error('[Gifts API] Error deleting gift:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
