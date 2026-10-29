import React from 'react';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Headphones, CreditCard, Lock, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigateAdmin?: () => void;
  onNavigateCategory?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateAdmin, onNavigateCategory }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600">
      {/* Service Highlights */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Giao Vận Toàn Quốc</h4>
                <p className="text-xs text-slate-500">Giao hàng nhanh 24/7 qua GHN & GHTK</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Chính Hãng 100%</h4>
                <p className="text-xs text-slate-500">Cam kết nguồn gốc xuất xứ, hóa đơn VAT</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-xs">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Thanh Toán An Toàn</h4>
                <p className="text-xs text-slate-500">Quét mã VietQR hoặc nhận hàng COD</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-xs">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Đổi Trả 30 Ngày</h4>
                <p className="text-xs text-slate-500">1 đổi 1 tận nơi nếu sản phẩm lỗi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold shadow-md">
                N
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                NEXUS<span className="text-indigo-600">STORE</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống bán lẻ & Thương mại điện tử chính hãng hàng đầu, mang đến trải nghiệm mua sắm trực tuyến thông minh, tiện lợi và uy tín cho khách hàng toàn quốc.
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Hotline: <strong className="text-slate-900">1900 6868</strong> (8:00 - 21:30)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Email: hotro@nexusstore.vn</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>Tòa nhà Nexus Tower, Cầu Giấy, TP. Hà Nội</span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h5 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Ngành Hàng Nổi Bật
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onNavigateCategory && onNavigateCategory('dien-thoai-tablet')}
                  className="hover:text-indigo-600 transition"
                >
                  Điện thoại & Máy tính bảng cao cấp
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory && onNavigateCategory('thoi-trang')}
                  className="hover:text-indigo-600 transition"
                >
                  Thời trang nam nữ & Phụ kiện
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory && onNavigateCategory('dien-gia-dung')}
                  className="hover:text-indigo-600 transition"
                >
                  Thiết bị gia dụng thông minh
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory && onNavigateCategory('phu-kien-so')}
                  className="hover:text-indigo-600 transition"
                >
                  Phụ kiện sạc nhanh & Âm thanh
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory && onNavigateCategory('laptop-may-tinh')}
                  className="hover:text-indigo-600 transition"
                >
                  Laptop & Máy tính văn phòng
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Policies */}
          <div>
            <h5 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Chăm Sóc Khách Hàng
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="hover:text-indigo-600 transition cursor-pointer">Chính sách bảo hành & Đổi trả</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">Hướng dẫn đặt hàng & Thanh toán</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">Chính sách vận chuyển & Đồng kiểm</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">Bảo mật thông tin khách hàng</li>
              <li className="hover:text-indigo-600 transition cursor-pointer">Quy chế hoạt động sàn TMĐT</li>
            </ul>
          </div>

          {/* Column 4: Payment & Internal Portal */}
          <div className="space-y-4">
            <h5 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Phương Thức Thanh Toán
            </h5>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-700">
                VietQR
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-700">
                VNPay
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-700">
                Tiền mặt COD
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-700">
                Visa / Master
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-700">
                Napas
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-700">
                Trả góp 0%
              </div>
            </div>

            {/* Subtle Dedicated Admin Link */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Dành cho nhân viên:</span>
                <a
                  href="#admin"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateAdmin) onNavigateAdmin();
                  }}
                  className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-semibold transition"
                  title="Cổng quản trị nội bộ NexusStore"
                >
                  <Lock className="h-3 w-3" />
                  <span>Cổng Quản Trị</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © 2026 NEXUSTORE Co., Ltd. Giấy phép kinh doanh số 0109876543 cấp bởi Sở KH&ĐT TP. Hà Nội.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 transition cursor-pointer">Điều khoản sử dụng</span>
            <span>•</span>
            <span className="hover:text-slate-600 transition cursor-pointer">Chính sách bảo mật</span>
            <span>•</span>
            <span className="hover:text-slate-600 transition cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
