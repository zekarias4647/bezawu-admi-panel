
import React, { useState } from 'react';
import { X, Film, Link as LinkIcon, Type, FileVideo, Save, Loader2, Sparkles, MessageSquareQuote } from 'lucide-react';

interface AddStoryModalProps {
    onClose: () => void;
    onSuccess?: () => void;
    isDarkMode: boolean;
}

const AddStoryModal: React.FC<AddStoryModalProps> = ({ onClose, onSuccess, isDarkMode }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        video_url: ''
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Please select a video file');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            let uploadedVideoUrl = '';

            // Upload Video
            const uploadData = new FormData();
            uploadData.append('image', videoFile); // Backend currently expects 'image' as field name

            const uploadResponse = await fetch('https://branchapi.ristestate.com/api/upload/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });

            if (uploadResponse.ok) {
                const data = await uploadResponse.json();
                uploadedVideoUrl = data.imageUrl; // contains relative path like /uploads/...
            } else {
                throw new Error('Video upload failed');
            }

            // Create Story
            const response = await fetch('https://branchapi.ristestate.com/api/stories/stories-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    video_url: uploadedVideoUrl
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create story');
            }

            onSuccess?.();
            onClose();
        } catch (err: any) {
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
                                <Film className="text-emerald-500" size={24} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Publish Story</h2>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-0.5">Mobile Content & Engagement Protocol</p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">

                        {/* Story Content Card */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 opacity-80" />

                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-amber-500/10 p-1.5 rounded-lg">
                                    <Sparkles size={14} className="text-amber-500" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visual Asset & Title</span>
                            </div>

                            <div className="space-y-4">
                                {/* Title Input */}
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Type size={10} className="text-amber-500" /> Story Headline
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Exclusive Weekend Offers"
                                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-xs ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                {/* Video Upload */}
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <FileVideo size={10} className="text-amber-500" /> Tactical Media Asset
                                    </label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            id="video-upload"
                                            onChange={e => setVideoFile(e.target.files?.[0] || null)}
                                        />
                                        <label
                                            htmlFor="video-upload"
                                            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${videoFile
                                                ? 'border-emerald-500/40 bg-emerald-500/5'
                                                : isDarkMode ? 'bg-[#1a1d23] border-slate-700 hover:border-amber-500/50' : 'bg-white border-slate-200 hover:border-amber-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${videoFile ? 'bg-emerald-500 text-white' : 'bg-slate-500/10 text-slate-400'}`}>
                                                    <FileVideo size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${videoFile ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
                                                        {videoFile ? videoFile.name : 'Choose Video File'}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase">MP4, MOV, or WEBM</span>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${videoFile ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                {videoFile ? 'Change' : 'Browse'}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Payload Card */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-violet-500 opacity-80" />

                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-500/10 p-1.5 rounded-lg">
                                    <MessageSquareQuote size={14} className="text-blue-500" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Story Payload & Action</span>
                            </div>

                            <div className="space-y-4">
                                {/* Deep Link */}
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <LinkIcon size={10} className="text-blue-500" /> Action Link (Optional)
                                    </label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500/50" size={12} />
                                        <input
                                            type="text"
                                            placeholder="https://yourapp.link/promo"
                                            className={`w-full pl-9 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-xs ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-blue-400 placeholder:text-slate-600' : 'bg-white border-slate-200 text-blue-600'}`}
                                            value={formData.link}
                                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <MessageSquareQuote size={10} className="text-blue-500" /> Deployment Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Brief description for internal records..."
                                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-xs leading-relaxed resize-none ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
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
                            Abort Entry
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-[9px] transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.97] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            {loading ? 'Transmitting...' : 'Commit Story Deployment'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
            `}</style>
        </div>
    );
};

export default AddStoryModal;
