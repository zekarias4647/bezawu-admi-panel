const { query } = require('./connection/db');
async function check() {
    try {
        const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
        console.log(res.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
check();
