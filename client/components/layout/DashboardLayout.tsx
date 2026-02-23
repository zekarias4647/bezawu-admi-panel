
import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus, Customer, BranchStatus, GridStatus } from '../../types';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';
import LiveOrders, { OrderDetailsModal } from '../Dashboard/LiveOrders';
import Analytics from '../Dashboard/Analytics';
import Inventory, { ProductDetailModal } from '../Dashboard/Inventory';
import SpecialPackages from '../Dashboard/SpecialPackages';
import ArrivalAlert from '../Dashboard/ArrivalAlert';
import AddProductModal from '../forms/AddProductModal';
import AddCategoryModal from '../forms/AddCategoryModal';
import AddBundleModal from '../forms/AddBundleModal';
import Users, { CustomerDetailModal } from '../Dashboard/Users';
import Settings from '../Dashboard/Settings';
import FeedbackFeed from '../Dashboard/FeedbackFeed';
import Reports from '../Dashboard/Reports';
import GlobalTermination from '../../shutdown/GlobalTermination';
import BranchOffline from '../Dashboard/BranchOffline';

import OmniLockdown from '../../shutdown/OmniLockdown';
// import Ads from '../Dashboard/Ads';
import AddAdModal from '../forms/AddAdModal';
import Stories from '../Dashboard/Stories';
import AddStoryModal from '../forms/AddStoryModal';
import Gifts from '../Dashboard/Gifts';
import Runners from '../Dashboard/Runners';
import AddRunnerModal from '../forms/AddRunnerModal';

// ... other imports ...


interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, isDarkMode, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [isBusy, setIsBusy] = useState(user.isBusy);
  const [arrivedOrder, setArrivedOrder] = useState<Order | null>(null);
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0);
  const [bundlesRefreshKey, setBundlesRefreshKey] = useState(0);
  const [storiesRefreshKey, setStoriesRefreshKey] = useState(0);
  const [adsRefreshKey, setAdsRefreshKey] = useState(0);
  const [runnersRefreshKey, setRunnersRefreshKey] = useState(0);
  const [giftsRefreshKey, setGiftsRefreshKey] = useState(0);

  const handleToggleBusy = async () => {
    const nextBusy = !isBusy;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://branchapi.ristestate.com/api/settings/toggle-busy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBusy: nextBusy })
      });

      if (response.ok) {
        setIsBusy(nextBusy);
      }
    } catch (err) {
      console.error('Failed to toggle busy status:', err);
    }
  };
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const notifiedArrivals = React.useRef<Set<string>>(new Set());
  const notifiedPending = React.useRef<Set<string>>(new Set());

  // Status Management
  const [gridStatus, setGridStatus] = useState<GridStatus>(GridStatus.ONLINE);
  const [branchStatus, setBranchStatus] = useState<BranchStatus>(BranchStatus.ACTIVE);

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const [isAddBundleOpen, setIsAddBundleOpen] = useState(false);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isAddAdOpen, setIsAddAdOpen] = useState(false);
  const [isAddRunnerOpen, setIsAddRunnerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const checkGlobalAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const { playNotificationSound } = await import('../../services/soundService');

      // 1. Check Arrivals
      const arrivalRes = await fetch('https://branchapi.ristestate.com/api/orders/arrivals-get', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (arrivalRes.ok) {
        const arrivals = await arrivalRes.json();
        const newArrival = arrivals.find((a: Order) => !notifiedArrivals.current.has(a.id));
        if (newArrival) {
          setArrivedOrder(newArrival);
          notifiedArrivals.current.add(newArrival.id);
          playNotificationSound();
        }
      }

      // 2. Check Pending Orders (Global Sound)
      const orderRes = await fetch('https://branchapi.ristestate.com/api/orders/orders-get', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (orderRes.ok) {
        const orders = await orderRes.json();
        const newPending = orders.find((o: Order) => o.status === OrderStatus.PENDING && !notifiedPending.current.has(o.id));
        if (newPending) {
          notifiedPending.current.add(newPending.id);
          playNotificationSound();
        }

        // Sync notifiedPending to remove orders that are no longer pending
        const currentPendingIds = new Set(orders.filter((o: Order) => o.status === OrderStatus.PENDING).map((o: Order) => o.id));
        notifiedPending.current = new Set([...notifiedPending.current].filter(id => currentPendingIds.has(id)));
      }
    } catch (err) {
      console.error('Global alert check failed:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkGlobalAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://branchapi.ristestate.com/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        if (nextStatus === OrderStatus.COMPLETED) {
          setArrivedOrder(null);
        }
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
        }
        // Force refresh if LiveOrders is active or just wait for next poll
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <LiveOrders
          onUpdateStatus={handleUpdateStatus}
          onSelectOrder={setSelectedOrder}
          isDarkMode={isDarkMode}
        />;
      case 'reports':
        return <Reports isDarkMode={isDarkMode} />;
      case 'feedback':
        return <FeedbackFeed isDarkMode={isDarkMode} />;
      case 'inventory':
        return <Inventory
          key={inventoryRefreshKey}
          isDarkMode={isDarkMode}
          onAddProduct={() => setIsAddProductOpen(true)}
          onSelectProduct={setSelectedProduct}
        />;

        // ... (inside return JSX)

        {
          selectedProduct && (
            <ProductDetailModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onRefresh={() => setInventoryRefreshKey(prev => prev + 1)}
              isDarkMode={isDarkMode}
            />
          )
        }
      case 'packages':
        return <SpecialPackages
          key={bundlesRefreshKey}
          isDarkMode={isDarkMode}
          onAddPackage={() => setIsAddBundleOpen(true)}
        />;
      case 'stories':
        return <Stories
          key={storiesRefreshKey}
          isDarkMode={isDarkMode}
          onAddStory={() => setIsAddStoryOpen(true)}
        />;
      // case 'ads':
      //   return <Ads
      //     key={adsRefreshKey}
      //     isDarkMode={isDarkMode}
      //     onAddAd={() => setIsAddAdOpen(true)}
      //   />;
      case 'gifts': return <Gifts
        key={giftsRefreshKey}
        isDarkMode={isDarkMode}
        onSuccess={() => setGiftsRefreshKey(prev => prev + 1)}
      />;
      case 'analytics': return <Analytics isDarkMode={isDarkMode} />;
      case 'runners': return <Runners
        key={runnersRefreshKey}
        isDarkMode={isDarkMode}
        onAddRunner={() => setIsAddRunnerOpen(true)}
      />;
      case 'users': return <Users isDarkMode={isDarkMode} onSelectCustomer={setSelectedCustomer} />;
      case 'settings': return <Settings
        isDarkMode={isDarkMode}
        isBusy={isBusy}
        onToggleBusy={handleToggleBusy}
        onShutdownBranch={() => setBranchStatus(BranchStatus.SHUTDOWN)}
        onShutdownGrid={() => setGridStatus(GridStatus.DARK)}
        onOmniShutdown={() => setGridStatus(GridStatus.OMNI_DARK)}
      />;
      default: return <LiveOrders onUpdateStatus={handleUpdateStatus} onSelectOrder={setSelectedOrder} isDarkMode={isDarkMode} />;
    }
  };

  // Handle Shutdown States
  if (gridStatus === GridStatus.OMNI_DARK) {
    return <OmniLockdown onRestore={() => setGridStatus(GridStatus.ONLINE)} />;
  }

  if (gridStatus === GridStatus.DARK) {
    return <GlobalTermination onRestore={() => setGridStatus(GridStatus.ONLINE)} />;
  }

  if (branchStatus === BranchStatus.SHUTDOWN) {
    return (
      <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} isDarkMode={isDarkMode} />
        <div className="flex-1 relative">
          <BranchOffline branchName={user.branchName} onRestore={() => setBranchStatus(BranchStatus.ACTIVE)} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full overflow-hidden relative ${isDarkMode ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        isDarkMode={isDarkMode}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <Header
          user={user}
          isBusy={isBusy}
          onToggleBusy={handleToggleBusy}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />

        {/* Fill the gap by setting pt-2 instead of py-4/6 */}
        <main className="flex-1 overflow-y-auto px-4 pt-1 pb-6 lg:px-6 lg:pt-2 custom-scrollbar">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(status) => handleUpdateStatus(selectedOrder.id, status)}
          isDarkMode={isDarkMode}
        />
      )}

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {arrivedOrder && (
        <ArrivalAlert
          order={arrivedOrder}
          onClose={() => setArrivedOrder(null)}
          onComplete={() => handleUpdateStatus(arrivedOrder.id, OrderStatus.COMPLETED)}
          isDarkMode={isDarkMode}
        />
      )}

      {isAddProductOpen && (
        <AddProductModal
          onClose={() => setIsAddProductOpen(false)}
          onAddCategory={() => setIsAddCategoryOpen(true)}
          onSuccess={() => setInventoryRefreshKey(prev => prev + 1)}
          isDarkMode={isDarkMode}
          user={user}
        />
      )}

      {isAddCategoryOpen && (
        <AddCategoryModal
          onClose={() => setIsAddCategoryOpen(false)}
          onSuccess={() => setInventoryRefreshKey(prev => prev + 1)}
          isDarkMode={isDarkMode}
        />
      )}

      {isAddBundleOpen && (
        <AddBundleModal
          onClose={() => setIsAddBundleOpen(false)}
          onSuccess={() => setBundlesRefreshKey(prev => prev + 1)}
          isDarkMode={isDarkMode}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onRefresh={() => setInventoryRefreshKey(prev => prev + 1)}
          isDarkMode={isDarkMode}
        />
      )}

      {isAddStoryOpen && (
        <AddStoryModal
          onClose={() => setIsAddStoryOpen(false)}
          onSuccess={() => setStoriesRefreshKey(prev => prev + 1)}
          isDarkMode={isDarkMode}
        />
      )}

      {isAddAdOpen && (
        <AddAdModal
          isOpen={isAddAdOpen}
          onClose={() => setIsAddAdOpen(false)}
          onSuccess={() => setAdsRefreshKey(prev => prev + 1)}
          isDarkMode={isDarkMode}
        />
      )}

      {isAddRunnerOpen && (
        <AddRunnerModal
          onClose={() => setIsAddRunnerOpen(false)}
          onSuccess={() => setRunnersRefreshKey(prev => prev + 1)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
