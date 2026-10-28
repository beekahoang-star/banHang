# HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ B2C ĐA NGÀNH HÀNG (E-COMMERCE PLATFORM)
> **Kiến trúc:** Modular Monolith (Spring Boot 3.3.4, Java 21 LTS) + React 18 (Vite, Tailwind CSS, Zustand)

---

## 1. Cấu Trúc Dự Án

```
banHang/
├── backend/                       # Java 21 / Spring Boot 3 Modular Monolith
│   ├── src/main/java/com/ecommerce/platform/
│   │   ├── common/                # BaseEntity, ApiResponse, GlobalExceptionHandler, Security & JWT
│   │   └── modules/
│   │       ├── auth/              # RBAC, User, Role, Permission, UserAddress
│   │       ├── catalog/           # Category, Brand, SPU, SKU, Dynamic Specs JSONB
│   │       ├── inventory/         # Stock on hand, Reserved, @Version Optimistic Locking, Thẻ kho
│   │       ├── ordering/          # Giỏ hàng, Order State Machine, Snapshot bảo toàn lịch sử đơn, RMA
│   │       ├── marketing/         # Voucher Engine, Flash Sale đếm ngược, Banners
│   │       ├── integration/       # VietQR Napas 247, Webhook thanh toán, GHN/GHTK API
│   │       └── analytics/         # Dashboard KPI, Báo cáo doanh thu, Cảnh báo SKU tồn thấp
│   ├── src/main/resources/
│   │   ├── application.yml        # Cấu hình chung, JWT secret, VietQR config
│   │   ├── application-local.yml  # Profile dev chạy ngay với H2 mode PostgreSQL
│   │   ├── application-postgres.yml # Profile PostgreSQL 16+ production
│   │   └── db/migration/          # 6 Flyway SQL migrations (V1 đến V6)
│   └── pom.xml
│
└── frontend/                      # React 18+ Vite, Tailwind CSS, Lucide React
    ├── src/
    │   ├── components/common/     # Navbar (Mega Menu), Footer, PermissionGate, VietQrModal
    │   ├── modules/
    │   │   ├── storefront/        # HomePage, ProductListingPage (Dynamic Filter), ProductDetailPage, CheckoutPage, OrderSuccessPage
    │   │   └── admin/             # Dashboard, CategoryManager, ProductFormDynamic (Cartesian Generator), InventoryManager, OrderManager, MarketingManager, RbacManager
    │   ├── stores/                # Zustand AuthStore (RBAC switcher), CartStore
    │   └── services/              # API Client (RESTful + Graceful Demo Mock Fallback)
    └── package.json
```

---

## 2. Cách Khởi Chạy Nhanh

### Bước 1: Khởi chạy Backend (Spring Boot 3.3.4 / Java 21)
Mở terminal tại thư mục `backend`:
```powershell
# Chạy trực tiếp từ file JAR đã build sẵn
java -jar target/platform-1.0.0-SNAPSHOT.jar

# Hoặc chạy bằng Maven:
mvn spring-boot:run
```
- **Swagger / OpenAPI 3 UI:** `http://localhost:8080/swagger-ui.html`
- **H2 Database Console (Local):** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:ecommercedb`)

### Bước 2: Khởi chạy Frontend (React Vite)
Mở terminal tại thư mục `frontend`:
```powershell
npm run dev
```
- Truy cập giao diện tại: `http://localhost:5173`

---

## 3. Tài Khoản & Vai Trò RBAC Kiểm Thử

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn tiêu biểu |
|---|---|---|---|
| **Super Admin** | `admin@ecommerce.com` | `admin123` | Toàn quyền cấu hình hệ thống & phân quyền |
| **Quản lý Kho** | `warehouse@ecommerce.com` | `admin123` | Quản lý On-hand vs Reserved, Thẻ kho, Nhập xuất |
| **CSKH / Đơn hàng** | `cskh@ecommerce.com` | `admin123` | Order State Machine, Vận chuyển, Xử lý khiếu nại RMA |
| **Marketing** | `marketing@ecommerce.com` | `admin123` | Tạo Voucher, Cấu hình Flash Sale, Banner CMS |
| **Khách hàng** | `customer@ecommerce.com` | `admin123` | Mua hàng, áp mã giảm giá, thanh toán VietQR |

> **Mẹo nhanh:** Trên thanh Header của Frontend có sẵn **Menu chọn vai trò (Role Switcher)** để bạn kiểm thử ngay tính năng ẩn/hiện menu của `<PermissionGate>` mà không cần phải đăng xuất/đăng nhập lại!
