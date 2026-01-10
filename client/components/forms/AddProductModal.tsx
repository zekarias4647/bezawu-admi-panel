
import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Tag, Layers, DollarSign, Database, Plus, ImageIcon, Loader2 } from 'lucide-react';

interface AddProductModalProps {
    onClose: () => void;
    onAddCategory: () => void;
    isDarkMode: boolean;
}

interface Category {
    id: string;
    name: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddCategory, isDarkMode }) => {
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        price: '',
        stock: '',
        unit: 'pcs'
    });

    const COMMON_UNITS = [
        // Weight
        { label: 'Kilogram (kg)', value: 'kg' },
        { label: 'Gram (g)', value: 'g' },
        { label: 'Milligram (mg)', value: 'mg' },
        { label: 'Pound (lb)', value: 'lb' },
        { label: 'Ounce (oz)', value: 'oz' },
        // Volume
        { label: 'Liter (L)', value: 'L' },
        { label: 'Milliliter (ml)', value: 'ml' },
        { label: 'Gallon (gal)', value: 'gal' },
        { label: 'Quart (qt)', value: 'qt' },
        { label: 'Pint (pt)', value: 'pt' },
        { label: 'Fluid Ounce (fl oz)', value: 'fl oz' },
        // Count / Packaging
        { label: 'Piece (pcs)', value: 'pcs' },
        { label: 'Pack (pk)', value: 'pack' },
        { label: 'Box', value: 'box' },
        { label: 'Bottle (btl)', value: 'btl' },
        { label: 'Can', value: 'can' },
        { label: 'Bag', value: 'bag' },
        { label: 'Bunch', value: 'bunch' },
        { label: 'Dozen (dz)', value: 'doz' },
        { label: 'Case', value: 'case' },
        { label: 'Tray', value: 'tray' },
        { label: 'Jar', value: 'jar' },
        { label: 'Tub', value: 'tub' },
        { label: 'Roll', value: 'roll' },
        { label: 'Sachet', value: 'sachet' },
        { label: 'Carton', value: 'carton' },
        { label: 'Container', value: 'container' },
        // Fresh Produce specific
        { label: 'Head', value: 'head' },
        { label: 'Ear', value: 'ear' },
        { label: 'Stalk', value: 'stalk' },
        { label: 'Stem', value: 'stem' },
        // Others
        { label: 'Meter (m)', value: 'm' },
        { label: 'Centimeter (cm)', value: 'cm' }
    ];

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch categories
                const catRes = await fetch('http://localhost:5000/api/categories/categories-get', { headers });
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData);
                    if (catData.length > 0) setFormData(prev => ({ ...prev, category_id: catData[0].id }));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            let imageUrl = null;

            if (mediaFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('image', mediaFile);
                const uploadRes = await fetch('http://localhost:5000/api/upload/image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formDataUpload
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    imageUrl = uploadData.imageUrl;
                }
            }

            const response = await fetch('http://localhost:5000/api/products/products-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    category_id: parseInt(formData.category_id, 10),

                    description: '', // Reset description or use a real description field if UI had one
                    sku: `SKU-${Math.floor(Math.random() * 10000)}`,
                    image_url: imageUrl,
                    unit: formData.unit,
                    stock: parseFloat(formData.stock) || 0
                    // branch_id is automatically assigned by backend from req.user
                }),
            });

            if (response.ok) {
                onClose();
                window.location.reload();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product', error);
            setError('System error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`max-w-xl w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
                }`}>
                <div className="px-10 pt-10 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                            <PlusCircle className="text-emerald-500" size={32} />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>New Inventory Asset</h2>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Catalog Entry Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                        <X size={28} />
                    </button>
                </div>

                <div className="px-10 mb-4">
                    <button
                        onClick={onAddCategory}
                        className="w-full py-4 border-2 border-dashed border-emerald-500/30 rounded-2xl flex items-center justify-center gap-3 text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/5 transition-all group"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                        Create New Category Definition
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-4">
                    {/* Media Upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <ImageIcon size={12} /> Product Image
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="product-image-upload"
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="product-image-upload"
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border border-dashed transition-all cursor-pointer ${isDarkMode ? 'bg-[#0f1115] border-slate-800 hover:border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-500'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                        {mediaFile ? (
                                            <img src={URL.createObjectURL(mediaFile)} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                                        ) : (
                                            <ImageIcon size={20} className="text-emerald-500" />
                                        )}
                                    </div>
                                    <div className={`text-xs font-bold ${mediaFile ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
                                        {mediaFile ? mediaFile.name : 'Select product photo...'}
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-500/10 px-3 py-1.5 rounded-lg">Upload</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Tag size={12} /> Product Name
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Organic Avocado"
                                className={`w-full px-6 py-3 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'
                                    }`}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={12} /> Category
                                </label>
                                <select
                                    required
                                    className={`w-full px-6 py-3 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    {categories.length > 0 ? (
                                        categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))
                                    ) : (
                                        <option value="">No categories found</option>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={12} /> Unit Price (ETB)
                                </label>
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    className={`w-full px-6 py-3 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                        }`}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Database size={12} /> Initial Stock
                                </label>
                                <input
                                    required
                                    type="number"
                                    placeholder="Qty"
                                    className={`w-full px-6 py-3 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                                        }`}
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <PlusCircle size={12} /> Unit
                                </label>
                                <select
                                    required
                                    className={`w-full px-6 py-3 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    {COMMON_UNITS.map(u => (
                                        <option key={u.value} value={u.value}>{u.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? 'Processing...' : 'Create Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
