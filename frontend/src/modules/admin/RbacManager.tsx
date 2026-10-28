import React from 'react';
import { Shield, Users, Check, Lock, ShieldCheck, Activity, Key } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const RbacManager: React.FC = () => {
  const { activeRole, loginAs } = useAuthStore();

  const roles = [
    {
      code: 'ROLE_SUPER_ADMIN',
      name: 'Super Admin',
      desc: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản nhân viên, danh mục, kho, đơn hàng và marketing.',
      usersCount: 1,
      badge: 'bg-indigo-100 text-indigo-800'
    },
    {
      code: 'ROLE_WAREHOUSE_MANAGER',
      name: 'Quản lý Kho',
      desc: 'Theo dõi tồn kho On-hand vs Reserved, tạo phiếu nhập/xuất kho, kiểm kê và tra cứu thẻ kho.',
      usersCount: 3,
      badge: 'bg-emerald-100 text-emerald-800'
    },
    {
      code: 'ROLE_CUSTOMER_SERVICE',
      name: 'CSKH & Xử lý Đơn',
      desc: 'Tiếp nhận đơn hàng, điều hướng Order State Machine, hỗ trợ khách hàng và giải quyết khiếu nại RMA.',
      usersCount: 5,
      badge: 'bg-blue-100 text-blue-800'
    },
    {
      code: 'ROLE_MARKETING',
      name: 'Marketing & Content',
      desc: 'Quản trị Banner chiến dịch, cấu hình mã giảm giá Voucher, thiết lập khung giờ Flash Sale.',
      usersCount: 2,
      badge: 'bg-purple-100 text-purple-800'
    }
  ];

  const permissionsMatrix = [
    { permission: 'CATALOG_READ', label: 'Xem danh mục & sản phẩm', superAdmin: true, warehouse: true, cskh: true, marketing: true },
    { permission: 'CATALOG_WRITE', label: 'Thêm, sửa, cấu hình schema & sản phẩm', superAdmin: true, warehouse: false, cskh: false, marketing: true },
    { permission: 'INVENTORY_READ', label: 'Tra cứu tồn kho & thẻ kho', superAdmin: true, warehouse: true, cskh: true, marketing: false },
    { permission: 'INVENTORY_WRITE', label: 'Tạo phiếu nhập/xuất kho & điều chỉnh', superAdmin: true, warehouse: true, cskh: false, marketing: false },
    { permission: 'ORDER_READ', label: 'Xem danh sách & chi tiết đơn hàng', superAdmin: true, warehouse: true, cskh: true, marketing: false },
    { permission: 'ORDER_WRITE', label: 'Chuyển trạng thái State Machine & vận chuyển', superAdmin: true, warehouse: false, cskh: true, marketing: false },
    { permission: 'MARKETING_READ', label: 'Xem Voucher & Flash Sale', superAdmin: true, warehouse: false, cskh: false, marketing: true },
    { permission: 'MARKETING_WRITE', label: 'Tạo Voucher, cấu hình Flash Sale & Banner', superAdmin: true, warehouse: false, cskh: false, marketing: true },
    { permission: 'ANALYTICS_READ', label: 'Xem Dashboard thống kê KPI & Doanh thu', superAdmin: true, warehouse: false, cskh: false, marketing: true },
    { permission: 'USER_MANAGE', label: 'Quản trị tài khoản & phân quyền hệ thống', superAdmin: true, warehouse: false, cskh: false, marketing: false },
  ];

  const activityLogs = [
    { staff: 'Nguyễn Quản Trị (Super Admin)', action: 'Cấu hình attribute_schema danh mục Điện Thoại', time: '10 phút trước', ip: '192.168.1.10' },
    { staff: 'Trần Thủ Kho (Quản lý Kho)', action: 'Tạo phiếu nhập kho 50 chiếc iPhone 15 Pro Max', time: '35 phút trước', ip: '192.168.1.12' },
    { staff: 'Lê CSKH (Đơn hàng)', action: 'Chuyển đơn ORD-2410271101 sang trạng thái PACKING', time: '1 giờ trước', ip: '192.168.1.15' },
    { staff: 'Phạm Marketing (Marketing)', action: 'Tạo mã voucher GIAM100K hạn mức 500 lượt', time: '2 giờ trước', ip: '192.168.1.18' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Phân Quyền Vai Trò RBAC & Nhật Ký Hoạt Động (Activity Logs)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống kiểm soát quyền hạn chi tiết cho 4 nhóm vai trò chính. Trên giao diện ReactJS, các nút bấm và menu được bảo vệ bằng component <code className="text-indigo-600 bg-white px-1.5 py-0.5 rounded font-mono font-bold border">&lt;PermissionGate&gt;</code>.
        </p>
      </div>

      {/* 4 Roles Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {roles.map((r) => {
          const isSelected = activeRole === r.code;
          return (
            <div
              key={r.code}
              className={`rounded-3xl border p-5 shadow-xs transition-all space-y-3 ${
                isSelected ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase ${r.badge}`}>
                  {r.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  {r.usersCount} nhân sự
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{r.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
              </div>

              <button
                onClick={() => loginAs(r.code)}
                className={`w-full rounded-xl py-2 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected ? 'Đang kích hoạt vai trò này' : 'Chuyển sang vai trò này'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Key className="h-4 w-4 text-indigo-600" />
            <span>Ma Trận Quyền Hạn Chi Tiết (Role-Permission Matrix)</span>
          </div>
          <span className="text-xs font-mono text-slate-400">@PreAuthorize("hasAuthority('...')")</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Quyền Hạn (Permission Authority)</th>
                <th className="py-3 px-4">Mô Tả Nghiệp Vụ</th>
                <th className="py-3 px-3 text-center">Super Admin</th>
                <th className="py-3 px-3 text-center">Quản Lý Kho</th>
                <th className="py-3 px-3 text-center">CSKH / Đơn</th>
                <th className="py-3 px-3 text-center">Marketing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((pm) => (
                <tr key={pm.permission} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{pm.permission}</td>
                  <td className="py-3 px-4 text-slate-700">{pm.label}</td>
                  <td className="py-3 px-3 text-center">
                    {pm.superAdmin ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <Lock className="h-3 w-3 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {pm.warehouse ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <Lock className="h-3 w-3 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {pm.cskh ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <Lock className="h-3 w-3 text-slate-300 mx-auto" />}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {pm.marketing ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <Lock className="h-3 w-3 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Activity Logs */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Activity className="h-4 w-4 text-indigo-600" />
          <h3 className="font-extrabold text-slate-900 text-sm">Nhật Ký Thao Tác Của Nhân Viên (Staff Activity Audit Logs)</h3>
        </div>

        <div className="space-y-2 text-xs">
          {activityLogs.map((log, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                  {log.staff.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{log.action}</div>
                  <div className="text-[11px] text-slate-400">Thực hiện bởi: <strong className="text-slate-600">{log.staff}</strong> • IP: {log.ip}</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
