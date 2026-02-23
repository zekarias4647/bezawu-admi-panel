
import React, { useState } from 'react';
import { X, User, Phone, Mail, Image as ImageIcon, Save, Loader2, UserCheck, ShieldCheck, Fingerprint, MapPin } from 'lucide-react';

interface AddRunnerModalProps {
    onClose: () => void;
    onSuccess: () => void;
    isDarkMode: boolean;
}

const AddRunnerModal: React.FC<AddRunnerModalProps> = ({ onClose, onSuccess, isDarkMode }) => {
    const generateId = () => {
        const random = Math.floor(100000 + Math.random() * 900000); // 6 random numbers
        return `BZWR-${random}`;
    };

    const [formData, setFormData] = useState({
        id: generateId(),
        full_name: '',
        phone: '',
        email: '',
        pro_image: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            let imageUrl = formData.pro_image;

            // Upload image if file is selected
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('image', imageFile);

                const uploadResponse = await fetch('https://branchapi.ristestate.com/api/upload/image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: uploadData
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    imageUrl = uploadResult.imageUrl;
                } else {
                    throw new Error('Image upload failed');
                }
            }

            const runnerData = {
                ...formData,
                pro_image: imageUrl
            };

            const response = await fetch('https://branchapi.ristestate.com/api/runners/runners-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(runnerData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create runner');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'} max-h-[90vh] flex flex-col`}>

                {/* Header */}
                <div className={`relative overflow-hidden shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-[#0f1115] via-[#121418] to-[#1a1d23]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-blue-400 to-cyan-500 opacity-90 z-10" />

                    <div className="relative px-6 pt-6 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl border transition-colors ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                                <UserCheck className="text-indigo-500" size={24} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Register Runner</h2>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-0.5">Operational Personnel Enrollment Protocol</p>
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

                        {/* Identity & Security Card */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-blue-500 opacity-80" />

                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-indigo-500/10 p-1.5 rounded-lg">
                                    <ShieldCheck size={14} className="text-indigo-500" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Personnel Authentication</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <User size={10} className="text-indigo-500" /> Full Legal Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Abebe Balcha"
                                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-xs ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Fingerprint size={10} className="text-indigo-500" /> System Identifier
                                    </label>
                                    <div className={`w-full px-4 py-3 rounded-xl border font-mono font-bold text-xs ${isDarkMode ? 'bg-[#0a0c10] border-slate-800 text-indigo-400/80' : 'bg-slate-100 border-slate-100 text-indigo-600/80'}`}>
                                        {formData.id}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Professional Details Card */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-500 opacity-80" />

                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-500/10 p-1.5 rounded-lg">
                                    <Phone size={14} className="text-blue-500" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Communication Vector</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Phone size={10} className="text-blue-500" /> Phone Number
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="+251 ..."
                                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-xs ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Mail size={10} className="text-blue-500" /> Digital Mail
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="runner@bezawu.com"
                                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-xs ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Identification Asset Card */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-80" />

                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                                    <ImageIcon size={14} className="text-emerald-500" />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identification Asset</span>
                            </div>

                            <div className="space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="runner-image"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            setFormData({ ...formData, pro_image: URL.createObjectURL(file) });
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="runner-image"
                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${imageFile
                                        ? 'border-emerald-500/40 bg-emerald-500/5'
                                        : isDarkMode ? 'bg-[#1a1d23] border-slate-700 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border-2 transition-all ${imageFile ? 'border-emerald-500' : 'border-slate-700 bg-slate-800/50'}`}>
                                            {formData.pro_image ? (
                                                <img src={formData.pro_image} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={20} className="text-slate-600" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${imageFile ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
                                                {imageFile ? imageFile.name : 'Choose Official ID Photo'}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-0.5">High Resolution Portrait Required</span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${imageFile ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        {imageFile ? 'Change' : 'Browse'}
                                    </div>
                                </label>
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
                    <div className={`px-6 py-4 flex items-center justify-end gap-3 border-t shrink-0 ${isDarkMode ? 'bg-[#121418]/95 border-slate-800 backdrop-blur-md' : 'bg-white/95 border-slate-100 backdrop-blur-md'}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            Abort Enrollment
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-[9px] transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.97] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            {loading ? 'Transmitting...' : 'Commit Personnel Entry'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(79, 70, 229, 0.3); }
            `}</style>
        </div>
    );
};

export default AddRunnerModal;
