const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Get bank account for a branch or vendor
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId } = req.user;
        let text = 'SELECT * FROM bank_accounts WHERE 1=1';
        const params = [];

        if (branchId) {
            text += ' AND branch_id = $1';
            params.push(branchId);
        } else if (vendorId) {
            text += ' AND vendor_id = $1';
            params.push(vendorId);
        } else {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const result = await query(text, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching bank account:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add or Update bank account
router.post('/', [
    authMiddleware,
    check('account_name', 'Account name is required').not().isEmpty(),
    check('account_number', 'Account number is required').not().isEmpty(),
    check('bank_name', 'Bank name is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { branchId, vendorId } = req.user;
        const { account_name, account_number, bank_name } = req.body;

        // Check if this specific account number already exists for this vendor/branch
        const checkText = 'SELECT id FROM bank_accounts WHERE vendor_id::text = $1::text AND (branch_id::text = $2::text OR (branch_id IS NULL AND $2 IS NULL)) AND account_number = $3';
        const checkResult = await query(checkText, [vendorId, branchId, account_number]);

        if (checkResult.rows.length > 0) {
            // Update
            const updateText = `
                UPDATE bank_accounts 
                SET account_name = $1, account_number = $2, bank_name = $3
                WHERE id = $4
                RETURNING *
            `;
            const result = await query(updateText, [account_name, account_number, bank_name, checkResult.rows[0].id]);
            res.json(result.rows[0]);
        } else {
            // Insert
            const insertText = `
                INSERT INTO bank_accounts (vendor_id, branch_id, account_name, account_number, bank_name, is_primary)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const result = await query(insertText, [vendorId, branchId, account_name, account_number, bank_name, true]);
            res.status(201).json(result.rows[0]);
        }
    } catch (err) {
        console.error('[Bank API Error Details]:', {
            message: err.message,
            stack: err.stack,
            body: req.body,
            user: req.user
        });
        res.status(500).json({ message: 'Internal Server Error', detail: err.message });
    }
});

module.exports = router;
