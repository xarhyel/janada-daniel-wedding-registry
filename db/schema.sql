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

ALTER TABLE items ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE items DROP COLUMN IF EXISTS claimed;
ALTER TABLE items DROP COLUMN IF EXISTS claimed_by;
ALTER TABLE items DROP COLUMN IF EXISTS claim_message;

-- Contributions: free-form amount (no percentages).
-- DROP and recreate so legacy percentage columns/constraints on existing DBs are removed.
DROP TABLE IF EXISTS contributions;

CREATE TABLE contributions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id),
    contributor_name VARCHAR(100) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contributions_item ON contributions(item_id);
CREATE INDEX IF NOT EXISTS idx_contributions_paid ON contributions(paid);
