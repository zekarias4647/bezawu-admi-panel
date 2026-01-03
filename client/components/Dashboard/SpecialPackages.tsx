import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Trash2, Power, Star, TrendingUp, Filter, Sparkles, Loader2, X, Tag } from 'lucide-react';
import { Bundle } from '../../types';

interface SpecialPackagesProps {
    isDarkMode: boolean;
    onAddPackage: () => void;
}

const SpecialPackages: React.FC<SpecialPackagesProps> = ({ isDarkMode, onAddPackage }) => {
    const [bundles, setBundles] = useState<Bundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
    const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

    const fetchBundles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/bundles/bundles-get', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBundles(data);
            }
        } catch (err) {
            console.error('Failed to fetch bundles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBundles();
    }, []);

    const handleToggleStatus = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/bundles/bundles/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setBundles(prev => prev.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b));
            }
        } catch (err) {
            console.error('Failed to toggle bundle:', err);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to decommission this strategic bundle?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/bundles/bundles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setBundles(prev => prev.filter(b => b.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete bundle:', err);
        }
    };

    const filteredBundles = bundles.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' ||
            (filter === 'ACTIVE' ? b.is_active : !b.is_active);
        return matchesSearch && matchesFilter;
    });

    const getImageUrl = (url?: string) => {
        if (!url) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1074';
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} />
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse font-mono">
                    Decrypting Strategic Packages...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Strategic Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <Sparkles className="text-cyan-500" size={20} />
                        </div>
                        <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Specialized Bundles
                        </h1>
                    </div>
                    <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm font-medium`}>
                        Configure high-velocity product combinations and strategic pricing
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className={`relative flex-1 min-w-[300px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search strategic assets..."
                            className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-sm font-bold ${isDarkMode
                                    ? 'bg-[#121418] border-slate-800 focus:border-cyan-500/50 shadow-inner'
                                    : 'bg-white border-slate-200 focus:border-cyan-500/50 shadow-sm'
                                }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onAddPackage}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all gap-3 items-center flex shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        Deploy Bundle
                    </button>
                </div>
            </div>

            {/* Main Assets List */}
            <div className={`border rounded-[2.5rem] overflow-hidden ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#1a1d23] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <th className="px-8 py-6">Bundle Identity</th>
                                <th className="px-8 py-6">Configuration</th>
                                <th className="px-8 py-6">Operational Commercials</th>
                                <th className="px-8 py-6">System Status</th>
                                <th className="px-8 py-6 text-right">Strategic Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {filteredBundles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className={`p-4 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                                <Package size={40} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Assets Deployed</p>
                                                <p className="text-sm text-slate-500 mt-1">Deploy a new commercial package to see it here.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBundles.map((bundle) => (
                                    <tr
                                        key={bundle.id}
                                        onClick={() => setSelectedBundle(bundle)}
                                        className={`group cursor-pointer transition-all ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shrink-0 group-hover:border-cyan-500 transition-all duration-500">
                                                    <img
                                                        src={getImageUrl(bundle.image_url)}
                                                        alt={bundle.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    {bundle.discount > 0 && (
                                                        <div className="absolute top-0 right-0 p-1.5 flex items-center justify-center">
                                                            <div className="bg-rose-600 text-white text-[8px] font-black px-2 py-1.5 rounded-xl shadow-lg border border-white/20 animate-bounce">
                                                                -{bundle.discount}%
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bundle.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1 max-w-[200px]">{bundle.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {bundle.items?.length || 0} Assets Linked
                                                </span>
                                                <div className="flex -space-x-2">
                                                    {Array.from({ length: Math.min(bundle.items?.length || 0, 4) }).map((_, i) => (
                                                        <div key={i} className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'bg-slate-800 border-slate-900' : 'bg-slate-200 border-white'} flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform cursor-default`}>
                                                            <Star size={12} className="text-cyan-500 fill-cyan-500" />
                                                        </div>
                                                    ))}
                                                    {(bundle.items?.length || 0) > 4 && (
                                                        <div className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'bg-slate-700 border-slate-900 text-white' : 'bg-slate-100 border-white text-slate-600'} flex items-center justify-center text-[9px] font-black shadow-lg`}>
                                                            +{bundle.items.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bundle.price.toLocaleString()}</span>
                                                    <span className="text-[10px] font-black text-cyan-500 uppercase italic font-mono">ETB</span>
                                                </div>
                                                {bundle.discount > 0 && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] line-through text-slate-500 font-bold">
                                                            {(bundle.price / (1 - bundle.discount / 100)).toFixed(0)} ETB
                                                        </span>
                                                        <div className="px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Profit Shield</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {bundle.is_active ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol Live</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded-full w-fit">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Inert Standby</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                                                <button
                                                    onClick={(e) => handleToggleStatus(e, bundle.id)}
                                                    className={`p-3 rounded-2xl transition-all shadow-lg ${bundle.is_active ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500'
                                                        } hover:text-white`}
                                                >
                                                    <Power size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, bundle.id)}
                                                    className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                                >
                                                    <Trash2 size={18} />
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

            {selectedBundle && (
                <BundleDetailModal
                    bundle={selectedBundle}
                    onClose={() => setSelectedBundle(null)}
                    isDarkMode={isDarkMode}
                    getImageUrl={getImageUrl}
                />
            )}
        </div>
    );
};

const BundleDetailModal: React.FC<{ bundle: Bundle, onClose: () => void, isDarkMode: boolean, getImageUrl: (url?: string) => string }> = ({ bundle, onClose, isDarkMode, getImageUrl }) => {
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-500">
            <div className={`max-w-4xl w-full rounded-[3rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
                }`}>
                <div className="relative h-80 overflow-hidden">
                    <img
                        src={getImageUrl(bundle.image_url)}
                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                        alt={bundle.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-transparent"></div>

                    {bundle.discount > 0 && (
                        <div className="absolute top-10 left-10 scale-150 origin-top-left">
                            <div className="bg-rose-600 text-white p-4 rounded-[2rem] shadow-2xl border-4 border-white/20 flex flex-col items-center justify-center animate-in slide-in-from-left duration-700">
                                <Tag size={20} className="mb-1" />
                                <span className="text-xl font-black">{bundle.discount}%</span>
                                <span className="text-[8px] font-black uppercase tracking-tighter">OFF</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-10 right-10 p-4 rounded-full bg-black/40 text-white hover:bg-rose-600 backdrop-blur-md transition-all duration-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-12 -mt-24 relative">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-2xl">{bundle.name}</h2>
                            <div className="flex items-center gap-4 mt-6">
                                <div className="px-5 py-2 bg-cyan-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                                    Strategic Asset
                                </div>
                                {bundle.is_active && (
                                    <div className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                        Protocol Live
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`p-8 rounded-[2.5rem] text-right border-2 ${isDarkMode ? 'bg-[#0a0c10] border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'} transform transition-transform hover:scale-105`}>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Operational Value</p>
                            <div className="flex items-baseline justify-end gap-2">
                                <span className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bundle.price.toLocaleString()}</span>
                                <span className="text-lg font-black text-cyan-500 uppercase italic">ETB</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
                                    <div className="w-6 h-px bg-slate-800" />
                                    Strategic Purpose
                                </h3>
                                <p className={`text-lg leading-relaxed font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {bundle.description || "Experimental product configuration optimized for high-velocity commercial throughput. No specific metadata provided."}
                                </p>
                            </div>

                            <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDarkMode ? 'bg-cyan-500/5 border-cyan-500/20 shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-500">
                                        <TrendingUp size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Economic Yield</p>
                                        <p className={`text-lg font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Optimization Logic Active</p>
                                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tighter">Automated Profit Shielding</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
                                <div className="w-6 h-px bg-slate-800" />
                                Linked Assets ({bundle.items?.length || 0})
                            </h3>
                            <div className={`rounded-[2.5rem] border-2 overflow-hidden ${isDarkMode ? 'bg-[#0a0c10] border-slate-800' : 'bg-white border-slate-50 shadow-sm'}`}>
                                <div className="divide-y divide-slate-800/10">
                                    {(bundle.items && bundle.items.length > 0) ? bundle.items.map((item, i) => (
                                        <div key={i} className="p-6 flex items-center justify-between group hover:bg-cyan-500/[0.02] transition-colors">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-cyan-500' : 'bg-white border-slate-100 text-cyan-600'} group-hover:bg-cyan-500 group-hover:text-white transition-all`}>
                                                    {item.quantity}x
                                                </div>
                                                <span className={`text-base font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.product_name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-black text-slate-500 italic uppercase">{item.price} ETB</span>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Per Unit</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-12 text-center">
                                            <Package className="mx-auto text-slate-700 mb-4 opacity-20" size={48} />
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No Operational Assets Linked</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialPackages;
