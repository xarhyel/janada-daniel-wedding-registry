CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_range VARCHAR(50) NOT NULL,
    image_url VARCHAR(500) DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add price column if upgrading from old schema
ALTER TABLE items ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Set prices for existing items that still have price=0 (migration from old schema)
UPDATE items SET price = 400.00 WHERE name = 'Premium Cookware Set' AND price = 0;
UPDATE items SET price = 200.00 WHERE name = 'Chef''s Knife Set' AND price = 0;
UPDATE items SET price = 150.00 WHERE name = 'High-Speed Blender' AND price = 0;
UPDATE items SET price = 300.00 WHERE name = 'Espresso Machine' AND price = 0;
UPDATE items SET price = 200.00 WHERE name = 'Elegant Dinnerware Set' AND price = 0;
UPDATE items SET price = 100.00 WHERE name = 'Wine Glass Set' AND price = 0;
UPDATE items SET price = 100.00 WHERE name = 'Stainless Steel Flatware Set' AND price = 0;
UPDATE items SET price = 80.00 WHERE name = 'Stainless Mixing Bowls' AND price = 0;
UPDATE items SET price = 100.00 WHERE name = 'Slow Cooker' AND price = 0;
UPDATE items SET price = 60.00 WHERE name = 'Baking Sheet Set' AND price = 0;
UPDATE items SET price = 150.00 WHERE name = 'Luxury Towel Set' AND price = 0;
UPDATE items SET price = 160.00 WHERE name = 'Premium Sheet Set' AND price = 0;
UPDATE items SET price = 250.00 WHERE name = 'Down Comforter' AND price = 0;
UPDATE items SET price = 80.00 WHERE name = 'Throw Blankets (Set of 2)' AND price = 0;
UPDATE items SET price = 60.00 WHERE name = 'Framed Photo Collection' AND price = 0;
UPDATE items SET price = 80.00 WHERE name = 'Ceramic Vase Set' AND price = 0;
UPDATE items SET price = 50.00 WHERE name = 'Scented Candle Collection' AND price = 0;
UPDATE items SET price = 70.00 WHERE name = 'Indoor Planters (Set of 3)' AND price = 0;
UPDATE items SET price = 50.00 WHERE name = 'Honeymoon Fund — $50 Contribution' AND price = 0;
UPDATE items SET price = 100.00 WHERE name = 'Honeymoon Fund — $100 Contribution' AND price = 0;
UPDATE items SET price = 250.00 WHERE name = 'Honeymoon Fund — $250 Contribution' AND price = 0;
UPDATE items SET price = 150.00 WHERE name = 'Date Night Gift Card' AND price = 0;

-- Drop old claim-system columns (replaced by contributions table)
ALTER TABLE items DROP COLUMN IF EXISTS claimed;
ALTER TABLE items DROP COLUMN IF EXISTS claimed_by;
ALTER TABLE items DROP COLUMN IF EXISTS claim_message;

CREATE TABLE IF NOT EXISTS contributions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id),
    contributor_name VARCHAR(100) NOT NULL,
    percentage INTEGER NOT NULL CHECK (percentage IN (25, 50, 75, 100)),
    amount NUMERIC(10,2) NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
