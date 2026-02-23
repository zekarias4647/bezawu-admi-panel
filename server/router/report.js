const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get reports for the authenticated branch or vendor
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId } = req.user;

        let text = `
            SELECT 
                r.id,
                r.customer_id as "customerId",
                r.order_id as "orderId",
                r.reason,
                r.description,
                r.status,
                r.created_at as "createdAt",
                r.branch_id as "branchId",
                u.name as "customerName",
                u.phone as "customerPhone"
            FROM reports r
            LEFT JOIN customers u ON r.customer_id::text = u.id::text
            WHERE 1=1
        `;

        const params = [];
        if (branchId) {
            text += ` AND r.branch_id::text = $1::text`;
            params.push(branchId);
        } else if (vendorId) {
            text += ` AND r.branch_id IN (SELECT id::text FROM branches WHERE vendor_id::text = $1::text)`;
            params.push(vendorId);
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        text += ` ORDER BY r.created_at DESC`;

        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        console.error('[API] Error fetching reports:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update report status
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateQuery = `
            UPDATE reports 
            SET status = $1 
            WHERE id = $2 
            RETURNING *
        `;
        const result = await query(updateQuery, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({ message: 'Status updated successfully', report: result.rows[0] });
    } catch (err) {
        console.error('[API] Error updating report status:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
