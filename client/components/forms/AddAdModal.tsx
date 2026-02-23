
import React, { useState } from 'react';
import { X, Save, Loader2, ImageIcon, Film, Clock, Type, Sparkles, Zap } from 'lucide-react';

interface AddAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    isDarkMode: boolean;
}

const AddAdModal: React.FC<AddAdModalProps> = ({ isOpen, onClose, onSuccess, isDarkMode }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

    // Form State
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [duration, setDuration] = useState('24'); // Default 24 hours
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mediaFile) {
            setError('Please select a media file');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('image', mediaFile); // Multer field name is 'image'

            const token = localStorage.getItem('token');

            const uploadRes = await fetch('https://branchapi.ristestate.com/api/upload/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Failed to upload media');
            const uploadData = await uploadRes.json();
            const mediaUrl = uploadData.imageUrl;

            const adRes = await fetch('https://branchapi.ristestate.com/api/ads/ads-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: activeTab,
                    media_url: mediaUrl,
                    description,
                    duration_hours: parseInt(duration)
                })
            });

            if (!adRes.ok) throw new Error('Failed to create ad');

            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'} max-h-[90vh] flex flex-col`}>

                {/* Header */}
                <div className={`relative overflow-hidden shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-[#0f1115] via-[#121418] to-[#1a1d23]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-90 z-10" />

                    <div className="relative px-6 pt-6 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl border transition-colors ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                                <ImageIcon className="text-emerald-500" size={24} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Promotional Campaign</h2>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-0.5">Strategic Advertisement & Marketing Protocol</p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 flex gap-6 border-b border-transparent">
                        <button
                            onClick={() => { setActiveTab('image'); setMediaFile(null); }}
                            className={`pb-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'image'
                                ? 'text-emerald-500 border-emerald-500'
                                : 'text-slate-500 border-transparent hover:text-slate-400'}`}
                        >
                            Static Image
                        </button>
                        <button
                            onClick={() => { setActiveTab('video'); setMediaFile(null); }}
                            className={`pb-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'video'
                                ? 'text-pink-500 border-pink-500'
                                : 'text-slate-500 border-transparent hover:text-slate-400'}`}
                        >
                            Video Motion
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">

                        {/* Media Asset Card */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 opacity-80" />

                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-amber-500/10 p-1.5 rounded-lg">
                                    <Sparkles size={14} className="text-amber-500" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visual Deployment</span>
                            </div>

                            <div className="space-y-4">
                                {/* File Upload */}
                                <div className="relative">
                                    <input
                                        required
                                        type="file"
                                        accept={activeTab === 'image' ? "image/*" : "video/*"}
                                        className="hidden"
                                        id="media-upload"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="media-upload"
                                        className={`w-full flex items-center justify-between px-5 py-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${mediaFile
                                            ? 'border-emerald-500/40 bg-emerald-500/5'
                                            : isDarkMode ? 'bg-[#1a1d23] border-slate-700 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-amber-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mediaFile ? (activeTab === 'image' ? 'bg-emerald-500' : 'bg-pink-500') : 'bg-slate-500/10 text-slate-400'}`}>
                                                {activeTab === 'image' ? <ImageIcon size={20} className={mediaFile ? 'text-white' : ''} /> : <Film size={20} className={mediaFile ? 'text-white' : ''} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className={`text-xs font-bold ${mediaFile ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
                                                    {mediaFile ? mediaFile.name : `Select ${activeTab} file...`}
                                                </div>
                                                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                                    {activeTab === 'image' ? 'JPG, PNG, WEBP (Maximum Impact)' : 'MP4, MOV (High Velocity)'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${mediaFile ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                            {mediaFile ? 'Switch' : 'Browse'}
                                        </div>
                                    </label>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Type size={10} className="text-amber-500" /> Campaign Caption
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. Exclusive Flash Sale — 50% Off Everything"
                                            maxLength={50}
                                            className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-xs ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-500 font-mono">
                                            {description.length}/50
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lifecycle Card */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-violet-500 opacity-80" />

                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-500/10 p-1.5 rounded-lg">
                                    <Clock size={14} className="text-blue-500" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Campaign Duration</span>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: '24h', full: '24 Hours', value: '24' },
                                    { label: '3d', full: '3 Days', value: '72' },
                                    { label: '1w', full: '1 Week', value: '168' },
                                    { label: '1m', full: '1 Month', value: '720' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setDuration(opt.value)}
                                        className={`group relative py-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${duration === opt.value
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 active:scale-95'
                                            : isDarkMode
                                                ? 'bg-[#1a1d23] border-slate-800 text-slate-500 hover:border-blue-500/50 hover:text-blue-400'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
                                            }`}
                                    >
                                        <span className="text-xs font-bold">{opt.label}</span>
                                        <span className="text-[6px] font-bold uppercase tracking-tighter opacity-60 group-hover:opacity-100">{opt.full}</span>
                                        {duration === opt.value && (
                                            <div className="absolute -top-1 -right-1">
                                                <Zap size={8} className="fill-white text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className={`px-6 py-4 flex items-center justify-end gap-3 border-t shrink-0 ${isDarkMode ? 'bg-[#121418]/95 border-slate-800' : 'bg-white/95 border-slate-100'}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            Decline
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-[9px] transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.97] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            {loading ? 'Transmitting...' : 'Commit Ad Placement'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.3); }
            `}</style>
        </div>
    );
};

export default AddAdModal;
