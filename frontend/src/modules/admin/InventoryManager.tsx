import React, { useState, useEffect } from 'react';
import {
  Warehouse, Plus, History, RefreshCw, CheckCircle2,
  AlertCircle, ArrowDownCircle, ArrowUpCircle, FileText
} from 'lucide-react';
import { InventorySummary, InventoryLog } from '../../types';
import { api } from '../../services/api';

export const InventoryManager: React.FC = () => {
  const [inventories, setInventories] = useState<InventorySummary[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'logs'>('summary');

  // Modals
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<InventorySummary | null>(null);
  const [restockQty, setRestockQty] = useState(20);
  const [restockNote, setRestockNote] = useState('Nhập hàng mở rộng kho');
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.getAdminInventories().then(setInventories);
    api.getAdminInventoryLogs().then(setLogs);
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku) return;

    // Simulate restock update
    setInventories(prev => prev.map(item => {
      if (item.variantId === selectedSku.variantId) {
        const newOnHand = item.stockOnHand + restockQty;
        return {
          ...item,
          stockOnHand: newOnHand,
          availableStock: newOnHand - item.stockReserved,
          version: item.version + 1
        };
      }
      return item;
    }));

    // Add log entry
    const newLog: InventoryLog = {
      id: Date.now(),
      variantId: selectedSku.variantId,
      skuCode: selectedSku.skuCode,
      changeType: 'IMPORT',
      quantityChanged: restockQty,
      stockOnHandAfter: selectedSku.stockOnHand + restockQty,
      stockReservedAfter: selectedSku.stockReserved,
      referenceType: 'IMPORT_RECEIPT',
      referenceId: `PNK-${Date.now().toString().slice(-6)}`,
      note: restockNote,
      createdByName: 'Trần Thủ Kho',
      createdAt: new Date().toISOString()
    };
    setLogs([newLog, ...logs]);

    setActionSuccess(true);
    setTimeout(() => {
      setActionSuccess(false);
      setRestockModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản Lý Tồn Kho & Thẻ Kho (Stock Ledger)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tách biệt tồn thực tế và tồn đang giữ để chống bán lố (Anti-overselling) với cơ chế Optimistic Locking (@Version).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-slate-200/70 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('summary')}
            className={`rounded-xl px-4 py-2 transition ${
              activeSubTab === 'summary' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tổng Quan Tồn Kho (On-hand vs Reserved)
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`rounded-xl px-4 py-2 transition ${
              activeSubTab === 'logs' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhật Ký Thẻ Kho (Audit Log Ledger)
          </button>
        </div>
      </div>

      {activeSubTab === 'summary' ? (
        /* Inventory Summary Table */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Warehouse className="h-5 w-5 text-indigo-600" />
              <span>Bảng Thống Kê Tồn Kho Biến Thể SKU</span>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Công thức: Tồn khả dụng = Tồn thực tế - Tồn giữ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Mã SKU</th>
                  <th className="py-3 px-4">Sản Phẩm & Biến Thể</th>
                  <th className="py-3 px-4 text-center">Tồn Thực Tế (On-hand)</th>
                  <th className="py-3 px-4 text-center">Tồn Đang Giữ (Reserved)</th>
                  <th className="py-3 px-4 text-center">Tồn Khả Dụng</th>
                  <th className="py-3 px-4 text-center">Lock Version</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventories.map((item) => (
                  <tr key={item.variantId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {item.skuCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{item.options}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-sm">
                      {item.stockOnHand}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-md bg-amber-50 px-2.5 py-1 font-bold text-amber-700 border border-amber-200">
                        {item.stockReserved}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`rounded-md px-2.5 py-1 font-black text-sm ${
                        item.availableStock > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.availableStock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      v{item.version}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSku(item);
                          setRestockModalOpen(true);
                        }}
                        className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
                      >
                        + Nhập Kho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Audit Logs Table */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <History className="h-5 w-5 text-indigo-600" />
              <span>Sổ Thẻ Kho Điện Tử (Audit Trail Logs)</span>
            </div>
            <span className="font-mono text-xs text-slate-400">Ghi vết mọi giao dịch biến động tồn</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Mã SKU</th>
                  <th className="py-3 px-4">Loại Biến Động</th>
                  <th className="py-3 px-4 text-center">Số Lượng Đổi</th>
                  <th className="py-3 px-4 text-center">Tồn Thực Sau</th>
                  <th className="py-3 px-4 text-center">Tồn Giữ Sau</th>
                  <th className="py-3 px-4">Mã Tham Chiếu</th>
                  <th className="py-3 px-4">Ghi Chú & Người Tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const isPositive = log.quantityChanged > 0;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {log.skuCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded-md px-2 py-0.5 font-bold text-[10px] uppercase ${
                          log.changeType === 'IMPORT' ? 'bg-emerald-100 text-emerald-800' :
                          log.changeType === 'ORDER_RESERVE' ? 'bg-amber-100 text-amber-800' :
                          log.changeType === 'ORDER_COMMIT' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {log.changeType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                          {isPositive ? `+${log.quantityChanged}` : log.quantityChanged}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">
                        {log.stockOnHandAfter}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-amber-700">
                        {log.stockReservedAfter}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.referenceId || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{log.note}</div>
                        <div className="text-[10px] text-slate-400 font-medium">Bởi: {log.createdByName}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModalOpen && selectedSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Tạo Phiếu Nhập Kho Hàng Hóa</h3>
            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1">
              <div>Sản phẩm: <strong className="text-slate-900">{selectedSku.productName}</strong></div>
              <div>Mã SKU: <strong className="font-mono text-indigo-600">{selectedSku.skuCode}</strong></div>
              <div>Tồn hiện tại: <strong>{selectedSku.stockOnHand}</strong> chiếc</div>
            </div>

            {actionSuccess ? (
              <div className="py-6 text-center text-emerald-600 font-bold text-sm">
                Đã tạo phiếu nhập kho và cập nhật số dư thẻ kho thành công!
              </div>
            ) : (
              <form onSubmit={handleRestock} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng nhập thêm:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ghi chú phiếu nhập kho:</label>
                  <input
                    type="text"
                    value={restockNote}
                    onChange={(e) => setRestockNote(e.target.value)}
                    placeholder="VD: Nhập kho lô hàng từ Apple Authorized Reseller"
                    className="w-full rounded-xl border border-slate-200 p-2.5"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRestockModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-slate-500 hover:bg-slate-100 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-white font-bold hover:bg-indigo-700"
                  >
                    Xác nhận nhập kho
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
