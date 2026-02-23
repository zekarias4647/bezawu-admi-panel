const { query } = require('./connection/db');
async function check() {
    try {
        const res = await query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'gift_items'");
        console.log(res.rows);
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
check();
