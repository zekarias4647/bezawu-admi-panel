const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

router.get('/customers-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, supermarketId } = req.user;

        let filterClause = '1=1';
        const params = [];

        if (branchId) {
            filterClause = 'o.branch_id = $1';
            params.push(branchId);
        } else if (supermarketId) {
            filterClause = 'b.supermarket_id = $1';
            params.push(supermarketId);
        }

        const customersQuery = `
            SELECT 
                c.id,
                c.name,
                c.phone,
                c.email,
                c.loyalty_points as "loyaltyPoints",
                c.is_verified as "isVerified",
                c.profile_picture as "profilePicture",
                COUNT(o.id) as "totalOrders",
                SUM(o.total_price) as "totalSpent",
                MAX(o.created_at) as "lastPurchase"
            FROM customers c
            JOIN orders o ON c.id = o.customer_id
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE ${filterClause}
            GROUP BY c.id, c.name, c.phone, c.email, c.loyalty_points, c.is_verified, c.profile_picture
            ORDER BY "totalSpent" DESC
        `;

        const customerResults = await query(customersQuery, params);
        const customers = customerResults.rows;

        const fullCustomers = await Promise.all(customers.map(async (cust) => {
            const purchasesQuery = `
                SELECT 
                    o.id,
                    o.created_at as date,
                    o.total_price as amount,
                    o.status,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as "itemsCount"
                FROM orders o
                WHERE o.customer_id = $1
                ORDER BY o.created_at DESC
                LIMIT 10
            `;
            const purchaseResults = await query(purchasesQuery, [cust.id]);

            return {
                ...cust,
                totalOrders: parseInt(cust.totalOrders),
                totalSpent: parseFloat(cust.totalSpent || 0),
                lastPurchase: cust.lastPurchase ? new Date(cust.lastPurchase).toISOString().split('T')[0] : null,
                purchases: purchaseResults.rows.map(p => ({
                    ...p,
                    amount: parseFloat(p.amount),
                    itemsCount: parseInt(p.itemsCount),
                    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }))
            };
        }));

        res.json(fullCustomers);
    } catch (err) {
        console.error('[User API] Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get specific customer details (history & trajectory)
router.get('/:id/details', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId, supermarketId } = req.user;

        // Security check
        const authCheckText = `
            SELECT o.id 
            FROM orders o 
            LEFT JOIN branches b ON o.branch_id = b.id 
            WHERE o.customer_id = $1
            AND (o.branch_id = $2 OR b.supermarket_id = $2)
            LIMIT 1
        `;
        const authCheck = await query(authCheckText, [id, branchId || supermarketId]);
        if (authCheck.rows.length === 0) {
            return res.status(403).json({ message: 'No commercial relationship found' });
        }

        // 1. Fetch exact purchase history
        const historyQuery = `
            SELECT 
                o.id,
                o.created_at as date,
                o.total_price as amount,
                o.status,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as "itemsCount"
            FROM orders o
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE o.customer_id = $1
            AND (o.branch_id = $2 OR b.supermarket_id = $2)
            ORDER BY o.created_at DESC
            LIMIT 20
        `;
        const historyResult = await query(historyQuery, [id, branchId || supermarketId]);

        // 2. Fetch spend trajectory (last 7 days of activity)
        const trajectoryQuery = `
            SELECT 
                TO_CHAR(o.created_at, 'Mon DD') as date,
                SUM(o.total_price) as amount
            FROM orders o
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE o.customer_id = $1
            AND (o.branch_id = $2 OR b.supermarket_id = $2)
            AND o.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY TO_CHAR(o.created_at, 'Mon DD'), o.created_at::date
            ORDER BY o.created_at::date ASC
        `;
        const trajectoryResult = await query(trajectoryQuery, [id, branchId || supermarketId]);

        const formattedHistory = historyResult.rows.map(row => ({
            ...row,
            date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: parseFloat(row.amount)
        }));

        res.json({
            history: formattedHistory,
            trajectory: trajectoryResult.rows.map(r => ({
                date: r.date,
                amount: parseFloat(r.amount)
            }))
        });

    } catch (err) {
        console.error('[User Details API] Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
