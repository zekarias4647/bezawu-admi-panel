import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Power, Eye, ImageIcon, Film, Loader2, X, Clock, Calendar } from 'lucide-react';
import { Ad } from '../../types';

interface AdsProps {
    isDarkMode: boolean;
    onAddAd: () => void;
}

const Ads: React.FC<AdsProps> = ({ isDarkMode, onAddAd }) => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('https://branchapi.bezawcurbside.com/api/ads/ads-get', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAds(data);
            }
        } catch (err) {
            console.error('Failed to fetch ads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this ad?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.bezawcurbside.com/api/ads/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAds(prev => prev.filter(a => a.id !== id));
                if (selectedAd?.id === id) setSelectedAd(null);
            }
        } catch (err) {
            console.error('Failed to delete ad:', err);
        }
    };

    const handleToggleStatus = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.bezawcurbside.com/api/ads/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAds(prev => prev.map(a => a.id === id ? { ...a, is_active: !a.is_active } : a));
                if (selectedAd?.id === id) {
                    setSelectedAd(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
                }
            }
        } catch (err) {
            console.error('Failed to toggle ad status:', err);
        }
    };

    const getMediaUrl = (url?: string) => {
        if (!url) return '';
        if (url.includes('/uploads/')) {
            const filename = url.split('/uploads/')[1];
            return `https://branchapi.bezawcurbside.com/uploads/${filename}`;
        }
        if (url.startsWith('http')) return url;
        return `https://branchapi.bezawcurbside.com${url}`;
    };

    const filteredAds = ads.filter(a =>
        (a.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse font-mono">
                    Loading Ads...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30">
                        <ImageIcon className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            App Advertisements
                        </h1>
                        <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm font-medium`}>
                            Manage promotional content and banners
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`relative ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search ads..."
                            className={`w-64 pl-10 pr-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${isDarkMode
                                ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500'
                                : 'bg-white border-slate-200 focus:border-emerald-500'
                                }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onAddAd}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all gap-2 items-center flex shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus size={16} />
                        New Ad
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-slate-800 bg-[#121418]' : 'border-slate-200 bg-white'}`}>
                <div className={`grid grid-cols-12 gap-4 p-4 border-b text-[10px] uppercase font-black tracking-widest ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                    <div className="col-span-1">Preview</div>
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Duration</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAds.map(ad => (
                        <div
                            key={ad.id}
                            onClick={() => setSelectedAd(ad)}
                            className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                        >
                            <div className="col-span-1">
                                <div className="h-16 w-16 rounded-lg bg-black/5 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                                    {ad.type === 'video' ? (
                                        <video src={getMediaUrl(ad.media_url)} className="h-full w-full object-cover" />
                                    ) : (
                                        <img src={getMediaUrl(ad.media_url)} className="h-full w-full object-cover" alt="ad" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                        <div className="p-1 rounded-full bg-white/20 backdrop-blur-sm">
                                            <Eye size={10} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3 min-w-0">
                                <h3 className={`font-bold text-sm truncate mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {ad.description || 'No Description'}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar size={12} />
                                    <span>{new Date(ad.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                    {ad.type === 'video' ? <Film size={14} className="text-pink-500" /> : <ImageIcon size={14} className="text-emerald-500" />}
                                    <span className={`text-xs font-bold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{ad.type}</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <Clock size={14} />
                                    <span>{ad.duration_hours}h ({new Date(ad.expires_at).toLocaleDateString()})</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${ad.status_derived === 'EXPIRED'
                                    ? 'bg-rose-500/10 text-rose-500'
                                    : ad.is_active
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : 'bg-slate-500/10 text-slate-500'
                                    }`}>
                                    {ad.status_derived === 'EXPIRED' ? 'Expired' : (ad.is_active ? 'Active' : 'Inactive')}
                                </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <button
                                    onClick={(e) => handleToggleStatus(e, ad.id)}
                                    className={`p-2 rounded-lg transition-colors ${ad.is_active
                                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                        : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
                                        }`}
                                >
                                    <Power size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, ad.id)}
                                    className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredAds.length === 0 && (
                    <div className="text-center py-20">
                        <ImageIcon className="mx-auto text-slate-500 mb-4" size={48} />
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No ads found</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedAd && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#121418]' : 'bg-white'}`}>

                        <button
                            onClick={() => setSelectedAd(null)}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Left Side: Details */}
                        <div className={`flex-1 p-8 lg:p-10 flex flex-col overflow-y-auto custom-scrollbar border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                    <ImageIcon className="text-emerald-500" size={20} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Ad Details</span>
                            </div>

                            <h2 className={`text-2xl font-black tracking-tight mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {selectedAd.description || 'No Description Available'}
                            </h2>

                            <div className="space-y-6">
                                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Duration Info</h3>
                                    <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        <Clock size={16} className="text-emerald-500" />
                                        <span>Runs for {selectedAd.duration_hours} hours</span>
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500">
                                        Expires on: {new Date(selectedAd.expires_at).toLocaleString()}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Status</h3>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${selectedAd.status_derived === 'EXPIRED'
                                        ? 'bg-rose-500/10 text-rose-500'
                                        : selectedAd.is_active
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-slate-500/10 text-slate-500'
                                        }`}>
                                        {selectedAd.status_derived === 'EXPIRED' ? 'Expired' : (selectedAd.is_active ? 'Active' : 'Inactive')}
                                    </span>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-xs text-slate-500 font-medium">
                                        Created on {new Date(selectedAd.created_at).toLocaleDateString()} at {new Date(selectedAd.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Media */}
                        <div className="flex-[1.5] bg-black flex items-center justify-center relative group p-4">
                            {selectedAd.type === 'video' ? (
                                <video
                                    src={getMediaUrl(selectedAd.media_url)}
                                    className="max-h-full max-w-full object-contain rounded-xl"
                                    controls
                                    autoPlay
                                    loop
                                />
                            ) : (
                                <img
                                    src={getMediaUrl(selectedAd.media_url)}
                                    className="max-h-full max-w-full object-contain rounded-xl"
                                    alt="Ad Media"
                                />
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Ads;
