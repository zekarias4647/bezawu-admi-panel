
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
import GlobalTermination from '../../shutdown/GlobalTermination';
import BranchOffline from '../Dashboard/BranchOffline';
import OmniLockdown from '../../shutdown/OmniLockdown';


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

  const handleToggleBusy = async () => {
    const nextBusy = !isBusy;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/settings/toggle-busy', {
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

  // Status Management
  const [gridStatus, setGridStatus] = useState<GridStatus>(GridStatus.ONLINE);
  const [branchStatus, setBranchStatus] = useState<BranchStatus>(BranchStatus.ACTIVE);

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddBundleOpen, setIsAddBundleOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const checkArrivals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/arrivals-get', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const arrivals = await response.json();
        if (arrivals.length > 0) {
          const newArrival = arrivals.find((a: Order) => !notifiedArrivals.current.has(a.id));
          if (newArrival) {
            setArrivedOrder(newArrival);
            notifiedArrivals.current.add(newArrival.id);
            // Play sound for arrival
            const { playNotificationSound } = await import('../../services/soundService');
            playNotificationSound();
          }
        }
      }
    } catch (err) {
      console.error('Failed to check arrivals:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkArrivals, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
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
      case 'feedback':
        return <FeedbackFeed isDarkMode={isDarkMode} />;
      case 'inventory':
        return <Inventory
          isDarkMode={isDarkMode}
          onAddProduct={() => setIsAddProductOpen(true)}
          onSelectProduct={setSelectedProduct}
        />;
      case 'packages':
        return <SpecialPackages
          isDarkMode={isDarkMode}
          onAddPackage={() => setIsAddBundleOpen(true)}
        />;
      case 'analytics': return <Analytics isDarkMode={isDarkMode} />;
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
    <div className={`flex h-screen w-screen overflow-hidden relative ${isDarkMode ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
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
        <main className="flex-1 overflow-y-auto px-6 pt-2 pb-8 lg:px-10 lg:pt-4 custom-scrollbar">
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
          isDarkMode={isDarkMode}
        />
      )}

      {isAddCategoryOpen && (
        <AddCategoryModal
          onClose={() => setIsAddCategoryOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {isAddBundleOpen && (
        <AddBundleModal
          onClose={() => setIsAddBundleOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
