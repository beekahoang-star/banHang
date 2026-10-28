import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { CartDrawer } from './modules/storefront/CartDrawer';
import { HomePage } from './modules/storefront/HomePage';
import { ProductListingPage } from './modules/storefront/ProductListingPage';
import { ProductDetailPage } from './modules/storefront/ProductDetailPage';
import { CheckoutPage } from './modules/storefront/CheckoutPage';
import { OrderSuccessPage } from './modules/storefront/OrderSuccessPage';
import { AdminLayout } from './modules/admin/AdminLayout';
import { AdminDashboard } from './modules/admin/AdminDashboard';
import { CategoryManager } from './modules/admin/CategoryManager';
import { ProductFormDynamic } from './modules/admin/ProductFormDynamic';
import { InventoryManager } from './modules/admin/InventoryManager';
import { OrderManager } from './modules/admin/OrderManager';
import { MarketingManager } from './modules/admin/MarketingManager';
import { RbacManager } from './modules/admin/RbacManager';

type AppView = 'home' | 'listing' | 'product' | 'checkout' | 'order-success' | 'admin';

const detectInitialView = (): AppView => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (hash === '#admin' || hash.startsWith('#admin/') || path === '/admin' || path.startsWith('/admin/')) {
      return 'admin';
    }
  }
  return 'home';
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(detectInitialView);
  const [viewPayload, setViewPayload] = useState<any>({});
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  // Sync URL hash with view state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash.startsWith('#admin/')) {
        setCurrentView('admin');
      } else if (hash === '#checkout') {
        setCurrentView('checkout');
      } else if (currentView === 'admin' && (hash === '' || hash === '#/')) {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const handleNavigate = (view: string, payload: any = {}) => {
    setCurrentView(view as AppView);
    setViewPayload(payload);
    setMegaMenuOpen(false);

    if (view === 'admin') {
      window.location.hash = '#admin';
    } else if (window.location.hash.startsWith('#admin')) {
      window.location.hash = '#/';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin portal
  if (currentView === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onNavigateStorefront={() => handleNavigate('home')}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
        {adminTab === 'categories' && <CategoryManager />}
        {adminTab === 'create-product' && <ProductFormDynamic />}
        {adminTab === 'inventory' && <InventoryManager />}
        {adminTab === 'orders' && <OrderManager />}
        {ad