const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
(async () => {
  await pool.query('DELETE FROM contributions');
  await pool.query('DELETE FROM items');
  await pool.query("SELECT setval('items_id_seq', 1, false)");
  console.log('Cleared old items, sequence reset');
  process.exit();
})();
