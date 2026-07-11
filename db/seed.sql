-- Clear old items so seed always runs fresh
DELETE FROM contributions;
DELETE FROM items;
SELECT setval('items_id_seq', 1, false);

INSERT INTO items (name, description, category, price_range, price, image_url, sort_order)
SELECT * FROM (VALUES
    ('Furniture', 'Quality furniture for your home', 'Furniture', '₦3,000,000', 3000000.00, '/images/Furniture.png', 1),
    ('65" Smart TV', 'Latest 65 inch smart television', 'Electronics', '₦1,300,000', 1300000.00, '/images/65 Inch TV.jpg', 2),
    ('Rug', 'Beautiful area rug for your living space', 'Home Decor', '₦350,000', 350000.00, '/images/Rug.jpg', 3),
    ('Air Conditioner', 'Energy efficient air conditioning unit', 'Appliances', '₦1,200,000', 1200000.00, '/images/Air Conditioner.jpg', 4),
    ('Mirrors ×2', 'Pair of elegant mirrors (₦200,000 each)', 'Home Decor', '₦200,000', 200000.00, '/images/Mirror.jpg', 5),
    ('Gas Cooker', 'Reliable gas cooking stove', 'Kitchen', '₦500,000', 500000.00, '/images/Gas Cooker.jpg', 6),
    ('Cylinder', 'Gas cylinder for cooking', 'Kitchen', '₦50,000', 50000.00, '/images/Gas Cylinder.jpg', 7),
    ('Refrigerator/Freezer', 'Full-size refrigerator with freezer compartment', 'Appliances', '₦1,500,000', 1500000.00, '/images/refridgerator.jpg', 8),
    ('Washing Machine', 'Modern washing machine for laundry', 'Appliances', '₦400,000', 400000.00, '/images/Washing Machine.jpg', 9),
    ('Toaster', 'Classic toaster for breakfast', 'Kitchen', '₦50,000', 50000.00, '/images/Toaster.jpg', 10),
    ('Rice Cooker', 'Automatic rice cooking appliance', 'Kitchen', '₦50,000', 50000.00, '/images/Rice cooker.jpg', 11),
    ('Steam Iron', 'Professional steam iron for clothes', 'Laundry', '₦55,000', 55000.00, '/images/Iron.jpg', 12),
    ('Ironing Board', 'Essential board for ironing clothes', 'Laundry', '₦80,000', 80000.00, '/images/Ironing Board.jpg', 13),
    ('Vacuum Cleaner', 'Powerful vacuum for cleaning floors', 'Cleaning', '₦250,000', 250000.00, '/images/Vacuum Cleaner.jpg', 14),
    ('Glass Storage Bowls', 'Set of glass containers for storage', 'Kitchen', '₦150,000', 150000.00, '/images/Glass Container.jpg', 15),
    ('Shoe Rack', 'Organized shoe storage solution', 'Storage', '₦200,000', 200000.00, '/images/Shoe Rack.jpg', 16)
) AS v(name, description, category, price_range, price, image_url, sort_order);
