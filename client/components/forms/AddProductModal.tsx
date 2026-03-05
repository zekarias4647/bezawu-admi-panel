
import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Tag, Layers, DollarSign, Database, Plus, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';

interface AddProductModalProps {
    onClose: () => void;
    onAddCategory: () => void;
    onSuccess?: () => void;
    isDarkMode: boolean;
    user: User;
}

interface Category {
    id: string;
    name: string;
    parent_id: string | null;
}

interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean';
    required?: boolean;
    options?: string[]; // For select inputs
    placeholder?: string;
}

interface BusinessTypeConfig {
    name: string;
    schema: FieldConfig[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddCategory, onSuccess, isDarkMode, user }) => {
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        subcategory_id: '',
        price: '',
        stock: '0',
        unit: 'pcs',
        is_fasting: false
    });
    const [showSuccess, setShowSuccess] = useState(false);

    // Dynamic specs state
    const [specs, setSpecs] = useState<Record<string, any>>({});
    const [config, setConfig] = useState<BusinessTypeConfig | null>(null);
    const [addons, setAddons] = useState<{ id: string, name: string, price: string }[]>([]);
    const [showAddons, setShowAddons] = useState(false);
    const [showUnitPicker, setShowUnitPicker] = useState(false);

    const addAddon = () => {
        setAddons(prev => [...prev, { id: Date.now().toString(), name: '', price: '' }]);
    };

    const removeAddon = (id: string) => {
        setAddons(prev => prev.filter(a => a.id !== id));
    };

    const updateAddon = (id: string, field: 'name' | 'price', value: string) => {
        setAddons(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const UNIT_GROUPS = [
        {
            label: 'Weight',
            units: [
                { label: 'Kilogram (kg)', value: 'kg' },
                { label: 'Gram (g)', value: 'g' },
                { label: 'Milligram (mg)', value: 'mg' },
                { label: 'Pound (lb)', value: 'lb' },
                { label: 'Ounce (oz)', value: 'oz' },
            ]
        },
        {
            label: 'Volume',
            units: [
                { label: 'Liter (L)', value: 'L' },
                { label: 'Milliliter (ml)', value: 'ml' },
                { label: 'Gallon (gal)', value: 'gal' },
                { label: 'Quart (qt)', value: 'qt' },
                { label: 'Pint (pt)', value: 'pt' },
                { label: 'Fluid Ounce (fl oz)', value: 'fl oz' },
            ]
        },
        {
            label: 'Count / Packaging',
            units: [
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
            ]
        },
        {
            label: 'Fresh Produce',
            units: [
                { label: 'Head', value: 'head' },
                { label: 'Ear', value: 'ear' },
                { label: 'Stalk', value: 'stalk' },
                { label: 'Stem', value: 'stem' },
            ]
        },
        {
            label: 'Length',
            units: [
                { label: 'Meter (m)', value: 'm' },
                { label: 'Centimeter (cm)', value: 'cm' },
            ]
        }
    ];

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [catLoading, setCatLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        setCatLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch categories
            const catRes = await fetch('https://branchapi.bezawcurbside.com/api/categories/categories-get', { headers });
            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(catData);

                // If there's a category and none selected, or selected one is missing, select the first top-level one
                const topLevelCats = catData.filter((c: Category) => !c.parent_id);
                if (topLevelCats.length > 0) {
                    const currentId = formData.category_id;
                    const exists = topLevelCats.find((c: Category) => c.id.toString() === currentId);
                    if (!currentId || !exists) {
                        setFormData(prev => ({ ...prev, category_id: topLevelCats[0].id.toString(), subcategory_id: '' }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCatLoading(false);
        }
    };

    const fetchBusinessConfig = async () => {
        if (!user.businessType) return;

        setConfigLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.bezawcurbside.com/api/business-types/${user.businessType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Handle different JSON structures in the config column (array vs object with schema/fields)
                const rawConfig = data.config;
                let schema = [];

                if (Array.isArray(rawConfig)) {
                    schema = rawConfig;
                } else if (rawConfig && typeof rawConfig === 'object') {
                    schema = rawConfig.schema || rawConfig.fields || [];
                }

                setConfig({
                    name: data.name,
                    schema: schema
                });
            } else {
                const errData = await response.json();
                setError(errData.message || `Protocol for ${user.businessType} not found.`);
            }
        } catch (error) {
            console.error('Error fetching business config:', error);
        } finally {
            setConfigLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchBusinessConfig();
    }, [user.businessType]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFile(e.target.files[0]);
        }
    };

    const handleSpecChange = (name: string, value: any) => {
        setSpecs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            let imageUrl = null;

            if (mediaFile) {
                console.log('Uploading image...', mediaFile.name);
                const formDataUpload = new FormData();
                formDataUpload.append('image', mediaFile);

                const uploadRes = await fetch('https://branchapi.bezawcurbside.com/api/upload/image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formDataUpload
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    console.log('Image uploaded successfully:', uploadData.imageUrl);
                    imageUrl = uploadData.imageUrl;
                } else {
                    const errorText = await uploadRes.text();
                    console.error('Image upload failed:', errorText);
                    throw new Error('Image upload failed. Please check file size/type.');
                }
            }

            const response = await fetch('https://branchapi.bezawcurbside.com/api/products/products-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                body: JSON.stringify({
                    name: formData.name,
                    category_id: formData.category_id || null,
                    subcategory_id: formData.subcategory_id || null,
                    price: parseFloat(formData.price),
                    description: `Stock level: ${formData.stock}`,
                    stock_quantity: parseFloat(formData.stock),
                    unit: formData.unit,
                    image_url: imageUrl,
                    is_fasting: formData.is_fasting,
                    specs: specs,
                    product_addons: addons.map(a => ({ name: a.name, price: parseFloat(a.price) }))
                }),
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 1500);
            } else {
                const errorData = await response.json();
                const msg = errorData.errors
                    ? errorData.errors.map((e: any) => e.msg).join(', ')
                    : errorData.message || 'Failed to add product. Please check all fields and try again.';
                setError(msg);
            }
        } catch (error: any) {
            console.error('Error adding product', error);
            setError(error.message || 'Could not connect to the server. Please check your internet and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
                } max-h-[90vh] overflow-y-auto custom-scrollbar`}>
                <div className="px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border transition-colors ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                            <PlusCircle className="text-emerald-500" size={18} />
                        </div>
                        <div>
                            <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>New Inventory Asset</h2>
                            <p className="text-[8px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-0.5">
                                {config?.name ? `${config.name} PROTOCOL` : 'CATALOG ENTRY PROTOCOL'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                        <X size={18} />
                    </button>
                </div>

                {/* Success Toast */}
                {showSuccess && (
                    <div className="mx-6 mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Product created successfully!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
                    {/* Identity — Image & Name Unified Card */}
                    <div className={`p-3 rounded-2xl border transition-all relative overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-pink-400 to-fuchsia-500 opacity-80" />

                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-rose-500/10 p-1.5 rounded-lg">
                                <Tag size={14} className="text-rose-500" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Identity</span>
                        </div>

                        <div className="flex gap-4">
                            {/* Image Upload */}
                            <div className="relative shrink-0">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="product-image-upload"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="product-image-upload"
                                    className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer group ${mediaFile
                                        ? 'border-emerald-500/40 p-0 overflow-hidden'
                                        : isDarkMode ? 'border-slate-700 hover:border-rose-500/50 bg-[#1a1d23]' : 'border-slate-200 hover:border-rose-400 bg-white'
                                        }`}
                                >
                                    {mediaFile ? (
                                        <img src={URL.createObjectURL(mediaFile)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <ImageIcon size={12} className="text-rose-500/60 group-hover:text-rose-500 transition-colors mb-0.5" />
                                            <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">Upload</span>
                                        </>
                                    )}
                                </label>
                                {mediaFile && (
                                    <button
                                        type="button"
                                        onClick={() => setMediaFile(null)}
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg"
                                    >
                                        <X size={8} />
                                    </button>
                                )}
                            </div>

                            {/* Product Name */}
                            <div className="flex-1 flex flex-col justify-center gap-1.5">
                                <span className={`text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Product Name</span>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Organic Avocado"
                                    className={`w-full px-2.5 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs font-medium ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                <span className={`text-[8px] font-bold tracking-wider ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>This name will appear on customer menus</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Dynamic Specs Section */}
                        {configLoading ? (
                            <div className="py-4 flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-emerald-500" size={24} />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Applying {user.businessType} Configuration</span>
                            </div>
                        ) : (
                            config?.schema.map((field, idx) => (
                                <div key={idx} className="space-y-2 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <Layers size={12} className="text-emerald-500" /> {field.label}
                                    </label>

                                    {field.type === 'select' || (field.options && field.options.length > 0) ? (
                                        <select
                                            required={field.required}
                                            className={`w-full px-3 py-2.5 rounded-xl border transition-all text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                            onChange={(e) => handleSpecChange(field.name, e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>{field.placeholder || `Select ${field.label}`}</option>
                                            {field.options?.map((opt: any, oIdx: number) => {
                                                const label = typeof opt === 'object' ? opt.label : opt;
                                                const value = typeof opt === 'object' ? opt.value : opt;
                                                return <option key={oIdx} value={value}>{label}</option>;
                                            })}
                                        </select>
                                    ) : field.type === 'boolean' ? (
                                        <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Enable {field.label}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleSpecChange(field.name, !specs[field.name])}
                                                className={`w-12 h-6 rounded-full transition-all relative ${specs[field.name] ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${specs[field.name] ? 'right-1' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ) : (
                                        <input
                                            required={field.required}
                                            type={field.type}
                                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                            className={`w-full px-3 py-2.5 rounded-xl border transition-all text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                            onChange={(e) => handleSpecChange(field.name, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))
                        )}

                        {/* Category Section — Unified Card */}
                        <div className={`p-3 rounded-2xl border transition-all relative overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            {/* Accent gradient bar */}
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-80" />

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                                        <Layers size={14} className="text-emerald-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Assignment</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={onAddCategory}
                                        className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${isDarkMode ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                                    >
                                        <Plus size={10} /> New
                                    </button>
                                    <button
                                        type="button"
                                        onClick={fetchCategories}
                                        className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 bg-slate-800 hover:bg-slate-700' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'}`}
                                    >
                                        <Loader2 size={10} className={catLoading ? "animate-spin" : ""} /> Refresh
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Main Category */}
                                <div className="flex-1 space-y-1.5">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Main</span>
                                    <select
                                        required
                                        className={`w-full px-3 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })}
                                    >
                                        {categories.filter(c => !c.parent_id).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                        {categories.filter(c => !c.parent_id).length === 0 && (
                                            <option value="">No categories found</option>
                                        )}
                                    </select>
                                </div>

                                {/* Arrow connector */}
                                <div className="flex flex-col items-center pt-5">
                                    <div className={`w-8 h-[2px] rounded-full ${isDarkMode ? 'bg-gradient-to-r from-emerald-500/50 to-cyan-500/50' : 'bg-gradient-to-r from-emerald-300 to-cyan-300'}`} />
                                    <span className="text-[8px] font-black text-slate-500 mt-0.5">›</span>
                                </div>

                                {/* Subcategory */}
                                <div className="flex-1 space-y-1.5">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-emerald-500/60' : 'text-emerald-400'}`}>Sub (Optional)</span>
                                    <select
                                        className={`w-full px-3 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                        value={formData.subcategory_id}
                                        onChange={e => setFormData({ ...formData, subcategory_id: e.target.value })}
                                    >
                                        <option value="">None / All</option>
                                        {categories.filter(c => c.parent_id === formData.category_id).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Unit — Unified Card */}
                        <div className={`p-3 rounded-2xl border transition-all relative ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[1.8rem] overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 opacity-80" /></div>

                            <div className="flex items-center gap-2 mb-3">
                                <div className="bg-amber-500/10 p-1.5 rounded-lg">
                                    <DollarSign size={14} className="text-amber-500" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing & Measurement</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Price */}
                                <div className="flex-1 space-y-1.5">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Unit Price</span>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            placeholder="0.00"
                                            className={`w-full px-3 py-2.5 pr-14 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-bold ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-amber-500 uppercase">ETB</span>
                                    </div>
                                </div>

                                {/* Connector */}
                                <div className="flex flex-col items-center pt-5">
                                    <div className={`w-6 h-[2px] rounded-full ${isDarkMode ? 'bg-gradient-to-r from-amber-500/50 to-rose-500/50' : 'bg-gradient-to-r from-amber-300 to-rose-300'}`} />
                                    <span className="text-[8px] font-black text-slate-500 mt-0.5">per</span>
                                </div>

                                {/* Unit — Combo Box */}
                                <div className="flex-1 space-y-1.5 relative">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-amber-500/60' : 'text-amber-400'}`}>Unit</span>
                                    <div className="relative group">
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. 250mg, 1kg, pcs"
                                            className={`w-full px-3 py-2 pr-8 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-medium ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                            onFocus={() => setShowUnitPicker(true)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowUnitPicker(!showUnitPicker)}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${isDarkMode ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
                                        >
                                            <Layers size={14} />
                                        </button>
                                    </div>
                                    {/* Unit Suggestions Dropdown */}
                                    {showUnitPicker && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowUnitPicker(false)} />
                                            <div className={`absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border shadow-xl max-h-[200px] overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#1a1d23] border-slate-700' : 'bg-white border-slate-200'}`}>
                                                {UNIT_GROUPS.map(group => (
                                                    <div key={group.label}>
                                                        <div className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest sticky top-0 ${isDarkMode ? 'bg-[#1a1d23] text-slate-500 border-b border-slate-800' : 'bg-slate-50 text-slate-400 border-b border-slate-100'}`}>
                                                            {group.label}
                                                        </div>
                                                        {group.units.map(u => (
                                                            <button
                                                                key={u.value}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, unit: u.value });
                                                                    setShowUnitPicker(false);
                                                                }}
                                                                className={`w-full text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-between ${formData.unit === u.value
                                                                    ? 'text-amber-500 bg-amber-500/10'
                                                                    : isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <span>{u.label}</span>
                                                                {formData.unit === u.value && <CheckCircle2 size={12} className="text-amber-500" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Fasting, Stock, Addons Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Fasting Toggle — inline within pricing card */}
                            <div className={`flex flex-col h-full px-3 py-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#1a1d23] border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="bg-emerald-500/10 p-1 rounded-lg">
                                            <span className="text-lg leading-none block">🌙</span>
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Fasting Product</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_fasting: !formData.is_fasting })}
                                        className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${formData.is_fasting ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${formData.is_fasting ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                                <span className={`text-[8px] mt-auto font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Target customers with dietary restrictions</span>
                            </div>
                            {/* Stock Management — Unified Card */}
                            <div className={`p-3 rounded-2xl border transition-all relative overflow-hidden flex flex-col h-full ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-violet-500 opacity-80" />

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-500/10 p-1.5 rounded-lg">
                                            <Database size={14} className="text-blue-500" />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stock Management</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const isTracking = formData.stock !== '-1';
                                            setFormData(prev => ({ ...prev, stock: isTracking ? '-1' : '0' }));
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase tracking-widest ${formData.stock !== '-1'
                                            ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')
                                            : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')
                                            }`}
                                    >
                                        <div className={`w-6 h-3.5 rounded-full transition-all relative ${formData.stock !== '-1' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-slate-600'}`}>
                                            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all shadow-sm ${formData.stock !== '-1' ? 'right-0.5' : 'left-0.5'}`} />
                                        </div>
                                        {formData.stock !== '-1' ? 'Tracking' : 'Unlimited'}
                                    </button>
                                </div>

                                {formData.stock !== '-1' ? (
                                    <div className="mt-auto animate-in slide-in-from-top-2 fade-in duration-300">
                                        <span className={`text-[8px] font-bold uppercase tracking-widest mb-1.5 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Available Quantity</span>
                                        <div className="relative">
                                            <input
                                                required
                                                type="number"
                                                placeholder="0"
                                                className={`w-full px-3 py-2 pr-14 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-medium ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                                value={formData.stock}
                                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-blue-500 uppercase">{formData.unit}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`mt-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                        <span className="text-base text-blue-500">∞</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Unlimited supply</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Addons — Unified Card */}
                            <div className={`p-3 rounded-2xl border transition-all relative overflow-hidden flex flex-col h-full ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-500 opacity-80" />

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-purple-500/10 p-1.5 rounded-lg">
                                            <Plus size={14} className="text-purple-500" />
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Product Addons</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddons(prev => {
                                                if (prev) setAddons([]);
                                                return !prev;
                                            });
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[9px] font-bold uppercase tracking-widest ${showAddons
                                            ? (isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600')
                                            : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')
                                            }`}
                                    >
                                        <div className={`w-6 h-3.5 rounded-full transition-all relative ${showAddons ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-slate-600'}`}>
                                            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all shadow-sm ${showAddons ? 'right-0.5' : 'left-0.5'}`} />
                                        </div>
                                        {showAddons ? 'Enabled' : 'Off'}
                                    </button>
                                </div>

                                {showAddons ? (
                                    <div className="mt-auto space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                                        {addons.map((addon, idx) => (
                                            <div key={addon.id} className={`flex gap-2 items-center p-3 rounded-xl border animate-in slide-in-from-right-2 duration-200 ${isDarkMode ? 'bg-[#1a1d23] border-slate-700' : 'bg-white border-slate-200'}`}>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Extra Cheese"
                                                    className={`w-1/2 px-2 py-1.5 rounded-lg border-0 text-xs font-bold transition-all focus:outline-none bg-transparent ${isDarkMode ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-300'}`}
                                                    value={addon.name}
                                                    onChange={(e) => updateAddon(addon.id, 'name', e.target.value)}
                                                />
                                                <div className={`flex-1 flex items-center gap-1 px-2 py-1.5 rounded-lg ${isDarkMode ? 'bg-[#0f1115] border border-slate-800' : 'bg-slate-50 border border-slate-200'}`}>
                                                    <span className="text-[9px] font-black text-slate-500">+</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        className={`w-full text-xs font-bold bg-transparent focus:outline-none text-right ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                                                        value={addon.price}
                                                        onChange={(e) => updateAddon(addon.id, 'price', e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAddon(addon.id)}
                                                    className="p-1 px-1.5 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addAddon}
                                            className={`w-full py-2 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-all ${isDarkMode ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/5' : 'border-purple-200 text-purple-500 hover:bg-purple-50'}`}
                                        >
                                            <PlusCircle size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Add Option</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`mt-auto flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">No custom variants enabled</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-[1.2rem] bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                            <div className="bg-rose-500/20 p-1 rounded-lg mt-0.5 shrink-0">
                                <X size={12} className="text-rose-500" />
                            </div>
                            <span className="text-rose-500 text-[10px] font-bold leading-relaxed">{error}</span>
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-2 rounded-xl text-[9px] transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.97] uppercase tracking-widest disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={14} />}
                            {loading ? 'Processing...' : 'Deploy Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
