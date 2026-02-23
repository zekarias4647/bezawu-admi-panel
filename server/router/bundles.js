const express = require('express');

const { check, validationResult, param } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all bundles for the logged-in manager's branch or vendor
router.get('/bundles-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId } = req.user;

        let text = `
            SELECT
                b.id,
                b.name,
                b.description,
                b.price,
                b.discount,
                (b.price - (b.price * (COALESCE(b.discount, 0) / 100))) as discount_price,
                b.image_url,
                b.bundle_addons,
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
                            'price', p.price,
                            'selected_addons', bi.selected_addons
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
        } else if (vendorId) {
            text += ` AND br.vendor_id = $${params.length + 1}`;
            params.push(vendorId);
        } else {
            return res.json([]);
        }

        text += ` GROUP BY b.id, b.name, b.description, b.price, b.discount, b.image_url, b.bundle_addons, b.is_active, b.created_at, b.branch_id ORDER BY b.created_at DESC`;

        const result = await query(text, params);

        const bundles = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            discount: parseFloat(row.discount || 0),
            discount_price: parseFloat(row.discount_price),
            image_url: row.image_url,
            bundle_addons: row.bundle_addons,
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
router.post('/bundles-post', [
    authMiddleware,
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('price', 'Price must be a number').isFloat({ min: 0 }),
    check('discount', 'Discount must be between 0 and 100').optional().isFloat({ min: 0, max: 100 }),
    check('items', 'Items must be an array').isArray()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, description, price, discount, image_url, items, bundle_addons } = req.body;
        const { branchId, vendorId } = req.user;

        if (!branchId) {
            return res.status(400).json({ message: 'Branch association required' });
        }

        // Calculate discount price
        const parsedPrice = parseFloat(price) || 0;
        const parsedDiscount = parseFloat(discount) || 0;
        const discountPrice = parsedPrice - (parsedPrice * (parsedDiscount / 100));

        const finalBundleAddons = bundle_addons ? JSON.stringify(bundle_addons) : '[]';

        // Start transaction
        await query('BEGIN');

        try {
            // Insert bundle with calculated final price
            const bundleResult = await query(
                `INSERT INTO bundles (name, description, price, discount, image_url, branch_id, bundle_addons)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [name, description, parsedPrice, parsedDiscount, image_url, branchId, finalBundleAddons]
            );

            const bundle = bundleResult.rows[0];

            // Insert bundle items if provided
            if (items && Array.isArray(items) && items.length > 0) {
                for (const item of items) {
                    await query(
                        `INSERT INTO bundle_items (bundle_id, product_id, quantity, selected_addons) 
                         VALUES ($1, $2, $3, $4)`,
                        [bundle.id, item.product_id, item.quantity, JSON.stringify(item.selected_addons || [])]
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
router.patch('/bundles/:id/toggle', [
    authMiddleware,
    param('id', 'Invalid Bundle ID').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { branchId, vendorId } = req.user;

        // Authorization check
        let authQuery = 'SELECT b.id FROM bundles b LEFT JOIN branches br ON b.branch_id = br.id WHERE b.id = $1';
        const authParams = [id];

        if (branchId) {
            authQuery += ' AND b.branch_id = $2';
            authParams.push(branchId);
        } else if (vendorId) {
            authQuery += ' AND br.vendor_id = $2';
            authParams.push(vendorId);
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
        const { branchId, vendorId } = req.user;

        // Authorization check
        let authQuery = 'SELECT b.id FROM bundles b LEFT JOIN branches br ON b.branch_id = br.id WHERE b.id = $1';
        const authParams = [id];

        if (branchId) {
            authQuery += ' AND b.branch_id = $2';
            authParams.push(branchId);
        } else if (vendorId) {
            authQuery += ' AND br.vendor_id = $2';
            authParams.push(vendorId);
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
