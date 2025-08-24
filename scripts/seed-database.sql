-- Seed database with sample data

-- Insert categories
INSERT INTO categories (id, name, description, slug) VALUES
('1', 'Electronics', 'Latest gadgets and electronic devices', 'electronics'),
('2', 'Clothing', 'Fashion and apparel for all occasions', 'clothing'),
('3', 'Home & Garden', 'Everything for your home and garden', 'home-garden'),
('4', 'Sports', 'Sports equipment and fitness gear', 'sports')
ON CONFLICT (id) DO NOTHING;

-- Insert products
INSERT INTO products (id, name, description, price, image, stock, featured, slug, category_id) VALUES
('1', 'Wireless Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 299.99, '/placeholder.svg?height=400&width=400', 25, TRUE, 'wireless-headphones', '1'),
('2', 'Smart Watch', 'Advanced fitness tracking smartwatch with heart rate monitor', 399.99, '/placeholder.svg?height=400&width=400', 15, TRUE, 'smart-watch', '1'),
('3', 'Designer T-Shirt', 'Premium cotton t-shirt with modern design', 49.99, '/placeholder.svg?height=400&width=400', 50, FALSE, 'designer-t-shirt', '2'),
('4', 'Running Shoes', 'Lightweight running shoes with advanced cushioning', 129.99, '/placeholder.svg?height=400&width=400', 30, TRUE, 'running-shoes', '4'),
('5', 'Coffee Maker', 'Programmable coffee maker with thermal carafe', 89.99, '/placeholder.svg?height=400&width=400', 20, FALSE, 'coffee-maker', '3'),
('6', 'Yoga Mat', 'Non-slip yoga mat with carrying strap', 39.99, '/placeholder.svg?height=400&width=400', 40, FALSE, 'yoga-mat', '4')
ON CONFLICT (id) DO NOTHING;

-- Insert sample user
INSERT INTO users (id, email, password, first_name, last_name) VALUES
('1', 'john@example.com', '$2b$10$hashedpasswordexample', 'John', 'Doe')
ON CONFLICT (id) DO NOTHING;
