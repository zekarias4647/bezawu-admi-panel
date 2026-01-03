const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

router.get('/feedback-get', authMiddleware, async (req, res) => {
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

        const feedbackQuery = `
            SELECT 
                f.id,
                c.name as "customerName",
                f.rating,
                f.comment,
                f.sentiment,
                f.created_at as timestamp,
                o.branch_id
            FROM feedback f
            JOIN customers c ON f.user_id = c.id
            JOIN orders o ON f.order_id = o.id
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE ${filterClause}
            ORDER BY f.created_at DESC
        `;

        const result = await query(feedbackQuery, params);

        // Format timestamp to something readable like '10:12 AM' or '2026-01-03'
        const formattedFeedback = result.rows.map(row => ({
            ...row,
            timestamp: new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedAction: getSuggestedAction(row.sentiment, row.rating)
        }));

        res.json(formattedFeedback);
    } catch (err) {
        console.error('[Feedback API] Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

function getSuggestedAction(sentiment, rating) {
    if (sentiment === 'POSITIVE' || rating >= 4) {
        return 'Send loyalty discount coupon';
    } else if (sentiment === 'CRITICAL' || rating <= 2) {
        return 'Urgent: Manager callback required';
    } else {
        return 'Audit service protocol for this order';
    }
}

module.exports = router;
