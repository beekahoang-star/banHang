import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  activeRole: string; // Used for interactive RBAC testing in demo
  isAuthenticated: boolean;
  loginAs: (roleCode: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const PRESET_USERS: Record<string, User> = {
  ROLE_SUPER_ADMIN: {
    id: 1,
    email: 'admin@ecommerce.com',
    fullName: 'Nguyễn Quản Trị (Super Admin)',
    roles: ['ROLE_SUPER_ADMIN'],
    permissions: [
      'CATALOG_READ', 'CATALOG_WRITE',
      'INVENTORY_READ', 'INVENTORY_WRITE',
      'ORDER_READ', 'ORDER_WRITE',
      'MARKETING_READ', 'MARKETING_WRITE',
      'ANALYTICS_READ', 'USER_MANAGE'
    ]
  },
  ROLE_WAREHOUSE_MANAGER: {
    id: 2,
    email: 'warehouse@ecommerce.com',
    fullName: 'Trần Thủ Kho (Quản lý Kho)',
    roles: ['ROLE_WAREHOUSE_MANAGER'],
    permissions: ['CATALOG_READ', 'INVENTORY_READ', 'INVENTORY_WRITE', 'ORDER_READ']
  },
  ROLE_CUSTOMER_SERVICE: {
    id: 3,
    email: 'cskh@ecommerce.com',
    fullName: 'Lê CSKH (Đơn hàng & Khiếu nại)',
    roles: ['ROLE_CUSTOMER_SERVICE'],
    permissions: ['CATALOG_READ', 'ORDER_READ', 'ORDER_WRITE', 'INVENTORY_READ']
  },
  ROLE_MARKETING: {
    id: 4,
    email: 'marketing@ecommerce.com',
    fullName: 'Phạm Marketing (Voucher & CMS)',
    roles: ['ROLE_MARKETING'],
    permissions: ['CATALOG_READ', 'CATALOG_WRITE', 'MARKETING_READ', 'MARKETING_WRITE', 'ANALYTICS_READ']
  },
  ROLE_CUSTOMER: {
    id: 5,
    email: 'customer@ecommerce.com',
    fullName: 'Hoàng Mua Hàng (Khách hàng)',
    roles: ['ROLE_CUSTOMER'],
    permissions: []
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: PRESET_USERS.ROLE_SUPER_ADMIN,
  activeRole: 'ROLE_SUPER_ADMIN',
  isAuthenticated: true,

  loginAs: (roleCode: string) => {
    const selected = PRESET_USERS[roleCode] || PRESET_USERS.ROLE_CUSTOMER;
    set({
      user: selected,
      activeRole: roleCode,
      isAuthenticated: true
    });
  },

  logout: () => {
    set({
      user: null,
      activeRole: 'ANONYMOUS',
      isAuthenticated: false
    });
    localStorage.removeItem('token');
  },

  hasRole: (role: string) => {
    const { user, activeRole } = get();
    if (!user) return false;
    return activeRole === role || user.roles.includes('ROLE_SUPER_ADMIN');
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.roles.includes('ROLE_SUPER_ADMIN')) return true;
    return user.permissions.includes(permission);
  }
}));
