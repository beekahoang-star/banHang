import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, DollarSign, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Warehouse, CheckCircle2
} from 'lucide-react';
import { DashboardSummary } from '../../types';
import { api } from '../../services/api';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api.getDashboardSummary().then(setData);
  }, []);

  if (!data) {
    return <div className="text-center py-20 text-slate-500 text-xs">Đang nạp dữ liệu thống kê KPI...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard & Thống Kê KPI Doanh Thu</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi số liệu kinh doanh thời gian thực, cảnh báo tồn kho và tiến độ vận hành.
        </p>
      </div>

      {/* 1. 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Revenue */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh Thu Thuần</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {data.netRevenue.toLocaleString('vi-VN')} đ
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>+18.4% so với tuần trước</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {data.totalOrders} đơn
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>+12.1% tăng trưởng đơn</span>
            </div>
          </div>
        </div>

        {/* AOV */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AOV (Giá Trị Đơn TB)</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {data.averageOrderValue.toLocaleString('vi-VN')} đ
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
              <span>Đa ngành hàng B2C</span>
            </div>
          </div>
        </div>

        {/* Cancellation Rate */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ Lệ Hủy Đơn</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {data.cancellationRate}%
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowDownRight className="h-4 w-4" />
              <span>-0.8% kiểm soát tốt</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 7-Day Revenue Trend Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Biểu Đồ Doanh Thu 7 Ngày Qua</h3>
              <p className="text-[11px] text-slate-400">Xu hướng doanh thu thuần và số đơn hàng theo ngày</p>
            </div>
            <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700">
              Đơn vị: Triệu VNĐ
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {data.revenueChart.map((point) => {
              const maxRev = 50000000;
              const heightPercent = Math.min(100, Math.round((point.revenue / maxRev) * 100));

              return (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                    {(point.revenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-40 flex items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-700 group-hover:to-indigo-500 transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-bold text-slate-600">{point.date}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{point.orderCount} đơn</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Revenue Breakdown */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Doanh Thu Theo Ngành Hàng</h3>
            <p className="text-[11px] text-slate-400">Tỷ trọng đóng góp từ các danh mục đa cấp</p>
          </div>

          <div className="space-y-4 pt-2">
            {data.categoryRevenue.map((cat, idx) => {
              const colors = ['bg-indigo-600', 'bg-rose-500', 'bg-emerald-500'];
              return (
                <div key={cat.categoryName} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">{cat.categoryName}</span>
                    <span className="font-semibold text-slate-600">{cat.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[idx % colors.length]}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    {cat.revenue.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Low Stock Alerts Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cảnh Báo Tồn Kho Sắp Hết (Low Stock Alert)</h3>
              <p className="text-[11px] text-slate-400">Các biến thể SKU có tồn khả dụng dưới ngưỡng an toàn (15 chiếc)</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
          >
            <Warehouse className="h-3.5 w-3.5" />
            <span>Quản lý kho chi tiết</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-left font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Mã SKU</th>
                <th className="py-2.5 px-3">Tên Sản Phẩm</th>
                <th className="py-2.5 px-3">Tồn Thực Tế</th>
                <th className="py-2.5 px-3">Tồn Đang Giữ</th>
                <th className="py-2.5 px-3">Tồn Khả Dụng</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.lowStockAlerts.map((sku) => (
                <tr key={sku.variantId} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600">{sku.skuCode}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{sku.productName}</td>
                  <td className="py-3 px-3 font-semibold text-slate-600">{sku.stockOnHand}</td>
                  <td className="py-3 px-3 font-semibold text-amber-600">{sku.stockReserved}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-600 border border-rose-200/60">
                      {sku.availableStock} chiếc
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigateTab('inventory')}
                      className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
                    >
                      Nhập thêm kho
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
