import { create } from 'zustand';
import { CartItem, Voucher } from '../types';

interface CartState {
  items: CartItem[];
  appliedVoucher: Voucher | null;
  discountAmount: number;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  setVoucher: (voucher: Voucher | null, discount: number) => void;
  setOpen: (open: boolean) => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  getFinalAmount: () => number;
}

const STORAGE_KEY = 'ecommerce_cart_v1';

function loadInitialItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Default demo item in cart
  return [
    {
      id: 1,
      variantId: 1,
      skuCode: 'IP15PM-TITAN-256',
      productName: 'iPhone 15 Pro Max',
      productSlug: 'iphone-15-pro-max',
      options: JSON.stringify({ color: 'Titan Tự Nhiên', storage: '256GB' }),
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
      price: 29990000,
      salePrice: 28490000,
      quantity: 1,
      subtotal: 28490000,
      availableStock: 48
    }
  ];
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadInitialItems(),
  appliedVoucher: null,
  discountAmount: 0,
  isOpen: false,

  addItem: (newItem) => {
    set((state) => {
      const existing = state.items.find(i => i.variantId === newItem.variantId);
      let updated: CartItem[];
      const effectivePrice = newItem.salePrice || newItem.price;

      if (existing) {
        updated = state.items.map(i => {
          if (i.variantId === newItem.variantId) {
            const newQty = i.quantity + newItem.quantity;
            return {
              ...i,
              quantity: newQty,
              subtotal: newQty * effectivePrice
            };
          }
          return i;
        });
      } else {
        const item: CartItem = {
          ...newItem,
          id: Date.now(),
          subtotal: newItem.quantity * effectivePrice
        };
        updated = [...state.items, item];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { items: updated, isOpen: true };
    });
  },

  updateQuantity: (variantId, quantity) => {
    set((state) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = state.items.filter(i => i.variantId !== variantId);
      } else {
        updated = state.items.map(i => {
          if (i.variantId === variantId) {
            const price = i.salePrice || i.price;
            return {
              ...i,
              quantity,
              subtotal: quantity * price
            };
          }
          return i;
        });
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { items: updated };
    });
  },

  removeItem: (variantId) => {
    set((state) => {
      const updated = state.items.filter(i => i.variantId !== variantId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { items: updated };
    });
  },

  clearCart: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ items: [], appliedVoucher: null, discountAmount: 0 });
  },

  setVoucher: (voucher, discount) => {
    set({ appliedVoucher: voucher, discountAmount: discount });
  },

  setOpen: (open) => set({ isOpen: open }),

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalAmount: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getFinalAmount: () => {
    const total = get().getTotalAmount();
    const discount = get().discountAmount;
    const shipping = 30000;
    return Math.max(0, total + shipping - discount);
  }
}));
