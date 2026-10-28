import React, { useState, useEffect } from 'react';
import {
  Flame, Clock, ArrowRight, Star, ShoppingCart, Zap,
  Smartphone, Shirt, Home, ChevronRight, ShieldCheck
} from 'lucide-react';
import { Banner, Category, FlashSale, ProductListItem } from '../../types';
import { api } from '../../services/api';
import { useCartStore } from '../../stores/cartStore';

interface HomePageProps {
  onNavigate: (view: string, payload?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { addItem } = useCartStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 15 });

  useEffect(() => {
    // Load initial homepage data
    api.getBanners().then(setBanners);
    api.getFlashSale().then(setFlashSale);
    api.getCategories().then(setCategories);
    api.searchProducts().then(res => setProducts(res.items));
  }, []);

  // Flash Sale Live Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCategoryIcon = (slug: string) => {
    if (slug.includes('dien-thoai')) return <Smartphone className="h-6 w-6 text-indigo-600" />;
    if (slug.includes('thoi-trang')) return <Shirt className="h-6 w-6 text-rose-500" />;
    return <Home className="h-6 w-6 text-emerald-600" />;
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Banner Carousel */}
      <section className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl aspect-21/9 sm:aspect-24/8 min-h-[260px]">
          {banners.length > 0 ? (
            <div className="relative h-full w-full">
              <img
                src={banners[currentBannerIdx]?.imageUrl}
                alt={banners[currentBannerIdx]?.title}
                className="h-full w-full object-cover opacity-85 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent flex items-center p-8 sm:p-14">
                <div className="max-w-xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md border border-indigo-400/30">
                    <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    ĐẠI TIỆC MỞ BÁN TOÀN SÀN
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {banners[currentBannerIdx]?.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                    Khám phá hàng ngàn sản phẩm công nghệ, thời trang và gia dụng chính hãng. Bảo hành điện tử, giao vận siêu tốc toàn quốc.
                  </p>
                  <div>
                    <button
                      onClick={() => onNavigate('listing')}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
                    >
                      <span>Khám phá ngay</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="absolute bottom-4 right-6 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBannerIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentBannerIdx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">Đang tải banner...</div>
          )}
        </div>
      </section>

      {/* 2. Flash Sale Section with Countdown */}
      {flashSale && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-200 animate-pulse">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span>{flashSale.name}</span>
                    <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Hot
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">Giá sốc khung giờ vàng, số lượng có hạn!</p>
                </div>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-semibold text-slate-600">Kết thúc sau:</span>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-white">
                  <span className="rounded-md bg-slate-900 px-2 py-1 shadow">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-slate-900 font-bold">:</span>
                  <span className="rounded-md bg-slate-900 px-2 py-1 shadow">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-slate-900 font-bold">:</span>
                  <span className="rounded-md bg-rose-600 px-2 py-1 shadow animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Flash Sale Product Cards Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {flashSale.items.map((item) => {
                const soldPercent = Math.min(100, Math.round((item.soldCount / item.quantityLimit) * 100));

                return (
                  <div
                    key={item.variantId}
                    onClick={() => onNavigate('product', { slug: item.productSlug })}
                    className="group cursor-pointer rounded-2xl border border-rose-100 bg-white p-4 shadow-sm hover:shadow-md transition-all hover:border-rose-300"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 rounded-lg bg-rose-600 px-2 py-1 text-xs font-black text-white shadow">
                        -{item.discountPercent}%
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition truncate">
                        {item.productName}
                      </h4>

                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-rose-600">
                          {item.flashPrice.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          {item.originalPrice.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      {/* Stock Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                          <span>Đã bán: <strong className="text-rose-600">{item.soldCount}</strong>/{item.quantityLimit}</span>
                          <span>{soldPercent}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-rose-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Multi-Category Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Danh Mục Ngành Hàng</h2>
            <p className="text-xs text-slate-500">Khám phá các phân hệ sản phẩm đa dạng với thông số chuẩn hóa</p>
          </div>
          <button
            onClick={() => onNavigate('listing')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Tất cả ngành hàng</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('listing', { categorySlug: cat.slug })}
              className="cursor-pointer group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {getCategoryIcon(cat.slug)}
                </div>
                <span className="text-xs font-medium text-slate-400 font-mono">
                  JSONB Schema
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                {cat.name}
              </h3>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {cat.children?.map(sub => (
                  <span key={sub.id} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                    {sub.name}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                <span>Xem chi tiết bộ lọc</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Products with Real-time Stock */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Sản Phẩm Gợi Ý Nổi Bật</h2>
            <p className="text-xs text-slate-500">Tồn kho đồng bộ real-time, cam kết chính hãng 100%</p>
          </div>
          <button
            onClick={() => onNavigate('listing')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>Xem thêm</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-indigo-400 hover:shadow-xl transition-all"
            >
              {/* Product Image */}
              <div
                onClick={() => onNavigate('product', { slug: p.slug })}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-slate-50"
              >
                <img
                  src={p.mainImageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 backdrop-blur-xs shadow-xs">
                  {p.brandName}
                </span>

                {p.totalStock > 0 ? (
                  <span className="absolute bottom-2 right-2 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    Còn {p.totalStock} máy
                  </span>
                ) : (
                  <span className="absolute bottom-2 right-2 rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                    Tạm hết hàng
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="mt-3 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{p.ratingAvg}</span>
                    <span className="text-slate-400 font-normal">({p.reviewCount})</span>
                  </div>

                  <h3
                    onClick={() => onNavigate('product', { slug: p.slug })}
                    className="cursor-pointer font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-2"
                  >
                    {p.name}
                  </h3>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Giá từ</span>
                    <span className="text-base font-extrabold text-indigo-600">
                      {p.minPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('product', { slug: p.slug })}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-xs"
                    title="Chọn phân loại & Mua ngay"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
