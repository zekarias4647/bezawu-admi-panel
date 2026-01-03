const { query } = require('./connection/db');

async function migrate() {
    try {
        console.log('Starting migration: Adding branch_id to products table...');

        // Check if column exists first
        const checkColumn = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' AND column_name='branch_id';
        `;
        const checkResult = await query(checkColumn);

        if (checkResult.rows.length === 0) {
            await query('ALTER TABLE products ADD COLUMN branch_id character varying(50);');
            console.log('Migration successful: branch_id column added to products table.');
        } else {
            console.log('Migration skipped: branch_id column already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
