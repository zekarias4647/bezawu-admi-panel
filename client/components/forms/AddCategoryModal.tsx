import React, { useState } from 'react';
import { X, Tag, Plus, Loader2 } from 'lucide-react';

interface AddCategoryModalProps {
    onClose: () => void;
    isDarkMode: boolean;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, isDarkMode }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/categories/categories-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Category tactical deployment successful' });
                setTimeout(onClose, 1500);
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
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`max-w-md w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
                }`}>
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500">
                            <Tag size={24} />
                        </div>
                        <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>New Category</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category Nomenclature</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g., Premium Beverages"
                            className={`w-full p-4 rounded-2xl border transition-all font-bold ${isDarkMode
                                    ? 'bg-[#0a0c10] border-slate-800 text-white focus:border-cyan-500/50'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500/50'
                                }`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Deploy Category
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryModal;
