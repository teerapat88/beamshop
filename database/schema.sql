-- =============================================
-- BEAM SHOP - Computer Equipment E-Commerce
-- Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS beam_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE beam_shop;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  avatar VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  stock INT DEFAULT 0,
  condition_type ENUM('new', 'used') DEFAULT 'new',
  condition_detail ENUM('like_new', 'good', 'fair', 'poor') DEFAULT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  sku VARCHAR(100),
  weight DECIMAL(8, 2),
  warranty VARCHAR(100),
  sold_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Specifications Table
CREATE TABLE IF NOT EXISTS product_specs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  spec_key VARCHAR(100) NOT NULL,
  spec_value VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash_on_delivery', 'bank_transfer', 'credit_card', 'promptpay') DEFAULT 'cash_on_delivery',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_slip VARCHAR(255),
  shipping_name VARCHAR(100) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_province VARCHAR(100),
  shipping_district VARCHAR(100),
  shipping_subdistrict VARCHAR(100),
  shipping_zipcode VARCHAR(10),
  tracking_number VARCHAR(100),
  notes TEXT,
  confirmed_at TIMESTAMP NULL,
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  condition_type ENUM('new', 'used') DEFAULT 'new',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart Table
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (product_id, user_id, order_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  discount_type ENUM('percentage', 'fixed') DEFAULT 'fixed',
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banner/Slider Table
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200),
  subtitle VARCHAR(300),
  image VARCHAR(500) NOT NULL,
  link VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert Admin User (password: admin123)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@beamshop.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin BeamShop', 'admin');

-- Insert Categories
INSERT INTO categories (name, slug, description, icon) VALUES
('CPU & Processors', 'cpu-processors', 'ซีพียูและโปรเซสเซอร์สำหรับเดสก์ท็อปและโน้ตบุ๊ก', 'cpu'),
('Motherboards', 'motherboards', 'เมนบอร์ดทุกรุ่น ทุกแพลตฟอร์ม', 'circuit-board'),
('RAM & Memory', 'ram-memory', 'หน่วยความจำ DDR4 DDR5 สำหรับเดสก์ท็อปและโน้ตบุ๊ก', 'memory'),
('Graphics Cards', 'graphics-cards', 'การ์ดจอทุกรุ่น NVIDIA AMD', 'gpu-card'),
('Storage', 'storage', 'SSD HDD NVMe ทุกความจุ', 'hdd'),
('Power Supply', 'power-supply', 'แหล่งจ่ายไฟทุกขนาด 80+ certified', 'zap'),
('PC Cases', 'pc-cases', 'เคสคอมพิวเตอร์ทุกขนาด ATX mATX ITX', 'box'),
('Cooling', 'cooling', 'ระบบระบายความร้อน ลม น้ำ', 'wind'),
('Monitors', 'monitors', 'จอมอนิเตอร์ทุกขนาด ทุก Hz', 'monitor'),
('Keyboards & Mice', 'keyboards-mice', 'คีย์บอร์ดและเมาส์ ทั้ง Mechanical และ Membrane', 'keyboard'),
('Laptops', 'laptops', 'โน้ตบุ๊กทั้งใหม่และมือสอง', 'laptop'),
('Networking', 'networking', 'อุปกรณ์เน็ตเวิร์ก Router Switch NIC', 'wifi');

-- Insert Sample Products
INSERT INTO products (category_id, name, slug, description, short_description, price, original_price, stock, condition_type, brand, model, warranty, is_featured) VALUES
(4, 'NVIDIA GeForce RTX 4090 24GB GDDR6X', 'nvidia-rtx-4090-24gb', 'การ์ดจอรุ่นท็อปสุดของ NVIDIA สำหรับเกมเมอร์และนักสร้างคอนเทนต์ระดับสูง', 'การ์ดจอ RTX 4090 24GB ประสิทธิภาพสูงสุด', 59900.00, 64900.00, 5, 'new', 'NVIDIA', 'RTX 4090', '3 ปี', TRUE),
(1, 'AMD Ryzen 9 7950X 16-Core Processor', 'amd-ryzen-9-7950x', 'โปรเซสเซอร์ระดับ Flagship จาก AMD พร้อม 16 Cores 32 Threads', 'CPU AMD Ryzen 9 7950X 16C/32T สำหรับงาน Creator', 22900.00, 24900.00, 10, 'new', 'AMD', 'Ryzen 9 7950X', '3 ปี', TRUE),
(1, 'Intel Core i9-14900K Processor', 'intel-core-i9-14900k', 'Intel Core i9 Gen 14 ประสิทธิภาพสูงสุด 24 Core', 'CPU Intel i9-14900K 24C สำหรับเกมและสร้างสรรค์', 19900.00, 21900.00, 8, 'new', 'Intel', 'Core i9-14900K', '3 ปี', TRUE),
(3, 'Corsair Vengeance DDR5-6000 32GB Kit', 'corsair-ddr5-6000-32gb', 'RAM DDR5 ความเร็วสูง 6000MHz สำหรับแพลตฟอร์ม AM5 และ LGA1700', 'RAM DDR5 6000MHz 32GB (2x16GB)', 7900.00, 8900.00, 20, 'new', 'Corsair', 'Vengeance DDR5-6000', '1 ปี', FALSE),
(5, 'Samsung 990 Pro NVMe SSD 2TB', 'samsung-990-pro-2tb', 'SSD NVMe Gen4 ความเร็วสูงสุด 7450MB/s Read', 'SSD NVMe 2TB ความเร็ว 7450MB/s', 5900.00, 6500.00, 15, 'new', 'Samsung', '990 Pro 2TB', '5 ปี', TRUE),
(9, 'LG UltraGear 27" QHD 165Hz IPS Monitor', 'lg-ultragear-27-qhd-165hz', 'จอมอนิเตอร์เกมมิ่ง 27 นิ้ว QHD 165Hz IPS พร้อม HDMI 2.1', 'มอนิเตอร์เกม 27" QHD 165Hz IPS', 11900.00, 13900.00, 12, 'new', 'LG', 'UltraGear 27GP850-B', '3 ปี', TRUE),
(4, 'AMD Radeon RX 6800 XT 16GB มือสอง', 'amd-rx-6800-xt-used', 'การ์ดจอมือสอง AMD RX 6800 XT สภาพดีมาก ใช้งานน้อย ทดสอบแล้ว', 'RX 6800 XT 16GB มือสอง สภาพดีมาก', 9900.00, NULL, 3, 'used', 'AMD', 'Radeon RX 6800 XT', 'ไม่มี', FALSE),
(1, 'Intel Core i5-12600K มือสอง', 'intel-i5-12600k-used', 'CPU Intel i5-12600K มือสอง สภาพดี ยังใช้งานได้ดี พร้อมส่ง', 'Intel i5-12600K มือสอง สภาพดี', 4500.00, NULL, 5, 'used', 'Intel', 'Core i5-12600K', 'ไม่มี', FALSE),
(11, 'ASUS ROG Zephyrus G14 Ryzen 9 RTX 4060', 'asus-rog-zephyrus-g14-2024', 'โน้ตบุ๊กเกมมิ่ง ASUS ROG Zephyrus G14 2024 Ryzen 9 8945HS RTX 4060 RAM 16GB SSD 512GB', 'Gaming Laptop ROG Zephyrus G14 Ryzen 9 + RTX 4060', 44900.00, 46900.00, 4, 'new', 'ASUS', 'ROG Zephyrus G14', '2 ปี', TRUE),
(10, 'Keychron K8 Pro Mechanical Keyboard', 'keychron-k8-pro', 'คีย์บอร์ด Mechanical Wireless รองรับ Windows/Mac พร้อม RGB', 'Keychron K8 Pro Wireless Mechanical RGB', 3200.00, 3500.00, 25, 'new', 'Keychron', 'K8 Pro', '1 ปี', FALSE),
(6, 'Corsair RM1000x 1000W 80+ Gold PSU', 'corsair-rm1000x-1000w', 'แหล่งจ่ายไฟ 1000W 80+ Gold Fully Modular', 'PSU 1000W 80+ Gold Fully Modular', 5900.00, 6500.00, 10, 'new', 'Corsair', 'RM1000x', '7 ปี', FALSE),
(2, 'ASUS ROG STRIX B650E-F GAMING WIFI', 'asus-rog-strix-b650e-f', 'เมนบอร์ด AM5 ซีรีย์ B650E รองรับ DDR5 PCIe 5.0 WiFi 6E', 'Motherboard AM5 B650E WiFi 6E DDR5', 8900.00, 9500.00, 7, 'new', 'ASUS', 'ROG STRIX B650E-F', '3 ปี', FALSE);

-- Insert Product Images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=600&fit=crop', TRUE),
(2, 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600&h=600&fit=crop', TRUE),
(3, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&h=600&fit=crop', TRUE),
(4, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&h=600&fit=crop', TRUE),
(5, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=600&fit=crop', TRUE),
(6, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop', TRUE),
(7, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=600&fit=crop', TRUE),
(8, 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600&h=600&fit=crop', TRUE),
(9, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop', TRUE),
(10, 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600&h=600&fit=crop', TRUE),
(11, 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=600&h=600&fit=crop', TRUE),
(12, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop', TRUE);

-- Insert Specs for RTX 4090
INSERT INTO product_specs (product_id, spec_key, spec_value, sort_order) VALUES
(1, 'GPU Architecture', 'Ada Lovelace', 1),
(1, 'VRAM', '24GB GDDR6X', 2),
(1, 'Memory Bus', '384-bit', 3),
(1, 'CUDA Cores', '16,384', 4),
(1, 'Boost Clock', '2520 MHz', 5),
(1, 'TDP', '450W', 6),
(1, 'Interface', 'PCIe 4.0 x16', 7),
(1, 'Display Outputs', '3x DisplayPort 1.4a, 1x HDMI 2.1', 8);

-- Insert Sample Coupon
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit) VALUES
('BEAM10', 'ส่วนลด 10% สำหรับสมาชิกใหม่', 'percentage', 10, 1000, 500, 100),
('BEAM500', 'ส่วนลด 500 บาท เมื่อซื้อครบ 5000 บาท', 'fixed', 500, 5000, NULL, 50);
