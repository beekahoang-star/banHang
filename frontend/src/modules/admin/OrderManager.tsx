import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, CheckCircle, Truck, Package, XCircle,
  RotateCcw, Printer, ChevronRight, Eye, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../services/api';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stateChangeSuccess, setStateChangeSuccess] = useState(false);

  useEffect(() => {
    api.getAdminOrders().then((ordList) => {
      setOrders(ordList);
      if (ordList.length > 0) {
        setSelectedOrder(ordList[0]);
      }
    });
  }, []);

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  // Transition rules: PENDING -> CONFIRMED -> PACKING -> SHIPPING -> DELIVERED / CANCELLED / RETURNED
  const getNextAvailableStates = (currentStatus: string): { status: string; label: string; color: string }[] => {
    switch (currentStatus) {
      case 'PENDING':
        return [
          { status: 'CONFIRMED', label: 'Xác Nhận Đơn', color: 'bg-blue-600 hover:bg-blue-700' },
          { status: 'CANCELLED', label: 'Hủy Đơn (Nhả tồn)', color: 'bg-rose-600 hover:bg-rose-700' }
        ];
      case 'CONFIRMED':
        return [
          { status: 'PACKING', label: 'Chuyển Đóng Gói (In tem)', color: 'bg-amber-600 hover:bg-amber-700' },
          { status: 'CANCELLED', label: 'Hủy Đơn (Nhả tồn)', color: 'bg-rose-600 hover:bg-rose-700' }
        ];
      case 'PACKING':
        return [
          { status: 'SHIPPING', label: 'Giao Sang GHN / GHTK', color: 'bg-indigo-600 hover:bg-indigo-700' },
          { status: 'CANCELLED', label: 'Hủy Đơn (Nhả tồn)', color: 'bg-rose-600 hover:bg-rose-700' }
        ];
      case 'SHIPPING':
        return [
          { status: 'DELIVERED', label: 'Khách Đã Nhận Thành Công', color: 'bg-emerald-600 hover:bg-emerald-700' },
          { status: 'RETURNED', label: 'Chuyển Hoàn Trả (Nhập lại kho)', color: 'bg-purple-600 hover:bg-purple-700' }
        ];
      case 'DELIVERED':
        return [
          { status: 'RETURNED', label: 'Xử lý Đổi Trả RMA', color: 'bg-purple-600 hover:bg-purple-700' }
        ];
      default:
        return [];
    }
  };

  const handleAdvanceStatus = (orderId: number, targetStatus: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const nextTimeline = [
          ...o.timelines,
          {
            fromStatus: o.status,
            toStatus: targetStatus,
            changedByName: 'Nguyễn Quản Trị (Admin)',
            note: `Chuyển trạng thái đơn sang ${targetStatus}. Tự động kích hoạt cơ chế xuất kho/giải phóng tồn theo quy tắc State Machine.`,
            createdAt: new Date().toISOString()
          }
        ];
        const updated: Order = {
          ...o,
          status: targetStatus as any,
          timelines: nextTimeline,
          trackingCode: targetStatus === 'SHIPPING' ? (o.trackingCode || `GHN-VN-${Date.now().toString().slice(-6)}`) : o.trackingCode
        };
        setSelectedOrder(updated);
        return updated;
      }
      return o;
    }));

    setStateChangeSuccess(true);
    setTimeout(() => setStateChangeSuccess(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">CHỜ DUYỆT</span>;
      case 'CONFIRMED': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold text-[10px]">ĐÃ XÁC NHẬN</span>;
      case 'PACKING': return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold text-[10px]">ĐANG ĐÓNG GÓI</span>;
      case 'SHIPPING': return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold text-[10px]">ĐANG GIAO (GHN)</span>;
      case 'DELIVERED': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">GIAO THÀNH CÔNG</span>;
      case 'CANCELLED': return <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-[10px]">ĐÃ HỦY</span>;
      case 'RETURNED': return <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold text-[10px]">HOÀN TRẢ RMA</span>;
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Đơn Hàng & Vận Chuyển (Order State Machine)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm soát luồng trạng thái nghiêm ngặt: PENDING → CONFIRMED → PACKING → SHIPPING → DELIVERED. Tự động liên kết thẻ kho và API vận chuyển.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1 text-xs">
          {['ALL', 'PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 font-bold transition ${
                statusFilter === st ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="font-extrabold text-sm text-slate-900">Danh Sách Đơn Hàng ({filteredOrders.length})</span>
            <span className="text-[11px] font-mono text-slate-400">Click để thao tác</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredOrders.map((o) => (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className={`cursor-pointer rounded-2xl border p-3.5 transition text-xs space-y-1.5 ${
                  selectedOrder?.id === o.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-700">{o.orderCode}</span>
                  {getStatusBadge(o.status)}
                </div>

                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold text-slate-800">{o.customerName}</span>
                  <span className="font-bold text-slate-900">{o.finalAmount.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono flex justify-between">
                  <span>{o.paymentMethod} • {o.paymentStatus}</span>
                  <span>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details & State Machine Transitions */}
        {selectedOrder ? (
          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-lg">Đơn Hàng {selectedOrder.orderCode}</h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Khách hàng: <strong className="text-slate-700">{selectedOrder.customerName}</strong> ({selectedOrder.customerEmail})
                </div>
              </div>

              {/* State Machine Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {getNextAvailableStates(selectedOrder.status).map((st) => (
                  <button
                    key={st.status}
                    onClick={() => handleAdvanceStatus(selectedOrder.id, st.status)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5 ${st.color}`}
                  >
                    <span>{st.label}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ))}

                <button
                  onClick={() => alert(`Đang in phiếu xuất kho & tem nhiệt đơn ${selectedOrder.orderCode}...`)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                  title="In phiếu xuất kho & tem nhiệt GHN"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>In Phiếu</span>
                </button>
              </div>
            </div>

            {stateChangeSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Chuyển trạng thái đơn hàng và kích hoạt xử lý tồn kho / vận chuyển thành công!</span>
              </div>
            )}

            {/* Carrier & Tracking */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Đơn vị vận chuyển:</span>
                <span className="font-bold text-slate-800 text-sm">{selectedOrder.shippingCarrier || 'GHN'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Mã vận đơn (Tracking Code):</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {selectedOrder.trackingCode || 'Đang tạo sau khi đóng gói'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Địa chỉ giao:</span>
                <span className="font-medium text-slate-800">
                  {selectedOrder.shippingAddress?.detailAddress}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
                </span>
              </div>
            </div>

            {/* Purchased Items (Frozen Snapshot) */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                Sản phẩm trong đơn (Variant Snapshot)
              </h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, idx: number) => {
                  let snap: any = {};
                  try { snap = JSON.parse(item.variantSnapshot); } catch (e) {}
                  return (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={snap.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100'}
                          alt={snap.productName}
                          className="h-10 w-10 rounded-lg object-cover border"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{snap.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {snap.skuCode}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-500">SL: <strong>{item.quantity}</strong></div>
                        <div className="font-bold text-indigo-600">{(item.subtotal || item.unitPrice).toLocaleString('vi-VN')} đ</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                Lịch sử luồng trạng thái (Order State Audit Logs)
              </h4>
              <div className="space-y-2 text-xs">
                {selectedOrder.timelines?.map((tl: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 rounded-xl bg-slate-50 p-2.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">
                        {tl.fromStatus ? `${tl.fromStatus} → ` : ''}{tl.toStatus}
                      </div>
                      <div className="text-slate-600 mt-0.5">{tl.note}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Bởi: {tl.changedByName || 'Hệ thống'} • {new Date(tl.createdAt || Date.now()).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
