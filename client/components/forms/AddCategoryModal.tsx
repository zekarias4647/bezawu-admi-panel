
import React, { useState } from 'react';
import { X, Tag, Plus, Loader2, Sparkles, FolderPlus } from 'lucide-react';

interface AddCategoryModalProps {
    onClose: () => void;
    onSuccess?: () => void;
    isDarkMode: boolean;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, onSuccess, isDarkMode }) => {
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const [categories, setCategories] = useState<{ id: string, name: string, parent_id: string | null }[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    React.useEffect(() => {
        const fetchExistingCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://branchapi.ristestate.com/api/categories/categories-get', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Only show top-level categories as potential parents to avoid deep nesting
                    setCategories(data.filter((c: any) => !c.parent_id));
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchExistingCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://branchapi.ristestate.com/api/categories/categories-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, parent_id: parentId || null })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Category tactical deployment successful' });
                onSuccess?.();
                setTimeout(onClose, 1000);
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || 'Deployment aborted' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network connection failure' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'}`}>

                {/* Header */}
                <div className={`relative overflow-hidden shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-[#0f1115] via-[#121418] to-[#1a1d23]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 opacity-90 z-10" />

                    <div className="relative px-5 pt-5 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl border transition-colors ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
                                <Tag className="text-cyan-500" size={20} />
                            </div>
                            <div>
                                <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>New Category</h2>
                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Inventory Architecture</p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-5 pt-3 space-y-4">
                    {/* Identity Card */}
                    <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-teal-500 opacity-80" />

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Sparkles size={10} className="text-cyan-500" /> Category Name
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Premium Beverages"
                                    className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium text-xs ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <FolderPlus size={10} className="text-cyan-500" /> Hierarchy Point
                                </label>
                                <select
                                    className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-medium text-xs ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">None (Top Level Global)</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <p className={`text-[9px] font-bold uppercase tracking-widest ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {message.text}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                        Deploy Category
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryModal;
