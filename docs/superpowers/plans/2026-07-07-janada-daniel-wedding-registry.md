# Janada & Daniel Wedding Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive wedding registry website where guests browse items and claim/unclaim gifts to prevent duplicate purchases.

**Architecture:** Express.js serves a single-page HTML frontend from `public/` and a REST API for item CRUD. A PostgreSQL database stores items and claim state. Railway handles hosting and Postgres provisioning.

**Tech Stack:** Node.js, Express 4, pg (node-postgres), PostgreSQL, vanilla HTML/CSS/JS.

## Global Constraints

- No authentication system for guests — claiming requires only a name match to unclaim
- All items and their claim state load on page load; updates use fetch API (no page reload)
- Database auto-migrates on first boot via `schema.sql` using `CREATE TABLE IF NOT EXISTS`
- Seed data loads only when the items table is empty
- Mobile-first responsive design with sage green (#8BA888), gold (#D4AF37), cream (#FDF8F5) palette
- No framework/build step — vanilla everything

---

### Task 1: Project Scaffold & Database

**Files:**
- Create: `package.json`
- Create: `Procfile`
- Create: `railway.json`
- Create: `db/schema.sql`
- Create: `db/seed.sql`
- Create: `server.js`

**Interfaces:**
- Consumes: nothing — this is the foundation
- Produces: `server.js` exports nothing (runs as entry point). DB pool exported via `module.exports = { pool }` used by Task 2. Database schema creates `items` table with 11 columns. Seed populates ~20 rows.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "janada-daniel-wedding-registry",
  "version": "1.0.0",
  "description": "Wedding registry for Janada & Daniel",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "pg": "^8.13.0"
  }
}
```

- [ ] **Step 2: Create Procfile**

```
web: node server.js
```

- [ ] **Step 3: Create railway.json**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

- [ ] **Step 4: Create db/schema.sql**

```sql
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_range VARCHAR(50) NOT NULL,
    image_url VARCHAR(500) DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_by VARCHAR(100) DEFAULT '',
    claim_message TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- [ ] **Step 5: Create db/seed.sql**

```sql
INSERT INTO items (name, description, category, price_range, image_url, sort_order)
SELECT * FROM (VALUES
    -- Kitchen & Dining
    ('Premium Cookware Set', '10-piece nonstick cookware set — pots, pans, and lids for every meal.', 'Kitchen & Dining', '$200 - $400', '', 1),
    ('Chef''s Knife Set', 'Professional 5-piece knife set with wooden block.', 'Kitchen & Dining', '$100 - $200', '', 2),
    ('High-Speed Blender', 'Powerful blender for smoothies, soups, and sauces.', 'Kitchen & Dining', '$80 - $150', '', 3),
    ('Espresso Machine', 'Semi-automatic espresso maker with milk frother.', 'Kitchen & Dining', '$150 - $300', '', 4),
    ('Elegant Dinnerware Set', '12-piece stoneware dinner set — plates, bowls, and mugs.', 'Kitchen & Dining', '$100 - $200', '', 5),
    ('Wine Glass Set', 'Set of 8 crystal wine glasses (4 red, 4 white).', 'Kitchen & Dining', '$60 - $100', '', 6),
    ('Stainless Steel Flatware Set', '40-piece flatware set for 8 — forks, knives, spoons.', 'Kitchen & Dining', '$50 - $100', '', 7),
    ('Stainless Mixing Bowls', 'Set of 5 nesting mixing bowls with lids.', 'Kitchen & Dining', '$40 - $80', '', 8),
    ('Slow Cooker', '6-quart programmable slow cooker with timer.', 'Kitchen & Dining', '$50 - $100', '', 9),
    ('Baking Sheet Set', '3-piece aluminum baking sheet set — half, quarter, and jelly roll.', 'Kitchen & Dining', '$30 - $60', '', 10),
    -- Bed & Bath
    ('Luxury Towel Set', 'Set of 6 plush bath towels in sage green.', 'Bed & Bath', '$80 - $150', '', 11),
    ('Premium Sheet Set', '100% cotton 400-thread-count sheet set, queen size.', 'Bed & Bath', '$80 - $160', '', 12),
    ('Down Comforter', 'Lightweight down comforter with duvet cover, queen.', 'Bed & Bath', '$120 - $250', '', 13),
    ('Throw Blankets (Set of 2)', 'Soft knit throw blankets in cream and sage.', 'Bed & Bath', '$40 - $80', '', 14),
    -- Home & Decor
    ('Framed Photo Collection', 'Set of 3 coordinating picture frames, assorted sizes.', 'Home & Decor', '$30 - $60', '', 15),
    ('Ceramic Vase Set', 'Set of 2 hand-crafted ceramic vases.', 'Home & Decor', '$40 - $80', '', 16),
    ('Scented Candle Collection', 'Set of 4 soy wax candles — vanilla, lavender, eucalyptus, amber.', 'Home & Decor', '$30 - $50', '', 17),
    ('Indoor Planters (Set of 3)', 'Modern ceramic planters with bamboo trays, 3 sizes.', 'Home & Decor', '$40 - $70', '', 18),
    -- Experiences
    ('Honeymoon Fund — $50 Contribution', 'Help the couple make memories on their honeymoon!', 'Experiences', '$50', '', 19),
    ('Honeymoon Fund — $100 Contribution', 'A generous contribution to Janada & Daniel''s honeymoon.', 'Experiences', '$100', '', 20),
    ('Honeymoon Fund — $250 Contribution', 'A VIP contribution to the honeymoon fund!', 'Experiences', '$250', '', 21),
    ('Date Night Gift Card', 'A dinner-and-a-movie night for the happy couple.', 'Experiences', '$75 - $150', '', 22)
) AS v(name, description, category, price_range, image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM items LIMIT 1);
```

- [ ] **Step 6: Create server.js**

```js
const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
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
```

- [ ] **Step 7: Install dependencies and verify server starts**

Run from `janada-daniel-wedding-registry/`:
```bash
npm install
node server.js &
sleep 2
kill %1 2>/dev/null
```
Expected: no errors, outputs "Database initialized" and "Registry running on port 3000"

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: initial scaffold with Express, Postgres schema, and default seed items"
```

---

### Task 2: API Routes (items, claim, unclaim)

**Files:**
- Create: `routes/items.js`

**Interfaces:**
- Consumes: `pool` from `server.js` (passed at construction)
- Produces: Three route handlers on `/api/items`:
  - `GET /api/items` → `[{id, name, description, category, price_range, image_url, sort_order, claimed, claimed_by, claim_message}]`
  - `POST /api/items/:id/claim` body `{name, message?}` → `{success: true, item: {...}}`
  - `POST /api/items/:id/unclaim` body `{name}` → `{success: true, item: {...}}`

- [ ] **Step 1: Create routes/items.js**

```js
const express = require('express');
const router = express.Router();

module.exports = function (pool) {
  // GET /api/items — list all items sorted by sort_order
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, description, category, price_range, image_url, sort_order, claimed, claimed_by, claim_message FROM items ORDER BY sort_order ASC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching items:', err);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  // POST /api/items/:id/claim — claim an item
  router.post('/:id/claim', async (req, res) => {
    const { id } = req.params;
    const { name, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required to claim a gift' });
    }

    try {
      // Check item exists and isn't already claimed
      const check = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      if (check.rows[0].claimed) {
        return res.status(409).json({ error: 'This gift has already been claimed' });
      }

      const result = await pool.query(
        'UPDATE items SET claimed = TRUE, claimed_by = $1, claim_message = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, description, category, price_range, image_url, sort_order, claimed, claimed_by, claim_message',
        [name.trim(), (message || '').trim(), id]
      );

      res.json({ success: true, item: result.rows[0] });
    } catch (err) {
      console.error('Error claiming item:', err);
      res.status(500).json({ error: 'Failed to claim item' });
    }
  });

  // POST /api/items/:id/unclaim — unclaim an item (name must match)
  router.post('/:id/unclaim', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required to unclaim a gift' });
    }

    try {
      const check = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      if (!check.rows[0].claimed) {
        return res.status(409).json({ error: 'This gift is not currently claimed' });
      }
      if (check.rows[0].claimed_by !== name.trim()) {
        return res.status(403).json({ error: 'Name does not match the claimer' });
      }

      const result = await pool.query(
        'UPDATE items SET claimed = FALSE, claimed_by = \'\', claim_message = \'\', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, description, category, price_range, image_url, sort_order, claimed, claimed_by, claim_message',
        [id]
      );

      res.json({ success: true, item: result.rows[0] });
    } catch (err) {
      console.error('Error unclaiming item:', err);
      res.status(500).json({ error: 'Failed to unclaim item' });
    }
  });

  return router;
};
```

- [ ] **Step 2: Start server and test API with curl**

```bash
node server.js &
SERVER_PID=$!
sleep 2

# Test GET items
echo "=== GET /api/items ==="
curl -s http://localhost:3000/api/items | head -c 500
echo ""

# Test claim item 1
echo "=== POST claim item 1 ==="
curl -s -X POST http://localhost:3000/api/items/1/claim \
  -H "Content-Type: application/json" \
  -d '{"name":"Aunt Sarah","message":"Congratulations!"}'
echo ""

# Test double-claim fails
echo "=== POST claim item 1 again (should fail) ==="
curl -s -X POST http://localhost:3000/api/items/1/claim \
  -H "Content-Type: application/json" \
  -d '{"name":"Uncle Bob"}'
echo ""

# Test unclaim with wrong name (should fail)
echo "=== POST unclaim wrong name (should fail) ==="
curl -s -X POST http://localhost:3000/api/items/1/unclaim \
  -H "Content-Type: application/json" \
  -d '{"name":"Uncle Bob"}'
echo ""

# Test unclaim with correct name
echo "=== POST unclaim correct name ==="
curl -s -X POST http://localhost:3000/api/items/1/unclaim \
  -H "Content-Type: application/json" \
  -d '{"name":"Aunt Sarah"}'
echo ""

kill $SERVER_PID 2>/dev/null
```

Expected: First GET returns all items. Claim succeeds. Second claim returns 409. Wrong-name unclaim returns 403. Correct-name unclaim succeeds.

- [ ] **Step 3: Commit**

```bash
git add routes/items.js
git commit -m "feat: add API routes for listing, claiming, and unclaiming items"
```

---

### Task 3: Frontend — HTML & CSS

**Files:**
- Create: `public/index.html`
- Create: `public/style.css`

**Interfaces:**
- Consumes: API from Task 2 (`/api/items/*`)
- Produces: Static HTML page linked to style.css. DOM structure used by Task 4's JavaScript: `.item-card`, `.claim-btn`, `.claimed-badge`, `#claim-modal`, `#items-grid`, `#claim-form`.

- [ ] **Step 1: Create public/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Janada & Daniel's Wedding Registry</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <!-- Hero -->
  <header class="hero">
    <div class="hero-content">
      <p class="hero-subtitle">We're getting married!</p>
      <h1 class="hero-title">Janada <span class="hero-amp">&amp;</span> Daniel</h1>
      <p class="hero-date">Coming Soon</p>
      <p class="hero-message">
        Thank you for celebrating with us. Your presence is the greatest gift,
        but if you'd like to help us stock our home, we've put together a list
        of things we'd love.
      </p>
    </div>
  </header>

  <!-- Registry Items -->
  <main class="registry">
    <h2 class="section-title">Our Registry</h2>
    <div id="items-grid" class="items-grid">
      <!-- Items rendered by JavaScript -->
    </div>
  </main>

  <!-- Claim Modal -->
  <div id="claim-modal" class="modal hidden">
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h3 class="modal-title">Claim This Gift</h3>
      <p class="modal-item-name" id="modal-item-name"></p>
      <form id="claim-form">
        <input type="hidden" id="claim-item-id" />
        <label for="claimer-name">Your Name</label>
        <input type="text" id="claimer-name" required placeholder="e.g. Aunt Sarah" />
        <label for="claimer-message">Message for the Couple <span class="optional">(optional)</span></label>
        <textarea id="claimer-message" rows="3" placeholder="Write a short note..."></textarea>
        <button type="submit" class="btn btn-primary">🎁 Claim Gift</button>
      </form>
    </div>
  </div>

  <!-- Unclaim Modal -->
  <div id="unclaim-modal" class="modal hidden">
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h3 class="modal-title">Remove Your Claim</h3>
      <p>Enter the name you used to claim this gift to remove it.</p>
      <form id="unclaim-form">
        <input type="hidden" id="unclaim-item-id" />
        <label for="unclaimer-name">Your Name</label>
        <input type="text" id="unclaimer-name" required placeholder="Enter the name you used" />
        <button type="submit" class="btn btn-secondary">Remove Claim</button>
      </form>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <p>Made with love &mdash; Janada &amp; Daniel</p>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create public/style.css**

```css
/* ===== Reset & Base ===== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #FDF8F5;
  color: #2C2C2C;
  line-height: 1.6;
}

/* ===== Typography ===== */
h1, h2, h3, h4 {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 400;
}

/* ===== Hero Section ===== */
.hero {
  background: linear-gradient(135deg, #8BA888 0%, #6B8F6A 100%);
  color: #fff;
  text-align: center;
  padding: 5rem 1.5rem 4rem;
  position: relative;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 40px;
  background: #FDF8F5;
  clip-path: ellipse(70% 100% at 50% 100%);
}

.hero-content {
  max-width: 640px;
  margin: 0 auto;
}

.hero-subtitle {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  opacity: 0.85;
  margin-bottom: 0.5rem;
}

.hero-title {
  font-size: 3rem;
  line-height: 1.15;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.hero-amp {
  font-style: italic;
  font-weight: 400;
  opacity: 0.8;
}

.hero-date {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
}

.hero-message {
  font-size: 1rem;
  opacity: 0.85;
  line-height: 1.7;
  max-width: 520px;
  margin: 0 auto;
}

/* ===== Registry Section ===== */
.registry {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  color: #2C2C2C;
  margin-bottom: 0.75rem;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 2px;
  background: #D4AF37;
  margin: 0.75rem auto 0;
}

.section-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2.5rem;
  font-size: 0.95rem;
}

/* ===== Items Grid ===== */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.item-card.claimed {
  opacity: 0.85;
}

.item-image {
  width: 100%;
  height: 140px;
  background: #f0efe7;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.item-category {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #8BA888;
  margin-bottom: 0.35rem;
}

.item-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.2rem;
  margin-bottom: 0.35rem;
  color: #2C2C2C;
}

.item-description {
  font-size: 0.88rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  flex: 1;
}

.item-price {
  font-size: 0.9rem;
  color: #8BA888;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* ===== Buttons ===== */
.btn {
  display: inline-block;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  text-align: center;
  width: 100%;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: #8BA888;
  color: #fff;
}

.btn-primary:hover {
  background: #7A9778;
}

.btn-secondary {
  background: #e8e4dd;
  color: #2C2C2C;
}

.btn-secondary:hover {
  background: #dcd7ce;
}

/* ===== Claimed Badge ===== */
.claimed-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0f7ef;
  border: 1px solid #8BA888;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  color: #2C2C2C;
  margin-bottom: 0.75rem;
}

.claimed-badge-icon {
  font-size: 1.1rem;
}

.claimed-badge-name {
  font-weight: 600;
  color: #8BA888;
}

.claimed-badge-message {
  font-style: italic;
  color: #888;
  font-size: 0.8rem;
  margin-top: 0.15rem;
}

.remove-claim-link {
  display: block;
  text-align: center;
  font-size: 0.82rem;
  color: #999;
  cursor: pointer;
  margin-top: 0.25rem;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.remove-claim-link:hover {
  color: #c0392b;
}

/* ===== Modal ===== */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal.hidden {
  display: none;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
}

.modal-content {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.modal-close:hover {
  color: #333;
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 0.35rem;
}

.modal-item-name {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.25rem;
}

.modal-content label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 0.3rem;
}

.modal-content .optional {
  font-weight: 400;
  color: #999;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  margin-bottom: 1rem;
  transition: border-color 0.2s;
}

.modal-content input:focus,
.modal-content textarea:focus {
  outline: none;
  border-color: #8BA888;
  box-shadow: 0 0 0 3px rgba(139,168,136,0.15);
}

/* ===== Footer ===== */
.footer {
  text-align: center;
  padding: 2rem 1.5rem;
  font-size: 0.85rem;
  color: #999;
  border-top: 1px solid #eee;
}

/* ===== Error / Toast ===== */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #2C2C2C;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.toast.show {
  opacity: 1;
}

/* ===== Loading State ===== */
.loading {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.loading::after {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-left: 0.5rem;
  border: 2px solid #ddd;
  border-top-color: #8BA888;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #c0392b;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .hero {
    padding: 3.5rem 1.25rem 3rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 641px) and (max-width: 960px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add public/index.html public/style.css
git commit -m "feat: add frontend HTML structure and responsive CSS"
```

---

### Task 4: Frontend JavaScript — API Integration & Claim Flow

**Files:**
- Create: `public/app.js`

**Interfaces:**
- Consumes: DOM structure from Task 3 (class/id names). API from Task 2.
- Produces: Inline behavior — fetches items on load, renders cards, handles claim/unclaim modals, shows toast notifications.

- [ ] **Step 1: Create public/app.js**

```js
const API_BASE = '/api/items';

// State
let items = [];

// DOM refs
const grid = document.getElementById('items-grid');
const claimModal = document.getElementById('claim-modal');
const unclaimModal = document.getElementById('unclaim-modal');
const claimForm = document.getElementById('claim-form');
const unclaimForm = document.getElementById('unclaim-form');
const modalItemName = document.getElementById('modal-item-name');
const claimItemId = document.getElementById('claim-item-id');
const claimerName = document.getElementById('claimer-name');
const claimerMessage = document.getElementById('claimer-message');
const unclaimItemId = document.getElementById('unclaim-item-id');
const unclaimerName = document.getElementById('unclaimer-name');

// ==============================
// Toast
// ==============================
function createToast() {
  const el = document.createElement('div');
  el.className = 'toast';
  document.body.appendChild(el);
  return el;
}
const toast = createToast();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==============================
// Item Card
// ==============================
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card' + (item.claimed ? ' claimed' : '');
  card.dataset.id = item.id;

  const icon = getCategoryIcon(item.category);

  card.innerHTML = `
    <div class="item-image">${icon}</div>
    <div class="item-category">${escapeHtml(item.category)}</div>
    <div class="item-name">${escapeHtml(item.name)}</div>
    <div class="item-description">${escapeHtml(item.description)}</div>
    <div class="item-price">${escapeHtml(item.price_range)}</div>
    ${item.claimed ? `
      <div class="claimed-badge">
        <span class="claimed-badge-icon">🎁</span>
        <span>
          <span class="claimed-badge-name">${escapeHtml(item.claimed_by)}</span> claimed this
          ${item.claim_message ? `<div class="claimed-badge-message">"${escapeHtml(item.claim_message)}"</div>` : ''}
        </span>
      </div>
      <button class="btn btn-primary" disabled>Claimed</button>
      <span class="remove-claim-link" data-id="${item.id}">Remove my claim</span>
    ` : `
      <button class="btn btn-primary claim-btn" data-id="${item.id}">🎁 Claim This Gift</button>
    `}
  `;

  return card;
}

function getCategoryIcon(category) {
  const icons = {
    'Kitchen & Dining': '🍳',
    'Bed & Bath': '🛁',
    'Home & Decor': '🏠',
    'Experiences': '✈️',
  };
  return icons[category] || '🎁';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==============================
// Render
// ==============================
function renderItems() {
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = '<p class="error-state">No registry items found.</p>';
    return;
  }

  items.forEach(item => {
    const card = createItemCard(item);
    grid.appendChild(card);
  });

  // Attach event listeners after render
  document.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', () => openClaimModal(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.remove-claim-link').forEach(link => {
    link.addEventListener('click', () => openUnclaimModal(parseInt(link.dataset.id)));
  });
}

// ==============================
// Fetch Items
// ==============================
async function fetchItems() {
  grid.innerHTML = '<div class="loading">Loading registry</div>';
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch');
    items = await res.json();
    renderItems();
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="error-state">Could not load registry. Please try again later.</div>';
  }
}

// ==============================
// Claim Flow
// ==============================
function openClaimModal(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item || item.claimed) return;
  modalItemName.textContent = item.name;
  claimItemId.value = itemId;
  claimerName.value = '';
  claimerMessage.value = '';
  claimModal.classList.remove('hidden');
  claimerName.focus();
}

async function handleClaimSubmit(e) {
  e.preventDefault();
  const id = claimItemId.value;
  const name = claimerName.value.trim();
  const message = claimerMessage.value.trim();

  if (!name) return;

  const btn = claimForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Claiming...';

  try {
    const res = await fetch(`${API_BASE}/${id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    });

    if (!res.ok) {
      const data = await res.json();
      showToast(data.error || 'Could not claim gift');
      return;
    }

    const data = await res.json();
    const idx = items.findIndex(i => i.id === parseInt(id));
    if (idx !== -1) items[idx] = data.item;

    renderItems();
    closeModals();
    showToast(`🎉 You claimed "${data.item.name}"!`);
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = '🎁 Claim Gift';
  }
}

// ==============================
// Unclaim Flow
// ==============================
function openUnclaimModal(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item || !item.claimed) return;
  unclaimItemId.value = itemId;
  unclaimerName.value = '';
  unclaimModal.classList.remove('hidden');
  unclaimerName.focus();
}

async function handleUnclaimSubmit(e) {
  e.preventDefault();
  const id = unclaimItemId.value;
  const name = unclaimerName.value.trim();

  if (!name) return;

  const btn = unclaimForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Removing...';

  try {
    const res = await fetch(`${API_BASE}/${id}/unclaim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json();
      showToast(data.error || 'Could not remove claim');
      return;
    }

    const data = await res.json();
    const idx = items.findIndex(i => i.id === parseInt(id));
    if (idx !== -1) items[idx] = data.item;

    renderItems();
    closeModals();
    showToast('Claim removed.');
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Remove Claim';
  }
}

// ==============================
// Modal helpers
// ==============================
function closeModals() {
  claimModal.classList.add('hidden');
  unclaimModal.classList.add('hidden');
}

// Close modals on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', closeModals);
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', closeModals);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModals();
});

// ==============================
// Init
// ==============================
claimForm.addEventListener('submit', handleClaimSubmit);
unclaimForm.addEventListener('submit', handleUnclaimSubmit);
fetchItems();
```

- [ ] **Step 2: Test full integration**

Start server and test the full flow:
```bash
# Kill any previous instance
pkill -f "node server.js" 2>/dev/null
sleep 1

# Start fresh
node server.js &
SERVER_PID=$!
sleep 2

# Fetch items
echo "=== Fetch items ==="
curl -s http://localhost:3000/api/items | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)} items loaded'); print(d[0]['name'])"

# Check HTML serves
echo "=== Check frontend ==="
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000/
echo ""

# Claim and verify frontend re-renders
echo "=== Claim item 1 ==="
curl -s -X POST http://localhost:3000/api/items/1/claim -H "Content-Type: application/json" -d '{"name":"Test Guest"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Claimed: {d[\"item\"][\"claimed\"]}, by {d[\"item\"][\"claimed_by\"]}')"

kill $SERVER_PID 2>/dev/null
```

Expected: 22 items loaded. Frontend returns 200. Claim succeeds and shows in API response.

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: add frontend JavaScript for claim/unclaim flow"
```

---

### Task 5: Final Verification & Deployment Prep

**Files:**
- None — this is a smoke test of the full application

- [ ] **Step 1: Run full integration test**

```bash
pkill -f "node server.js" 2>/dev/null
sleep 1
node server.js &
SERVER_PID=$!
sleep 2

echo "=== 1. Frontend serves ==="
curl -s -o /dev/null -w "Homepage: HTTP %{http_code}\n" http://localhost:3000/

echo ""
echo "=== 2. Items load ==="
curl -s http://localhost:3000/api/items | python3 -c "
import sys, json
items = json.load(sys.stdin)
print(f'Items: {len(items)}')
cats = set(i['category'] for i in items)
print(f'Categories: {len(cats)} -> {sorted(cats)}')
avail = sum(1 for i in items if not i['claimed'])
print(f'Available: {avail}')
"

echo ""
echo "=== 3. Full claim flow ==="
# Claim item 1
curl -s -X POST http://localhost:3000/api/items/1/claim -H 'Content-Type: application/json' -d '{"name":"Aunt Sarah","message":"Happy wedding!"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Claim: ok={d[\"success\"]}, by={d[\"item\"][\"claimed_by\"]}')"

# Verify it shows claimed
curl -s http://localhost:3000/api/items/1 | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'After claim: claimed={d[\"claimed\"]}, by={d[\"claimed_by\"]}')"

# Unclaim
curl -s -X POST http://localhost:3000/api/items/1/unclaim -H 'Content-Type: application/json' -d '{"name":"Aunt Sarah"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Unclaim: ok={d[\"success\"]}')"

# Verify re-available
curl -s http://localhost:3000/api/items/1 | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'After unclaim: claimed={d[\"claimed\"]}')"

kill $SERVER_PID 2>/dev/null
```

Expected: All checks pass. Frontend serves. 22 items in 4 categories. Claim/unclaim cycle works.

- [ ] **Step 2: Commit final version**

```bash
git add -A
git commit -m "chore: final integration pass"
```

- [ ] **Step 3: Ready for deploy**

The project is ready to deploy to Railway:

1. Create a GitHub repository and push the code
2. Go to [railway.app](https://railway.app), create a new project from the GitHub repo
3. Railway auto-provisions PostgreSQL and sets `DATABASE_URL`
4. The app auto-deploys and initializes the database on first start
5. Visit the Railway-generated URL to see the registry

Congrats — Janada & Daniel's registry is live! 🎉
```

