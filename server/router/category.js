const express = require('express');

const { check, validationResult } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all categories (filtered by user's supermarket/branch)
router.get('/categories-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId, role } = req.user;

        let text = 'SELECT id, name, vendor_id, branch_id, parent_id FROM categories WHERE 1=1';
        const params = [];

        // If Super Admin, show everything
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            // No filters
        } else if (branchId) {
            // Branch Admin: sees branch-specific, vendor-global, and system-global
            text += ' AND (branch_id = $1 OR vendor_id = $2 OR (branch_id IS NULL AND vendor_id IS NULL))';
            params.push(branchId, vendorId);
        } else if (vendorId) {
            // Vendor Admin: sees all categories in their vendor + global
            text += ' AND (vendor_id = $1 OR (branch_id IS NULL AND vendor_id IS NULL))';
            params.push(vendorId);
        } else {
            // Global/Other: only see truly global categories
            text += ' AND (branch_id IS NULL AND vendor_id IS NULL)';
        }

        text += ' ORDER BY name ASC';
        const result = await query(text, params);
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
    const { name, parent_id } = req.body;
    const branch_id = req.user.branchId;
    const vendor_id = req.user.vendorId;

    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const text = `
            INSERT INTO categories (name, vendor_id, branch_id, parent_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [name, vendor_id, branch_id, parent_id || null];
        const result = await query(text, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
