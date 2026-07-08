INSERT INTO items (name, description, category, price_range, image_url, sort_order)
SELECT * FROM (VALUES
    -- Kitchen & Dining
    ('Premium Cookware Set', '10-piece nonstick cookware set — pots, pans, and lids for every meal.', 'Kitchen & Dining', '$200 - $400', 'https://images.unsplash.com/photo-1584990347193-6bebebfeaeee?w=400&h=300&fit=crop', 1),
    ('Chef''s Knife Set', 'Professional 5-piece knife set with wooden block.', 'Kitchen & Dining', '$100 - $200', 'https://images.unsplash.com/photo-1593618229012-8aaad1cfefc3?w=400&h=300&fit=crop', 2),
    ('High-Speed Blender', 'Powerful blender for smoothies, soups, and sauces.', 'Kitchen & Dining', '$80 - $150', 'https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=400&h=300&fit=crop', 3),
    ('Espresso Machine', 'Semi-automatic espresso maker with milk frother.', 'Kitchen & Dining', '$150 - $300', 'https://images.unsplash.com/photo-1616388761741-a5936c6f61f6?w=400&h=300&fit=crop', 4),
    ('Elegant Dinnerware Set', '12-piece stoneware dinner set — plates, bowls, and mugs.', 'Kitchen & Dining', '$100 - $200', 'https://images.unsplash.com/photo-1631008788127-57317667a0d2?w=400&h=300&fit=crop', 5),
    ('Wine Glass Set', 'Set of 8 crystal wine glasses (4 red, 4 white).', 'Kitchen & Dining', '$60 - $100', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop', 6),
    ('Stainless Steel Flatware Set', '40-piece flatware set for 8 — forks, knives, spoons.', 'Kitchen & Dining', '$50 - $100', 'https://images.unsplash.com/photo-1739636863907-703ee2df2451?w=400&h=300&fit=crop', 7),
    ('Stainless Mixing Bowls', 'Set of 5 nesting mixing bowls with lids.', 'Kitchen & Dining', '$40 - $80', 'https://images.unsplash.com/photo-1567763745030-bfe9c51bec27?w=400&h=300&fit=crop', 8),
    ('Slow Cooker', '6-quart programmable slow cooker with timer.', 'Kitchen & Dining', '$50 - $100', 'https://images.unsplash.com/photo-1579712303131-56ec4f9d4128?w=400&h=300&fit=crop', 9),
    ('Baking Sheet Set', '3-piece aluminum baking sheet set — half, quarter, and jelly roll.', 'Kitchen & Dining', '$30 - $60', 'https://images.unsplash.com/photo-1586826583078-cef32c938857?w=400&h=300&fit=crop', 10),
    -- Bed & Bath
    ('Luxury Towel Set', 'Set of 6 plush bath towels in sage green.', 'Bed & Bath', '$80 - $150', 'https://images.unsplash.com/photo-1523471826770-c437b4636fe6?w=400&h=300&fit=crop', 11),
    ('Premium Sheet Set', '100% cotton 400-thread-count sheet set, queen size.', 'Bed & Bath', '$80 - $160', 'https://images.unsplash.com/photo-1601276174812-63280a55656e?w=400&h=300&fit=crop', 12),
    ('Down Comforter', 'Lightweight down comforter with duvet cover, queen.', 'Bed & Bath', '$120 - $250', 'https://images.unsplash.com/photo-1635594202056-9ea3b497e5c0?w=400&h=300&fit=crop', 13),
    ('Throw Blankets (Set of 2)', 'Soft knit throw blankets in cream and sage.', 'Bed & Bath', '$40 - $80', 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=400&h=300&fit=crop', 14),
    -- Home & Decor
    ('Framed Photo Collection', 'Set of 3 coordinating picture frames, assorted sizes.', 'Home & Decor', '$30 - $60', 'https://images.unsplash.com/photo-1452457005517-a0dd81caca2a?w=400&h=300&fit=crop', 15),
    ('Ceramic Vase Set', 'Set of 2 hand-crafted ceramic vases.', 'Home & Decor', '$40 - $80', 'https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=400&h=300&fit=crop', 16),
    ('Scented Candle Collection', 'Set of 4 soy wax candles — vanilla, lavender, eucalyptus, amber.', 'Home & Decor', '$30 - $50', 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=400&h=300&fit=crop', 17),
    ('Indoor Planters (Set of 3)', 'Modern ceramic planters with bamboo trays, 3 sizes.', 'Home & Decor', '$40 - $70', 'https://images.unsplash.com/photo-1604762525950-13c07ecdab8b?w=400&h=300&fit=crop', 18),
    -- Experiences
    ('Honeymoon Fund — $50 Contribution', 'Help the couple make memories on their honeymoon!', 'Experiences', '$50', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop', 19),
    ('Honeymoon Fund — $100 Contribution', 'A generous contribution to Janada & Daniel''s honeymoon.', 'Experiences', '$100', 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=400&h=300&fit=crop', 20),
    ('Honeymoon Fund — $250 Contribution', 'A VIP contribution to the honeymoon fund!', 'Experiences', '$250', 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=300&fit=crop', 21),
    ('Date Night Gift Card', 'A dinner-and-a-movie night for the happy couple.', 'Experiences', '$75 - $150', 'https://images.unsplash.com/photo-1559339352-11d035aa65ca?w=400&h=300&fit=crop', 22)
) AS v(name, description, category, price_range, image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM items LIMIT 1);
