import React from 'react';
import { Home, LayoutGrid, ShoppingBag, Package, PhoneCall, User } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

interface MobileBottomBarProps {
  currentView: string;
  onNavigate: (view: string, payload?: any) => void;
  onOpenCategories: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentView,
  onNavigate,
  onOpenCategories
}) => {
  const { getTotalItems, setOpen } = useCartStore();
  const cartCount = getTotalItems();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 shadow-2xl flex justify-around items-center">
      {/* 1. Trang chủ */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition ${
          currentView === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-600'
        }`}
      >
        <Home className="h-5 w-5" />
        <span>Trang chủ</span>
      </button>

      {/* 2. Danh mục */}
      <button
        onClick={onOpenCategories}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition ${
          currentView === 'listing' ? 'text-indigo-600 font-bold' : 'text-slate-600'
        }`}
      >
        <LayoutGrid className="h-5 w-5" />
        <span>Danh mục</span>
      </button>

      {/* 3. Giỏ hàng */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium text-slate-600 relative"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5 text-indigo-600" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </div>
        <span>Giỏ hàng</span>
      </button>

      {/* 4. Tra cứu đơn */}
      <button
        onClick={() => onNavigate('order-success')}
        className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition ${
          currentView === 'order-success' ? 'text-indigo-600 font-bold' : 'text-slate-600'
        }`}
      >
        <Package className="h-5 w-5" />
        <span>Đơn mua</span>
      </button>

      {/* 5. Hotline */}
      <a
        href="tel:19006868"
        className="flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium text-slate-600"
      >
        <PhoneCall className="h-5 w-5 text-emerald-600" />
        <span>1900 6868</span>
      </a>
    </div>
  );
};
