-- Clear old items so seed always runs fresh
DELETE FROM contributions;
DELETE FROM items;
SELECT setval('items_id_seq', 1, false);

INSERT INTO items (name, description, category, price_range, price, image_url, sort_order)
SELECT * FROM (VALUES
    ('Furniture', 'Quality furniture for your home', 'Furniture', '₦3,000,000', 3000000.00, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', 1),
    ('65" Smart TV', 'Latest 65 inch smart television', 'Electronics', '₦1,300,000', 1300000.00, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop', 2),
    ('Rug', 'Beautiful area rug for your living space', 'Home Decor', '₦350,000', 350000.00, 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400&h=300&fit=crop', 3),
    ('Air Conditioner', 'Energy efficient air conditioning unit', 'Appliances', '₦1,200,000', 1200000.00, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop', 4),
    ('Mirrors ×2', 'Pair of elegant mirrors (₦200,000 each)', 'Home Decor', '₦200,000', 200000.00, 'https://images.unsplash.com/photo-1452457005517-a0dd81caca2a?w=400&h=300&fit=crop', 5),
    ('Gas Cooker', 'Reliable gas cooking stove', 'Kitchen', '₦500,000', 500000.00, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', 6),
    ('Cylinder', 'Gas cylinder for cooking', 'Kitchen', '₦50,000', 50000.00, 'https://images.unsplash.com/photo-1586826583078-cef32c938857?w=400&h=300&fit=crop', 7),
    ('Refrigerator/Freezer', 'Full-size refrigerator with freezer compartment', 'Appliances', '₦1,500,000', 1500000.00, 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop', 8),
    ('Washing Machine', 'Modern washing machine for laundry', 'Appliances', '₦400,000', 400000.00, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=300&fit=crop', 9),
    ('Toaster', 'Classic toaster for breakfast', 'Kitchen', '₦50,000', 50000.00, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=300&fit=crop', 10),
    ('Rice Cooker', 'Automatic rice cooking appliance', 'Kitchen', '₦50,000', 50000.00, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', 11),
    ('Steam Iron', 'Professional steam iron for clothes', 'Laundry', '₦55,000', 55000.00, 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400&h=300&fit=crop', 12),
    ('Ironing Board', 'Essential board for ironing clothes', 'Laundry', '₦80,000', 80000.00, 'https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=400&h=300&fit=crop', 13),
    ('Vacuum Cleaner', 'Powerful vacuum for cleaning floors', 'Cleaning', '₦250,000', 250000.00, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop', 14),
    ('Glass Storage Bowls', 'Set of glass containers for storage', 'Kitchen', '₦150,000', 150000.00, 'https://images.unsplash.com/photo-1604762525950-13c07ecdab8b?w=400&h=300&fit=crop', 15),
    ('Shoe Rack', 'Organized shoe storage solution', 'Storage', '₦200,000', 200000.00, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop', 16)
) AS v(name, description, category, price_range, price, image_url, sort_order);
