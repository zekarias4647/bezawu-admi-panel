
import React, { useState, useEffect } from 'react';
import { X, Gift, Tag, TextQuote, DollarSign, ImageIcon, Loader2, Save, Plus, Trash2, ListPlus } from 'lucide-react';

interface AddGiftModalProps {
    onClose: () => void;
    onSuccess: () => void;
    isDarkMode: boolean;
}

interface GiftItemInput {
    product_id: string;
    product_name: string;
    quantity: string;
}

const AddGiftModal: React.FC<AddGiftModalProps> = ({ onClose, onSuccess, isDarkMode }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', price: '' });
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [items, setItems] = useState<GiftItemInput[]>([]);
    const [newItem, setNewItem] = useState<GiftItemInput>({ product_id: '', product_name: '', quantity: '1' });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/products/products-get', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();
    }, []);

    // Price Calculation
    useEffect(() => {
        const total = items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                return sum + (parseFloat(product.price) * parseInt(item.quantity));
            }
            return sum;
        }, 0);

        // Only auto-update if total > 0, otherwise keep manual price
        if (total > 0) {
            setFormData(prev => ({ ...prev, price: total.toFixed(2) }));
        }
    }, [items, products]);

    const handleAddItem = () => {
        if (newItem.product_id && newItem.quantity) {
            setItems([...items, newItem]);
            setNewItem({ product_id: '', product_name: '', quantity: '1' });
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let imageUrl = null;

            if (mediaFile) {
                const form = new FormData();
                form.append('image', mediaFile);
                const uploadRes = await fetch('http://localhost:5000/api/upload/image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: form
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    imageUrl = data.imageUrl;
                }
            } else if (items.length > 0) {
                const firstProduct = products.find(p => p.id === items[0].product_id);
                if (firstProduct) imageUrl = firstProduct.image_url;
            }

            const res = await fetch('http://localhost:5000/api/gifts/gifts-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    image_url: imageUrl,
                    items: items
                })
            });

            if (res.ok) onSuccess();
            else console.error('Failed to create gift');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`max-w-4xl w-full rounded-[3rem] overflow-hidden shadow-[0_60px_100px_-30px_rgba(0,0,0,0.5)] transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'}`}>

                {/* Header */}
                <div className="px-12 pt-12 pb-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
                            <Gift className="text-green-500" size={36} />
                        </div>
                        <div>
                            <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Initiate Gift</h2>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mt-1">Gift Protocol Definition</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-3 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                        <X size={32} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-12 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Gift Info */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Tag size={12} className="text-green-500" /> Gift Label
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Luxury Birthday Box"
                                    className={`w-full px-8 py-5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 font-bold ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <TextQuote size={12} className="text-green-500" /> Description Brief
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief definition of what's inside..."
                                    className={`w-full px-8 py-5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 font-medium leading-relaxed ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <DollarSign size={12} className="text-green-500" /> Calculated Value (ETB)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className={`w-full px-8 py-5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-green-500/10 font-black ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <ImageIcon size={12} className="text-green-500" /> Visual Asset
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="gift-image-final"
                                            className="hidden"
                                            onChange={e => e.target.files && setMediaFile(e.target.files[0])}
                                        />
                                        <label
                                            htmlFor="gift-image-final"
                                            className={`w-full px-8 py-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 hover:border-green-500 ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                        >
                                            <ImageIcon size={18} className="text-green-500" />
                                            <span className="text-sm font-medium truncate">
                                                {mediaFile ? mediaFile.name : 'Choose...'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Asset manifest selection */}
                        <div className="space-y-8 flex flex-col">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <ListPlus size={12} className="text-green-500" /> Manifest Inventory
                                </label>
                                <div className="flex gap-4">
                                    <select
                                        className={`flex-1 px-6 py-4 rounded-xl border transition-all focus:outline-none font-bold text-sm ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        value={newItem.product_id}
                                        onChange={e => {
                                            const prod = products.find(p => p.id === e.target.value);
                                            setNewItem({ ...newItem, product_id: e.target.value, product_name: prod ? prod.name : '' });
                                        }}
                                    >
                                        <option value="">Select Asset...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        className={`w-24 px-4 py-4 rounded-xl border transition-all focus:outline-none font-black text-center text-sm ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="p-4 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all shadow-lg shadow-green-500/20 active:scale-90"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Manifest Scroller */}
                            <div className={`flex-1 rounded-[2rem] border overflow-y-auto max-h-[300px] custom-scrollbar ${isDarkMode ? 'bg-[#0f1115] border-slate-800/50' : 'bg-slate-50 border-slate-200'}`}>
                                {items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 italic p-10">
                                        <ListPlus size={40} className="opacity-10 mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-center">No assets in protocol manifest</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-800/20">
                                        {items.map((item, index) => {
                                            const prod = products.find(p => p.id === item.product_id);
                                            const total = prod ? (parseFloat(prod.price) * parseInt(item.quantity)).toFixed(2) : '0.00';
                                            return (
                                                <div key={index} className="p-5 flex items-center justify-between group hover:bg-green-500/5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center font-black text-xs">{item.quantity}</span>
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{item.product_name}</span>
                                                            <span className="text-[10px] text-slate-500">@ {prod ? parseFloat(prod.price).toFixed(2) : '0.00'} ETB</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-sm font-black text-green-500">{total} ETB</span>
                                                        <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-slate-600 hover:text-rose-500">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-12 flex gap-6">
                        <button type="button" onClick={onClose} className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            Abort Entry
                        </button>
                        <button type="submit" disabled={loading} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl text-xs transition-all shadow-[0_20px_40px_-10px_rgba(34,197,94,0.4)] active:scale-[0.98] uppercase tracking-[0.4em] flex items-center justify-center gap-3 disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {loading ? 'Committing...' : 'Commit Gift Manifest'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGiftModal;
