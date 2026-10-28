import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Flame, Image as ImageIcon, Check,
  Calendar, Percent, DollarSign, Clock
} from 'lucide-react';
import { Voucher, Banner } from '../../types';
import { api } from '../../services/api';

export const MarketingManager: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // New voucher form
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('FIXED_AMOUNT');
  const [discountValue, setDiscountValue] = useState(100000);
  const [minOrderValue, setMinOrderValue] = useState(2000000);
  const [usageLimit, setUsageLimit] = useState(500);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  useEffect(() => {
    api.getVouchers().then(setVouchers);
    api.getBanners().then(setBanners);
  }, []);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const newV: Voucher = {
      id: Date.now(),
      code: code.trim().toUpperCase(),
      title,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount: discountType === 'PERCENTAGE' ? 1000000 : discountValue,
      usageLimit,
      usedCount: 0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: true
    };
    setVouchers([newV, ...vouchers]);
    setCreatedSuccess(true);
    setTimeout(() => {
      setCreatedSuccess(false);
      setModalOpen(false);
      setCode('');
      setTitle('');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Marketing & CMS (Voucher, Flash Sale, Banners)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập mã giảm giá toàn sàn/theo ngành hàng, quản lý khung giờ vàng Flash Sale và Banner chiến dịch.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Mã Voucher Mới</span>
        </button>
      </div>

      {/* 1. Vouchers Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Tag className="h-4 w-4 text-indigo-600" />
            <span>Danh Sách Mã Giảm Giá Voucher</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Kiểm tra hợp lệ tự động ở Checkout</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Mã Code</th>
                <th className="py-3 px-4">Tên Chiến Dịch</th>
                <th className="py-3 px-4">Mức Giảm</th>
                <th className="py-3 px-4">Đơn Tối Thiểu</th>
                <th className="py-3 px-4">Đã Dùng / Hạn Mức</th>
                <th className="py-3 px-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                    {v.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {v.title}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {v.discountType === 'PERCENTAGE'
                      ? `${v.discountValue}%`
                      : `${v.discountValue.toLocaleString('vi-VN')} đ`}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-600">
                    {v.minOrderValue ? `${v.minOrderValue.toLocaleString('vi-VN')} đ` : '0 đ'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{v.usedCount}</span>
                    <span className="text-slate-400"> / {v.usageLimit}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 text-[10px]">
                      ĐANG HOẠT ĐỘNG
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Banner CMS Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ImageIcon className="h-4 w-4 text-indigo-600" />
          <h3 className="font-extrabold text-slate-900 text-sm">Banner Chiến Dịch Đang Hiển Thị (Trang Chủ)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group">
              <img src={b.imageUrl} alt={b.title} className="h-32 w-full object-cover group-hover:scale-105 transition duration-300" />
              <div className="p-3 text-xs space-y-1">
                <h5 className="font-bold text-slate-800 truncate">{b.title}</h5>
                <div className="flex justify-between text-slate-400 font-mono text-[10px]">
                  <span>Vị trí: {b.position}</span>
                  <span>Thứ tự: {b.sortOrder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Voucher Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Tạo Mã Giảm Giá Voucher Mới</h3>

            {createdSuccess ? (
              <div className="py-8 text-center text-emerald-600 font-bold text-sm">
                Đã khởi tạo mã Voucher thành công vào hệ thống!
              </div>
            ) : (
              <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã Voucher (Code):</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="VD: MEGA2026, FREESHIP"
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-mono uppercase font-bold text-indigo-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tiêu đề chiến dịch:</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Giảm 100K cho ngày hội công nghệ"
                    className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Loại giảm giá:</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none"
                    >
                      <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Giá trị giảm:</label>
                    <input
                      type="number"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Đơn tối thiểu:</label>
                    <input
                      type="number"
                      value={minOrderValue}
                      onChange={(e) => setMinOrderValue(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lượt dùng tối đa:</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 p-2.5"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-slate-500 hover:bg-slate-100 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-white font-bold hover:bg-indigo-700"
                  >
                    Tạo Voucher
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
