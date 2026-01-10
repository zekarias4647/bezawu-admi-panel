const express = require('express');

const { check, validationResult } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all categories (filtered by user's supermarket/branch)
router.get('/categories-get', authMiddleware, async (req, res) => {
    try {
        const branch_id = req.user.branchId;
        const supermarket_id = req.user.supermarketId;

        // Fetch categories that:
        // 1. Belong to this specific branch
        // 2. Belong to the parent supermarket (global for that supermarket)
        // 3. Are completely global (branch_id and supermarket_id are null)
        const text = `
            SELECT * FROM categories 
            WHERE branch_id = $1 
               OR supermarket_id = $2 
               OR (branch_id IS NULL AND supermarket_id IS NULL)
            ORDER BY name ASC
        `;
        const result = await query(text, [branch_id, supermarket_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a new category
router.post('/categories-post', [
    authMiddleware,
    check('name', 'Category name is required').not().isEmpty().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name } = req.body;
    const branch_id = req.user.branchId;
    const supermarket_id = req.user.supermarketId;

    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const text = `
            INSERT INTO categories (name, supermarket_id, branch_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [name, supermarket_id, branch_id];
        const result = await query(text, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
