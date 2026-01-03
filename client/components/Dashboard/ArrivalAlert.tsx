
import React from 'react';
import { Order } from '../../types';
import { Car, X, MapPin, ScanLine } from 'lucide-react';

interface ArrivalAlertProps {
  order: Order;
  onClose: () => void;
  onComplete: () => void;
  isDarkMode: boolean;
}

const ArrivalAlert: React.FC<ArrivalAlertProps> = ({ order, onClose, onComplete, isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-[540px] w-full rounded-[2.5rem] shadow-2xl transition-all border animate-in zoom-in-95 duration-200 overflow-hidden relative ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
        }`}>
        <div className="p-12 pb-10 flex flex-col items-center">
          <button
            onClick={onClose}
            className={`absolute top-10 right-10 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <X size={28} />
          </button>

          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full border border-green-500/20 bg-green-500/5 flex items-center justify-center">
              <Car className="text-green-500 w-12 h-12" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
          </div>

          <h2 className={`text-4xl font-bold tracking-tight text-center mb-2 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
            CUSTOMER ARRIVED
          </h2>
          <p className="text-slate-400 text-base font-medium text-center">
            Immediate pickup zone action required
          </p>
        </div>

        <div className="px-12 pb-12">
          <div className={`rounded-[2rem] border transition-colors p-8 space-y-8 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-[#f8fafc] border-slate-200'
            }`}>
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Vehicle Match</p>
                <div>
                  <h3 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.car.model}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{order.car.color}</p>
                </div>
                <div className="bg-[#e9f9ef] text-[#22c55e] px-4 py-3 rounded-2xl border border-[#22c55e]/10 inline-block">
                  <span className="font-mono text-xl font-bold tracking-[0.15em]">{order.car.plate}</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Order Details</p>
                <div>
                  <h3 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.customerName}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{order.items.length} Packages ready</p>
                </div>
                <div className="flex items-center gap-2.5 pt-2">
                  <div className="text-green-500">
                    <ScanLine size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest leading-none">Ready for QR scan</span>
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
              }`}>
              <div className="bg-green-500/10 p-2 rounded-lg">
                <MapPin size={18} className="text-green-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                Station: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zone A - Curb 02</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-10">
            <button
              onClick={onClose}
              className={`py-5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1]'
                }`}
            >
              NOT NOW
            </button>
            <button
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl text-sm tracking-widest uppercase shadow-[0_10px_30_rgba(34,197,94,0.4)] transition-all transform active:scale-[0.98]"
            >
              CONFIRM HANDOVER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrivalAlert;
