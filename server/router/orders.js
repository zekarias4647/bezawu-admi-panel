const express = require('express');
const { check, validationResult, param } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// ─── EMAIL INTEGRATION ────────────────────────────────────────────────────────
// Ensure this path matches where you put the email.js utility
const { sendStatusEmail } = require('../utils/email');

// ─── GET /orders-get ──────────────────────────────────────────────────────────
// Get all orders (with items and customer details)
router.get('/orders-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId } = req.user;

        let text = `
            SELECT
                o.id,
                u.name as "customerName",
                o.status,
                o.total_price as "totalPrice",
                o.vehicle_type,
                o.vehicle_plate,
                o.vehicle_color,
                o.car_model,
                o.car_color,
                o.car_plate,
                o.created_at as "timestamp",
                o.arrived_at as "arrivedAt",
                o.is_gift,
                o.payment_proof_url as payment_proof_url,
                EXTRACT(EPOCH FROM o.handover_time) as "handoverTimeSeconds",
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'name', COALESCE(p.name, bun.name),
                            'isBundle', (oi.bundle_id IS NOT NULL),
                            'price', oi.price_at_purchase,
                            'quantity', oi.quantity,
                            'image', COALESCE(p.image_url, bun.image_url, g.image_url),
                            'bundleItems', (
                                SELECT json_agg(
                                    json_build_object(
                                        'name', bp.name, 
                                        'quantity', bi.quantity,
                                        'selected_addons', COALESCE(bi.selected_addons, '[]'::jsonb)
                                    )
                                )
                                FROM bundle_items bi
                                JOIN products bp ON bi.product_id::text = bp.id::text
                                WHERE bi.bundle_id::text = oi.bundle_id::text
                            ),
                            'bundle_addons', COALESCE(bun.bundle_addons, '[]'::jsonb),
                            'giftItems', (
                                SELECT json_agg(
                                    json_build_object(
                                        'name', gp.name, 
                                        'quantity', gi.quantity,
                                        'selected_addons', COALESCE(gi.selected_addons, '[]'::jsonb)
                                    )
                                )
                                FROM gift_items gi
                                JOIN products gp ON gi.product_id::text = gp.id::text
                                WHERE gi.gift_id::text = oi.gift_id::text
                            ),
                            'gift_addons', COALESCE(g.gift_addons, '[]'::jsonb),
                            'isGift', (oi.gift_id IS NOT NULL),
                            'selected_addons', COALESCE(oi.selected_addons, '[]'::jsonb),
                            'picked', false
                        )
                    ) FILTER(WHERE oi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM orders o
            LEFT JOIN customers u ON o.customer_id::text = u.id::text
            LEFT JOIN order_items oi ON o.id::text = oi.order_id::text
            LEFT JOIN products p ON oi.product_id::text = p.id::text
            LEFT JOIN bundles bun ON oi.bundle_id::text = bun.id::text
            LEFT JOIN gifts g ON oi.gift_id::text = g.id::text
            LEFT JOIN branches b ON o.branch_id::text = b.id::text
            WHERE 1=1
        `;

        const params = [];
        if (branchId) {
            text += ` AND o.branch_id::text = $${params.length + 1}::text`;
            params.push(branchId);
        } else if (vendorId) {
            text += ` AND b.vendor_id::text = $${params.length + 1}::text`;
            params.push(vendorId);
        } else {
            return res.json([]);
        }

        text += ` GROUP BY o.id, u.name, o.status, o.total_price, o.car_model, o.car_color, o.car_plate, o.vehicle_type, o.vehicle_plate, o.vehicle_color, o.created_at, o.arrived_at, o.handover_time, o.payment_proof_url, o.is_gift ORDER BY o.created_at DESC`;

        const result = await query(text, params);

        const orders = result.rows.map(row => {
            const isPrivate = !row.vehicle_type || row.vehicle_type === 'private';
            return {
                id: row.id,
                customerName: row.customerName || 'Unknown',
                status: row.status,
                totalPrice: parseFloat(row.totalPrice),
                car: {
                    model: isPrivate ? (row.car_model || 'Unknown') : row.vehicle_type,
                    color: isPrivate ? (row.car_color || 'Gray') : (row.vehicle_color || 'Gray'),
                    plate: isPrivate ? (row.car_plate || 'N/A') : (row.vehicle_plate || 'N/A')
                },
                timestamp: row.timestamp,
                items: Array.isArray(row.items) ? row.items : [],
                arrivedAt: row.arrivedAt,
                isGift: row.is_gift || false,
                paymentProofUrl: row.payment_proof_url ? (row.payment_proof_url.startsWith('http') ? row.payment_proof_url : `https://webappapi.bezawcurbside.com${row.payment_proof_url.startsWith('/') ? '' : '/'}${row.payment_proof_url}`) : null,
                handoverTimeSeconds: row.handoverTimeSeconds ? parseFloat(row.handoverTimeSeconds) : null
            };
        });

        console.log('[API] First 3 order PaymentProofUrls:', orders.slice(0, 3).map(o => o.paymentProofUrl));
        res.json(orders);
    } catch (err) {
        console.error('[API] Error fetching orders:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// ─── PATCH /:id/status (UPDATED) ─────────────────────────────────────────────
// Update order status and trigger email notifications
router.patch('/:id/status', [
    authMiddleware,
    param('id', 'Invalid Order ID').notEmpty().isString(),
    check('status', 'Status is required').not().isEmpty(),
    check('status', 'Invalid status value').isIn(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'VERIFIED', 'GIVEN'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { status } = req.body;
    const { branchId, vendorId } = req.user;

    try {
        // Fetch order AND customer email in one go
        let authCheckText = `
            SELECT o.id, u.email 
            FROM orders o 
            LEFT JOIN branches b ON o.branch_id = b.id 
            LEFT JOIN customers u ON o.customer_id::text = u.id::text
            WHERE o.id = $1
        `;
        const authCheckParams = [id];

        if (branchId) {
            authCheckText += ` AND o.branch_id = $2`;
            authCheckParams.push(branchId);
        } else if (vendorId) {
            authCheckText += ` AND b.vendor_id = $2`;
            authCheckParams.push(vendorId);
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const authCheckResult = await query(authCheckText, authCheckParams);

        if (authCheckResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized to update this order' });
        }

        const customerEmail = authCheckResult.rows[0].email;

        let updateQuery = 'UPDATE orders SET status = $1';
        let queryParams = [status];

        if (status === 'ARRIVED') {
            updateQuery += ', arrived_at = COALESCE(arrived_at, NOW())';
        } else if (['COMPLETED', 'VERIFIED', 'GIVEN'].includes(status)) {
            updateQuery += ', completed_at = NOW()';
        }

        updateQuery += ' WHERE id = $' + (queryParams.length + 1) + ' RETURNING *';
        queryParams.push(id);

        const result = await query(updateQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // ─── TRIGGER EMAIL LOGIC ───
        if (customerEmail && customerEmail.trim().length > 0) {
            let emailTitle = '';
            let emailMessage = '';

            const upperStatus = status.toUpperCase();
            if (upperStatus === 'PREPARING') {
                emailTitle = 'Order Preparing';
                emailMessage = `Good news! Your order ${id} is now being prepared and will be ready soon.`;
            } else if (['COMPLETED', 'VERIFIED', 'GIVEN', 'READY'].includes(upperStatus)) {
                emailTitle = upperStatus === 'READY' ? 'Order Ready' : 'Order Handed Over';
                emailMessage = upperStatus === 'READY'
                    ? `Your order ${id} is now ready! Our team is waiting for you at the pickup point.`
                    : `Your order ${id} has been handed over. Thank you for choosing Bezaw Curbside!`;
            }

            if (emailTitle) {
                // Sent in background (no await) so API stays fast
                sendStatusEmail(customerEmail, `Bezaw Curbside: ${emailTitle}`, emailTitle, emailMessage, id)
                    .then(sent => console.log(`[Email] Notification sent for ${id}: ${sent}`))
                    .catch(e => console.error(`[Email Error] ${e.message}`));
            }
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ─── GET /:id/items ───────────────────────────────────────────────────────────
router.get('/:id/items', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { branchId, vendorId } = req.user;

    try {
        const authCheckText = `
            SELECT o.id 
            FROM orders o 
            LEFT JOIN branches b ON o.branch_id = b.id 
            WHERE o.id = $1
            AND (o.branch_id = $2 OR b.vendor_id = $2)
        `;
        const authCheckResult = await query(authCheckText, [id, branchId || vendorId]);

        if (authCheckResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const itemsQuery = `
            SELECT 
                oi.id,
                COALESCE(p.name, bun.name, g.name) as name,
                oi.price_at_purchase as price,
                oi.quantity,
                COALESCE(oi.selected_addons, '[]'::jsonb) as "selected_addons",
                (
                    SELECT json_agg(
                        json_build_object(
                            'name', bp.name, 
                            'quantity', bi.quantity,
                            'selected_addons', COALESCE(bi.selected_addons, '[]'::jsonb)
                        )
                    )
                    FROM bundle_items bi
                    JOIN products bp ON bi.product_id::text = bp.id::text
                    WHERE bi.bundle_id::text = oi.bundle_id::text
                ) as "bundleItems",
                (
                    SELECT json_agg(
                        json_build_object(
                            'name', gp.name, 
                            'quantity', gi.quantity,
                            'selected_addons', COALESCE(gi.selected_addons, '[]'::jsonb)
                        )
                    )
                    FROM gift_items gi
                    JOIN products gp ON gi.product_id::text = gp.id::text
                    WHERE gi.gift_id::text = oi.gift_id::text
                ) as "giftItems",
                COALESCE(bun.bundle_addons, '[]'::jsonb) as "bundle_addons",
                COALESCE(g.gift_addons, '[]'::jsonb) as "gift_addons"
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id::text = p.id::text
            LEFT JOIN bundles bun ON oi.bundle_id::text = bun.id::text
            LEFT JOIN gifts g ON oi.gift_id::text = g.id::text
            WHERE oi.order_id::text = $1::text
        `;
        const itemsResult = await query(itemsQuery, [id]);

        res.json(itemsResult.rows);
    } catch (err) {
        console.error('[API] Error fetching order items:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ─── GET /arrivals-get ────────────────────────────────────────────────────────
router.get('/arrivals-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId } = req.user;

        let text = `
            SELECT 
                o.id,
                u.name as "customerName",
                o.status,
                o.total_price as "totalPrice",
                o.vehicle_type,
                o.vehicle_plate,
                o.vehicle_color,
                o.car_model,
                o.car_color,
                o.car_plate,
                o.arrived_at as "arrivedAt",
                o.is_gift,
                o.payment_proof_url as payment_proof_url,
                EXTRACT(EPOCH FROM o.handover_time) as "handoverTimeSeconds",
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'name', COALESCE(p.name, bun.name),
                            'price', oi.price_at_purchase,
                            'quantity', oi.quantity,
                            'bundleItems', (
                                SELECT json_agg(
                                    json_build_object(
                                        'name', bp.name, 
                                        'quantity', bi.quantity,
                                        'selected_addons', COALESCE(bi.selected_addons, '[]'::jsonb)
                                    )
                                )
                                FROM bundle_items bi
                                JOIN products bp ON bi.product_id::text = bp.id::text
                                WHERE bi.bundle_id::text = oi.bundle_id::text
                            ),
                            'bundle_addons', COALESCE(bun.bundle_addons, '[]'::jsonb),
                            'giftItems', (
                                SELECT json_agg(
                                    json_build_object(
                                        'name', gp.name, 
                                        'quantity', gi.quantity,
                                        'selected_addons', COALESCE(gi.selected_addons, '[]'::jsonb)
                                    )
                                )
                                FROM gift_items gi
                                JOIN products gp ON gi.product_id::text = gp.id::text
                                WHERE gi.gift_id::text = oi.gift_id::text
                            ),
                            'gift_addons', COALESCE(g.gift_addons, '[]'::jsonb),
                            'selected_addons', COALESCE(oi.selected_addons, '[]'::jsonb)
                        )
                    ) FILTER(WHERE oi.id IS NOT NULL),
                    '[]'
                ) as items
            FROM orders o
            LEFT JOIN customers u ON o.customer_id::text = u.id::text
            LEFT JOIN order_items oi ON o.id::text = oi.order_id::text
            LEFT JOIN products p ON oi.product_id::text = p.id::text
            LEFT JOIN bundles bun ON oi.bundle_id::text = bun.id::text
            LEFT JOIN gifts g ON oi.gift_id::text = g.id::text
            LEFT JOIN branches b ON o.branch_id::text = b.id::text
            WHERE o.status = 'ARRIVED'
        `;

        const params = [];
        if (branchId) {
            text += ` AND o.branch_id::text = $1::text`;
            params.push(branchId);
        } else if (vendorId) {
            text += ` AND b.vendor_id::text = $1::text`;
            params.push(vendorId);
        }

        text += ` GROUP BY o.id, u.name, o.status, o.total_price, o.car_model, o.car_color, o.car_plate, o.vehicle_type, o.vehicle_plate, o.vehicle_color, o.arrived_at, o.handover_time, o.payment_proof_url, o.is_gift`;

        const result = await query(text, params);

        const arrivals = result.rows.map(row => {
            const isPrivate = !row.vehicle_type || row.vehicle_type === 'private';
            return {
                id: row.id,
                customerName: row.customerName || 'Unknown',
                status: row.status,
                totalPrice: parseFloat(row.totalPrice),
                car: {
                    model: isPrivate ? (row.car_model || 'Unknown') : row.vehicle_type,
                    color: isPrivate ? (row.car_color || 'Gray') : (row.vehicle_color || 'Gray'),
                    plate: isPrivate ? (row.car_plate || 'N/A') : (row.vehicle_plate || 'N/A')
                },
                items: row.items,
                arrivedAt: row.arrivedAt,
                isGift: row.is_gift || false,
                paymentProofUrl: row.payment_proof_url ? (row.payment_proof_url.startsWith('http') ? row.payment_proof_url : `https://webappapi.bezawcurbside.com${row.payment_proof_url.startsWith('/') ? '' : '/'}${row.payment_proof_url}`) : null,
                handoverTimeSeconds: row.handoverTimeSeconds ? parseFloat(row.handoverTimeSeconds) : null
            };
        });

        res.json(arrivals);
    } catch (err) {
        console.error('[API] Error fetching arrivals:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
