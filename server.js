const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Auto-migrate and seed on startup
async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf-8');
  await pool.query(schema);
  const seed = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf-8');
  await pool.query(seed);
  console.log('Database initialized');
}

// Routes
const itemsRouter = require('./routes/items')(pool);
app.use('/api/items', itemsRouter);

// Start server
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Registry running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = { pool };
