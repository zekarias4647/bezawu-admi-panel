import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus } from '../../types';
import { STATUS_MAP } from '../../constants';
import { ExternalLink, User as UserIcon, Package, X, Phone, CreditCard, Clock, Loader2, Sparkles, Search, CheckCircle, Zap, IceCream, Activity, Gift } from 'lucide-react';
import { playNotificationSound } from '../../services/soundService';
import FulfillmentView from '../FulfillmentView';
import { QrCode, MessageSquare } from 'lucide-react';
import ChatModal from './ChatModal';

interface LiveOrdersProps {
  onUpdateStatus?: (id: string, status: OrderStatus) => void;
  onRefresh?: () => void;
  onSelectOrder?: (order: Order) => void;
  isDarkMode: boolean;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const HandoverTimer = ({ start }: { start: string }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startDate = new Date(start).getTime();
    const update = () => {
      const now = new Date().getTime();
      setElapsed(Math.max(0, (now - startDate) / 1000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [start]);

  return <span className="font-mono">{formatDuration(elapsed)}</span>;
};

export const LiveOrders: React.FC<LiveOrdersProps> = ({ isDarkMode, onUpdateStatus, onRefresh, onSelectOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isFulfillmentActive, setIsFulfillmentActive] = useState(false);
  const [fulfillmentOrder, setFulfillmentOrder] = useState<Order | null>(null);
  const [selectedChatOrder, setSelectedChatOrder] = useState<Order | null>(null);
  const prevOrderIds = useRef<Set<string>>(new Set());

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://branchapi.bezawcurbside.com/api/orders/orders-get', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const currentIds = new Set(data.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.ARRIVED).map(o => o.id));
          prevOrderIds.current = currentIds;
          setOrders(data);
        } else {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('[LiveOrders] Failed to fetch orders', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://branchapi.bezawcurbside.com/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        if (onUpdateStatus) onUpdateStatus(id, status);
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const categories = [
    { label: 'New', status: OrderStatus.PENDING },
    { label: 'Preparing', status: OrderStatus.PREPARING },
    { label: 'Ready for Pickup', status: OrderStatus.READY },
    { label: 'Arrived', status: OrderStatus.ARRIVED },
  ];

  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = order.id.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower);

    // Filter by completion status
    let matchesStatus = false;
    if (showAll) {
      matchesStatus = true;
    } else if (showCompleted) {
      matchesStatus = order.status === OrderStatus.COMPLETED;
    } else if (selectedStatus === 'GIFT') {
      matchesStatus = order.isGift && order.status !== OrderStatus.COMPLETED;
    } else {
      matchesStatus = (order.status !== OrderStatus.COMPLETED && (!selectedStatus || order.status === selectedStatus));
    }

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center p-20 min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-green-500" size={40} />
        <p className="text-sm font-bold text-slate-500 animate-pulse">Syncing Operations...</p>
      </div>
    </div>;
  }

  if (isFulfillmentActive) {
    return (
      <FulfillmentView
        order={fulfillmentOrder}
        onBack={() => {
          setIsFulfillmentActive(false);
          setFulfillmentOrder(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        onOpenChat={(order) => {
          setSelectedChatOrder(order);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <div>
            <h1 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Active Operations</h1>
            <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-[10px] mt-0.5`}>Real-time drive-through fulfillment queue</p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`relative flex items-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Search className="absolute left-2.5 text-slate-500" size={12} />
              <input
                type="text"
                placeholder="Search order or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-7 pr-3 py-1.5 rounded-lg border text-[10px] font-bold w-48 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDarkMode
                  ? 'bg-[#121418] border-slate-800 placeholder:text-slate-600 focus:border-emerald-500'
                  : 'bg-white border-slate-200 placeholder:text-slate-400 focus:border-emerald-500'
                  }`}
              />
            </div>

            <button
              onClick={fetchOrders}
              className={`border px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
            </button>


          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setShowAll(!showAll);
            setShowCompleted(false);
            setSelectedStatus(null);
          }}
          className={`border px-2 py-1 rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-95 ${showAll
            ? 'bg-slate-900 border-slate-900 text-white shadow-slate-900/20 shadow-lg'
            : isDarkMode
              ? 'bg-slate-800/50 border-slate-800 hover:bg-slate-800'
              : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
        >
          <span className={`text-[8px] font-bold uppercase tracking-widest ${showAll ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>All</span>
          <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${showAll
            ? 'bg-white/20 text-white'
            : isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
            }`}>
            {orders.length}
          </div>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => {
              setShowAll(false);
              if (showCompleted) setShowCompleted(false);
              setSelectedStatus(selectedStatus === cat.status ? null : cat.status);
            }}
            className={`border px-2 py-1 rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-95 ${selectedStatus === cat.status
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20 shadow-lg'
              : isDarkMode
                ? 'bg-slate-800/50 border-slate-800 hover:bg-slate-800'
                : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
          >
            <span className={`text-[8px] font-bold uppercase tracking-widest ${selectedStatus === cat.status ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>{cat.label}</span>
            <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${selectedStatus === cat.status
              ? 'bg-white/20 text-white'
              : isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
              }`}>
              {orders.filter(o => o.status === cat.status).length}
            </div>
          </button>
        ))}

        {/* Gifts Filter */}
        <button
          onClick={() => {
            setShowAll(false);
            if (showCompleted) setShowCompleted(false);
            setSelectedStatus(selectedStatus === 'GIFT' ? null : 'GIFT' as any);
          }}
          className={`border px-2 py-1 rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-95 ${selectedStatus === 'GIFT'
            ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20 shadow-lg'
            : isDarkMode
              ? 'bg-slate-800/50 border-slate-800 hover:bg-slate-800'
              : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
        >
          <Gift size={12} className={selectedStatus === 'GIFT' ? 'text-white' : 'text-indigo-500'} />
          <span className={`text-[8px] font-bold uppercase tracking-widest ${selectedStatus === 'GIFT' ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>Gifts</span>
          <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${selectedStatus === 'GIFT'
            ? 'bg-white/20 text-white'
            : isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
            }`}>
            {orders.filter(o => o.isGift && o.status !== OrderStatus.COMPLETED).length}
          </div>
        </button>

        <button
          onClick={() => {
            setShowAll(false);
            setShowCompleted(!showCompleted);
            if (!showCompleted) setSelectedStatus(null);
          }}
          className={`border px-2 py-1 rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-95 ${showCompleted
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-600/20 shadow-lg'
            : isDarkMode
              ? 'bg-slate-800/50 border-slate-800 hover:bg-slate-800'
              : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
        >
          <span className={`text-[8px] font-bold uppercase tracking-widest ${showCompleted ? 'text-white' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}>Completed</span>
          <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${showCompleted
            ? 'bg-white/20 text-white'
            : isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
            }`}>
            {orders.filter(o => o.status === OrderStatus.COMPLETED).length}
          </div>
        </button>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-[#1a1d23] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <th className="px-3 py-2.5">Order ID</th>
                <th className="px-3 py-2.5">Client Info</th>
                <th className="px-3 py-2.5">Vehicle</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className={`p-4 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <Package size={40} className="text-slate-400" />
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No active orders found</p>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or waiting for new orders.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <Package size={12} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                        </div>
                        <span className={`text-[11px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.id}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <UserIcon size={10} className="text-green-500" />
                        </div>
                        <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{order.customerName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.car.model}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full border border-slate-700" style={{ backgroundColor: order.car.color.toLowerCase() }}></div>
                          <span className="text-[10px] font-mono text-green-500 font-bold tracking-wider">{order.car.plate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1 items-start">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${(order.status && STATUS_MAP[order.status as OrderStatus])
                          ? `${STATUS_MAP[order.status as OrderStatus].color.replace('text', 'bg').replace('400', '500')} bg-opacity-10 ${STATUS_MAP[order.status as OrderStatus].color}`
                          : 'bg-slate-500/10 text-slate-500'
                          }`}>
                          {(order.status && STATUS_MAP[order.status as OrderStatus]) ? STATUS_MAP[order.status as OrderStatus].icon : <Clock size={16} />}
                          {(order.status && STATUS_MAP[order.status as OrderStatus]) ? STATUS_MAP[order.status as OrderStatus].label : order.status || 'Unknown'}
                        </div>
                        {order.status === OrderStatus.ARRIVED && order.arrivedAt && (
                          <div className="text-[10px] font-bold text-orange-500 flex items-center gap-1 animate-pulse px-1">
                            <Clock size={10} />
                            <HandoverTimer start={order.arrivedAt} />
                          </div>
                        )}
                        {(['COMPLETED', 'VERIFIED', 'GIVEN'].includes(order.status) && order.handoverTimeSeconds) && (
                          <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 px-1">
                            <Clock size={10} />
                            <span>{formatDuration(order.handoverTimeSeconds)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.totalPrice.toLocaleString()} ETB</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedChatOrder(order)}
                          className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'bg-slate-100 text-indigo-500 hover:bg-slate-200'}`}
                          title="Chat with Customer"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button onClick={() => setSelectedOrder(order)} className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                          <ExternalLink size={14} />
                        </button>
                        <div className={`h-8 w-px mx-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                        {order.status && (order.status as string).toUpperCase() !== 'COMPLETED' && (order.status as string).toUpperCase() !== 'CANCELLED' && (
                          <div className="flex gap-2">
                            {(() => {
                              const s = (order.status as string).toUpperCase();
                              if (s === 'PENDING' || s === 'ACCEPTED') {
                                return (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, OrderStatus.PREPARING)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] font-bold px-2 py-1 rounded-lg transition-all shadow-md uppercase min-w-[70px] active:scale-95 flex items-center justify-center"
                                  >
                                    Prepare
                                  </button>
                                );
                              }
                              if (s === 'PREPARING') {
                                return (
                                  <button
                                    onClick={() => handleUpdateStatus(order.id, OrderStatus.READY)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-[8px] font-bold px-2 py-1 rounded-lg transition-all shadow-md uppercase min-w-[70px] active:scale-95 flex items-center justify-center"
                                  >
                                    Ready
                                  </button>
                                );
                              }
                              // For READY, ARRIVED, VERIFIED, GIVEN or anything else that is active
                              return (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, OrderStatus.COMPLETED)}
                                  className="bg-slate-900 hover:bg-black text-white text-[8px] font-bold px-2 py-1 rounded-lg transition-all shadow-md uppercase min-w-[70px] active:scale-95 flex items-center justify-center"
                                >
                                  Complete
                                </button>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {
        selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={(status) => handleUpdateStatus(selectedOrder.id, status)}
            onOpenFulfillment={(order) => {
              setFulfillmentOrder(order);
              setIsFulfillmentActive(true);
              setSelectedOrder(null);
            }}
            onOpenChat={(order) => {
              setSelectedChatOrder(order);
            }}
            isDarkMode={isDarkMode}
          />
        )
      }

      {selectedChatOrder && (
        <ChatModal
          order={selectedChatOrder}
          onClose={() => setSelectedChatOrder(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div >
  );
};

const JITAlert = ({ eta, isDarkMode, orderId }: { eta?: number, isDarkMode: boolean, orderId: string }) => {
  // Use mock ETA if not provided to ensure the feature is visible
  const currentEta = eta ?? (orderId.charCodeAt(0) % 15 + 1);

  const isCritical = currentEta <= 0.5;
  const isPreparing = currentEta <= 3 && currentEta > 0.5;

  return (
    <div className="space-y-4">
      {/* Real Google Maps Visual */}
      <div className={`relative h-48 rounded-2xl overflow-hidden border shadow-inner ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
        <iframe
          title="JIT Logistics Map"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, filter: isDarkMode ? 'invert(90%) hue-rotate(180deg) brightness(0.9)' : 'none' }}
          src={`https://maps.google.com/maps?q=${9.0322 + (currentEta * 0.002)},${38.7460 + (currentEta * 0.002)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
        ></iframe>

        <div className="absolute top-4 left-6 z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Live Telemetry Link</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
            <Activity size={12} className="text-indigo-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{currentEta.toFixed(1)}m to Hub</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-6 z-10">
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 flex items-center gap-2">
            <Package size={14} />
            Branch Arrival Point
          </div>
        </div>
      </div>

      {/* Logic-based Alerts */}
      {isCritical ? (
        <div className="bg-rose-500 text-white p-4 rounded-2xl flex items-center gap-4 animate-pulse shadow-2xl shadow-rose-500/40 border border-rose-400/50">
          <div className="p-3 bg-white/20 rounded-xl">
            <Zap className="fill-white" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-80">Logistics Critical</p>
            <p className="text-xl font-bold tracking-tighter">GO TO CURB NOW</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-80">Arrival In</p>
            <p className="text-xl font-bold tracking-tighter">~30s</p>
          </div>
        </div>
      ) : isPreparing ? (
        <div className="bg-amber-500 text-white p-4 rounded-2xl flex items-center gap-4 shadow-2xl shadow-amber-500/30 border border-amber-400/50">
          <div className="p-3 bg-white/20 rounded-xl text-white">
            <IceCream className="fill-white" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-80">Quality Control</p>
            <p className="text-xl font-bold tracking-tighter">PACK FROZEN GOODS</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-80">In Range</p>
            <p className="text-xl font-bold tracking-tighter">~{Math.ceil(currentEta)}m</p>
          </div>
        </div>
      ) : (
        <div className={`p-4 rounded-2xl flex items-center gap-4 border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-indigo-500/20' : 'bg-white shadow-sm'}`}>
            <Activity size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-60">Foresight Sync</p>
            <p className={`text-xl font-bold tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>APPROACHING SITE</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-60">Estimated Arrival</p>
            <p className={`text-xl font-bold tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{Math.ceil(currentEta)} mins</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const OrderDetailsModal: React.FC<{
  order: Order,
  onClose: () => void,
  onUpdateStatus: (status: OrderStatus) => void,
  onOpenFulfillment: (order: Order) => void,
  onOpenChat: (order: Order) => void,
  isDarkMode: boolean
}> = ({ order, onClose, onUpdateStatus, onOpenFulfillment, onOpenChat, isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-3xl w-full max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
        }`}>
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-colors ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
              <Package className="text-green-500" size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Order Details</h2>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-0.5">REFERENCE #{order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
          {/* Predictive Logistics Feature */}
          <div className="mb-6 mt-4">
            <JITAlert eta={order.etaMinutes} isDarkMode={isDarkMode} orderId={order.id} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">CLIENT INFORMATION</h3>
                <div className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-[#0f1115] border border-slate-800' : 'bg-[#f8fafc] border border-slate-200'}`}>
                  <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-500 border border-green-200">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone size={10} className="text-slate-400" />
                      <p className="text-[10px] text-slate-500 font-medium">+251 911 223 344</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">VEHICLE INFO</h3>
                <div className={`p-4 rounded-xl space-y-3 transition-colors ${isDarkMode ? 'bg-[#0f1115] border border-slate-800' : 'bg-[#f8fafc] border border-slate-200'}`}>
                  <div className="flex justify-between items-center"><span className="text-[10px] font-medium text-slate-500">Model</span><span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.car.model}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[10px] font-medium text-slate-500">Color</span><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: order.car.color.toLowerCase() }}></div><span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.car.color}</span></div></div>
                  <div className="pt-3 border-t border-slate-200/50 flex justify-between items-center"><span className="text-[10px] font-medium text-slate-500">License Plate</span><span className="text-sm font-mono font-bold text-green-500 tracking-widest">{order.car.plate}</span></div>
                </div>
              </div>
            </div>
            <div className="space-y-6 flex flex-col">
              <div className="flex-1">
                <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">ORDER ITEMS</h3>
                <div className={`rounded-2xl border overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="divide-y divide-slate-200/50">
                    {order.items.map((item) => (
                      <div key={item.id} className={`p-4 hover:bg-slate-50/50 transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border flex-shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>{item.quantity}x</div>
                            <div>
                              <span className={`text-sm font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                              {/* Bundle Items with Addons */}
                              {item.bundleItems && item.bundleItems.length > 0 && (
                                <div className="mt-2.5 space-y-2 pl-2">
                                  {item.bundle_addons && item.bundle_addons.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {item.bundle_addons.map((addon: any, aIdx: number) => (
                                        <span key={`ba-${aIdx}`} className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-tight">
                                          + {addon.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="h-px w-4 bg-slate-200/50" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Bundle Contents</span>
                                  </div>
                                  {item.bundleItems.map((bItem, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                        <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                                        {bItem.quantity > 1 && <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{bItem.quantity}x </span>}
                                        {bItem.name}
                                      </div>
                                      {Array.isArray(bItem.selected_addons) && bItem.selected_addons.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pl-3">
                                          {bItem.selected_addons.map((addon, aIdx) => (
                                            <span key={aIdx} className="text-[8px] text-indigo-400 font-bold tracking-tight">+ {addon.name}</span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Gift Items with Addons */}
                              {item.giftItems && item.giftItems.length > 0 && (
                                <div className="mt-2.5 space-y-2 pl-2">
                                  {item.gift_addons && item.gift_addons.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {item.gift_addons.map((addon: any, aIdx: number) => (
                                        <span key={`ga-${aIdx}`} className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-tight">
                                          + {addon.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="h-px w-4 bg-indigo-200/30" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/70">Gift Contents</span>
                                  </div>
                                  {item.giftItems.map((gItem, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                        <div className="w-1 h-1 rounded-full bg-indigo-400/40"></div>
                                        {gItem.quantity > 1 && <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{gItem.quantity}x </span>}
                                        {gItem.name}
                                      </div>
                                      {Array.isArray(gItem.selected_addons) && gItem.selected_addons.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pl-3">
                                          {gItem.selected_addons.map((addon, aIdx) => (
                                            <span key={aIdx} className="text-[8px] text-indigo-400 font-bold tracking-tight">+ {addon.name}</span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {Array.isArray(item.selected_addons) && item.selected_addons.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {item.selected_addons.map((addon: any, idx: number) => (
                                    <span key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                                      + {addon.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-slate-400 whitespace-nowrap">{item.price} ETB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`p-5 border-t flex justify-between items-center transition-colors ${isDarkMode ? 'bg-[#0a0c10] border-slate-800' : 'bg-[#fcfdfe] border-slate-100'}`}>
                    <span className="text-base font-bold text-slate-400">Total</span>
                    <span className="text-xl font-bold text-green-500 tracking-tight">{order.totalPrice.toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>

              {order.paymentProofUrl ? (
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-colors ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 self-start">PAYMENT PROOF</h3>
                  <img src={`https://branchapi.bezawcurbside.com/uploads/${order.paymentProofUrl}`} alt="Payment Proof" className="max-h-64 object-contain rounded-xl w-full" />
                </div>
              ) : (
                <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-colors ${isDarkMode ? 'bg-green-500/5 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <CreditCard size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">PAYMENT CONFIRMED (DIGITAL)</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`p-5 flex items-center justify-between border-t transition-colors shrink-0 ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-[#f8fafc] border-slate-100'}`}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
            {(order.status && STATUS_MAP[order.status as OrderStatus]) ? (
              <>
                {STATUS_MAP[order.status as OrderStatus].icon}
                {STATUS_MAP[order.status as OrderStatus].label}
              </>
            ) : (
              <>
                <Clock size={14} />
                {order.status || 'Unknown'}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onOpenChat(order)}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 text-indigo-500 hover:bg-slate-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
              title="Chat with Customer"
            >
              <MessageSquare size={16} />
            </button>
            <button onClick={onClose} className="w-32 py-2.5 rounded-xl text-xs font-bold transition-all bg-slate-800 text-white hover:bg-slate-700">Close</button>
          </div>
        </div>
      </div >
    </div >
  );
};

export default LiveOrders;
