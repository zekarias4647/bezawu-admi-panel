
import React, { useState, useEffect } from 'react';
import { Gift, Plus, Search, Trash2, Eye, EyeOff, Loader2, ImageIcon, DollarSign, X, Tag, TextQuote, Save, Info, Filter, ArrowRight, Package } from 'lucide-react';
import AddGiftModal from '../forms/AddGiftModal';

interface GiftItemRecord {
    id: number;
    product_id: string;
    name: string;
    price: string;
    quantity: number;
    image_url: string;
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
}

interface GiftsProps {
    isDarkMode: boolean;
}

const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
};

export const Gifts: React.FC<GiftsProps> = ({ isDarkMode }) => {
    const [gifts, setGifts] = useState<GiftItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchGifts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/gifts/gifts-get', {
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
            const res = await fetch(`http://localhost:5000/api/gifts/${id}/toggle`, {
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
            const res = await fetch(`http://localhost:5000/api/gifts/${id}`, {
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
                    <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>User Gifts</h1>
                    <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm font-medium mt-2 flex items-center gap-2`}>
                        <Info size={14} className="text-green-500" /> Administrative Gift Manifest Management
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search Gift Manifest..."
                            className={`pl-12 pr-6 py-4 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 font-bold w-64 ${isDarkMode ? 'bg-[#121418] border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-[0_20px_40px_-10px_rgba(34,197,94,0.4)] active:scale-95 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs uppercase tracking-[0.2em]">Initiate Gift</span>
                    </button>
                </div>
            </div>

            {/* List Table Section */}
            <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'bg-[#1a1d23] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <th className="px-10 py-6">Gift Asset</th>
                                <th className="px-10 py-6">Identity</th>
                                <th className="px-10 py-6">valuation</th>
                                <th className="px-10 py-6">Status</th>
                                <th className="px-10 py-6 text-right">Operations</th>
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
                                        <td className="px-10 py-6">
                                            <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-slate-800/10 shadow-lg transition-transform group-hover:scale-105">
                                                {gift.image_url ? (
                                                    <img src={getImageUrl(gift.image_url) || ''} alt={gift.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`flex items-center justify-center h-full ${isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <ImageIcon size={24} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{gift.name}</span>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Ref ID: GIFT-{gift.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} className="text-green-500" />
                                                <span className={`text-xl font-black font-mono ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{parseFloat(gift.price).toFixed(2)}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ETB</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${gift.is_active ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${gift.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                                {gift.is_active ? 'Online' : 'Vaulted'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleToggle(gift.id)}
                                                    className={`p-3 rounded-xl border transition-all ${gift.is_active ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500/10' : 'border-green-500/20 text-green-500 hover:bg-green-500/10'}`}
                                                    title={gift.is_active ? 'Hide Protocol' : 'Deploy Protocol'}
                                                >
                                                    {gift.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(gift.id)}
                                                    className="p-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-all"
                                                    title="Terminal Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <div className="w-px h-6 bg-slate-800/10 mx-2"></div>
                                                <button onClick={() => setSelectedGift(gift)} className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'} hover:scale-110 active:scale-90 transition-all`}>
                                                    <ArrowRight size={18} />
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
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className={`max-w-5xl w-full rounded-[3.5rem] overflow-hidden shadow-[0_60px_100px_-30px_rgba(0,0,0,0.8)] transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-slate-100'}`}>
                        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                            {/* Left: Image Side */}
                            <div className="lg:w-1/3 relative bg-black/20 overflow-hidden">
                                {selectedGift.image_url ? (
                                    <img src={getImageUrl(selectedGift.image_url) || ''} alt={selectedGift.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <Gift size={80} className="text-slate-800" />
                                    </div>
                                )}
                                <div className="absolute top-10 left-10">
                                    <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                                        <span className="text-[10px] text-white font-black uppercase tracking-[0.3em]">Ref Detail Analysis</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Content Side */}
                            <div className="lg:w-2/3 p-12 flex flex-col">
                                <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-4">
                                    <div className="flex items-center justify-between">
                                        <div className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${selectedGift.is_active ? 'border-green-500/30 text-green-500' : 'border-slate-500/30 text-slate-500'}`}>
                                            {selectedGift.is_active ? 'Manifest Online' : 'Protocol Vaulted'}
                                        </div>
                                        <button onClick={() => setSelectedGift(null)} className="text-slate-500 hover:text-white transition-colors p-2">
                                            <X size={28} />
                                        </button>
                                    </div>

                                    <div>
                                        <h2 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedGift.name}</h2>
                                        <div className="flex items-baseline gap-3 mt-4">
                                            <span className="text-4xl font-black font-mono text-green-600">{parseFloat(selectedGift.price).toFixed(2)}</span>
                                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">ETB</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
                                            <TextQuote size={12} className="text-green-500" /> Protocol description
                                        </label>
                                        <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                            {selectedGift.description || 'This gift manifest currently does not contain a verified description brief.'}
                                        </p>
                                    </div>

                                    {/* Composure Manifest View */}
                                    <div className="space-y-4 pt-4">
                                        <label className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
                                            <Package size={12} className="text-green-500" /> Composed assets manifest
                                        </label>
                                        <div className={`rounded-3xl border ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                            {selectedGift.items && selectedGift.items.length > 0 ? (
                                                <div className="divide-y divide-slate-800/10">
                                                    {selectedGift.items.map((item, idx) => (
                                                        <div key={idx} className="p-4 flex items-center justify-between group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800/20">
                                                                    {item.image_url ? (
                                                                        <img src={getImageUrl(item.image_url) || ''} alt={item.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                                            <Package size={16} className="text-slate-600" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className={`text-sm font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</span>
                                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Quantity: {item.quantity}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs font-black text-green-500">{(parseFloat(item.price) * item.quantity).toFixed(2)} ETB</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No individual assets mapped</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800/50">
                                        <div>
                                            <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Creation Vector</span>
                                            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{new Date(selectedGift.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Status Identifier</span>
                                            <span className={`text-xs font-bold ${selectedGift.is_active ? 'text-green-500' : 'text-slate-500'}`}>{selectedGift.is_active ? 'MISSION_READY' : 'IN_STORAGE'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-800/20">
                                    <button
                                        onClick={() => setSelectedGift(null)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-[2rem] text-xs uppercase tracking-[0.4em] transition-all active:scale-95 shadow-xl shadow-green-500/20"
                                    >
                                        Close Manifest
                                    </button>
                                </div>
                            </div>
                        </div>
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
