const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all orders (with items and customer details)
router.get('/orders-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, supermarketId } = req.user;

        let text = `
            SELECT
                o.id,
                u.name as "customerName",
                o.status,
                o.total_price as "totalPrice",
                o.car_model,
                o.car_color,
                o.car_plate,
                o.created_at as "timestamp",
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'name', p.name,
                            'price', oi.price_at_purchase,
                            'quantity', oi.quantity,
                            'image', p.image_url,
                            'picked', false
                        )
                    ) FILTER(WHERE oi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM orders o
            LEFT JOIN customers u ON o.customer_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE 1=1
        `;

        const params = [];
        if (branchId) {
            text += ` AND o.branch_id = $${params.length + 1}`;
            params.push(branchId);
        } else if (supermarketId) {
            text += ` AND b.supermarket_id = $${params.length + 1}`;
            params.push(supermarketId);
        } else {
            return res.json([]);
        }

        text += ` GROUP BY o.id, u.name, o.status, o.total_price, o.car_model, o.car_color, o.car_plate, o.created_at ORDER BY o.created_at DESC`;

        const result = await query(text, params);

        const orders = result.rows.map(row => ({
            id: row.id,
            customerName: row.customerName || 'Unknown',
            status: row.status,
            totalPrice: parseFloat(row.totalPrice),
            car: {
                model: row.car_model || 'Unknown',
                color: row.car_color || 'Gray',
                plate: row.car_plate || 'N/A'
            },
            timestamp: row.timestamp,
            items: Array.isArray(row.items) ? row.items : []
        }));



        res.json(orders);
    } catch (err) {
        console.error('[API] Error fetching orders:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Update order status
router.patch('/:id/status', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { branchId, supermarketId } = req.user;

    try {
        let authCheckText = `
            SELECT o.id 
            FROM orders o 
            LEFT JOIN branches b ON o.branch_id = b.id 
            WHERE o.id = $1
        `;
        const authCheckParams = [id];

        if (branchId) {
            authCheckText += ` AND o.branch_id = $2`;
            authCheckParams.push(branchId);
        } else if (supermarketId) {
            authCheckText += ` AND b.supermarket_id = $2`;
            authCheckParams.push(supermarketId);
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const authCheckResult = await query(authCheckText, authCheckParams);

        if (authCheckResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized to update this order' });
        }

        const result = await query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get items for a specific order
router.get('/:id/items', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { branchId, supermarketId } = req.user;

    try {
        const authCheckText = `
            SELECT o.id 
            FROM orders o 
            LEFT JOIN branches b ON o.branch_id = b.id 
            WHERE o.id = $1
            AND (o.branch_id = $2 OR b.supermarket_id = $2)
        `;
        const authCheckResult = await query(authCheckText, [id, branchId || supermarketId]);

        if (authCheckResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const itemsQuery = `
            SELECT 
                oi.id,
                p.name,
                oi.price_at_purchase as price,
                oi.quantity
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const itemsResult = await query(itemsQuery, [id]);

        res.json(itemsResult.rows);
    } catch (err) {
        console.error('[API] Error fetching order items:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get recent arrivals for alerting
router.get('/arrivals-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, supermarketId } = req.user;

        let text = `
            SELECT 
                o.id,
                u.name as "customerName",
                o.status,
                o.total_price as "totalPrice",
                o.car_model,
                o.car_color,
                o.car_plate,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'name', p.name,
                            'price', oi.price_at_purchase,
                            'quantity', oi.quantity
                        )
                    ) FILTER(WHERE oi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM orders o
            LEFT JOIN customers u ON o.customer_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE o.status = 'ARRIVED'
        `;

        const params = [];
        if (branchId) {
            text += ` AND o.branch_id = $1`;
            params.push(branchId);
        } else if (supermarketId) {
            text += ` AND b.supermarket_id = $1`;
            params.push(supermarketId);
        }

        text += ` GROUP BY o.id, u.name, o.status, o.total_price, o.car_model, o.car_color, o.car_plate`;

        const result = await query(text, params);

        const arrivals = result.rows.map(row => ({
            id: row.id,
            customerName: row.customerName || 'Unknown',
            status: row.status,
            totalPrice: parseFloat(row.totalPrice),
            car: {
                model: row.car_model || 'Unknown',
                color: row.car_color || 'Gray',
                plate: row.car_plate || 'N/A'
            },
            items: row.items
        }));

        res.json(arrivals);
    } catch (err) {
        console.error('[API] Error fetching arrivals:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
