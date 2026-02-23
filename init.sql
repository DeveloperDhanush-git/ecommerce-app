-- ==========================================================
-- ECOMMERCE DATABASE INITIALIZATION
-- This file runs automatically on first MySQL container start
-- ==========================================================

CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- ==========================================================
-- USERS TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- CATEGORIES TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS categories (
  catid INT AUTO_INCREMENT PRIMARY KEY,
  catname VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  dateinserted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PRODUCTS TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS products (
  prodid INT AUTO_INCREMENT PRIMARY KEY,
  proname VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255),
  dateinserted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  catid INT,
  FOREIGN KEY (catid) REFERENCES categories(catid)
    ON DELETE SET NULL
);

CREATE INDEX idx_products_catid ON products(catid);
CREATE INDEX idx_products_price ON products(price);

-- ==========================================================
-- CATEGORY SYNONYMS TABLE (Amazon-style scalable)
-- ==========================================================

CREATE TABLE IF NOT EXISTS category_synonyms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  catid INT NOT NULL,
  synonym VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_catid_synonym (catid, synonym),
  FOREIGN KEY (catid) REFERENCES categories(catid)
    ON DELETE CASCADE
);

CREATE INDEX idx_synonym_catid ON category_synonyms(catid);
CREATE INDEX idx_synonym_word ON category_synonyms(synonym);

-- ==========================================================
-- SEED CATEGORY DATA
-- ==========================================================

INSERT INTO categories (catid, catname, description, image, slug) VALUES
(1, 'Electronics', 'Electronic gadgets and devices', 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SY450_.jpg', 'electronics'),
(2, 'Fashion', 'Clothing and fashion accessories', 'https://m.media-amazon.com/images/I/71gF4v2XWPL._AC_SY450_.jpg', 'fashion'),
(3, 'Home & Kitchen', 'Home appliances and kitchen essentials', 'https://m.media-amazon.com/images/I/71d5fMDvq9L._AC_SY450_.jpg', 'home-kitchen'),
(4, 'Mobiles', 'Smartphones and mobile accessories', 'https://m.media-amazon.com/images/I/71yzJoE7WlL._AC_SY450_.jpg', 'mobiles'),
(5, 'Beauty & Personal Care', 'Beauty and grooming products', 'https://m.media-amazon.com/images/I/61N5v1yXHcL._AC_SY450_.jpg', 'beauty-personal-care'),
(6, 'Toys & Games', 'Toys and games for kids', 'https://m.media-amazon.com/images/I/61d7zR6p6-L._AC_SY450_.jpg', 'toys-games'),
(7, 'Books', 'Fiction and non-fiction books', 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 'books'),
(8, 'Sports & Fitness', 'Sports equipment and fitness gear', 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 'sports-fitness'),
(9, 'Grocery', 'Daily grocery and food items', 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 'grocery'),
(10, 'Computers & Accessories', 'Computer hardware and accessories', 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 'computers-accessories');

-- ==========================================================
-- SEED CATEGORY SYNONYMS
-- ==========================================================

-- Electronics synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(1, 'electronic'), (1, 'electronics'), (1, 'gadget'), (1, 'gadgets'), (1, 'device'), (1, 'devices');

-- Fashion synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(2, 'clothes'), (2, 'clothing'), (2, 'dress'), (2, 'wear');

-- Home & Kitchen synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(3, 'home'), (3, 'kitchen'), (3, 'cookware'), (3, 'utensils'), (3, 'appliances');

-- Mobiles synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(4, 'mobile'), (4, 'mobiles'), (4, 'phone'), (4, 'phones'), (4, 'smartphone'), (4, 'smartphones');

-- Beauty synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(5, 'beauty'), (5, 'cosmetics'), (5, 'makeup'), (5, 'grooming'), (5, 'skincare');

-- Toys synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(6, 'toy'), (6, 'toys'), (6, 'games'), (6, 'gaming'), (6, 'kids');

-- Books synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(7, 'book'), (7, 'books'), (7, 'novel'), (7, 'novels'), (7, 'literature');

-- Sports synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(8, 'sports'), (8, 'fitness'), (8, 'gym'), (8, 'exercise'), (8, 'training');

-- Grocery synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(9, 'food'), (9, 'daily'), (9, 'essentials');

-- Computers synonyms
INSERT INTO category_synonyms (catid, synonym) VALUES
(10, 'computer'), (10, 'computers'), (10, 'laptop'), (10, 'pc'), (10, 'notebook'), (10, 'accessories');

-- ==========================================================
-- SEED PRODUCT DATA (10 products per category = 100 total)
-- ==========================================================

-- Electronics products
INSERT INTO products (proname, description, price, image, catid) VALUES
('Wireless Bluetooth Headphones', 'High quality wireless headphones', 1999.00, 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SY450_.jpg', 1),
('Smart LED TV 43 inch', 'Full HD Smart LED TV', 25999.00, 'https://m.media-amazon.com/images/I/71F2XhGkB1L._AC_SY450_.jpg', 1),
('Gaming Laptop', 'High performance gaming laptop', 74999.00, 'https://m.media-amazon.com/images/I/71TPda7cwUL._AC_SY450_.jpg', 1),
('Bluetooth Speaker', 'Portable bluetooth speaker', 2999.00, 'https://m.media-amazon.com/images/I/71r69Y7BSeL._AC_SY450_.jpg', 1),
('DSLR Camera', 'Professional DSLR camera', 55999.00, 'https://m.media-amazon.com/images/I/81eR8jvFQPL._AC_SY450_.jpg', 1),
('Power Bank 20000mAh', 'Fast charging power bank', 1499.00, 'https://m.media-amazon.com/images/I/71lVwl3q-kL._AC_SY450_.jpg', 1),
('Wireless Mouse', 'Ergonomic wireless mouse', 799.00, 'https://m.media-amazon.com/images/I/61LtuGzXeaL._AC_SY450_.jpg', 1),
('Mechanical Keyboard', 'RGB mechanical keyboard', 3499.00, 'https://m.media-amazon.com/images/I/71F3XlX8pML._AC_SY450_.jpg', 1),
('USB-C Hub', 'Multiport USB-C hub', 2199.00, 'https://m.media-amazon.com/images/I/61aYp1mL4CL._AC_SY450_.jpg', 1),
('Noise Cancelling Earbuds', 'Premium ANC earbuds', 4999.00, 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SY450_.jpg', 1);

-- Fashion products
INSERT INTO products (proname, description, price, image, catid) VALUES
('Men Casual Shirt', 'Cotton slim fit shirt', 899.00, 'https://m.media-amazon.com/images/I/71gF4v2XWPL._AC_SY450_.jpg', 2),
('Women Kurti', 'Traditional cotton kurti', 1199.00, 'https://m.media-amazon.com/images/I/71z5V8jL7pL._AC_SY450_.jpg', 2),
('Jeans for Men', 'Stretchable denim jeans', 1499.00, 'https://m.media-amazon.com/images/I/81sXzZ+3M3L._AC_SY450_.jpg', 2),
('Sports Shoes', 'Running sports shoes', 2499.00, 'https://m.media-amazon.com/images/I/71k7M9Z6n0L._AC_SY450_.jpg', 2),
('Women Handbag', 'Stylish leather handbag', 1999.00, 'https://m.media-amazon.com/images/I/71b5QhKJt9L._AC_SY450_.jpg', 2),
('Men T-Shirt', 'Printed cotton t-shirt', 599.00, 'https://m.media-amazon.com/images/I/71U3n6F0oDL._AC_SY450_.jpg', 2),
('Sunglasses', 'UV protection sunglasses', 799.00, 'https://m.media-amazon.com/images/I/61wT7F4uXyL._AC_SY450_.jpg', 2),
('Women Sandals', 'Comfortable sandals', 1299.00, 'https://m.media-amazon.com/images/I/71fJ5W8oK2L._AC_SY450_.jpg', 2),
('Jacket', 'Winter leather jacket', 3499.00, 'https://m.media-amazon.com/images/I/71HkR5xW9GL._AC_SY450_.jpg', 2),
('Watch', 'Analog wrist watch', 2199.00, 'https://m.media-amazon.com/images/I/71f5Eu5lJSL._AC_SY450_.jpg', 2);

-- Home & Kitchen products
INSERT INTO products (proname, description, price, image, catid) VALUES
('Non-Stick Cooking Pan', 'Premium non-stick frying pan for daily cooking', 1299.00, 'https://m.media-amazon.com/images/I/71d5fMDvq9L._AC_SY450_.jpg', 3),
('Mixer Grinder 750W', 'High performance mixer grinder with 3 jars', 3499.00, 'https://m.media-amazon.com/images/I/71Kp8jY5hUL._AC_SY450_.jpg', 3),
('Electric Rice Cooker', 'Automatic rice cooker with keep warm function', 2599.00, 'https://m.media-amazon.com/images/I/71F5Eu5lJSL._AC_SY450_.jpg', 3),
('Stainless Steel Water Bottle', 'Insulated steel water bottle 1L', 699.00, 'https://m.media-amazon.com/images/I/61bK6PMOC3L._AC_SY450_.jpg', 3),
('LED Ceiling Light', 'Energy efficient LED ceiling light 12W', 499.00, 'https://m.media-amazon.com/images/I/61x8Y4C9+JL._AC_SY450_.jpg', 3),
('Vacuum Cleaner', 'Powerful home vacuum cleaner with HEPA filter', 5999.00, 'https://m.media-amazon.com/images/I/71mVjzJzXhL._AC_SY450_.jpg', 3),
('Dinner Set 24 Pieces', 'Premium ceramic dinner set', 3999.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 3),
('Wall Clock', 'Modern decorative wall clock', 999.00, 'https://m.media-amazon.com/images/I/61LtuGzXeaL._AC_SY450_.jpg', 3),
('Bed Sheet King Size', 'Cotton king size bed sheet with pillow covers', 1799.00, 'https://m.media-amazon.com/images/I/71HkR5xW9GL._AC_SY450_.jpg', 3),
('Air Fryer 4L', 'Oil free healthy air fryer', 5499.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 3);

-- Mobiles products
INSERT INTO products (proname, description, price, image, catid) VALUES
('iPhone 14 Pro Max', 'Apple iPhone 14 Pro Max 128GB', 129999.00, 'https://m.media-amazon.com/images/I/71yzJoE7WlL._AC_SY450_.jpg', 4),
('Samsung Galaxy S23', 'Samsung flagship smartphone 256GB', 79999.00, 'https://m.media-amazon.com/images/I/61RZDb2mQxL._AC_SY450_.jpg', 4),
('OnePlus 12', 'OnePlus latest 5G smartphone', 64999.00, 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SY450_.jpg', 4),
('Redmi Note 13 Pro', 'Affordable 5G smartphone with AMOLED display', 21999.00, 'https://m.media-amazon.com/images/I/71ZDY57yTQL._AC_SY450_.jpg', 4),
('Realme Narzo 60', 'Budget friendly 5G smartphone', 14999.00, 'https://m.media-amazon.com/images/I/71r69Y7BSeL._AC_SY450_.jpg', 4),
('Vivo V29', 'Stylish smartphone with high quality camera', 32999.00, 'https://m.media-amazon.com/images/I/71F3XlX8pML._AC_SY450_.jpg', 4),
('Motorola Edge 40', 'Premium design and performance', 29999.00, 'https://m.media-amazon.com/images/I/61aYp1mL4CL._AC_SY450_.jpg', 4),
('Nothing Phone 2', 'Unique transparent design smartphone', 37999.00, 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SY450_.jpg', 4),
('POCO X6 Pro', 'Gaming focused 5G smartphone', 24999.00, 'https://m.media-amazon.com/images/I/71TPda7cwUL._AC_SY450_.jpg', 4),
('Google Pixel 8', 'Google AI powered smartphone', 75999.00, 'https://m.media-amazon.com/images/I/81eR8jvFQPL._AC_SY450_.jpg', 4);

-- Beauty & Personal Care products
INSERT INTO products (proname, description, price, image, catid) VALUES
('Face Wash for Oily Skin', 'Deep cleansing face wash for daily use', 249.00, 'https://m.media-amazon.com/images/I/61N5v1yXHcL._AC_SY450_.jpg', 5),
('Vitamin C Serum', 'Brightening and anti-aging serum 30ml', 599.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 5),
('Hair Dryer 1200W', 'Compact hair dryer with heat control', 1299.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 5),
('Body Lotion 400ml', 'Moisturizing body lotion for smooth skin', 349.00, 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SY450_.jpg', 5),
('Perfume for Men', 'Long lasting premium fragrance 100ml', 999.00, 'https://m.media-amazon.com/images/I/71gF4v2XWPL._AC_SY450_.jpg', 5),
('Makeup Kit Combo', 'Complete makeup starter kit', 1999.00, 'https://m.media-amazon.com/images/I/71d5fMDvq9L._AC_SY450_.jpg', 5),
('Hair Straightener', 'Ceramic hair straightener with temperature control', 1799.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 5),
('Beard Trimmer', 'Rechargeable beard trimmer with multiple settings', 1499.00, 'https://m.media-amazon.com/images/I/71yzJoE7WlL._AC_SY450_.jpg', 5),
('Sunscreen SPF 50', 'Water resistant sunscreen lotion', 399.00, 'https://m.media-amazon.com/images/I/61d7zR6p6-L._AC_SY450_.jpg', 5),
('Aloe Vera Gel', 'Natural soothing aloe vera gel 200ml', 299.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 5);

-- Toys & Games products
INSERT INTO products (proname, description, price, image, catid) VALUES
('Remote Control Car', 'High speed RC car for kids', 1999.00, 'https://m.media-amazon.com/images/I/61d7zR6p6-L._AC_SY450_.jpg', 6),
('Building Blocks Set', 'Creative building blocks 500 pieces', 1499.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 6),
('Soft Teddy Bear', 'Cute and soft plush teddy bear', 799.00, 'https://m.media-amazon.com/images/I/71gF4v2XWPL._AC_SY450_.jpg', 6),
('Puzzle Game 1000 Pieces', 'Challenging jigsaw puzzle game', 699.00, 'https://m.media-amazon.com/images/I/71d5fMDvq9L._AC_SY450_.jpg', 6),
('Cricket Bat for Kids', 'Lightweight cricket bat size 4', 999.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 6),
('Barbie Doll Set', 'Fashion doll with accessories', 1599.00, 'https://m.media-amazon.com/images/I/61N5v1yXHcL._AC_SY450_.jpg', 6),
('Ludo Board Game', 'Classic family board game', 299.00, 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SY450_.jpg', 6),
('Toy Kitchen Set', 'Mini kitchen play set for kids', 2499.00, 'https://m.media-amazon.com/images/I/71yzJoE7WlL._AC_SY450_.jpg', 6),
('Football Size 5', 'Professional training football', 899.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 6),
('Educational Learning Tablet', 'Interactive learning toy for kids', 2999.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 6);

-- Books products
INSERT INTO products (proname, description, price, image, catid) VALUES
('The Power of Habit', 'Self-help book on building good habits', 499.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('Atomic Habits', 'Guide to building small habits for big success', 599.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('Rich Dad Poor Dad', 'Personal finance and wealth mindset book', 399.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('The Alchemist', 'Fiction novel by Paulo Coelho', 349.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('Think and Grow Rich', 'Classic success mindset book', 299.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('Data Structures & Algorithms', 'Technical programming reference book', 899.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('The Psychology of Money', 'Book on financial behavior and investing', 499.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('Deep Work', 'Productivity and focus improvement book', 549.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('Zero to One', 'Startup and entrepreneurship guide', 459.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7),
('Clean Code', 'Best practices for writing clean software', 999.00, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_SY450_.jpg', 7);

-- Sports & Fitness products
INSERT INTO products (proname, description, price, image, catid) VALUES
('Yoga Mat Anti-Slip', 'Comfortable non-slip yoga mat', 799.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Adjustable Dumbbells 10kg', 'Home workout adjustable dumbbells set', 2499.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Skipping Rope', 'High speed fitness skipping rope', 299.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Gym Gloves', 'Weight lifting gym gloves for better grip', 399.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Treadmill for Home', 'Motorized treadmill with LCD display', 29999.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Exercise Resistance Bands', 'Stretchable resistance bands set', 699.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Protein Powder 1kg', 'Whey protein supplement chocolate flavor', 2499.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Push Up Bar', 'Heavy duty push up bars for home workouts', 599.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Badminton Racket Set', 'Professional badminton racket combo', 1499.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8),
('Football Training Cones', 'Speed and agility training cones set', 499.00, 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._AC_SY450_.jpg', 8);

-- Grocery products
INSERT INTO products (proname, description, price, image, catid) VALUES
('Basmati Rice 5kg', 'Premium long grain basmati rice', 799.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Sunflower Oil 1L', 'Refined sunflower cooking oil', 149.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Organic Honey 500g', 'Pure natural organic honey', 299.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Toor Dal 1kg', 'Premium quality toor dal', 189.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Whole Wheat Flour 5kg', 'Fresh chakki atta wheat flour', 349.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Green Tea 100 Bags', 'Healthy antioxidant green tea bags', 249.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Instant Coffee 200g', 'Rich aroma instant coffee powder', 299.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Peanut Butter 1kg', 'Creamy peanut butter spread', 399.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Cornflakes 500g', 'Healthy breakfast cornflakes cereal', 199.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9),
('Dark Chocolate 100g', 'Premium dark chocolate bar', 149.00, 'https://m.media-amazon.com/images/I/71sBtM3Yi5L._AC_SY450_.jpg', 9);

-- Computers & Accessories products
INSERT INTO products (proname, description, price, image, catid) VALUES
('Wireless Mouse', 'Ergonomic wireless optical mouse', 699.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard', 2499.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('USB 3.0 Pen Drive 64GB', 'High speed USB flash drive', 799.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('Laptop Cooling Pad', 'Dual fan cooling pad for laptops', 1299.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('External Hard Drive 1TB', 'Portable USB external hard disk', 4499.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('Webcam HD 1080p', 'Full HD webcam for online meetings', 1599.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('Bluetooth Keyboard', 'Slim wireless bluetooth keyboard', 1299.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('Laptop Backpack', 'Water resistant laptop backpack 15.6 inch', 1999.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('Gaming Headset', 'Surround sound gaming headset with mic', 2999.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10),
('HDMI Cable 2m', 'High speed HDMI cable for TV & monitor', 499.00, 'https://m.media-amazon.com/images/I/71z+z8VJxYL._AC_SY450_.jpg', 10);
