const express = require('express');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all business types
router.get('/', authMiddleware, async (req, res) => {
    try {
        const result = await query('SELECT * FROM business_types ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('[Business Types API] Error fetching business types:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get config for a specific business type by name
router.get('/:name', authMiddleware, async (req, res) => {
    try {
        const { name } = req.params;
        console.log(`[Business Types] Searching for: "${name}"`);

        const result = await query('SELECT * FROM business_types WHERE UPPER(name) = UPPER($1)', [name.trim()]);

        if (result.rows.length === 0) {
            console.warn(`[Business Types] Not found: "${name}"`);
            return res.status(404).json({ message: `Business type "${name}" not found in database.` });
        }

        console.log(`[Business Types] Found config for: ${result.rows[0].name}`);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[Business Types API] Error fetching business type config:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
