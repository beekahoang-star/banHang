-- V6: Seed Initial Data (Roles, Permissions, Users, Categories, SPU, SKU, Inventories, Vouchers, Banners)

-- 1. Permissions
INSERT INTO permissions (id, name, description, module) VALUES
(1, 'CATALOG_READ', 'Xem danh mục và sản phẩm', 'catalog'),
(2, 'CATALOG_WRITE', 'Thêm, sửa, xoá danh mục và sản phẩm', 'catalog'),
(3, 'INVENTORY_READ', 'Tra cứu tồn kho và thẻ kho', 'inventory'),
(4, 'INVENTORY_WRITE', 'Nhập, xuất, điều chỉnh tồn kho', 'inventory'),
(5, 'ORDER_READ', 'Xem danh sách và chi tiết đơn hàng', 'ordering'),
(6, 'ORDER_WRITE', 'Xử lý đơn hàng, đổi trạng thái, vận chuyển', 'ordering'),
(7, 'MARKETING_READ', 'Xem mã giảm giá và chiến dịch', 'marketing'),
(8, 'MARKETING_WRITE', 'Tạo mã voucher, flash sale, banner', 'marketing'),
(9, 'ANALYTICS_READ', 'Xem báo cáo doanh thu và KPI', 'analytics'),
(10, 'USER_MANAGE', 'Quản lý tài khoản và phân quyền nhân viên', 'auth')
ON CONFLICT (id) DO NOTHING;

-- 2. Roles
INSERT INTO roles (id, code, name, description) VALUES
(1, 'ROLE_SUPER_ADMIN', 'Super Admin', 'Toàn quyền quản trị hệ sinh thái E-commerce'),
(2, 'ROLE_WAREHOUSE_MANAGER', 'Quản lý Kho', 'Quản lý tồn kho, nhập xuất và thẻ kho'),
(3, 'ROLE_CUSTOMER_SERVICE', 'CSKH & Đơn hàng', 'Tiếp nhận, xử lý đơn hàng và khiếu nại RMA'),
(4, 'ROLE_MARKETING', 'Marketing & Content', 'Quản trị Banner, Flash Sale, Voucher và CMS'),
(5, 'ROLE_CUSTOMER', 'Khách hàng', 'Người dùng mua sắm trên Storefront')
ON CONFLICT (id) DO NOTHING;

-- 3. Role Permissions mapping
-- Super Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON CONFLICT DO NOTHING;

-- Warehouse Manager: catalog_read, inventory_read, inventory_write, order_read
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 3), (2, 4), (2, 5)
ON CONFLICT DO NOTHING;

-- CSKH: catalog_read, order_read, order_write, inventory_read
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 3), (3, 5), (3, 6)
ON CONFLICT DO NOTHING;

-- Marketing: catalog_read, catalog_write, marketing_read, marketing_write, analytics_read
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 1), (4, 2), (4, 7), (4, 8), (4, 9)
ON CONFLICT DO NOTHING;

-- 4. Users (Password is "admin123" -> BCrypt: $2a$10$w85o3k9YvWzOom5bIu15m.2pD3e4sU4Z5g4QhJtD0x5jNfN8U9r2K)
INSERT INTO users (id, email, password_hash, full_name, phone, is_active) VALUES
(1, 'admin@ecommerce.com', '$2a$10$w85o3k9YvWzOom5bIu15m.2pD3e4sU4Z5g4QhJtD0x5jNfN8U9r2K', 'Nguyễn Quản Trị (Super Admin)', '0901234567', TRUE),
(2, 'warehouse@ecommerce.com', '$2a$10$w85o3k9YvWzOom5bIu15m.2pD3e4sU4Z5g4QhJtD0x5jNfN8U9r2K', 'Trần Thủ Kho', '0901234568', TRUE),
(3, 'cskh@ecommerce.com', '$2a$10$w85o3k9YvWzOom5bIu15m.2pD3e4sU4Z5g4QhJtD0x5jNfN8U9r2K', 'Lê CSKH', '0901234569', TRUE),
(4, 'marketing@ecommerce.com', '$2a$10$w85o3k9YvWzOom5bIu15m.2pD3e4sU4Z5g4QhJtD0x5jNfN8U9r2K', 'Phạm Marketing', '0901234570', TRUE),
(5, 'customer@ecommerce.com', '$2a$10$w85o3k9YvWzOom5bIu15m.2pD3e4sU4Z5g4QhJtD0x5jNfN8U9r2K', 'Hoàng Mua Hàng', '0909888999', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5)
ON CONFLICT DO NOTHING;

-- 5. Categories with attribute_schema JSONB
INSERT INTO categories (id, parent_id, name, slug, icon_url, sort_order, attribute_schema) VALUES
(1, NULL, 'Điện Thoại & Tablet', 'dien-thoai-tablet', 'Smartphone', 1, '[
  {"key": "screen_size", "label": "Màn hình", "type": "select", "options": ["6.1 inch", "6.7 inch", "6.8 inch", "11.0 inch"]},
  {"key": "cpu", "label": "Vi xử lý (CPU)", "type": "text"},
  {"key": "ram", "label": "Dung lượng RAM", "type": "select", "options": ["8GB", "12GB", "16GB"]},
  {"key": "battery", "label": "Dung lượng pin (mAh)", "type": "number"},
  {"key": "warranty", "label": "Bảo hành", "type": "select", "options": ["12 tháng chính hãng", "24 tháng mở rộng"]}
]'::jsonb),
(2, NULL, 'Thời Trang & Phụ Kiện', 'thoi-trang-phu-kien', 'Shirt', 2, '[
  {"key": "material", "label": "Chất liệu", "type": "select", "options": ["Cotton 100%", "Polyester", "Kaki", "Lụa"]},
  {"key": "gender", "label": "Giới tính", "type": "select", "options": ["Nam", "Nữ", "Unisex"]},
  {"key": "origin", "label": "Xuất xứ", "type": "text"}
]'::jsonb),
(3, NULL, 'Thiết Bị Gia Dụng', 'thiet-bi-gia-dung', 'Home', 3, '[
  {"key": "power", "label": "Công suất (W)", "type": "text"},
  {"key": "capacity", "label": "Dung tích", "type": "text"},
  {"key": "voltage", "label": "Điện áp", "type": "select", "options": ["220V - 50Hz", "110V"]}
]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. Brands
INSERT INTO brands (id, name, slug, logo_url) VALUES
(1, 'Apple', 'apple', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100'),
(2, 'Samsung', 'samsung', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100'),
(3, 'Xiaomi', 'xiaomi', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=100'),
(4, 'Nike', 'nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'),
(5, 'Philips', 'philips', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=100')
ON CONFLICT (id) DO NOTHING;

-- 7. Products (SPU with attributes JSONB)
INSERT INTO products (id, category_id, brand_id, name, slug, description, base_price, status, rating_avg, review_count, attributes) VALUES
(1, 1, 1, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Đỉnh cao công nghệ với khung viền Titan chuẩn hàng không vũ trụ, chip A17 Pro mạnh mẽ và cụm camera zoom quang học 5x.', 29990000.00, 'ACTIVE', 4.9, 128, '{
  "screen_size": "6.7 inch",
  "cpu": "Apple A17 Pro (3nm)",
  "ram": "8GB",
  "battery": 4422,
  "warranty": "12 tháng chính hãng"
}'::jsonb),
(2, 1, 2, 'Samsung Galaxy S24 Ultra AI', 'samsung-galaxy-s24-ultra-ai', 'Kỷ nguyên Galaxy AI quyền năng, bút S-Pen tích hợp, camera 200MP siêu zoom đêm.', 26990000.00, 'ACTIVE', 4.8, 95, '{
  "screen_size": "6.8 inch",
  "cpu": "Snapdragon 8 Gen 3 for Galaxy",
  "ram": "12GB",
  "battery": 5000,
  "warranty": "12 tháng chính hãng"
}'::jsonb),
(3, 2, 4, 'Áo Khoác Gió Thể Thao Nike Windrunner', 'ao-khoac-gio-the-thao-nike-windrunner', 'Chất liệu vải dệt chống thấm nước nhẹ, trọng lượng siêu nhẹ, kiểu dáng kinh điển Chevron 26 độ.', 1890000.00, 'ACTIVE', 4.7, 43, '{
  "material": "Polyester",
  "gender": "Unisex",
  "origin": "Việt Nam"
}'::jsonb),
(4, 3, 5, 'Nồi Chiên Không Dầu Điện Tử Philips XXL HD9650', 'noi-chien-khong-dau-philips-xxl-hd9650', 'Công nghệ Twin TurboStar loại bỏ đến 90% lượng mỡ thừa, dung tích 1.4kg chiên gà nguyên con.', 4990000.00, 'ACTIVE', 4.9, 210, '{
  "power": "2225 W",
  "capacity": "1.4 kg / 3.5 Lít",
  "voltage": "220V - 50Hz"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8. Product Variants (SKU with options JSONB)
INSERT INTO product_variants (id, product_id, sku_code, barcode, price, sale_price, weight_grams, image_url, options) VALUES
-- iPhone 15 Pro Max SKUs
(1, 1, 'IP15PM-TITAN-256', '893850123001', 29990000.00, 28490000.00, 221, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', '{"color": "Titan Tự Nhiên", "storage": "256GB"}'::jsonb),
(2, 1, 'IP15PM-BLUE-256', '893850123002', 29990000.00, 28490000.00, 221, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', '{"color": "Titan Xanh", "storage": "256GB"}'::jsonb),
(3, 1, 'IP15PM-TITAN-512', '893850123003', 34990000.00, 33490000.00, 221, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', '{"color": "Titan Tự Nhiên", "storage": "512GB"}'::jsonb),

-- S24 Ultra SKUs
(4, 2, 'SS24U-GRAY-256', '893850123004', 26990000.00, 24990000.00, 232, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', '{"color": "Xám Titan", "storage": "256GB"}'::jsonb),
(5, 2, 'SS24U-BLACK-512', '893850123005', 30990000.00, 28990000.00, 232, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', '{"color": "Đen Titan", "storage": "512GB"}'::jsonb),

-- Nike Windrunner SKUs
(6, 3, 'NIKE-WR-BLK-M', '893850123006', 1890000.00, 1690000.00, 350, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600', '{"color": "Đen Phối Trắng", "size": "M"}'::jsonb),
(7, 3, 'NIKE-WR-BLK-L', '893850123007', 1890000.00, 1690000.00, 360, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600', '{"color": "Đen Phối Trắng", "size": "L"}'::jsonb),

-- Philips XXL HD9650
(8, 4, 'PHILIPS-XXL-BLK', '893850123008', 4990000.00, 4290000.00, 8000, 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600', '{"color": "Đen Bóng", "capacity": "XXL (1.4kg)"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 9. Inventories (stock_on_hand, stock_reserved, version = 0)
INSERT INTO inventories (variant_id, stock_on_hand, stock_reserved, version) VALUES
(1, 50, 2, 0),
(2, 35, 1, 0),
(3, 20, 0, 0),
(4, 40, 3, 0),
(5, 15, 0, 0),
(6, 80, 5, 0),
(7, 65, 2, 0),
(8, 25, 1, 0)
ON CONFLICT (variant_id) DO NOTHING;

-- Initial Inventory Audit Logs
INSERT INTO inventory_logs (variant_id, change_type, quantity_changed, stock_on_hand_after, stock_reserved_after, reference_type, note) VALUES
(1, 'IMPORT', 50, 50, 0, 'IMPORT_RECEIPT', 'Nhập kho lô hàng mở bán đợt 1'),
(2, 'IMPORT', 35, 35, 0, 'IMPORT_RECEIPT', 'Nhập kho lô hàng mở bán đợt 1'),
(3, 'IMPORT', 20, 20, 0, 'IMPORT_RECEIPT', 'Nhập kho lô hàng mở bán đợt 1'),
(4, 'IMPORT', 40, 40, 0, 'IMPORT_RECEIPT', 'Nhập kho mở bán Samsung S24'),
(5, 'IMPORT', 15, 15, 0, 'IMPORT_RECEIPT', 'Nhập kho mở bán Samsung S24'),
(6, 'IMPORT', 80, 80, 0, 'IMPORT_RECEIPT', 'Nhập hàng thời trang Nike vụ Thu Đông'),
(7, 'IMPORT', 65, 65, 0, 'IMPORT_RECEIPT', 'Nhập hàng thời trang Nike vụ Thu Đông'),
(8, 'IMPORT', 25, 25, 0, 'IMPORT_RECEIPT', 'Nhập gia dụng Philips chính hãng');

-- 10. Vouchers
INSERT INTO vouchers (id, code, title, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, used_count, start_date, end_date) VALUES
(1, 'GIAM100K', 'Giảm ngay 100K cho đơn từ 2 triệu', 'FIXED_AMOUNT', 100000.00, 2000000.00, 100000.00, 500, 24, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days'),
(2, 'TECH10', 'Giảm 10% ngành hàng Công nghệ', 'PERCENTAGE', 10.00, 5000000.00, 1000000.00, 200, 48, NOW() - INTERVAL '1 day', NOW() + INTERVAL '15 days'),
(3, 'FREESHIP', 'Miễn phí vận chuyển toàn quốc', 'FIXED_AMOUNT', 35000.00, 500000.00, 35000.00, 1000, 112, NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days')
ON CONFLICT (id) DO NOTHING;

-- 11. Banners
INSERT INTO banners (id, title, image_url, link_url, position, sort_order) VALUES
(1, 'Siêu Đại Tiệc Công Nghệ - Giảm Sốc Đến 35%', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80', '/category/dien-thoai-tablet', 'HOME_HERO', 1),
(2, 'Bộ Sưu Tập Thể Thao Thu Đông - Năng Động Bứt Phá', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=80', '/category/thoi-trang-phu-kien', 'HOME_HERO', 2),
(3, 'Gia Dụng Thông Minh - Nâng Tầm Cuộc Sống', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80', '/category/thiet-bi-gia-dung', 'HOME_HERO', 3)
ON CONFLICT (id) DO NOTHING;

-- 12. Flash Sale
INSERT INTO flash_sales (id, name, start_time, end_time, is_active) VALUES
(1, 'Giờ Vàng Giá Sốc Hôm Nay', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '10 hours', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO flash_sale_items (id, flash_sale_id, variant_id, flash_price, quantity_limit, sold_count) VALUES
(1, 1, 1, 26990000.00, 20, 14),
(2, 1, 4, 23990000.00, 25, 18),
(3, 1, 6, 1450000.00, 30, 21)
ON CONFLICT (id) DO NOTHING;
