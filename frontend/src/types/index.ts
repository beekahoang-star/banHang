export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  cancelOrderRate?: number;
  roles: string[];
  permissions: string[];
}

export interface Address {
  id: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

export interface AttributeSchemaField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  unit?: string;
}

export interface Category {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
  iconUrl?: string;
  sortOrder: number;
  isActive: boolean;
  attributeSchema?: string; // JSON array of AttributeSchemaField
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Variant {
  id: number;
  skuCode: string;
  barcode?: string;
  price: number;
  salePrice?: number | null;
  weightGrams?: number;
  imageUrl?: string;
  options: string; // JSON string e.g. {"color": "Titan", "storage": "256GB"}
  stockOnHand: number;
  stockReserved: number;
  availableStock: number;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  brandName: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  ratingAvg: number;
  reviewCount: number;
  mainImageUrl?: string;
  totalStock: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  status: string;
  ratingAvg: number;
  reviewCount: number;
  category: Category;
  brand?: Brand;
  attributes?: string; // JSON string e.g. {"cpu": "A17", "ram": "8GB"}
  variants: Variant[];
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  sellerReply?: string;
  createdAt: string;
}

export interface CartItem {
  id: number;
  variantId: number;
  skuCode: string;
  productName: string;
  productSlug: string;
  options: string;
  imageUrl?: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  subtotal: number;
  availableStock: number;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface OrderItem {
  id: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variantSnapshot: string;
}

export interface OrderTimeline {
  fromStatus?: string;
  toStatus: string;
  changedByName?: string;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderCode: string;
  userId?: number;
  customerName: string;
  customerEmail: string;
  status: 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentMethod: 'COD' | 'VIETQR' | 'VNPAY';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentTransactionId?: string;
  totalProductAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  shippingCarrier?: string;
  trackingCode?: string;
  shippingAddress: {
    receiverName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
  };
  customerNote?: string;
  cancelReason?: string;
  createdAt: string;
  items: OrderItem[];
  timelines: OrderTimeline[];
}

export interface Voucher {
  id: number;
  code: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface FlashSaleItem {
  variantId: number;
  skuCode: string;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  originalPrice: number;
  flashPrice: number;
  quantityLimit: number;
  soldCount: number;
  discountPercent: number;
}

export interface FlashSale {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  items: FlashSaleItem[];
}

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  sortOrder: number;
}

export interface InventorySummary {
  variantId: number;
  skuCode: string;
  productName: string;
  options: string;
  price?: number;
  stockOnHand: number;
  stockReserved: number;
  availableStock: number;
  version: number;
}

export interface InventoryLog {
  id: number;
  variantId: number;
  skuCode: string;
  changeType: string;
  quantityChanged: number;
  stockOnHandAfter: number;
  stockReservedAfter: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdByName?: string;
  createdAt: string;
}

export interface DashboardSummary {
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  cancellationRate: number;
  lowStockCount: number;
  revenueChart: { date: string; revenue: number; orderCount: number }[];
  categoryRevenue: { categoryName: string; revenue: number; percentage: number }[];
  lowStockAlerts: {
    variantId: number;
    skuCode: string;
    productName: string;
    stockOnHand: number;
    stockReserved: number;
    availableStock: number;
  }[];
}
