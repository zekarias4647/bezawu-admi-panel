
import React, { useState } from 'react';
import { 
  Search, Filter, User as UserIcon, Calendar, DollarSign, 
  ExternalLink, X, ShoppingBag, CreditCard, ChevronRight, 
  Package, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { Customer, CustomerPurchase, OrderStatus } from '../../types';
import { STATUS_MAP } from '../../constants';

export const mockCustomers: Customer[] = [
  {
    id: 'C-901',
    name: 'Dawit Getachew',
    phone: '+251 911 223 344',
    email: 'dawit.g@gmail.com',
    totalOrders: 14,
    totalSpent: 42500,
    lastPurchase: '2023-10-24',
    purchases: [
      { id: 'BZ-4021', date: 'Oct 24', amount: 1450, itemsCount: 3, status: OrderStatus.COMPLETED },
      { id: 'BZ-3882', date: 'Oct 15', amount: 3200, itemsCount: 5, status: OrderStatus.COMPLETED },
      { id: 'BZ-3510', date: 'Sep 28', amount: 890, itemsCount: 2, status: OrderStatus.COMPLETED },
      { id: 'BZ-3200', date: 'Sep 12', amount: 4500, itemsCount: 7, status: OrderStatus.COMPLETED },
      { id: 'BZ-3100', date: 'Aug 30', amount: 2100, itemsCount: 4, status: OrderStatus.COMPLETED },
    ]
  },
  {
    id: 'C-902',
    name: 'Sara Ahmed',
    phone: '+251 912 556 778',
    email: 'sara.ahmed@outlook.com',
    totalOrders: 8,
    totalSpent: 18400,
    lastPurchase: '2023-10-20',
    purchases: [
      { id: 'BZ-4022', date: 'Oct 20', amount: 2800, itemsCount: 1, status: OrderStatus.COMPLETED },
      { id: 'BZ-3901', date: 'Oct 10', amount: 1200, itemsCount: 4, status: OrderStatus.COMPLETED },
      { id: 'BZ-3700', date: 'Sep 15', amount: 3500, itemsCount: 6, status: OrderStatus.COMPLETED },
    ]
  },
  {
    id: 'C-903',
    name: 'Yonas Tadesse',
    phone: '+251 944 112 233',
    email: 'yonas.t@yahoo.com',
    totalOrders: 25,
    totalSpent: 85200,
    lastPurchase: '2023-10-25',
    purchases: [
      { id: 'BZ-4023', date: 'Oct 25', amount: 620, itemsCount: 2, status: OrderStatus.COMPLETED },
      { id: 'BZ-4001', date: 'Oct 22', amount: 4500, itemsCount: 8, status: OrderStatus.COMPLETED },
      { id: 'BZ-3950', date: 'Oct 18', amount: 7200, itemsCount: 12, status: OrderStatus.COMPLETED },
      { id: 'BZ-3800', date: 'Oct 05', amount: 2100, itemsCount: 3, status: OrderStatus.COMPLETED },
    ]
  },
];

interface UsersProps {
  isDarkMode: boolean;
  onSelectCustomer: (customer: Customer) => void;
}

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-[#1a1d23]/90 border-slate-700' : 'bg-white/90 border-slate-200'
      }`}>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Spend: <span className="text-green-500">{payload[0].value.toLocaleString()} ETB</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PurchaseDetailModal: React.FC<{ purchase: CustomerPurchase, onClose: () => void, isDarkMode: boolean }> = ({ purchase, onClose, isDarkMode }) => {
  const mockItems = [
    { name: 'Organic Bananas', qty: 2, price: 45 },
    { name: 'Fresh Milk 1L', qty: 1, price: 85 },
    { name: 'Whole Grain Bread', qty: 1, price: 60 },
    { name: 'Coffee Beans 500g', qty: 1, price: 450 },
    { name: 'Butter 250g', qty: 2, price: 120 }
  ].slice(0, purchase.itemsCount);

  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className={`max-w-lg w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-[#1a1d23] border-slate-700' : 'bg-white border-slate-200 shadow-xl'
      }`}>
        <div className="p-8 border-b border-slate-700/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-xl">
              <ShoppingBag size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Transaction Detail</h3>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">#{purchase.id}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Timeline</span>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{purchase.date}, 2023</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</span>
              <div>
                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                  {STATUS_MAP[purchase.status].label}
                </span>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-5 border ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Manifest</p>
            <div className="space-y-3">
              {mockItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-green-500">{item.qty}x</span>
                    <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-500">{item.price} ETB</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-700/10 flex justify-between items-end">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</p>
              <p className="text-3xl font-black text-green-500 tracking-tighter">{purchase.amount.toLocaleString()} <span className="text-xs font-normal text-slate-600 tracking-normal ml-1">ETB</span></p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <button 
            onClick={onClose}
            className="w-full bg-[#0f172a] hover:bg-black text-white font-black py-4 rounded-xl transition-all shadow-xl active:scale-95 text-[10px] uppercase tracking-widest"
          >
            DISMISS TRANSACTION
          </button>
        </div>
      </div>
    </div>
  );
};

export const CustomerDetailModal: React.FC<{ customer: Customer, onClose: () => void, isDarkMode: boolean }> = ({ customer, onClose, isDarkMode }) => {
  const [selectedPurchase, setSelectedPurchase] = useState<CustomerPurchase | null>(null);
  const chartData = [...customer.purchases].reverse();

  return (
    <div className={`fixed inset-0 z-[100000] animate-in fade-in duration-300 flex items-center justify-center p-0 md:p-6 overflow-hidden backdrop-blur-[2px] ${
      isDarkMode ? 'bg-black/25' : 'bg-slate-900/10'
    }`}>
      <div className={`w-full max-w-5xl h-full md:h-[90vh] flex flex-col md:rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] transition-all border animate-in zoom-in-95 duration-500 ${
        isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className={`px-10 py-10 flex items-center justify-between border-b relative z-20 ${isDarkMode ? 'bg-[#121418] border-slate-800/80' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-[#f0fdf4] border-green-100'}`}>
              <UserIcon className="text-green-500" size={32} />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] text-[#94a3b8] uppercase font-black tracking-widest">CLIENT IDENTITY: {customer.id}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]/30"></div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></div>
                  <p className="text-[10px] text-[#22c55e] uppercase font-black tracking-widest">ACTIVE LINK</p>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-500 hover:text-white' : 'bg-[#f8fafc] text-[#94a3b8] hover:text-[#475569]'}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-10 custom-scrollbar bg-inherit relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div className="space-y-6">
              <div className={`p-8 rounded-[2rem] border transition-all flex justify-between items-center ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-[#f8fafc] border-slate-200'}`}>
                <div>
                  <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mb-3">LIFETIME CONTRIBUTION</p>
                  <p className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>{customer.totalSpent.toLocaleString()}</p>
                </div>
                <span className="text-xs font-black text-[#94a3b8] uppercase italic">ETB</span>
              </div>
              <div className={`p-8 rounded-[2rem] border transition-all flex justify-between items-center ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-[#f8fafc] border-slate-200'}`}>
                <div>
                  <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest mb-3">TRANSACTION VELOCITY</p>
                  <p className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>{customer.totalOrders}</p>
                </div>
                <span className="text-xs font-black text-[#94a3b8] uppercase italic">LOGS</span>
              </div>
            </div>

            <div className={`p-8 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-[#f1f5f9]'}`}>
              <h3 className={`text-[10px] font-black tracking-widest uppercase mb-8 ${isDarkMode ? 'text-slate-400' : 'text-[#94a3b8]'}`}>COMMERCIAL ANALYTICS TRAJECTORY</h3>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUserLine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(value) => `${value/1000}k`} />
                    <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                    <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} fill="url(#colorUserLine)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <Clock size={18} className="text-[#22c55e]" />
            <h3 className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'}`}>
              FULFILLMENT HISTORY LEDGER
            </h3>
          </div>

          <div className={`border rounded-[2rem] overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-[#f1f5f9] shadow-sm'}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#1a1d23] text-slate-500' : 'bg-[#fcfdfe] text-[#94a3b8]'}`}>
                  <th className="px-8 py-5">REFERENCE</th>
                  <th className="px-8 py-5">TIMELINE</th>
                  <th className="px-8 py-5">VALUE</th>
                  <th className="px-8 py-5 text-right">INSPECT</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-[#f1f5f9]'}`}>
                {customer.purchases.map((purchase) => (
                  <tr key={purchase.id} className={`transition-colors group cursor-pointer h-16 ${isDarkMode ? 'hover:bg-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-[#475569]'}`} onClick={() => setSelectedPurchase(purchase)}>
                    <td className="px-8 py-4 font-mono text-[11px] font-black italic tracking-tighter text-[#22c55e]/70 group-hover:text-[#22c55e]">#{purchase.id}</td>
                    <td className="px-8 py-4 text-[11px] font-bold uppercase">{purchase.date}, 2023</td>
                    <td className="px-8 py-4 text-sm font-black">{purchase.amount.toLocaleString()} <span className="text-[10px] text-slate-400">ETB</span></td>
                    <td className="px-8 py-4 text-right">
                      <div className={`inline-flex p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-[#f8fafc] text-[#94a3b8] group-hover:text-[#22c55e]'}`}>
                        <ArrowRight size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`px-10 py-8 flex items-center justify-between border-t ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-[#fcfdfe] border-[#f1f5f9]'}`}>
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-[#f1f5f9] text-[#94a3b8] shadow-inner'}`}>
               <CreditCard size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">PROTOCOL TIER</p>
              <p className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>PLATINUM ELITE ACCESS</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-[#0f172a] hover:bg-black text-white px-14 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">
            DISMISS CLIENT VIEW
          </button>
        </div>

        {selectedPurchase && <PurchaseDetailModal purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
};

const Users: React.FC<UsersProps> = ({ isDarkMode, onSelectCustomer }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Branch <span className="text-emerald-600">Customers</span>
          </h1>
          <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm mt-1 flex items-center gap-2 font-bold uppercase tracking-widest`}>
            <UserIcon size={14} className="text-emerald-500" />
            Strategic Client Management & History
          </p>
        </div>
      </div>

      <div className={`border rounded-[2.5rem] overflow-hidden transition-colors ${
        isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b text-[10px] font-bold uppercase tracking-widest ${
                isDarkMode ? 'bg-[#1a1d23] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <th className="px-8 py-5">Client Identity</th>
                <th className="px-8 py-5">Contact Vector</th>
                <th className="px-8 py-5">Order Velocity</th>
                <th className="px-8 py-5">Contribution</th>
                <th className="px-8 py-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {mockCustomers.map((customer) => (
                <tr key={customer.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-green-500' : 'bg-white border-slate-200 text-green-600 shadow-sm'
                      }`}>
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{customer.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter italic">#{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className={`text-xs font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{customer.phone}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isDarkMode ? 'bg-slate-800 text-emerald-500' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {customer.totalOrders}
                      </div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Logs</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {customer.totalSpent.toLocaleString()} <span className="text-[10px] text-slate-500 tracking-normal ml-0.5">ETB</span>
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => onSelectCustomer(customer)}
                      className={`p-3 rounded-xl transition-all ${
                        isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-emerald-600'
                      }`}
                    >
                      <ExternalLink size={18} />
                    </button>
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

export default Users;
