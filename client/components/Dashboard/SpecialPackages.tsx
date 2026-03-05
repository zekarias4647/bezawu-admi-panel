import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Trash2, Power, TrendingUp, Sparkles, Loader2, X, Tag, Zap, Shield, Activity, ChevronRight, Clock, BarChart3, PackageOpen, ArrowUpRight, Filter } from 'lucide-react';
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
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const fetchBundles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('https://branchapi.bezawcurbside.com/api/bundles/bundles-get', {
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
            const response = await fetch(`https://branchapi.bezawcurbside.com/api/bundles/bundles/${id}/toggle`, {
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
            const response = await fetch(`https://branchapi.bezawcurbside.com/api/bundles/bundles/${id}`, {
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

        // Handle legacy absolute URLs with potential wrong IPs (e.g. 192.168.x.x)
        if (url.includes('/uploads/')) {
            const filename = url.split('/uploads/')[1];
            return `https://branchapi.bezawcurbside.com/uploads/${filename}`;
        }

        if (url.startsWith('http')) return url;
        return `https://branchapi.bezawcurbside.com${url}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                <div className="relative">
                    <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
                </div>
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse font-mono">
                    Decrypting Strategic Packages...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Strategic Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30">

                        </div>
                        <div className="absolute -inset-1 bg-emerald-500 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Specialized Bundles
                        </h1>
                        <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-xs font-bold mt-1`}>
                            Configure high-velocity product combinations
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`relative ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search bundles..."
                            className={`w-56 pl-9 pr-4 py-2 rounded-lg border transition-all text-xs font-bold ${isDarkMode
                                ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500'
                                : 'bg-white border-slate-200 focus:border-emerald-500'
                                }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onAddPackage}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all gap-2 items-center flex shadow-md active:scale-95"
                    >
                        <Plus size={14} />
                        New Bundle
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filterOption) => (
                    <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${filter === filterOption
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <Filter size={12} />
                        {filterOption}
                    </button>
                ))}
            </div>

            {/* Awesome List Style */}
            <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                {filteredBundles.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="mx-auto text-slate-400 mb-4" size={48} />
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No bundles found</p>
                        <p className="text-sm text-slate-500 mt-1">Create your first bundle to get started</p>
                    </div>
                ) : (
                    <div className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                        {filteredBundles.map((bundle) => (
                            <div
                                key={bundle.id}
                                onClick={() => setSelectedBundle(bundle)}
                                onMouseEnter={() => setHoveredId(bundle.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className={`group relative p-5 transition-all duration-200 cursor-pointer hover:bg-slate-50/50 ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Image Section */}
                                    <div className="relative flex-shrink-0 w-full md:w-32 h-20 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                                        <img
                                            src={getImageUrl(bundle.image_url)}
                                            alt={bundle.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {bundle.discount > 0 && (
                                            <div className="absolute top-1 left-1 bg-rose-600/90 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                                -{bundle.discount}%
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-grow min-w-0 py-0.5">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <h3 className={`font-bold text-sm truncate pr-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {bundle.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${bundle.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                                                        }`}>
                                                        <div className={`w-1 h-1 rounded-full ${bundle.is_active ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                                                        {bundle.is_active ? 'Active' : 'Inactive'}
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Price - Mobile visible, Desktop hidden (moved to right) */}
                                            <div className="md:hidden text-right">
                                                <span className={`block font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {bundle.price.toLocaleString()}
                                                </span>
                                                <span className="text-[9px] font-bold text-emerald-500 uppercase">ETB</span>
                                            </div>
                                        </div>

                                        <p className={`text-[10px] line-clamp-1 mb-2 max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {bundle.description || "No description provided."}
                                        </p>

                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                <PackageOpen size={12} />
                                                <span>{bundle.items?.length || 0} Items</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                <Activity size={12} />
                                                <span>High Demand</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions & Price Section (Desktop) */}
                                    <div className="flex-shrink-0 flex flex-col items-end justify-between gap-2 min-w-[100px] pl-3 md:border-l border-slate-100 dark:border-slate-800">
                                        <div className="hidden md:block text-right">
                                            <div className="flex items-baseline justify-end gap-1">
                                                <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {bundle.price.toLocaleString()}
                                                </span>
                                                <span className="text-[9px] font-bold text-emerald-500 uppercase">ETB</span>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total Value</p>
                                        </div>

                                        <div className="flex items-center justify-end gap-1 w-full">
                                            <button
                                                onClick={(e) => handleToggleStatus(e, bundle.id)}
                                                className={`p-1.5 rounded-md transition-all ${bundle.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                    : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500 hover:text-white'
                                                    }`}
                                                title={bundle.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                <Power size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, bundle.id)}
                                                className="p-1.5 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <button className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all">
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Indicator */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 transform transition-transform duration-200 ${hoveredId === bundle.id ? 'scale-y-100' : 'scale-y-0'
                                    }`} />
                            </div>
                        ))}
                    </div>
                )}
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
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-500">
            <div className={`max-w-5xl w-full rounded-3xl shadow-2xl transition-all border-0 animate-in zoom-in-95 duration-500 relative overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
                {/* Decorative Background Accents */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -mr-48 -mt-48 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>

                {/* Banner Section with Parallax-like feel */}
                <div className="relative h-44 overflow-hidden group">
                    <img
                        src={getImageUrl(bundle.image_url)}
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                        alt={bundle.name}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-slate-950 via-slate-950/40' : 'from-slate-50 via-white/40'} to-transparent`}></div>

                    {/* Animated Scanning Line */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-1/2 w-full animate-[scan_4s_linear_infinite] opacity-30"></div>

                    {bundle.discount > 0 && (
                        <div className="absolute top-8 left-8">
                            <div className="relative group/tag">
                                <div className="absolute -inset-1 bg-rose-500 rounded-2xl blur opacity-40 group-hover/tag:opacity-75 transition duration-500"></div>
                                <div className="relative bg-gradient-to-r from-rose-600 to-rose-500 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <Tag size={20} className="animate-bounce" />
                                    </div>
                                    <div>
                                        <span className="text-2xl font-black tracking-tighter leading-none block">{bundle.discount}%</span>
                                        <span className="text-[10px] font-bold block uppercase tracking-widest opacity-80">Strategic Discount</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 rounded-2xl bg-black/20 text-white hover:bg-rose-500/80 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:rotate-90 group"
                    >
                        <X size={24} className="group-hover:scale-110" />
                    </button>
                </div>

                {/* Content Section with Glassmorphic Overlap */}
                <div className="px-8 pb-8 -mt-12 relative z-10">
                    {/* Floating Header Card */}
                    <div className={`p-5 rounded-2xl border backdrop-blur-xl shadow-xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all hover:shadow-emerald-500/5 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <PackageOpen size={32} className="text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                </div>
                            </div>
                            <div>
                                <h2 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {bundle.name}
                                </h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${bundle.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                        <div className={`w-2 h-2 rounded-full ${bundle.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-500'}`}></div>
                                        {bundle.is_active ? 'Live Network' : 'Offline'}
                                    </div>
                                    <div className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Shield size={10} />
                                        Verified Asset
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Asset Valuation</p>
                                <div className="flex items-baseline justify-end gap-2 group cursor-pointer">
                                    <span className={`text-4xl font-black tabular-nums transition-colors group-hover:text-emerald-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {bundle.price.toLocaleString()}
                                    </span>
                                    <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 tracking-tighter uppercase transition-all group-hover:scale-110">ETB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* LEFT: Intelligence Column */}
                        <div className="lg:col-span-3 space-y-8">
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <BarChart3 size={16} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 underline decoration-emerald-500/30 underline-offset-8">Intelligence</h3>
                                </div>
                                <div className={`p-5 rounded-3xl border transition-all hover:bg-emerald-500/5 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                    <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {bundle.description || "Analytical profile missing for this strategic asset."}
                                    </p>
                                </div>
                            </section>

                            {((bundle.bundle_addons && bundle.bundle_addons.length > 0) || (bundle.items?.some(item => item.selected_addons && item.selected_addons.length > 0))) && (
                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Zap size={16} />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 underline decoration-blue-500/30 underline-offset-8">Enhancements</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {/* Global Bundle Addons */}
                                        {bundle.bundle_addons?.map((addon, i) => (
                                            <div key={`bundle-addon-${i}`} className={`flex items-center justify-between p-3 rounded-2xl border group transition-all hover:border-blue-500/50 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-400 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{addon.name}</span>
                                                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Bundle Strategic</span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">+{addon.price} ETB</div>
                                            </div>
                                        ))}

                                        {/* Product Specific Addons (Aggregated) */}
                                        {bundle.items?.flatMap(item =>
                                            (item.selected_addons || []).map((addon, ai) => (
                                                <div key={`item-addon-${item.id}-${ai}`} className={`flex items-center justify-between p-3 rounded-2xl border group transition-all hover:border-emerald-500/50 ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{addon.name}</span>
                                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Ref: {item.product_name}</span>
                                                        </div>
                                                    </div>
                                                    {addon.price && <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+{addon.price} ETB</div>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* CENTER: Inventory Grid */}
                        <div className="lg:col-span-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <TrendingUp size={16} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 underline decoration-emerald-500/30 underline-offset-8">Core Cluster ({bundle.items?.length || 0})</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bundle.items && bundle.items.length > 0 ? bundle.items.map((item, i) => (
                                    <div key={i} className={`p-4 rounded-3xl border group transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-emerald-500/40' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all group-hover:rotate-6 ${isDarkMode ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'bg-slate-50 text-emerald-600 border border-slate-100'}`}>
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <span className={`text-sm font-black block group-hover:text-emerald-500 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.product_name}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                        <Activity size={8} /> Performance Opt
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-800/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black tabular-nums text-slate-500">{item.price} ETB <span className="text-[8px] opacity-40">/ Unit</span></span>
                                            </div>

                                            {item.selected_addons && item.selected_addons.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.selected_addons.map((addon, ai) => (
                                                        <div key={ai} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                                                            <Sparkles size={8} className="text-emerald-500" />
                                                            <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-tighter">{addon.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 p-12 text-center rounded-[2rem] border border-dashed border-slate-800 bg-slate-900/20">
                                        <Package size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
                                        <p className="text-xs text-slate-600 font-bold uppercase tracking-[0.3em]">No Assets Detected</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Telemetry Column */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                    <Activity size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 underline decoration-rose-500/30 underline-offset-8">Telemetry</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className={`p-4 rounded-3xl border flex items-center gap-4 group transition-all hover:bg-emerald-500/5 ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/30' : 'bg-white border-slate-200'}`}>
                                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Deployment</p>
                                        <p className={`text-sm font-black transition-colors ${bundle.is_active ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-slate-500 underline'}`}>
                                            {bundle.is_active ? 'READY FOR TRADING' : 'MAINTENANCE MODE'}
                                        </p>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-3xl border flex items-center gap-4 group transition-all hover:bg-rose-500/5 ${isDarkMode ? 'bg-slate-900/40 border-slate-800 hover:border-rose-500/30' : 'bg-white border-slate-200'}`}>
                                    <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Growth Vector</p>
                                        <p className="text-sm font-black text-white group-hover:text-rose-400 transition-colors uppercase">
                                            High Velocity Asset
                                        </p>
                                    </div>
                                </div>

                                <div className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-slate-800 hover:border-emerald-500/40' : 'bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-100'}`}>
                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Asset Complexity</p>
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-black text-emerald-500 tabular-nums">
                                            {(bundle.items?.length || 0) + (bundle.bundle_addons?.length || 0)}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase leading-tight tracking-widest">
                                            INTEGRATED<br />DYNAMICS
                                        </div>
                                    </div>
                                </div>
                            </div>
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
    );
};

export default SpecialPackages;