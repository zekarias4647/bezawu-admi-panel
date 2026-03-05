
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: '192.168.1.7',
    user: 'postgres',
    password: '1234',
    database: 'bezawdb',
    port: 5432,
});

async function checkSchema() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bank_accounts'
    `);
        console.log('Schema for bank_accounts:');
        console.log(JSON.stringify(res.rows, null, 2));
        fs.writeFileSync('db_schema_debug.json', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error checking schema:', err.message);
        fs.writeFileSync('db_schema_debug.json', JSON.stringify({ error: err.message }, null, 2));
    } finally {
        await pool.end();
    }
}

checkSchema();
