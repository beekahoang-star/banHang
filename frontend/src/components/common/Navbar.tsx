import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ShoppingBag, Menu, ChevronDown, ChevronRight,
  PhoneCall, PackageCheck, Sparkles, X, Smartphone, Shirt,
  Home, Flame, Zap, Award, Tag
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, payload?: any) => void;
  megaMenuOpen?: boolean;
  setMegaMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  megaMenuOpen: externalMegaMenuOpen,
  setMegaMenuOpen: externalSetMegaMenuOpen
}) => {
  const { getTotalItems, getTotalAmount, setOpen } = useCartStore();
  const [internalMegaMenuOpen, setInternalMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  const isMegaMenuOpen = externalMegaMenuOpen !== undefined ? externalMegaMenuOpen : internalMegaMenuOpen;
  const setIsMegaMenuOpen = externalSetMegaMenuOpen || setInternalMegaMenuOpen;

  const cartCount = getTotalItems();
  const cartTotal = getTotalAmount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMegaMenuOpen(false);
      onNavigate('listing', { keyword: searchQuery.trim() });
    }
  };

  const categoriesData = [
    {
      id: 'dien-thoai-tablet',
      name: 'Điện Thoại & Tablet',
      icon: Smartphone,
      color: 'text-indigo-600',
      subgroups: [
        {
          title: 'Apple iPhone',
          items: ['iPhone 16 Series', 'iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14 Series', 'iPhone 13']
        },
        {
          title: 'Samsung Galaxy',
          items: ['Galaxy S24 Ultra', 'Galaxy S24 / S24+', 'Galaxy Z Fold6 / Flip6', 'Galaxy A Series']
        },
        {
          title: 'Máy Tính Bảng',
          items: ['iPad Pro M4', 'iPad Air M2', 'iPad Gen 10', 'Samsung Galaxy Tab S9']
        },
        {
          title: 'Phụ Kiện Chính Hãng',
          items: ['Củ sạc nhanh 20W - 65W', 'Cáp sạc Type-C / Lightning', 'Tai nghe AirPods / Buds', 'Ốp lưng MagSafe']
        }
      ],
      featuredBrand: 'Apple & Samsung Authorized Reseller'
    },
    {
      id: 'thoi-trang-phu-kien',
      name: 'Thời Trang & Phụ Kiện',
      icon: Shirt,
      color: 'text-rose-500',
      subgroups: [
        {
          title: 'Thời Trang Nam',
          items: ['Áo khoác gió thể thao', 'Áo Polo cao cấp', 'Áo thun Cotton 100%', 'Quần Jogger / Khaki']
        },
        {
          title: 'Thời Trang Nữ',
          items: ['Áo khoác Blazer', 'Váy đầm công sở', 'Áo len dệt kim', 'Set đồ thể thao Activewear']
        },
        {
          title: 'Giày Thể Thao Sneaker',
          items: ['Nike Air Max / Jordan', 'Adidas Ultraboost', 'Puma Lifestyle', 'Giày chạy bộ chuyên nghiệp']
        },
        {
          title: 'Phụ Kiện Thời Trang',
          items: ['Balo chống nước', 'Túi xách cao cấp', 'Kính râm phân cực', 'Thắt lưng da bò']
        }
      ],
      featuredBrand: 'Bộ sưu tập Thu Đông chính hãng'
    },
    {
      id: 'thiet-bi-gia-dung',
      name: 'Thiết Bị Gia Dụng',
      icon: Home,
      color: 'text-emerald-600',
      subgroups: [
        {
          title: 'Nhà Bếp Thông Minh',
          items: ['Nồi chiên không dầu XXL', 'Nồi áp suất điện đa năng', 'Máy xay sinh tố công suất cao', 'Bếp từ đôi cao cấp']
        },
        {
          title: 'Chăm Sóc Gia Đình',
          items: ['Robot hút bụi lau nhà tự giặt', 'Máy lọc không khí Hepa', 'Máy hút ẩm thông minh', 'Bàn ủi hơi nước đứng']
        },
        {
          title: 'Thiết Bị Tiện Ích',
          items: ['Ấm siêu tốc thủy tinh', 'Máy pha cà phê gia đình', 'Bình giữ nhiệt Lock&Lock', 'Máy sấy tóc ion âm']
        }
      ],
      featuredBrand: 'Philips, Tefal & Xiaomi Ecosystem'
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
      {/* 1. Top Announcement Bar (Real E-commerce Notice & Support Hotline) */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-white">Khuyến Mãi Toàn Sàn:</span>
            <span className="text-slate-300 truncate">
              Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ • Giảm ngay 100K cho khách hàng mới
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-slate-300 font-medium">
            <a href="tel:19006868" className="flex items-center gap-1.5 hover:text-white transition">
              <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
              <span>Hotline: <strong className="text-white">1900 6868</strong> (8:00 - 21:30)</span>
            </a>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => onNavigate('order-success')}
              className="flex items-center gap-1 hover:text-white transition"
            >
              <PackageCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span>Tra cứu đơn hàng</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Hệ thống 120 chi nhánh</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand Logo & Mega Menu Button */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group text-left flex-shrink-0"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                NEXUS<span className="text-indigo-600">STORE</span>
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Thương Mại Điện Tử Chính Hãng
              </span>
            </div>
          </button>

          {/* Mega Menu Button */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition border ${
                isMegaMenuOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-100 text-slate-800 border-slate-200/80 hover:bg-slate-200/80'
              }`}
            >
              <Menu className="h-4 w-4" />
              <span>Danh mục sản phẩm</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar with Auto Suggestions */}
        <div className="relative flex-1 max-w-xl mx-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Tìm kiếm điện thoại, laptop, thời trang, thiết bị gia dụng..."
              className="w-full rounded-full border border-slate-200 bg-slate-50/90 py-2.5 pl-11 pr-24 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition"
            />
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Quick Search Suggestions Dropdown */}
          {searchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 text-xs animate-fade-in">
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
                Gợi ý tìm kiếm phổ biến
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['iPhone 16', 'Galaxy S24 Ultra', 'Áo khoác Nike', 'Nồi chiên Philips', 'Tai nghe AirPods', 'Robot hút bụi'].map((kw) => (
                  <button
                    key={kw}
                    onMouseDown={() => {
                      setSearchQuery(kw);
                      onNavigate('listing', { keyword: kw });
                    }}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Right Actions */}
        <div className="flex items-center gap-3">
          {/* Order Tracker Link */}
          <button
            onClick={() => onNavigate('order-success')}
            className="hidden xl:flex items-center gap-2 rounded-xl border border-slate-200/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <PackageCheck className="h-4 w-4 text-indigo-600" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 leading-none">Kiểm tra</div>
              <div className="text-slate-900 font-bold leading-none mt-0.5">Đơn hàng</div>
            </div>
          </button>

          {/* Cart Button with Count Badge & Total */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-50/80 border border-indigo-100 p-2 sm:px-3.5 sm:py-2 text-indigo-700 hover:bg-indigo-600 hover:text-white transition group shadow-2xs"
            title="Xem giỏ hàng"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left text-xs leading-none">
              <div className="text-[10px] opacity-75 font-medium">Giỏ hàng</div>
              <div className="font-extrabold mt-0.5">
                {cartTotal > 0 ? `${cartTotal.toLocaleString('vi-VN')} đ` : '0 đ'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Secondary Category Strip (Quick access navigation) */}
      <div className="hidden sm:block border-t border-slate-100 bg-slate-50/60 px-4 py-1.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('listing')}
              className="hover:text-indigo-600 transition flex items-center gap-1"
            >
              <span>Tất cả sản phẩm</span>
            </button>
            <button
              onClick={() => onNavigate('listing', { categorySlug: 'dien-thoai-tablet' })}
              className="hover:text-indigo-600 transition"
            >
              Điện Thoại & Tablet
            </button>
            <button
              onClick={() => onNavigate('listing', { categorySlug: 'thoi-trang-phu-kien' })}
              className="hover:text-indigo-600 transition"
            >
              Thời Trang & Phụ Kiện
            </button>
            <button
              onClick={() => onNavigate('listing', { categorySlug: 'thiet-bi-gia-dung' })}
              className="hover:text-indigo-600 transition"
            >
              Thiết Bị Gia Dụng
            </button>
            <button
              onClick={() => onNavigate('listing')}
              className="text-rose-600 hover:text-rose-700 transition flex items-center gap-1 font-bold"
            >
              <Flame className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span>Flash Sale Giá Sốc</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4 text-slate-400 font-normal text-[11px]">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              <span>Cam kết 100% hàng chính hãng</span>
            </span>
            <span>•</span>
            <span>Bảo hành toàn diện 12 tháng</span>
          </div>
        </div>
      </div>

      {/* 4. Multi-Level Mega Menu Overlay */}
      {isMegaMenuOpen && (
        <div
          onMouseLeave={() => setIsMegaMenuOpen(false)}
          className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white shadow-2xl z-50 animate-fade-in"
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="grid grid-cols-12 gap-6 min-h-[380px]">
              {/* Left Column: Category Tabs */}
              <div className="col-span-3 border-r border-slate-100 pr-4 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Ngành hàng chính
                </div>
                {categoriesData.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isActive = activeCategoryIndex === idx;
                  return (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onClick={() => {
                        onNavigate('listing', { categorySlug: cat.id });
                        setIsMegaMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${cat.color}`} />
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  );
                })}
              </div>

              {/* Middle Area: Subcategory columns */}
              <div className="col-span-6 grid grid-cols-2 gap-6 p-2">
                {categoriesData[activeCategoryIndex]?.subgroups.map((sub, sIdx) => (
                  <div key={sIdx} className="space-y-2.5">
                    <h4 className="font-extrabold text-xs text-slate-900 border-b border-slate-100 pb-1.5">
                      {sub.title}
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {sub.items.map((item, iIdx) => (
                        <li key={iIdx}>
                          <button
                            onClick={() => {
                              onNavigate('listing', {
                                categorySlug: categoriesData[activeCategoryIndex].id,
                                keyword: item
                              });
                              setIsMegaMenuOpen(false);
                            }}
                            className="hover:text-indigo-600 hover:underline transition text-left"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right Area: Featured Promo Card */}
              <div className="col-span-3 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 border border-indigo-100 flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Ưu đãi nổi bật
                  </span>
                  <h3 className="mt-2 text-base font-extrabold text-slate-900 leading-snug">
                    {categoriesData[activeCategoryIndex]?.featuredBrand}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Giảm thêm 10% khi áp dụng voucher tại bước thanh toán. Trả góp 0% lãi suất qua thẻ tín dụng.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onNavigate('listing', { categorySlug: categoriesData[activeCategoryIndex].id });
                    setIsMegaMenuOpen(false);
                  }}
                  className="mt-4 rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
