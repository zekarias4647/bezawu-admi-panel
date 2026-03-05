
import React, { useState, useEffect } from 'react';
import { Gift, Plus, Search, Trash2, Eye, EyeOff, Loader2, ImageIcon, DollarSign, X, Tag, TextQuote, Save, Info, Filter, ArrowRight, Package, Sparkles, Zap } from 'lucide-react';
import AddGiftModal from '../forms/AddGiftModal';

interface GiftItemRecord {
    id: number;
    product_id: string;
    name: string;
    price: string;
    quantity: number;
    image_url: string;
    selected_addons?: any[];
}

interface GiftItem {
    id: number;
    name: string;
    description: string;
    price: string;
    image_url: string;
    is_active: boolean;
    created_at: string;
    items?: GiftItemRecord[];
    gift_addons?: any[];
}

interface GiftsProps {
    isDarkMode: boolean;
    onSuccess?: () => void;
}

const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://branchapi.bezawcurbside.com${url.startsWith('/') ? '' : '/'}${url}`;
};

export const Gifts: React.FC<GiftsProps> = ({ isDarkMode, onSuccess }) => {
    const [gifts, setGifts] = useState<GiftItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchGifts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://branchapi.bezawcurbside.com/api/gifts/gifts-get', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGifts(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGifts();
    }, []);

    const handleToggle = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://branchapi.bezawcurbside.com/api/gifts/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchGifts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this gift?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://branchapi.bezawcurbside.com/api/gifts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchGifts();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredGifts = gifts.filter(gift =>
        gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (gift.description && gift.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
                <p className={`text-sm font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Syncing Gift Protocols</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>User Gifts</h1>
                    <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-xs font-bold mt-1.5 flex items-center gap-2 uppercase tracking-widest`}>
                        <Info size={12} className="text-green-500" /> Administrative Gift Manifest Management
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search Gift Manifest..."
                            className={`pl-10 pr-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 text-xs font-bold w-56 ${isDarkMode ? 'bg-[#121418] border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 group"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-[10px] uppercase tracking-widest">Initiate Gift</span>
                    </button>
                </div>
            </div>

            {/* List Table Section */}
            <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#1a1d23] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <th className="px-6 py-4">Gift Asset</th>
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Valuation</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {filteredGifts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className={`p-8 rounded-[2rem] ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                                <Gift size={64} className="text-slate-400 opacity-20" />
                                            </div>
                                            <div>
                                                <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Manifest Empty</p>
                                                <p className="text-sm text-slate-500 mt-2">No gift protocols found matching your criteria</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredGifts.map((gift) => (
                                    <tr
                                        key={gift.id}
                                        className={`group transition-all hover:bg-green-500/[0.02] cursor-pointer`}
                                        onClick={() => setSelectedGift(gift)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-slate-800/10 shadow-sm transition-transform group-hover:scale-105">
                                                {gift.image_url ? (
                                                    <img src={getImageUrl(gift.image_url) || ''} alt={gift.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`flex items-center justify-center h-full ${isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <ImageIcon size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{gift.name}</span>
                                                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Ref ID: GIFT-{gift.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign size={14} className="text-green-500" />
                                                <span className={`text-sm font-black font-mono ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{parseFloat(gift.price).toFixed(2)}</span>
                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">ETB</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${gift.is_active ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                <span className={`w-1 h-1 rounded-full ${gift.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                                {gift.is_active ? 'Online' : 'Vaulted'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggle(gift.id)}
                                                    className={`p-2 rounded-lg border transition-all ${gift.is_active ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500/10' : 'border-green-500/20 text-green-500 hover:bg-green-500/10'}`}
                                                    title={gift.is_active ? 'Hide Protocol' : 'Deploy Protocol'}
                                                >
                                                    {gift.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(gift.id)}
                                                    className="p-2 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"
                                                    title="Terminal Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <div className="w-px h-4 bg-slate-800/10 mx-1"></div>
                                                <button onClick={() => setSelectedGift(gift)} className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'} hover:scale-110 active:scale-90 transition-all`}>
                                                    <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedGift && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-500">
                    <div className={`max-w-6xl w-full rounded-[2.5rem] shadow-2xl transition-all border-0 animate-in zoom-in-95 duration-500 relative overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
                        {/* Decorative Background Accents */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>

                        {/* Banner Section with Parallax-like feel */}
                        <div className="relative h-48 overflow-hidden group">
                            {selectedGift.image_url ? (
                                <img
                                    src={getImageUrl(selectedGift.image_url) || ''}
                                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                    alt={selectedGift.name}
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                    <Gift size={80} className="text-slate-800 opacity-50" />
                                </div>
                            )}
                            <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-slate-950 via-slate-950/40' : 'from-slate-50 via-white/40'} to-transparent`}></div>

                            {/* Animated Scanning Line */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent h-1/2 w-full animate-[scan_4s_linear_infinite] opacity-30"></div>

                            <div className="absolute top-8 left-8">
                                <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                                    <span className="text-[10px] text-white font-black uppercase tracking-[0.3em]">Protocol Detail Analysis</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedGift(null)}
                                className="absolute top-8 right-8 p-3 rounded-2xl bg-black/20 text-white hover:bg-rose-500/80 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:rotate-90 group"
                            >
                                <X size={24} className="group-hover:scale-110" />
                            </button>
                        </div>

                        {/* Content Section with Glassmorphic Overlap */}
                        <div className="px-10 pb-10 -mt-16 relative z-10">
                            {/* Floating Header Card */}
                            <div className={`p-8 rounded-3xl border backdrop-blur-2xl shadow-xl mb-10 flex flex-col lg:flex-row items-center justify-between gap-8 transition-all hover:shadow-green-500/5 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                            <Gift size={36} className="text-white" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 border-4 border-slate-900 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {selectedGift.name}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-3">
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedGift.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                <div className={`w-2 h-2 rounded-full ${selectedGift.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`}></div>
                                                {selectedGift.is_active ? 'Deployment Active' : 'Protocol Vaulted'}
                                            </div>
                                            <div className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <Tag size={10} />
                                                GIFT-{selectedGift.id.toString().padStart(4, '0')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Exchange Valuation</p>
                                        <div className="flex items-baseline justify-end gap-2 group cursor-pointer">
                                            <span className={`text-5xl font-black tabular-nums transition-colors group-hover:text-green-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {parseFloat(selectedGift.price).toLocaleString()}
                                            </span>
                                            <span className="text-sm font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/20 tracking-tighter uppercase transition-all group-hover:scale-110">ETB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Dashboard Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* LEFT: Intelligence Column */}
                                <div className="lg:col-span-4 space-y-8">
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                                <TextQuote size={16} />
                                            </div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 underline decoration-green-500/30 underline-offset-8">Tactical Briefing</h3>
                                        </div>
                                        <div className={`p-6 rounded-3xl border transition-all hover:bg-green-500/5 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                            <p className={`text-base leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {selectedGift.description || "Analytical briefing missing for this reward protocol."}
                                            </p>
                                        </div>
                                    </section>

                                    {((selectedGift.gift_addons && selectedGift.gift_addons.length > 0) || (selectedGift.items?.some(item => item.selected_addons && item.selected_addons.length > 0))) && (
                                        <section>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Zap size={16} />
                                                </div>
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 underline decoration-blue-500/30 underline-offset-8">Enhancements</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {/* Global Gift Addons */}
                                                {selectedGift.gift_addons?.map((addon, i) => (
                                                    <div key={`gift-addon-${i}`} className={`flex items-center justify-between p-3 rounded-2xl border group transition-all hover:border-blue-500/50 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-400 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{addon.name}</span>
                                                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Gift Protocol Option</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">+{addon.price} ETB</div>
                                                    </div>
                                                ))}

                                                {/* Product Specific Addons (Aggregated) */}
                                                {selectedGift.items?.flatMap(item =>
                                                    (item.selected_addons || []).map((addon, ai) => (
                                                        <div key={`item-addon-${item.id}-${ai}`} className={`flex items-center justify-between p-3 rounded-2xl border group transition-all hover:border-green-500/50 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-150 transition-transform"></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-slate-400 group-hover:text-green-400 transition-colors uppercase tracking-tight">{addon.name}</span>
                                                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Ref: {item.name}</span>
                                                                </div>
                                                            </div>
                                                            {addon.price && <div className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">+{addon.price} ETB</div>}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </section>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`p-5 rounded-3xl border transition-all flex flex-col gap-2 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Creation Vector</span>
                                            <span className="text-sm font-black uppercase tracking-tight">
                                                {new Date(selectedGift.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className={`p-5 rounded-3xl border transition-all flex flex-col gap-2 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Type</span>
                                            <span className="text-sm font-black uppercase tracking-tight text-blue-500">Tier-1 Award</span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: Asset Manifest Grid */}
                                <div className="lg:col-span-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Package size={16} />
                                            </div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 underline decoration-blue-500/30 underline-offset-8">Manifested Assets ({selectedGift.items?.length || 0})</h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedGift.items && selectedGift.items.length > 0 ? selectedGift.items.map((item, i) => (
                                            <div key={i} className={`p-5 rounded-3xl border group transition-all hover:shadow-lg hover:-translate-y-1 ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-green-500/40' : 'bg-white border-slate-200 hover:border-green-300'}`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-800/10 shadow-inner shrink-0">
                                                            {item.image_url ? (
                                                                <img src={getImageUrl(item.image_url) || ''} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                                    <Package size={20} className="text-slate-600" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className={`text-base font-black block group-hover:text-green-500 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                                <Sparkles size={8} className="text-green-500" /> Resource Verified
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="px-2 py-1 rounded-lg bg-green-500/10 text-green-500 font-black text-[10px]">QTY: {item.quantity}</div>
                                                            <span className="text-[10px] font-black tabular-nums text-slate-500 tracking-tight">{item.price} ETB/U</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-black text-green-500 tracking-tight">{(parseFloat(item.price) * item.quantity).toLocaleString()} ETB</span>
                                                        </div>
                                                    </div>

                                                    {item.selected_addons && item.selected_addons.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.selected_addons.map((addon, ai) => (
                                                                <div key={ai} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/5 border border-green-500/10 group-hover:border-green-500/30 transition-all">
                                                                    <Sparkles size={8} className="text-green-500" />
                                                                    <span className="text-[8px] font-black text-green-500/80 uppercase tracking-tighter">{addon.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-2 p-16 text-center rounded-[3rem] border border-dashed border-slate-800 bg-slate-900/20">
                                                <Package size={64} className="mx-auto text-slate-800 mb-6 opacity-20" />
                                                <p className="text-xs text-slate-600 font-black uppercase tracking-[0.4em]">Resource Manifest Empty</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <style>{`
                            @keyframes scan {
                                from { transform: translateY(-100%); }
                                to { transform: translateY(200%); }
                            }
                        `}</style>
                    </div>
                </div>
            )}

            {showAddModal && (
                <AddGiftModal
                    onClose={() => setShowAddModal(false)}
                    isDarkMode={isDarkMode}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchGifts();
                    }}
                />
            )}
        </div>
    );
};

export default Gifts;
