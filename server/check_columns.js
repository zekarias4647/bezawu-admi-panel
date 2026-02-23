
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'");
    console.log(res.rows.map(r => r.column_name));
    await client.end();
}
run();
