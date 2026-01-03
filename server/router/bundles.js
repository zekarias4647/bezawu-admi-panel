const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all bundles for the logged-in manager's branch or supermarket
router.get('/bundles-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, supermarketId } = req.user;

        let text = `
            SELECT 
                b.id,
                b.name,
                b.description,
                b.price,
                b.discount,
                b.image_url,
                b.is_active,
                b.created_at,
                b.branch_id,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', bi.id,
                            'product_id', bi.product_id,
                            'product_name', p.name,
                            'quantity', bi.quantity,
                            'price', p.price
                        )
                    ) FILTER(WHERE bi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM bundles b
            LEFT JOIN bundle_items bi ON b.id = bi.bundle_id
            LEFT JOIN products p ON bi.product_id = p.id
            LEFT JOIN branches br ON b.branch_id = br.id
            WHERE 1=1
        `;

        const params = [];
        if (branchId) {
            text += ` AND b.branch_id = $${params.length + 1}`;
            params.push(branchId);
        } else if (supermarketId) {
            text += ` AND br.supermarket_id = $${params.length + 1}`;
            params.push(supermarketId);
        } else {
            return res.json([]);
        }

        text += ` GROUP BY b.id, b.name, b.description, b.price, b.discount, b.image_url, b.is_active, b.created_at, b.branch_id ORDER BY b.created_at DESC`;

        const result = await query(text, params);

        const bundles = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            discount: parseFloat(row.discount || 0),
            image_url: row.image_url,
            is_active: row.is_active,
            created_at: row.created_at,
            branch_id: row.branch_id,
            items: Array.isArray(row.items) ? row.items : []
        }));

        res.json(bundles);
    } catch (err) {
        console.error('[API] Error fetching bundles:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Create a new bundle
router.post('/bundles-post', authMiddleware, async (req, res) => {
    try {
        const { name, description, price, discount, image_url, items } = req.body;
        const { branchId } = req.user;

        if (!branchId) {
            return res.status(400).json({ message: 'Branch association required' });
        }

        // Calculate final price after discount
        const basePrice = parseFloat(price) || 0;
        const discountPercent = parseFloat(discount) || 0;
        const finalPrice = basePrice * (1 - (discountPercent / 100));

        // Start transaction
        await query('BEGIN');

        try {
            // Insert bundle with calculated final price
            const bundleResult = await query(
                `INSERT INTO bundles (name, description, price, discount, image_url, branch_id) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [name, description, finalPrice, discountPercent, image_url, branchId]
            );

            const bundle = bundleResult.rows[0];

            // Insert bundle items if provided
            if (items && Array.isArray(items) && items.length > 0) {
                for (const item of items) {
                    await query(
                        `INSERT INTO bundle_items (bundle_id, product_id, quantity) 
                         VALUES ($1, $2, $3)`,
                        [bundle.id, item.product_id, item.quantity]
                    );
                }
            }

            await query('COMMIT');

            res.status(201).json({
                message: 'Bundle created successfully',
                bundle: {
                    id: bundle.id,
                    name: bundle.name,
                    description: bundle.description,
                    price: parseFloat(bundle.price),
                    discount: parseFloat(bundle.discount),
                    image_url: bundle.image_url,
                    branch_id: bundle.branch_id
                }
            });
        } catch (err) {
            await query('ROLLBACK');
            throw err;
        }
    } catch (err) {
        console.error('[API] Error creating bundle:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Update bundle active status
router.patch('/bundles/:id/toggle', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId, supermarketId } = req.user;

        // Authorization check
        let authQuery = 'SELECT b.id FROM bundles b LEFT JOIN branches br ON b.branch_id = br.id WHERE b.id = $1';
        const authParams = [id];

        if (branchId) {
            authQuery += ' AND b.branch_id = $2';
            authParams.push(branchId);
        } else if (supermarketId) {
            authQuery += ' AND br.supermarket_id = $2';
            authParams.push(supermarketId);
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const authResult = await query(authQuery, authParams);
        if (authResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: Bundle not in your scope' });
        }

        // Toggle active status
        const result = await query(
            'UPDATE bundles SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
            [id]
        );

        res.json({
            message: 'Bundle status updated',
            is_active: result.rows[0].is_active
        });
    } catch (err) {
        console.error('[API] Error toggling bundle status:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Delete bundle
router.delete('/bundles/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId, supermarketId } = req.user;

        // Authorization check
        let authQuery = 'SELECT b.id FROM bundles b LEFT JOIN branches br ON b.branch_id = br.id WHERE b.id = $1';
        const authParams = [id];

        if (branchId) {
            authQuery += ' AND b.branch_id = $2';
            authParams.push(branchId);
        } else if (supermarketId) {
            authQuery += ' AND br.supermarket_id = $2';
            authParams.push(supermarketId);
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const authResult = await query(authQuery, authParams);
        if (authResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: Bundle not in your scope' });
        }

        // Delete bundle items first (foreign key constraint)
        await query('DELETE FROM bundle_items WHERE bundle_id = $1', [id]);

        // Delete bundle
        await query('DELETE FROM bundles WHERE id = $1', [id]);

        res.json({ message: 'Bundle deleted successfully' });
    } catch (err) {
        console.error('[API] Error deleting bundle:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

module.exports = router;
