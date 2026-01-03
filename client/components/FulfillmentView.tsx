
import React, { useState, useEffect } from 'react';
import {
    Car,
    User as UserIcon,
    Package,
    ChevronLeft,
    Phone,
    CheckCircle2,
    MapPin,
    Clock,
    Battery,
    Wifi,
    Signal,
    QrCode,
    ArrowRight,
    Receipt,
    ShieldCheck
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { mockOrders } from '../../services/mockData';

interface FulfillmentViewProps {
    onBack: () => void;
    isDarkMode: boolean;
}

const FulfillmentView: React.FC<FulfillmentViewProps> = ({ onBack, isDarkMode }) => {
    const [activeOrder, setActiveOrder] = useState<Order>(mockOrders[2]); // Using "Ready" order
    const [pickedItems, setPickedItems] = useState<Set<string>>(new Set());
    const [isConfirmed, setIsConfirmed] = useState(false);

    const toggleItem = (id: string) => {
        const next = new Set(pickedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setPickedItems(next);
    };

    const allPicked = pickedItems.size === activeOrder.items.length;

    const handleConfirm = () => {
        if (allPicked) {
            setIsConfirmed(true);
            // Logic for delivery confirmation would go here
        }
    };

    if (isConfirmed) {
        return (
            <div className={`h-screen w-full max-w-[450px] mx-auto flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500 ${isDarkMode ? 'bg-[#0f1115] text-white' : 'bg-slate-50 text-slate-900'
                }`}>
                <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/40 animate-bounce">
                    <ShieldCheck size={48} />
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-4 uppercase">Handover Complete</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
                    The transaction for Order #{activeOrder.id} has been successfully closed and synchronized with the central ledger.
                </p>
                <button
                    onClick={onBack}
                    className="mt-12 bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                    Return to Hub
                </button>
            </div>
        );
    }

    return (
        <div className={`h-screen w-full max-w-[450px] mx-auto overflow-hidden flex flex-col relative shadow-2xl border-x ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
            {/* Liquid Background Orbs */}
            <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-morph"></div>
            <div className="absolute bottom-[20%] left-[-15%] w-72 h-72 bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none animate-morph" style={{ animationDelay: '-5s' }}></div>

            {/* Mobile Status Bar */}
            <div className="h-10 px-6 flex items-center justify-between opacity-60 relative z-10">
                <span className="text-xs font-black tracking-tight">9:41</span>
                <div className="flex items-center gap-2">
                    <Signal size={14} />
                    <Wifi size={14} />
                    <Battery size={14} />
                </div>
            </div>

            {/* Tactical Header */}
            <header className="px-6 py-3 flex items-center justify-between border-b border-slate-800/20 relative z-10 backdrop-blur-md bg-transparent">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">NODE_TERMINAL_04</p>
                    <h2 className="text-xs font-black tracking-widest uppercase mt-0.5">ZONE A / CURB 02</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <QrCode size={18} />
                </div>
            </header>

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar relative z-10">

                {/* Order Status Badge */}
                <div className="flex justify-center">
                    <div className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-3 shadow-lg shadow-emerald-500/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic">Target Arrived & Verified</span>
                    </div>
                </div>

                {/* Client Identity Card */}
                <section className={`p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group ${isDarkMode ? 'bg-[#121418]/80 border-slate-800 shadow-xl backdrop-blur-sm' : 'bg-white border-slate-200'
                    }`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <UserIcon size={120} className="-mr-10 -mt-10" />
                    </div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="h-16 w-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                            <UserIcon size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black tracking-tight leading-none">{activeOrder.customerName}</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2 flex items-center gap-1.5">
                                PLATINUM_MEMBER <span className="text-emerald-500/50">#</span>{activeOrder.id}
                            </p>
                        </div>
                        <a href={`tel:+251911000000`} className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20">
                            <Phone size={20} />
                        </a>
                    </div>
                </section>

                {/* Vehicle Matching Matrix */}
                <section className={`p-6 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#121418]/80 border-slate-800 shadow-xl backdrop-blur-sm' : 'bg-white border-slate-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-6">
                        <Car size={16} className="text-emerald-500" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VEHICLE IDENTIFICATION</h4>
                    </div>
                    <div className="flex justify-between items-center bg-[#0a0c10] p-6 rounded-[1.8rem] border border-slate-800/50 shadow-inner group transition-all hover:border-emerald-500/30">
                        <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Plate Number</p>
                            <p className="text-2xl font-mono font-black tracking-tighter text-white group-hover:text-emerald-500 transition-colors">{activeOrder.car.plate}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Visual Profile</p>
                            <p className="text-lg font-black text-emerald-500 tracking-tight leading-none">{activeOrder.car.color} <br /> {activeOrder.car.model}</p>
                        </div>
                    </div>
                </section>

                {/* Fulfillment Checklist */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Package size={16} className="text-emerald-500" />
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ORDER MANIFEST</h4>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all ${allPicked ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
                            }`}>
                            {pickedItems.size}/{activeOrder.items.length} LOADED
                        </span>
                    </div>

                    <div className="space-y-3">
                        {activeOrder.items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={`p-5 rounded-[1.8rem] border flex items-center justify-between transition-all cursor-pointer active:scale-95 ${pickedItems.has(item.id)
                                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                                        : isDarkMode ? 'bg-[#121418]/60 border-slate-800 backdrop-blur-sm' : 'bg-white border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border transition-all ${pickedItems.has(item.id)
                                            ? 'bg-emerald-500 text-white border-emerald-400'
                                            : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                                        }`}>
                                        {pickedItems.has(item.id) ? <CheckCircle2 size={18} /> : item.quantity}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black transition-all ${pickedItems.has(item.id) ? 'line-through text-slate-500 scale-95 origin-left' : ''}`}>
                                            {item.name}
                                        </p>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">Ref SKU: {item.id}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Total Price Section - Financial Summary */}
                <section className={`p-6 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20 shadow-xl backdrop-blur-md' : 'bg-emerald-50 border-emerald-200 shadow-sm'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <Receipt size={16} className="text-emerald-500" />
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">FINANCIAL SETTLEMENT</h4>
                    </div>
                    <div className="flex items-end justify-between">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Account Total</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black tracking-tighter text-emerald-500">{activeOrder.totalPrice.toLocaleString()}</span>
                                <span className="text-xs font-black text-emerald-600/60 italic uppercase">ETB</span>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-slate-200 shadow-inner'
                            }`}>
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Paid In Full</span>
                        </div>
                    </div>
                </section>

                {/* Operational Telemetry */}
                <div className="grid grid-cols-2 gap-4 pb-4">
                    <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#121418]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <Clock size={16} className="text-blue-500 mb-2" />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wait Time</p>
                        <p className={`text-base font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>4m 12s</p>
                    </div>
                    <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-[#121418]/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <MapPin size={16} className="text-orange-500 mb-2" />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Proximity</p>
                        <p className={`text-base font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>DOCKED</p>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <footer className={`p-6 border-t relative z-20 ${isDarkMode ? 'bg-[#121418]/90 border-slate-800 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'
                }`}>
                <button
                    onClick={handleConfirm}
                    disabled={!allPicked}
                    className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl relative overflow-hidden group ${allPicked
                            ? 'bg-emerald-600 text-white shadow-emerald-500/30 active:scale-[0.97]'
                            : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/30'
                        }`}
                >
                    {allPicked && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    )}
                    {isConfirmed ? 'SYNCHRONIZING...' : 'CONFIRM HANDOVER'}
                    {!isConfirmed && <ArrowRight size={18} className={allPicked ? 'animate-bounce-x' : ''} />}
                </button>
            </footer>

            <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
        @keyframes morph {
          0% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; transform: rotate(0deg); }
          34% { border-radius: 70% 30% 46% 54% / 30% 29% 71% 70%; }
          67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
          100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; transform: rotate(360deg); }
        }
        .animate-morph {
          animation: morph 20s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default FulfillmentView;
