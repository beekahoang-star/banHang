import React, { useState } from 'react';
import {
  LayoutDashboard, FolderTree, PlusSquare, Warehouse,
  ShoppingBag, Tag, Shield, Store, Menu, X, ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { PermissionGate } from '../../components/common/PermissionGate';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateStorefront: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onNavigateStorefront,
  children
}) => {
  const { user, activeRole, loginAs } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & KPI', icon: LayoutDashboard, permission: 'ANALYTICS_READ' },
    { id: 'categories', label: 'Cấu hình Danh mục (Schema)', icon: FolderTree, permission: 'CATALOG_WRITE' },
    { id: 'create-product', label: 'Tạo sản phẩm', icon: PlusSquare, permission: 'CATALOG_WRITE' },
    { id: 'inventory', label: 'Quản lý Kho & Thẻ kho', icon: Warehouse, permission: 'INVENTORY_READ' },
    { id: 'orders', label: 'Đơn hàng (State Machine)', icon: ShoppingBag, permission: 'ORDER_READ' },
    { id: 'marketing', label: 'Marketing & Voucher CMS', icon: Tag, permission: 'MARKETING_WRITE' },
    { id: 'rbac', label: 'Phân quyền RBAC & Nhật ký', icon: Shield, permission: 'USER_MANAGE' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shadow">
              A
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base leading-none block">
                NEXUSTORE ADMIN
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                Hệ Thống Quản Trị Trung Tâm
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* RBAC Role Switcher (Admin Internal Tool) */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs">
            <Shield className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline text-slate-500 font-medium">Tài khoản:</span>
            <select
              value={activeRole}
              onChange={(e) => loginAs(e.target.value)}
              className="bg-transparent font-bold text-indigo-700 outline-none cursor-pointer py-0.5 text-xs"
              title="Chuyển đổi vai trò để kiểm thử phân quyền RBAC"
            >
              <option value="ROLE_SUPER_ADMIN">Nguyễn Quản Trị (Super Admin)</option>
              <option value="ROLE_WAREHOUSE_MANAGER">Trần Thủ Kho (Quản lý Kho)</option>
              <option value="ROLE_CUSTOMER_SERVICE">Lê CSKH (Đơn hàng & CSKH)</option>
              <option value="ROLE_MARKETING">Phạm Marketing (Voucher & CMS)</option>
            </select>
          </div>

          <button
            onClick={onNavigateStorefront}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Store className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Về</span>
            <span>Storefront</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 pt-16' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Phân Hệ Quản Trị
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <PermissionGate key={item.id} permission={item.permission}>
                  <button
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/50'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                </PermissionGate>
              );
            })}
          </div>

          <div className="p-4 mt-8 mx-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span>Kiểm Thử Quyền</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Các mục menu được bảo vệ bởi thẻ <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">&lt;PermissionGate&gt;</code>. Khi đổi vai trò trên thanh Header, menu sẽ tự động ẩn/hiện tương ứng.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
