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
