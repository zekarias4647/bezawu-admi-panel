const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all products
router.get('/products-get', authMiddleware, async (req, res) => {
    try {
        const { branchId, vendorId, role } = req.user;
        const { showDeleted } = req.query;
        const isDeleted = showDeleted === 'true';

        let text = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.category_id,
                p.subcategory_id,
                c.name as cat_name,
                sc.name as subcat_name,
                p.image_url,
                p.sku,
                p.description,
                p.is_fasting,
                p.unit,
                p.discount_price,
                p.branch_id,
                p.stock_quantity,
                p.specs,
                p.product_addons,
                p.is_active
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN categories sc ON p.subcategory_id = sc.id
            LEFT JOIN branches b ON p.branch_id::text = b.id::text
            WHERE p.is_deleted = $1
        `;
        const params = [isDeleted];
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            // No filters
        } else if (branchId) {
            text += ` AND p.branch_id = $${params.length + 1}`;
            params.push(branchId);
        } else if (vendorId) {
            text += ` AND b.vendor_id = $${params.length + 1}`;
            params.push(vendorId);
        } else {
            return res.json([]);
        }

        const result = await query(text, params);

        const products = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.cat_name || (row.category_id ? `Category ${row.category_id}` : 'Uncategorized'),
            category_id: row.category_id,
            subcategory: row.subcat_name,
            subcategory_id: row.subcategory_id,
            price: parseFloat(row.price),
            stock: row.stock_quantity || 0,
            status: row.stock_quantity === -1 ? 'In Stock' : (row.stock_quantity || 0) > 10 ? 'In Stock' : (row.stock_quantity || 0) > 0 ? 'Low Stock' : 'Out of Stock',
            image_url: row.image_url,
            is_fasting: row.is_fasting,
            is_active: row.is_active,
            unit: row.unit,
            specs: row.specs || {},
            product_addons: row.product_addons || []
        }));

        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create product
router.post('/products-post', [
    authMiddleware,
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('price', 'Price must be a positive number').isFloat({ min: 0 }),
    check('category_id').optional({ nullable: true }),
    check('branch_id', 'Branch ID must be a UUID').optional({ nullable: true }).isUUID()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, category_id, subcategory_id, price, description, sku, image_url, unit, stock, stock_quantity, branch_id: bodyBranchId, specs, product_addons } = req.body;
    const { branchId: userBranchId, vendorId } = req.user;

    const targetBranchId = bodyBranchId || userBranchId;

    if (!targetBranchId) {
        return res.status(400).json({ message: 'Branch association required' });
    }

    try {
        // Authorization check
        if (userBranchId && userBranchId !== targetBranchId) {
            return res.status(403).json({ message: 'Unauthorized: You can only post to your own branch' });
        }

        if (vendorId) {
            const check = await query('SELECT id FROM branches WHERE id = $1 AND vendor_id = $2', [targetBranchId, vendorId]);
            if (check.rows.length === 0) {
                return res.status(403).json({ message: 'Unauthorized: Branch outside your vendor scope' });
            }
        }

        const text = `
            INSERT INTO products (name, category_id, subcategory_id, price, description, sku, image_url, unit, branch_id, stock_quantity, specs, product_addons, is_fasting, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        // Handle both 'stock' and 'stock_quantity' for compatibility
        const finalStock = stock_quantity !== undefined ? stock_quantity : (stock !== undefined ? stock : 0);
        const finalSpecs = specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : '{}';
        const finalAddons = product_addons ? (typeof product_addons === 'string' ? product_addons : JSON.stringify(product_addons)) : '[]';

        const values = [name, category_id, subcategory_id || null, price, description, sku, image_url, unit, targetBranchId, finalStock, finalSpecs, finalAddons, !!req.body.is_fasting, req.body.is_active !== undefined ? req.body.is_active : true];

        const result = await query(text, values);

        // Audit Log
        await query(
            'INSERT INTO audit_logs (admin_id, branch_id, vendor_id, action, severity) VALUES ($1, $2, $3, $4, $5)',
            [
                req.user.id,
                targetBranchId,
                vendorId,
                `PRODUCT_CREATE: ${name} (${result.rows[0].id})`,
                'INFO'
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId, vendorId } = req.user;

        // Authorization check
        let authQuery = 'SELECT p.id FROM products p LEFT JOIN branches b ON p.branch_id = b.id WHERE p.id = $1';
        const authParams = [id];

        if (branchId) {
            authQuery += ' AND p.branch_id = $2';
            authParams.push(branchId);
        } else if (vendorId) {
            authQuery += ' AND b.vendor_id = $2';
            authParams.push(vendorId);
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const authResult = await query(authQuery, authParams);
        if (authResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: Product not in your scope' });
        }

        await query('UPDATE products SET is_deleted = true WHERE id = $1', [id]);
        res.json({ message: 'Product moved to trash' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update product (used for stock adjustment)
router.patch('/:id', [
    authMiddleware,
    check('stock', 'Stock must be a valid number').optional().isFloat({ min: -1 }),
    check('price', 'Price must be a positive number').optional().isFloat({ min: 0 }),
    check('category_id').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { branchId, vendorId } = req.user;
        const updates = req.body;

        // Authorization check
        let authQuery = 'SELECT p.id FROM products p LEFT JOIN branches b ON p.branch_id = b.id WHERE p.id = $1';
        const authParams = [id];

        if (branchId) {
            authQuery += ' AND p.branch_id = $2';
            authParams.push(branchId);
        } else if (vendorId) {
            authQuery += ' AND b.vendor_id = $2';
            authParams.push(vendorId);
        }

        const authResult = await query(authQuery, authParams);
        if (authResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: Product not in your scope' });
        }

        // Build dynamic update query
        // Note: 'stock' in frontend corresponds to 'stock_quantity' or similiar column. 
        // Based on previous code, `stock` was a placeholder 100 in GET. 
        // I will assume there is a column for quantity, if not I will add it or map it to description if strictly needed, 
        // but robustly I should assume a column exists or creating one is out of scope. 
        // Looking at the GET `p.description = 'Stock level: ...'` used in POST suggests it might be stored in description or a missing column.
        // However, to do this "properly" for an inventory feature, I should look to update a real column. 
        // Given I cannot see the schema, I will assume a `stock` column was intended or added, OR I update the `description` string if `stock` is passed.
        // Let's assume for now we are updating `description` to store stock as the POST did: `Stock level: ${formData.stock}`

        // Wait, the POST used `description: 'Stock level: ' + stock`. 
        // But better practice is a real column. 
        // Let's check the POST again. 
        // It inserts `stock` into `description`.
        // So for "updating stock", I should update `description`?? That's messy.
        // But wait, the GET reads `p.description` but outputs `stock: 100 // Placeholder`.
        // The user wants to "add quantity". 
        // I will implement a cleaner approach: Update `description` to contain strict JSON or just text "Stock: X".
        // OR better: I will try to update a `stock` column if it exists. 
        // Since I can't check schema easily without running SQL, I'll stick to the pattern established in the POST:
        // Update `description` to `Stock level: <new_qty>`.

        let updateFields = [];
        let updateValues = [];
        let idx = 1;

        if (updates.stock !== undefined) {
            updateFields.push(`stock_quantity = $${idx}`);
            updateValues.push(updates.stock);
            idx++;
        }

        // Handle other fields generically if needed
        if (updates.price) {
            updateFields.push(`price = $${idx}`);
            updateValues.push(updates.price);
            idx++;
        }

        if (updates.category_id) {
            updateFields.push(`category_id = $${idx}`);
            updateValues.push(updates.category_id);
            idx++;
        }

        if (updates.subcategory_id) {
            updateFields.push(`subcategory_id = $${idx}`);
            updateValues.push(updates.subcategory_id);
            idx++;
        }

        if (updates.is_active !== undefined) {
            updateFields.push(`is_active = $${idx}`);
            updateValues.push(updates.is_active);
            idx++;
        }

        if (updates.is_fasting !== undefined) {
            updateFields.push(`is_fasting = $${idx}`);
            updateValues.push(updates.is_fasting);
            idx++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        updateValues.push(id);
        const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`;

        const result = await query(updateQuery, updateValues);
        const updatedProduct = result.rows[0];

        // 1. Log Price Change (Significant Action)
        if (updates.price !== undefined) {
            await query(
                'INSERT INTO audit_logs (admin_id, branch_id, vendor_id, action, severity) VALUES ($1, $2, $3, $4, $5)',
                [
                    req.user.id,
                    req.user.branchId,
                    req.user.vendorId,
                    `PRODUCT_PRICE_CHANGE: ${updatedProduct.name} (${id}) -> ${updates.price} ETB`,
                    'WARNING'
                ]
            );
        }

        // 2. Log Stock Adjustment (Routine Action)
        if (updates.stock !== undefined) {
            await query(
                'INSERT INTO audit_logs (admin_id, branch_id, vendor_id, action, severity) VALUES ($1, $2, $3, $4, $5)',
                [
                    req.user.id,
                    req.user.branchId,
                    req.user.vendorId,
                    `PRODUCT_STOCK_ADJUST: ${updatedProduct.name} (${id}) -> ${updates.stock}`,
                    'INFO'
                ]
            );
        }

        res.json(updatedProduct);

    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.patch('/:id/toggle-status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('UPDATE products SET is_active = NOT is_active WHERE id = $1 RETURNING is_active', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ is_active: result.rows[0].is_active });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to toggle product status' });
    }
});

router.patch('/:id/restore', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId, vendorId } = req.user;

        // Authorization check
        let authQuery = 'SELECT p.id FROM products p LEFT JOIN branches b ON p.branch_id = b.id WHERE p.id = $1';
        const authParams = [id];

        if (branchId) {
            authQuery += ' AND p.branch_id = $2';
            authParams.push(branchId);
        } else if (vendorId) {
            authQuery += ' AND b.vendor_id = $2';
            authParams.push(vendorId);
        }

        const authResult = await query(authQuery, authParams);
        if (authResult.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized: Product not in your scope' });
        }

        await query('UPDATE products SET is_deleted = false WHERE id = $1', [id]);
        res.json({ message: 'Product restored successfully' });
    } catch (err) {
        console.error('Error restoring product:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
