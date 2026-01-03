const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all products
router.get('/products-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, supermarketId } = req.user;

        let text = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.category_id,
                c.name as category_name,
                p.image_url,
                p.sku,
                p.description,
                p.is_fasting,
                p.unit,
                p.discount_price,
                p.branch_id
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN branches b ON p.branch_id = b.id
            WHERE 1=1
        `;

        const params = [];
        if (branchId) {
            text += ` AND p.branch_id = $${params.length + 1}`;
            params.push(branchId);
        } else if (supermarketId) {
            text += ` AND b.supermarket_id = $${params.length + 1}`;
            params.push(supermarketId);
        } else {
            return res.json([]);
        }

        const result = await query(text, params);

        const products = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category_name || 'Uncategorized',
            price: parseFloat(row.price),
            stock: 100, // Placeholder
            status: 'In Stock',
            image_url: row.image_url
        }));

        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create product
router.post('/products-post', authMiddleware, async (req, res) => {
    const { name, category_id, price, description, sku, image_url, branch_id: bodyBranchId } = req.body;
    const { branchId: userBranchId, supermarketId } = req.user;

    const targetBranchId = bodyBranchId || userBranchId;

    if (!targetBranchId) {
        return res.status(400).json({ message: 'Branch association required' });
    }

    try {
        // Authorization check
        if (userBranchId && userBranchId !== targetBranchId) {
            return res.status(403).json({ message: 'Unauthorized: You can only post to your own branch' });
        }

        if (supermarketId) {
            const check = await query('SELECT id FROM branches WHERE id = $1 AND supermarket_id = $2', [targetBranchId, supermarketId]);
            if (check.rows.length === 0) {
                return res.status(403).json({ message: 'Unauthorized: Branch outside your supermarket scope' });
            }
        }

        const text = `
            INSERT INTO products (name, category_id, price, description, sku, image_url, branch_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [name, category_id, price, description, sku, image_url, targetBranchId];

        const result = await query(text, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
