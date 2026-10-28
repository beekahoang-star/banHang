import React, { useState } from 'react';
import {
  CreditCard, QrCode, Truck, ShieldCheck, MapPin,
  CheckCircle2, ArrowRight, ArrowLeft
} from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { VietQrModal } from '../../components/common/VietQrModal';

interface CheckoutPageProps {
  onNavigate: (view: string, payload?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, getTotalAmount, getFinalAmount, appliedVoucher, discountAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [shippingAddress, setShippingAddress] = useState({
    receiverName: user?.fullName || 'Hoàng Mua Hàng',
    phone: user?.phone || '0909888999',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    detailAddress: 'Tòa nhà Bitexco, 2 Hải Triều'
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VIETQR' | 'VNPAY'>('VIETQR');
  const [shippingCarrier, setShippingCarrier] = useState<'GHN' | 'GHTK'>('GHN');
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // VietQR modal state
  const [vietQrOpen, setVietQrOpen] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState('');

  const total = getTotalAmount();
  const final = getFinalAmount();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        shippingAddress,
        items: items.map(i => ({
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.salePrice || i.price,
          productName: i.productName,
          skuCode: i.skuCode,
          options: i.options,
          imageUrl: i.imageUrl
        })),
        paymentMethod,
        shippingCarrier,
        voucherCode: appliedVoucher?.code,
        discountAmount,
        customerNote
      };

      const order = await api.createOrder(payload);

      if (paymentMethod === 'VIETQR') {
        setCreatedOrderCode(order.orderCode);
        setVietQrOpen(true);
      } else {
        clearCart();
        onNavigate('order-success', { order });
      }
    } catch (err) {
      alert('Đã xảy ra lỗi khi đặt hàng, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVietQrSuccess = () => {
    setVietQrOpen(false);
    clearCart();
    onNavigate('order-success', {
      order: {
        orderCode: createdOrderCode,
        status: 'PENDING',
        paymentMethod: 'VIETQR',
        paymentStatus: 'PAID',
        finalAmount: final,
        shippingAddress
      }
    });
  };

  if (items.length === 0 && !vietQrOpen) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Không có sản phẩm nào trong giỏ hàng</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại trang chủ</span>
        </button>
        <span className="text-xs font-mono text-slate-400">Checkout Flow • Chống Bán Lố Bằng @Version</span>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Address & Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Shipping Address */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <MapPin className="h-5 w-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Địa Chỉ Nhận Hàng</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên người nhận</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.receiverName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, receiverName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tỉnh / Thành phố</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.province}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quận / Huyện</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.district}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà)</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.detailAddress}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, detailAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú cho shipper</label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Ví dụ: Gọi trước khi giao, giao trong giờ hành chính..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Carrier */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Truck className="h-5 w-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Đơn Vị Vận Chuyển</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'GHN', name: 'Giao Hàng Nhanh (GHN Express)', desc: '1-2 ngày • Phí 30.000đ' },
                { id: 'GHTK', name: 'Giao Hàng Tiết Kiệm (GHTK)', desc: '2-3 ngày • Phí 28.000đ' }
              ].map((c) => (
                <label
                  key={c.id}
                  onClick={() => setShippingCarrier(c.id as any)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    shippingCarrier === c.id
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{c.name}</span>
                    <input
                      type="radio"
                      name="carrier"
                      checked={shippingCarrier === c.id}
                      onChange={() => {}}
                      className="text-indigo-600"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{c.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Phương Thức Thanh Toán</h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'VIETQR',
                  name: 'Chuyển khoản VietQR Napas 247 (Tự động xác nhận qua Webhook)',
                  desc: 'Quét mã QR bằng App ngân hàng bất kỳ, hệ thống tự động duyệt đơn trong 10 giây.',
                  badge: 'Khuyên Dùng'
                },
                {
                  id: 'COD',
                  name: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                  desc: 'Được đồng kiểm tra hàng trước khi thanh toán cho nhân viên giao hàng.'
                },
                {
                  id: 'VNPAY',
                  name: 'Ví điện tử VNPay / Thẻ ATM Nội Địa / Thẻ Quốc Tế',
                  desc: 'Cổng thanh toán điện tử VNPay an toàn bảo mật chuẩn PCI DSS.'
                }
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    paymentMethod === m.id
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === m.id}
                    onChange={() => {}}
                    className="mt-1 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{m.name}</span>
                      {m.badge && (
                        <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Tóm Tắt Đơn Hàng ({items.length} món)
            </h3>

            {/* Items list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
              {items.map((i) => {
                const price = i.salePrice || i.price;
                return (
                  <div key={i.variantId} className="flex gap-3">
                    <img
                      src={i.imageUrl}
                      alt={i.productName}
                      className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-slate-800 truncate">{i.productName}</h5>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {i.skuCode}</div>
                      <div className="mt-0.5 flex justify-between text-slate-600 font-medium">
                        <span>SL: {i.quantity}</span>
                        <span className="font-bold text-indigo-600">{price.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Tiền hàng:</span>
                <span className="font-semibold text-slate-800">{total.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Phí giao hàng:</span>
                <span className="font-semibold text-slate-800">30.000 đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Voucher giảm giá ({appliedVoucher?.code}):</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
                <span>Tổng cộng:</span>
                <span className="text-lg text-indigo-600">{final.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <span>{submitting ? 'Đang tạo đơn...' : 'Xác nhận Đặt Hàng'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Cam kết bảo mật & Giữ hàng chống bán lố</span>
            </div>
          </div>
        </div>
      </form>

      {/* VietQR Modal */}
      <VietQrModal
        orderCode={createdOrderCode}
        amount={final}
        isOpen={vietQrOpen}
        onClose={() => setVietQrOpen(false)}
        onPaymentSuccess={handleVietQrSuccess}
      />
    </div>
  );
};
