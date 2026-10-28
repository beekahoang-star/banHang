import {
  Category, Brand, ProductListItem, ProductDetail, Cart,
  Order, Voucher, FlashSale, Banner, InventorySummary,
  InventoryLog, DashboardSummary, User
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Fallback Mock Data for instant seamless preview
const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Điện Thoại & Tablet',
    slug: 'dien-thoai-tablet',
    iconUrl: 'Smartphone',
    sortOrder: 1,
    isActive: true,
    attributeSchema: JSON.stringify([
      { key: 'screen_size', label: 'Màn hình', type: 'select', options: ['6.1 inch', '6.7 inch', '6.8 inch', '11.0 inch'] },
      { key: 'cpu', label: 'Vi xử lý (CPU)', type: 'text' },
      { key: 'ram', label: 'Dung lượng RAM', type: 'select', options: ['8GB', '12GB', '16GB'] },
      { key: 'battery', label: 'Dung lượng pin (mAh)', type: 'number' },
      { key: 'warranty', label: 'Bảo hành', type: 'select', options: ['12 tháng chính hãng', '24 tháng VIP'] }
    ]),
    children: [
      { id: 11, parentId: 1, name: 'iPhone', slug: 'iphone', sortOrder: 1, isActive: true },
      { id: 12, parentId: 1, name: 'Samsung Galaxy', slug: 'samsung-galaxy', sortOrder: 2, isActive: true },
      { id: 13, parentId: 1, name: 'iPad & Tablet Android', slug: 'ipad-tablet', sortOrder: 3, isActive: true }
    ]
  },
  {
    id: 2,
    name: 'Thời Trang & Phụ Kiện',
    slug: 'thoi-trang-phu-kien',
    iconUrl: 'Shirt',
    sortOrder: 2,
    isActive: true,
    attributeSchema: JSON.stringify([
      { key: 'material', label: 'Chất liệu', type: 'select', options: ['Cotton 100%', 'Polyester', 'Kaki', 'Lụa'] },
      { key: 'gender', label: 'Giới tính', type: 'select', options: ['Nam', 'Nữ', 'Unisex'] },
      { key: 'origin', label: 'Xuất xứ', type: 'text' }
    ]),
    children: [
      { id: 21, parentId: 2, name: 'Áo Khoác & Bomber', slug: 'ao-khoac', sortOrder: 1, isActive: true },
      { id: 22, parentId: 2, name: 'Giày Thể Thao', slug: 'giay-the-thao', sortOrder: 2, isActive: true }
    ]
  },
  {
    id: 3,
    name: 'Thiết Bị Gia Dụng',
    slug: 'thiet-bi-gia-dung',
    iconUrl: 'Home',
    sortOrder: 3,
    isActive: true,
    attributeSchema: JSON.stringify([
      { key: 'power', label: 'Công suất (W)', type: 'text' },
      { key: 'capacity', label: 'Dung tích', type: 'text' },
      { key: 'voltage', label: 'Điện áp', type: 'select', options: ['220V - 50Hz', '110V'] }
    ]),
    children: [
      { id: 31, parentId: 3, name: 'Nồi Chiên & Lò Nướng', slug: 'noi-chien', sortOrder: 1, isActive: true },
      { id: 32, parentId: 3, name: 'Máy Hút Bụi Robot', slug: 'robot-hut-bui', sortOrder: 2, isActive: true }
    ]
  }
];

const MOCK_PRODUCTS: ProductListItem[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    categoryName: 'Điện Thoại & Tablet',
    categorySlug: 'dien-thoai-tablet',
    brandName: 'Apple',
    basePrice: 29990000,
    minPrice: 28490000,
    maxPrice: 34990000,
    ratingAvg: 4.9,
    reviewCount: 128,
    mainImageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
    totalStock: 105
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra AI',
    slug: 'samsung-galaxy-s24-ultra-ai',
    categoryName: 'Điện Thoại & Tablet',
    categorySlug: 'dien-thoai-tablet',
    brandName: 'Samsung',
    basePrice: 26990000,
    minPrice: 24990000,
    maxPrice: 30990000,
    ratingAvg: 4.8,
    reviewCount: 95,
    mainImageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600',
    totalStock: 55
  },
  {
    id: 3,
    name: 'Áo Khoác Gió Thể Thao Nike Windrunner',
    slug: 'ao-khoac-gio-the-thao-nike-windrunner',
    categoryName: 'Thời Trang & Phụ Kiện',
    categorySlug: 'thoi-trang-phu-kien',
    brandName: 'Nike',
    basePrice: 1890000,
    minPrice: 1690000,
    maxPrice: 1890000,
    ratingAvg: 4.7,
    reviewCount: 43,
    mainImageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
    totalStock: 145
  },
  {
    id: 4,
    name: 'Nồi Chiên Không Dầu Điện Tử Philips XXL HD9650',
    slug: 'noi-chien-khong-dau-philips-xxl-hd9650',
    categoryName: 'Thiết Bị Gia Dụng',
    categorySlug: 'thiet-bi-gia-dung',
    brandName: 'Philips',
    basePrice: 4990000,
    minPrice: 4290000,
    maxPrice: 4990000,
    ratingAvg: 4.9,
    reviewCount: 210,
    mainImageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600',
    totalStock: 25
  }
];

const MOCK_PRODUCT_DETAILS: Record<string, ProductDetail> = {
  'iphone-15-pro-max': {
    id: 1,
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'iPhone 15 Pro Max được chế tác từ Titan chuẩn hàng không vũ trụ, trang bị vi xử lý Apple A17 Pro 3nm mạnh mẽ bậc nhất thế giới, cổng sạc USB-C hỗ trợ truyền dữ liệu tốc độ cao và nút tác vụ Action Button tùy biến linh hoạt.',
    basePrice: 29990000,
    status: 'ACTIVE',
    ratingAvg: 4.9,
    reviewCount: 128,
    category: MOCK_CATEGORIES[0],
    brand: { id: 1, name: 'Apple', slug: 'apple', logoUrl: '' },
    attributes: JSON.stringify({
      screen_size: '6.7 inch Super Retina XDR OLED 120Hz',
      cpu: 'Apple A17 Pro (3nm)',
      ram: '8GB LPDDR5X',
      battery: 4422,
      warranty: '12 tháng chính hãng Apple Care'
    }),
    variants: [
      {
        id: 1,
        skuCode: 'IP15PM-TITAN-256',
        barcode: '893850123001',
        price: 29990000,
        salePrice: 28490000,
        weightGrams: 221,
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
        options: JSON.stringify({ color: 'Titan Tự Nhiên', storage: '256GB' }),
        stockOnHand: 50,
        stockReserved: 2,
        availableStock: 48
      },
      {
        id: 2,
        skuCode: 'IP15PM-BLUE-256',
        barcode: '893850123002',
        price: 29990000,
        salePrice: 28490000,
        weightGrams: 221,
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
        options: JSON.stringify({ color: 'Titan Xanh', storage: '256GB' }),
        stockOnHand: 35,
        stockReserved: 1,
        availableStock: 34
      },
      {
        id: 3,
        skuCode: 'IP15PM-TITAN-512',
        barcode: '893850123003',
        price: 34990000,
        salePrice: 33490000,
        weightGrams: 221,
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
        options: JSON.stringify({ color: 'Titan Tự Nhiên', storage: '512GB' }),
        stockOnHand: 20,
        stockReserved: 0,
        availableStock: 20
      }
    ]
  },
  'samsung-galaxy-s24-ultra-ai': {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra AI',
    slug: 'samsung-galaxy-s24-ultra-ai',
    description: 'Mở ra kỷ nguyên di động mới cùng Galaxy AI quyền năng: Phiên dịch trực tiếp cuộc gọi, Trợ lý Note thông minh, Khoanh tròn để tìm kiếm cùng Google. Khung viền Titan bền bỉ tích hợp bút S-Pen.',
    basePrice: 26990000,
    status: 'ACTIVE',
    ratingAvg: 4.8,
    reviewCount: 95,
    category: MOCK_CATEGORIES[0],
    brand: { id: 2, name: 'Samsung', slug: 'samsung', logoUrl: '' },
    attributes: JSON.stringify({
      screen_size: '6.8 inch Dynamic AMOLED 2X 120Hz',
      cpu: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12GB',
      battery: 5000,
      warranty: '12 tháng chính hãng Samsung'
    }),
    variants: [
      {
        id: 4,
        skuCode: 'SS24U-GRAY-256',
        price: 26990000,
        salePrice: 24990000,
        weightGrams: 232,
        imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600',
        options: JSON.stringify({ color: 'Xám Titan', storage: '256GB' }),
        stockOnHand: 40,
        stockReserved: 3,
        availableStock: 37
      },
      {
        id: 5,
        skuCode: 'SS24U-BLACK-512',
        price: 30990000,
        salePrice: 28990000,
        weightGrams: 232,
        imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600',
        options: JSON.stringify({ color: 'Đen Titan', storage: '512GB' }),
        stockOnHand: 15,
        stockReserved: 0,
        availableStock: 15
      }
    ]
  }
};

export const api = {
  // Public Catalog
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/public/catalog/categories`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch (e) {}
    return MOCK_CATEGORIES;
  },

  async searchProducts(filter: any = {}): Promise<{ items: ProductListItem[]; totalElements: number }> {
    try {
      const res = await fetch(`${API_BASE}/public/catalog/products/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    
    let items = [...MOCK_PRODUCTS];
    if (filter.categorySlug) {
      items = items.filter(p => p.categorySlug === filter.categorySlug);
    }
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(kw) || p.brandName.toLowerCase().includes(kw));
    }
    return { items, totalElements: items.length };
  },

  async getProductDetail(slug: string): Promise<ProductDetail> {
    try {
      const res = await fetch(`${API_BASE}/public/catalog/products/${slug}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return MOCK_PRODUCT_DETAILS[slug] || MOCK_PRODUCT_DETAILS['iphone-15-pro-max'];
  },

  // Marketing
  async getBanners(): Promise<Banner[]> {
    try {
      const res = await fetch(`${API_BASE}/public/marketing/banners`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch (e) {}
    return [
      {
        id: 1,
        title: 'Siêu Đại Tiệc Công Nghệ - Giảm Sốc Đến 35%',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
        position: 'HOME_HERO',
        sortOrder: 1
      },
      {
        id: 2,
        title: 'Bộ Sưu Tập Thể Thao Thu Đông - Năng Động Bứt Phá',
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=80',
        position: 'HOME_HERO',
        sortOrder: 2
      }
    ];
  },

  async getFlashSale(): Promise<FlashSale | null> {
    try {
      const res = await fetch(`${API_BASE}/public/marketing/flash-sale`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return {
      id: 1,
      name: 'Giờ Vàng Giá Sốc Hôm Nay',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() + 28800000).toISOString(),
      items: [
        {
          variantId: 1,
          skuCode: 'IP15PM-TITAN-256',
          productName: 'iPhone 15 Pro Max 256GB',
          productSlug: 'iphone-15-pro-max',
          imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
          originalPrice: 29990000,
          flashPrice: 26990000,
          quantityLimit: 20,
          soldCount: 14,
          discountPercent: 10
        },
        {
          variantId: 4,
          skuCode: 'SS24U-GRAY-256',
          productName: 'Samsung Galaxy S24 Ultra AI',
          productSlug: 'samsung-galaxy-s24-ultra-ai',
          imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600',
          originalPrice: 26990000,
          flashPrice: 23990000,
          quantityLimit: 25,
          soldCount: 18,
          discountPercent: 11
        }
      ]
    };
  },

  async getVouchers(): Promise<Voucher[]> {
    try {
      const res = await fetch(`${API_BASE}/public/marketing/vouchers`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch (e) {}
    return [
      {
        id: 1,
        code: 'GIAM100K',
        title: 'Giảm 100K cho đơn từ 2 triệu',
        discountType: 'FIXED_AMOUNT',
        discountValue: 100000,
        minOrderValue: 2000000,
        maxDiscountAmount: 100000,
        usageLimit: 500,
        usedCount: 24,
        startDate: '',
        endDate: '',
        isActive: true
      },
      {
        id: 2,
        code: 'TECH10',
        title: 'Giảm 10% ngành Công nghệ',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 5000000,
        maxDiscountAmount: 1000000,
        usageLimit: 200,
        usedCount: 48,
        startDate: '',
        endDate: '',
        isActive: true
      }
    ];
  },

  async validateVoucher(code: string, totalAmount: number): Promise<{ valid: boolean; discountAmount: number; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/public/marketing/vouchers/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, totalProductAmount: totalAmount })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    // Mock validation logic
    if (code.toUpperCase() === 'GIAM100K') {
      if (totalAmount >= 2000000) {
        return { valid: true, discountAmount: 100000, message: 'Áp dụng mã GIAM100K thành công (-100,000đ)' };
      }
      return { valid: false, discountAmount: 0, message: 'Đơn hàng tối thiểu 2,000,000đ để dùng mã này' };
    }
    if (code.toUpperCase() === 'TECH10') {
      const disc = Math.min(1000000, totalAmount * 0.1);
      return { valid: true, discountAmount: disc, message: `Áp dụng mã TECH10 thành công (-${disc.toLocaleString('vi-VN')}đ)` };
    }
    return { valid: false, discountAmount: 0, message: 'Mã giảm giá không tồn tại hoặc không hợp lệ' };
  },

  // VietQR & Payment
  async getVietQr(orderCode: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/public/integration/vietqr/${orderCode}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    return {
      qrImageUrl: `https://img.vietqr.io/image/970422-0987654321-compact.png?amount=28520000&addInfo=${orderCode}&accountName=CTY%20CO%20PHAN%20ECOMMERCE%20VN`,
      bankId: 'MBBank (Napas 247)',
      accountNo: '0987654321',
      accountName: 'CTY CO PHAN ECOMMERCE VN',
      amount: 28520000,
      transferContent: orderCode
    };
  },

  // Checkout & Order creation
  async createOrder(payload: any): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/customer/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    // Mock order response
    const mockCode = `ORD-${Date.now().toString().slice(-8)}`;
    return {
      id: 999,
      orderCode: mockCode,
      customerName: payload.shippingAddress.receiverName,
      customerEmail: 'customer@ecommerce.com',
      status: 'PENDING',
      paymentMethod: payload.paymentMethod || 'COD',
      paymentStatus: 'UNPAID',
      totalProductAmount: payload.items.reduce((s: number, i: any) => s + (i.price || 28490000) * i.quantity, 0),
      shippingFee: 30000,
      discountAmount: payload.discountAmount || 0,
      finalAmount: (payload.items.reduce((s: number, i: any) => s + (i.price || 28490000) * i.quantity, 0)) + 30000 - (payload.discountAmount || 0),
      shippingAddress: payload.shippingAddress,
      createdAt: new Date().toISOString(),
      items: payload.items.map((i: any, idx: number) => ({
        id: idx + 1,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.price || 28490000,
        subtotal: (i.price || 28490000) * i.quantity,
        variantSnapshot: JSON.stringify({
          productName: i.productName || 'iPhone 15 Pro Max',
          skuCode: i.skuCode || 'IP15PM-TITAN-256',
          options: i.options || '{"color":"Titan Tự Nhiên"}',
          imageUrl: i.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'
        })
      })),
      timelines: [
        {
          toStatus: 'PENDING',
          note: 'Đơn hàng được khởi tạo thành công, chờ xác nhận.',
          createdAt: new Date().toISOString()
        }
      ]
    };
  },

  // Admin APIs
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await fetch(`${API_BASE}/admin/analytics/dashboard`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    return {
      netRevenue: 205700000,
      totalOrders: 54,
      averageOrderValue: 3809000,
      cancellationRate: 3.7,
      lowStockCount: 2,
      revenueChart: [
        { date: '21/10', revenue: 18500000, orderCount: 8 },
        { date: '22/10', revenue: 22400000, orderCount: 11 },
        { date: '23/10', revenue: 19800000, orderCount: 9 },
        { date: '24/10', revenue: 31200000, orderCount: 14 },
        { date: '25/10', revenue: 27900000, orderCount: 12 },
        { date: '26/10', revenue: 38600000, orderCount: 16 },
        { date: '27/10', revenue: 47300000, orderCount: 19 }
      ],
      categoryRevenue: [
        { categoryName: 'Điện Thoại & Tablet', revenue: 128500000, percentage: 62.5 },
        { categoryName: 'Thời Trang & Phụ Kiện', revenue: 45200000, percentage: 22.0 },
        { categoryName: 'Thiết Bị Gia Dụng', revenue: 32000000, percentage: 15.5 }
      ],
      lowStockAlerts: [
        { variantId: 5, skuCode: 'SS24U-BLACK-512', productName: 'Samsung Galaxy S24 Ultra AI', stockOnHand: 15, stockReserved: 0, availableStock: 15 },
        { variantId: 3, skuCode: 'IP15PM-TITAN-512', productName: 'iPhone 15 Pro Max', stockOnHand: 20, stockReserved: 0, availableStock: 20 }
      ]
    };
  },

  async uploadProductImage(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/admin/catalog/upload`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    // Fallback: create an object URL or base64 so it previews immediately in demo
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ url: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  },

  async getAdminInventories(): Promise<InventorySummary[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/summary`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    return [
      { variantId: 1, skuCode: 'IP15PM-TITAN-256', productName: 'iPhone 15 Pro Max', options: '{"color":"Titan Tự Nhiên","storage":"256GB"}', price: 29990000, stockOnHand: 50, stockReserved: 2, availableStock: 48, version: 0 },
      { variantId: 2, skuCode: 'IP15PM-BLUE-256', productName: 'iPhone 15 Pro Max', options: '{"color":"Titan Xanh","storage":"256GB"}', price: 29990000, stockOnHand: 35, stockReserved: 1, availableStock: 34, version: 0 },
      { variantId: 3, skuCode: 'IP15PM-TITAN-512', productName: 'iPhone 15 Pro Max', options: '{"color":"Titan Tự Nhiên","storage":"512GB"}', price: 34990000, stockOnHand: 20, stockReserved: 0, availableStock: 20, version: 0 },
      { variantId: 4, skuCode: 'SS24U-GRAY-256', productName: 'Samsung Galaxy S24 Ultra AI', options: '{"color":"Xám Titan","storage":"256GB"}', price: 26990000, stockOnHand: 40, stockReserved: 3, availableStock: 37, version: 0 },
      { variantId: 5, skuCode: 'SS24U-BLACK-512', productName: 'Samsung Galaxy S24 Ultra AI', options: '{"color":"Đen Titan","storage":"512GB"}', price: 30990000, stockOnHand: 15, stockReserved: 0, availableStock: 15, version: 0 },
      { variantId: 6, skuCode: 'NIKE-WR-BLK-M', productName: 'Áo Khoác Gió Nike Windrunner', options: '{"color":"Đen","size":"M"}', price: 1890000, stockOnHand: 80, stockReserved: 5, availableStock: 75, version: 0 },
      { variantId: 8, skuCode: 'PHILIPS-XXL-BLK', productName: 'Nồi Chiên Không Dầu Philips XXL', options: '{"color":"Đen Bóng"}', price: 4990000, stockOnHand: 25, stockReserved: 1, availableStock: 24, version: 0 }
    ];
  },

  async getAdminInventoryLogs(): Promise<InventoryLog[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/logs`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}

    return [
      { id: 1, variantId: 1, skuCode: 'IP15PM-TITAN-256', changeType: 'ORDER_RESERVE', quantityChanged: 2, stockOnHandAfter: 50, stockReservedAfter: 2, referenceType: 'ORDER', referenceId: 'ORD-2410271101', note: 'Giữ hàng đơn ORD-2410271101', createdByName: 'Hệ thống', createdAt: '2026-10-27T10:15:00Z' },
      { id: 2, variantId: 4, skuCode: 'SS24U-GRAY-256', changeType: 'ORDER_COMMIT', quantityChanged: -1, stockOnHandAfter: 40, stockReservedAfter: 3, referenceType: 'ORDER', referenceId: 'ORD-2410270921', note: 'Đã xuất kho gửi GHN', createdByName: 'Trần Thủ Kho', createdAt: '2026-10-27T09:40:00Z' },
      { id: 3, variantId: 1, skuCode: 'IP15PM-TITAN-256', changeType: 'IMPORT', quantityChanged: 50, stockOnHandAfter: 50, stockReservedAfter: 0, referenceType: 'IMPORT_RECEIPT', referenceId: 'PNK-202610-01', note: 'Nhập kho đợt 1', createdByName: 'Trần Thủ Kho', createdAt: '2026-10-25T08:00:00Z' }
    ];
  },

  async getAdminOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data.items;
      }
    } catch (e) {}

    return [
      {
        id: 101,
        orderCode: 'ORD-2410271101',
        customerName: 'Hoàng Mua Hàng',
        customerEmail: 'customer@ecommerce.com',
        status: 'PENDING',
        paymentMethod: 'VIETQR',
        paymentStatus: 'PAID',
        totalProductAmount: 28490000,
        shippingFee: 30000,
        discountAmount: 100000,
        finalAmount: 28420000,
        shippingCarrier: 'GHN',
        shippingAddress: {
          receiverName: 'Hoàng Mua Hàng',
          phone: '0909888999',
          province: 'Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Bến Nghé',
          detailAddress: 'Tòa nhà Bitexco, 2 Hải Triều'
        },
        createdAt: '2026-10-27T10:15:00Z',
        items: [
          {
            id: 1,
            variantId: 1,
            quantity: 1,
            unitPrice: 28490000,
            subtotal: 28490000,
            variantSnapshot: JSON.stringify({
              productName: 'iPhone 15 Pro Max',
              skuCode: 'IP15PM-TITAN-256',
              options: '{"color":"Titan Tự Nhiên","storage":"256GB"}',
              imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'
            })
          }
        ],
        timelines: [
          { toStatus: 'PENDING', note: 'Khách hàng tạo đơn hàng', createdAt: '2026-10-27T10:15:00Z' }
        ]
      },
      {
        id: 102,
        orderCode: 'ORD-2410270921',
        customerName: 'Lê Văn An',
        customerEmail: 'an.le@gmail.com',
        status: 'SHIPPING',
        paymentMethod: 'COD',
        paymentStatus: 'UNPAID',
        totalProductAmount: 24990000,
        shippingFee: 30000,
        discountAmount: 0,
        finalAmount: 25020000,
        shippingCarrier: 'GHN',
        trackingCode: 'GHN-VN-8839210',
        shippingAddress: {
          receiverName: 'Lê Văn An',
          phone: '0912345678',
          province: 'Hà Nội',
          district: 'Cầu Giấy',
          ward: 'Dịch Vọng Hậu',
          detailAddress: 'Số 18 Duy Tân'
        },
        createdAt: '2026-10-27T08:30:00Z',
        items: [
          {
            id: 2,
            variantId: 4,
            quantity: 1,
            unitPrice: 24990000,
            subtotal: 24990000,
            variantSnapshot: JSON.stringify({
              productName: 'Samsung Galaxy S24 Ultra AI',
              skuCode: 'SS24U-GRAY-256',
              options: '{"color":"Xám Titan","storage":"256GB"}',
              imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'
            })
          }
        ],
        timelines: [
          { toStatus: 'PENDING', note: 'Tạo đơn COD', createdAt: '2026-10-27T08:30:00Z' },
          { fromStatus: 'PENDING', toStatus: 'CONFIRMED', note: 'Xác nhận đơn hàng', createdAt: '2026-10-27T08:45:00Z' },
          { fromStatus: 'CONFIRMED', toStatus: 'PACKING', note: 'Đang đóng gói', createdAt: '2026-10-27T09:10:00Z' },
          { fromStatus: 'PACKING', toStatus: 'SHIPPING', note: 'Đã giao đơn vị vận chuyển GHN. Mã vận đơn: GHN-VN-8839210', createdAt: '2026-10-27T09:40:00Z' }
        ]
      }
    ];
  }
};
