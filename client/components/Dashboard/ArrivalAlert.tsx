import React from 'react';
import { Order } from '../../types';
import { Car, X, MapPin, ScanLine, ArrowRight, Check } from 'lucide-react';

interface ArrivalAlertProps {
  order: Order;
  onClose: () => void;
  onComplete: () => void;
  isDarkMode: boolean;
}

const ArrivalAlert: React.FC<ArrivalAlertProps> = ({ order, onClose, onComplete, isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md overflow-y-auto py-8 px-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-center min-h-full">
        <div className={`max-w-[400px] w-full rounded-3xl shadow-2xl transition-all border overflow-hidden relative group ${isDarkMode ? 'bg-[#0F1115] border-slate-800 shadow-emerald-900/20' : 'bg-white border-slate-100 shadow-xl'
          }`}>
          {/* Ambient Background Glow */}
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="p-6 pt-8 flex flex-col items-center relative z-10">
            <button
              onClick={onClose}
              className={`absolute top-5 right-5 p-2 rounded-full transition-all ${isDarkMode
                ? 'text-slate-500 hover:text-white hover:bg-white/5'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
            >
              <X size={20} />
            </button>

            {/* Animated Icon */}
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-50 animate-pulse"></div>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg relative z-10 transition-transform duration-500 ${isDarkMode ? 'bg-[#1A1D24] border-slate-800' : 'bg-white border-slate-50 shadow-emerald-100'
                }`}>
                <Car className="text-emerald-500 w-8 h-8" strokeWidth={1.5} />
              </div>
              {/* Status Indicator */}
              <div className="absolute -top-1 -right-1 flex h-5 w-5 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className={`relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-4 ${isDarkMode ? 'border-[#0F1115]' : 'border-white'
                  }`}></span>
              </div>
            </div>

            <h2 className={`text-2xl font-bold tracking-tight text-center mb-1.5 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
              Customer Arrived
            </h2>
            <p className="text-slate-400 text-xs font-medium text-center max-w-[240px] leading-relaxed">
              Vehicle detected at the pickup zone. Please prepare for immediate handover.
            </p>
          </div>

          <div className="px-5 pb-5">
            <div className={`rounded-3xl p-1.5 ${isDarkMode ? 'bg-[#16181D]' : 'bg-slate-50'
              }`}>
              <div className={`rounded-2xl border px-5 py-6 relative overflow-hidden ${isDarkMode ? 'bg-[#0F1115] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                {/* Pattern bg */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="space-y-6 relative">
                  {/* Vehicle Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Vehicle</p>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.car.model}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{order.car.color}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-center border ${isDarkMode ? 'bg-[#1A1D24] border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}>
                      <p className="text-[9px] text-slate-500 font-bold mb-0.5 uppercase">Plate</p>
                      <span className={`font-mono text-base font-bold tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`}>{order.car.plate}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className={`h-px w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

                  {/* Order Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                        <ScanLine size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Customer</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{order.customerName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#1A1D24]/50 border-slate-800/50' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex justify-between items-start flex-col sm:flex-row gap-2">
                            <div className="flex items-start gap-2.5">
                              <span className="text-[10px] font-black text-emerald-500">{item.quantity}x</span>
                              <div>
                                <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.name}</span>
                                {item.selected_addons && item.selected_addons.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {item.selected_addons.map((addon: any, aIdx: number) => (
                                      <span key={aIdx} className="text-[8px] text-indigo-400 font-bold">+ {addon.name}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.price} ETB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full px-1 mb-1">
                <button
                  onClick={onClose}
                  className={`w-full py-3 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all ${isDarkMode
                    ? 'bg-[#16181D] text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrivalAlert;
