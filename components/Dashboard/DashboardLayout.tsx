
import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus, Customer } from '../../types';
import Sidebar from './Sidebar';
import Header from './Header';
import LiveOrders, { OrderDetailsModal } from './LiveOrders';
import Analytics from './Analytics';
import Inventory, { ProductDetailModal } from './Inventory';
import ArrivalAlert from './ArrivalAlert';
import AddProductModal from '../forms/AddProductModal';
import AddCategoryModal from '../forms/AddCategoryModal';
import Users, { CustomerDetailModal } from './Users';
import Settings from './Settings';
import FeedbackFeed from './FeedbackFeed';
import { mockOrders } from '../../services/mockData';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, isDarkMode, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [isBusy, setIsBusy] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [arrivedOrder, setArrivedOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const pendingOrder = orders.find(o => o.status === OrderStatus.READY);
      if (pendingOrder && !arrivedOrder) {
        const updated = { ...pendingOrder, status: OrderStatus.ARRIVED };
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        setArrivedOrder(updated);
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2855/2855-preview.mp3');
        audio.play().catch(() => {}); 
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [orders, arrivedOrder]);

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    if (nextStatus === OrderStatus.COMPLETED) {
      setArrivedOrder(null);
    }
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders': 
        return <LiveOrders 
          orders={orders} 
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
      case 'analytics': return <Analytics isDarkMode={isDarkMode} />;
      case 'users': return <Users isDarkMode={isDarkMode} onSelectCustomer={setSelectedCustomer} />;
      case 'settings': return <Settings isDarkMode={isDarkMode} isBusy={isBusy} onToggleBusy={() => setIsBusy(!isBusy)} />;
      default: return <LiveOrders orders={orders} onUpdateStatus={handleUpdateStatus} onSelectOrder={setSelectedOrder} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden relative ${isDarkMode ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={onLogout} 
        isDarkMode={isDarkMode}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        <Header 
          user={user} 
          isBusy={isBusy} 
          onToggleBusy={() => setIsBusy(!isBusy)} 
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals - Rendered at root level to ensure they cover Header/Sidebar */}
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
