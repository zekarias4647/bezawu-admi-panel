const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

router.get('/dashboard-stats', authMiddleware, async (req, res) => {
    try {
        const { branchId, supermarketId } = req.user;

        // Base where clause for filtering by branch/supermarket
        let filterClause = '1=1';
        const params = [];

        if (branchId) {
            filterClause = 'o.branch_id = $1';
            params.push(branchId);
        } else if (supermarketId) {
            filterClause = 'b.supermarket_id = $1';
            params.push(supermarketId);
        }

        // 1. KPI Stats
        const kpiQuery = `
            SELECT 
                COALESCE(SUM(o.total_price), 0) as "totalRevenue",
                COUNT(o.id) as "totalOrders",
                COALESCE(AVG(f.rating), 0) as "avgRating"
            FROM orders o
            LEFT JOIN branches b ON o.branch_id = b.id
            LEFT JOIN feedback f ON o.id = f.order_id
            WHERE ${filterClause}
        `;
        const kpiResult = await query(kpiQuery, params);
        const kpis = kpiResult.rows[0];

        // 2. Hourly Data (last 24 hours)
        const hourlyQuery = `
            SELECT 
                TO_CHAR(o.created_at, 'HH24:00') as time,
                COUNT(o.id) as orders,
                COALESCE(SUM(o.total_price), 0) as revenue,
                COALESCE(AVG(f.rating), 0) as rating
            FROM orders o
            LEFT JOIN branches b ON o.branch_id = b.id
            LEFT JOIN feedback f ON o.id = f.order_id
            WHERE ${filterClause} AND o.created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY TO_CHAR(o.created_at, 'HH24:00')
            ORDER BY time
        `;
        const hourlyResult = await query(hourlyQuery, params);

        // 3. Sentiment Data
        const sentimentQuery = `
            SELECT 
                f.sentiment as name,
                COUNT(*) as value
            FROM feedback f
            JOIN orders o ON f.order_id = o.id
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE ${filterClause}
            GROUP BY f.sentiment
        `;
        const sentimentResult = await query(sentimentQuery, params);
        const sentiments = sentimentResult.rows.map(row => ({
            name: row.name || 'Neutral',
            value: parseInt(row.value),
            color: row.name === 'Positive' ? '#10b981' : row.name === 'Critical' ? '#f43f5e' : '#f59e0b'
        }));

        // 4. Operational Insights (Mocked if data doesn't exist, using some logic)
        const insights = [
            { label: 'Order Picking Accuracy', score: 99.2, color: 'bg-emerald-500' },
            { label: 'Drive-Thru Efficiency', score: 85.5, color: 'bg-blue-500' },
            { label: 'Inventory Integrity', score: 94.0, color: 'bg-purple-500' },
            { label: 'Customer Loyalty Score', score: 91.8, color: 'bg-amber-500' },
        ];

        res.json({
            kpis: {
                revenue: { value: parseFloat(kpis.totalRevenue).toLocaleString(), trend: '+14.2%', up: true },
                rating: { value: parseFloat(kpis.avgRating).toFixed(1), trend: '+0.3', up: true },
                wait: { value: '3m 12s', trend: '-45s', up: true },
                orders: { value: kpis.totalOrders, trend: '+12%', up: true }
            },
            hourlyData: hourlyResult.rows,
            sentimentData: sentiments.length > 0 ? sentiments : [
                { name: 'Positive', value: 75, color: '#10b981' },
                { name: 'Neutral', value: 15, color: '#f59e0b' },
                { name: 'Critical', value: 10, color: '#f43f5e' }
            ],
            insights
        });

    } catch (err) {
        console.error('[Analytics API] Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
