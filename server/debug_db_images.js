require('dotenv').config();
const { query } = require('./connection/db');

async function test() {
    try {
        const res = await query('SELECT id, payment_proof_url FROM orders WHERE payment_proof_url IS NOT NULL LIMIT 5');
        console.log('Orders with payment proof:', JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
