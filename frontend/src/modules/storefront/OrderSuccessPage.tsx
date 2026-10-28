import React, { useState } from 'react';
import {
  CheckCircle2, Package, Truck, ArrowRight, RotateCcw,
  Clock, ShieldCheck, MapPin, AlertCircle
} from 'lucide-react';
import { Order } from '../../types';

interface OrderSuccessPageProps {
  order?: any;
  onNavigate: (view: string, payload?: any) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  const [rmaModalOpen, setRmaModalOpen] = useState(false);
  const [rmaReason, setRmaReason] = useState('');
  const [rmaSuccess, setRmaSuccess] = useState(false);

  const orderData = order || {
    orderCode: 'ORD-2410279999',
    status: 'PENDING',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    finalAmount: 28420000,
    shippingCarrier: 'GHN',
    trackingCode: 'GHN-VN-MOCK8892',
    shippingAddress: {
      receiverName: 'Hoàng Mua Hàng',
      phone: '0909888999',
      province: 'Hồ Chí Minh',
      district: 'Quận 1',
      detailAddress: 'Tòa nhà Bitexco, 2 Hải Triều'
    },
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
      { toStatus: 'PENDING', note: 'Đơn hàng được khởi tạo thành công, giữ hàng trong kho.', createdAt: 'Vừa xong' }
    ]
  };

  const steps = [
    { key: 'PENDING', label: 'Chờ Xác Nhận' },
    { key: 'CONFIRMED', label: 'Đã Xác Nhận' },
    { key: 'PACKING', label: 'Đang Đóng Gói' },
    { key: 'SHIPPING', label: 'Đang Giao Hàng' },
    { key: 'DELIVERED', label: 'Đã Giao Thành Công' },
  ];

  const currentStepIdx = steps.findIndex(s => s.key === orderData.status);
  const activeIdx = currentStepIdx >= 0 ? currentStepIdx : 0;

  const handleRmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRmaSuccess(true);
    setTimeout(() => {
      setRmaModalOpen(false);
      setRmaSuccess(false);
      alert('Yêu cầu đổi trả RMA đã được gửi đến bộ phận CSKH để xử lý!');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8 animate-fade-in">
      {/* Success Banner */}
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-indigo-50/50 p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Đặt Hàng Thành Công!
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Mã đơn hàng của bạn là <strong className="font-mono text-indigo-600 text-base">{orderData.orderCode}</strong>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Trạng thái thanh toán: <strong className={orderData.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}>
            {orderData.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN (VIETQR)' : 'CHƯA THANH TOÁN (COD)'}
          </strong>
        </p>
      </div>

      {/* Order State Machine Timeline Tracker */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>Tiến Trình Đơn Hàng (Order State Machine Timeline)</span>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 font-mono text-[11px] font-bold text-indigo-700">
            Trạng thái hiện tại: {orderData.status}
          </span>
        </div>

        {/* Stepper Bar */}
        <div className="relative py-4">
          <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-1 bg-slate-100" />
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500"
            style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
          />

          <div className="relative flex justify-between">
            {steps.map((st, idx) => {
              const isPastOrCurrent = idx <= activeIdx;
              return (
                <div key={st.key} className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${
                    isPastOrCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`mt-2 text-[11px] font-semibold text-center max-w-[80px] ${
                    isPastOrCurrent ? 'text-indigo-600 font-bold' : 'text-slate-400'
                  }`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Variant Snapshot (Historical Data Preservation) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
            <Package className="h-4 w-4 text-indigo-600" />
            <span>Sản Phẩm Đã Mua (Lưu Cứng Variant Snapshot JSONB)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Bảo toàn dữ liệu lịch sử</span>
        </div>

        <div className="space-y-4">
          {orderData.items?.map((item: any, idx: number) => {
            let snapshot: any = {};
            try {
              snapshot = JSON.parse(item.variantSnapshot);
            } catch (e) {}

            return (
              <div key={idx} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <img
                  src={snapshot.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300'}
                  alt={snapshot.productName}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900">{snapshot.productName}</h4>
                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">Mã SKU: {snapshot.skuCode}</div>
                  <div className="text-xs text-slate-600 mt-1">Phân loại: {snapshot.options}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Số lượng: <strong>{item.quantity}</strong></div>
                  <div className="text-sm font-bold text-indigo-600 mt-1">
                    {Number(item.subtotal || item.unitPrice).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total details */}
        <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
          <span>Tổng số tiền đã xác nhận:</span>
          <span className="text-xl text-indigo-600">{Number(orderData.finalAmount).toLocaleString('vi-VN')} đ</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setRmaModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
        >
          <RotateCcw className="h-4 w-4 text-amber-600" />
          <span>Yêu cầu Đổi Trả / Hoàn Tiền (RMA)</span>
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          <span>Tiếp tục mua sắm</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* RMA Request Modal */}
      {rmaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tạo Yêu Cầu Đổi Trả (RMA)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Áp dụng cho đơn hàng <strong className="text-slate-800">{orderData.orderCode}</strong> trong vòng 7 ngày kể từ khi nhận hàng.
            </p>

            {rmaSuccess ? (
              <div className="py-6 text-center text-emerald-600 font-bold text-sm">
                Đã ghi nhận yêu cầu RMA, CSKH sẽ liên hệ trong 24h!
              </div>
            ) : (
              <form onSubmit={handleRmaSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lý do đổi trả hoặc hoàn tiền:</label>
                  <textarea
                    rows={3}
                    required
                    value={rmaReason}
                    onChange={(e) => setRmaReason(e.target.value)}
                    placeholder="Mô tả tình trạng lỗi sản phẩm (móp méo, không lên nguồn, sai biến thể...)"
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRmaModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-slate-500 hover:bg-slate-100 font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-white font-bold hover:bg-indigo-700"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
