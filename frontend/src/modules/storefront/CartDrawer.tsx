import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { api } from '../../services/api';

interface CartDrawerProps {
  onNavigateCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateCheckout }) => {
  const {
    items,
    isOpen,
    setOpen,
    updateQuantity,
    removeItem,
    getTotalAmount,
    getFinalAmount,
    appliedVoucher,
    discountAmount,
    setVoucher
  } = useCartStore();

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const total = getTotalAmount();
  const final = getFinalAmount();

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherMessage(null);
    try {
      const res = await api.validateVoucher(voucherCode, total);
      if (res.valid) {
        setVoucher({
          id: 99,
          code: voucherCode.toUpperCase(),
          title: res.message,
          discountType: 'FIXED_AMOUNT',
          discountValue: res.discountAmount,
          startDate: '',
          endDate: '',
          isActive: true
        }, res.discountAmount);
        setVoucherMessage({ text: res.message });
      } else {
        setVoucher(null, 0);
        setVoucherMessage({ text: res.message, error: true });
      }
    } catch (e) {
      setVoucherMessage({ text: 'Lỗi kiểm tra voucher', error: true });
    } finally {
      setVoucherLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Giỏ Hàng Của Bạn</h2>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                {items.length} món
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="mx-auto h-16 w-16 text-slate-200" />
                <p className="mt-3 text-sm text-slate-500 font-medium">Giỏ hàng của bạn đang trống</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              items.map((item) => {
                let parsedOptions: Record<string, string> = {};
                try {
                  parsedOptions = JSON.parse(item.options);
                } catch (e) {}

                const price = item.salePrice || item.price;

                return (
                  <div
                    key={item.variantId}
                    className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3 relative group"
                  >
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300'}
                      alt={item.productName}
                      className="h-20 w-20 rounded-lg object-cover border border-slate-200/80 bg-white"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Mã SP: {item.skuCode}
                      </p>

                      {/* Display selected options */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(parsedOptions).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/60"
                          >
                            {v}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm font-bold text-indigo-600">
                          {price.toLocaleString('vi-VN')} đ
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2.5 py-0.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-l"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="px-2.5 py-0.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-r"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 transition"
                      title="Xóa mục"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout button */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-4">
              {/* Voucher Box */}
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Mã giảm giá (VD: GIAM100K, TECH10)"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs uppercase placeholder:normal-case focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleApplyVoucher}
                    disabled={voucherLoading || !voucherCode.trim()}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
                  >
                    {voucherLoading ? 'Kiểm tra...' : 'Áp dụng'}
                  </button>
                </div>

                {voucherMessage && (
                  <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
                    voucherMessage.error ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {voucherMessage.error ? <AlertCircle className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    <span>{voucherMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Tổng tiền sản phẩm:</span>
                  <span className="font-semibold text-slate-800">{total.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng dự tính:</span>
                  <span className="font-semibold text-slate-800">30.000 đ</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Mã giảm giá ({appliedVoucher?.code}):</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Tổng thanh toán:</span>
                  <span className="text-base text-indigo-600">{final.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* Proceed to checkout */}
              <button
                onClick={() => {
                  setOpen(false);
                  onNavigateCheckout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
              >
                <span>Tiến hành đặt hàng</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
