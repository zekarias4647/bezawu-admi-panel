
import React from 'react';
import { Order, OrderStatus } from '../../types';
import { STATUS_MAP } from '../../constants';
import { ExternalLink, User as UserIcon, Package, X, Phone, CreditCard, Clock } from 'lucide-react';

interface LiveOrdersProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onSelectOrder: (order: Order) => void;
  isDarkMode: boolean;
}

export const LiveOrders: React.FC<LiveOrdersProps> = ({ orders, onUpdateStatus, onSelectOrder, isDarkMode }) => {
  const categories = [
    { label: 'New', status: OrderStatus.PENDING },
    { label: 'Preparing', status: OrderStatus.PREPARING },
    { label: 'Ready for Pickup', status: OrderStatus.READY },
    { label: 'Arrived', status: OrderStatus.ARRIVED },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Active Operations</h1>
          <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm mt-1`}>Real-time drive-through fulfillment queue</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.label} className={`border px-4 py-1.5 rounded-lg transition-colors flex items-center gap-3 ${
              isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{cat.label}</span>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {orders.filter(o => o.status === cat.status).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-[#1a1d23] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Client Info</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {orders.map((order) => (
                <tr key={order.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <Package size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                      </div>
                      <span className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>#{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <UserIcon size={14} className="text-green-500" />
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{order.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{order.car.model}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 rounded-full border border-slate-700" style={{ backgroundColor: order.car.color.toLowerCase() }}></div>
                        <span className="text-[11px] font-mono text-green-500 font-bold tracking-wider">{order.car.plate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      STATUS_MAP[order.status].color.replace('text', 'bg').replace('400', '500')
                    } bg-opacity-10 ${STATUS_MAP[order.status].color}`}>
                      {STATUS_MAP[order.status].icon}
                      {STATUS_MAP[order.status].label}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.totalPrice.toLocaleString()} ETB</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onSelectOrder(order)} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <ExternalLink size={16} />
                      </button>
                      <div className={`h-8 w-px mx-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                      {order.status === OrderStatus.PENDING && (
                        <button onClick={() => onUpdateStatus(order.id, OrderStatus.PREPARING)} className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-md uppercase">Pick</button>
                      )}
                      {order.status === OrderStatus.PREPARING && (
                        <button onClick={() => onUpdateStatus(order.id, OrderStatus.READY)} className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-md uppercase">Ready</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const OrderDetailsModal: React.FC<{ order: Order, onClose: () => void, onUpdateStatus: (status: OrderStatus) => void, isDarkMode: boolean }> = ({ order, onClose, onUpdateStatus, isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-4xl w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
              <Package className="text-green-500" size={32} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Order Details</h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-1">REFERENCE #{order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
            <X size={28} />
          </button>
        </div>
        <div className="px-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">CLIENT INFORMATION</h3>
                <div className={`p-6 rounded-[2rem] flex items-center gap-5 transition-colors ${isDarkMode ? 'bg-[#0f1115] border border-slate-800' : 'bg-[#f8fafc] border border-slate-200'}`}>
                  <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-500 border border-green-200">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone size={14} className="text-slate-400" />
                      <p className="text-sm text-slate-500 font-medium">+251 911 223 344</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">VEHICLE INFO</h3>
                <div className={`p-8 rounded-[2rem] space-y-5 transition-colors ${isDarkMode ? 'bg-[#0f1115] border border-slate-800' : 'bg-[#f8fafc] border border-slate-200'}`}>
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-500">Model</span><span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.car.model}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-500">Color</span><div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: order.car.color.toLowerCase() }}></div><span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.car.color}</span></div></div>
                  <div className="pt-5 border-t border-slate-200/50 flex justify-between items-center"><span className="text-sm font-medium text-slate-500">License Plate</span><span className="text-lg font-mono font-bold text-green-500 tracking-widest">{order.car.plate}</span></div>
                </div>
              </div>
            </div>
            <div className="space-y-8 flex flex-col">
              <div className="flex-1">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3">ORDER ITEMS</h3>
                <div className={`rounded-[2rem] border overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="divide-y divide-slate-200/50">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>{item.quantity}x</div>
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-400">{item.price} ETB</span>
                      </div>
                    ))}
                  </div>
                  <div className={`p-8 border-t flex justify-between items-center transition-colors ${isDarkMode ? 'bg-[#0a0c10] border-slate-800' : 'bg-[#fcfdfe] border-slate-100'}`}>
                    <span className="text-lg font-bold text-slate-400">Total</span>
                    <span className="text-3xl font-bold text-green-500 tracking-tight">{order.totalPrice.toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>
              <div className={`p-5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-4 transition-colors ${isDarkMode ? 'bg-green-500/5 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <CreditCard size={24} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">PAYMENT CONFIRMED (DIGITAL)</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`p-10 flex items-center justify-between border-t transition-colors ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-[#f8fafc] border-slate-100'}`}>
          <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}><Clock size={16} />{STATUS_MAP[order.status].label}</div>
          <div className="flex gap-4">
            <button onClick={onClose} className={`px-10 py-4 rounded-2xl text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1]'}`}>Close</button>
            {order.status === OrderStatus.PENDING && (
              <button onClick={() => { onUpdateStatus(OrderStatus.PREPARING); onClose(); }} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-12 py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-95">Start Picking</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveOrders;
