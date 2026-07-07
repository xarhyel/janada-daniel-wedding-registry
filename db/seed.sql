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
