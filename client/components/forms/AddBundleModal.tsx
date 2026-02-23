
import React, { useState, useEffect } from 'react';
import { X, Plus, Gift, Tag, DollarSign, Image as ImageIcon, TextQuote, Save, Trash2, ListPlus, Percent, ShoppingBag, Loader2, Sparkles, ChevronRight, Calculator, Zap } from 'lucide-react';

interface BundleItemInput {
  product_id: string;
  product_name: string;
  quantity: string;
  selected_addons: any[];
}

interface AddBundleModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  isDarkMode: boolean;
}

const AddBundleModal: React.FC<AddBundleModalProps> = ({ onClose, onSuccess, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    image_url: '',
  });
  const [bundleAddons, setBundleAddons] = useState<{ name: string, price: string }[]>([]);
  const [newBundleAddon, setNewBundleAddon] = useState({ name: '', price: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UI Toggles
  const [showExtras, setShowExtras] = useState(false);

  const [items, setItems] = useState<BundleItemInput[]>([]);
  const [newItem, setNewItem] = useState<BundleItemInput>({ product_id: '', product_name: '', quantity: '1', selected_addons: [] });
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [currentAddonsProduct, setCurrentAddonsProduct] = useState<any>(null);
  const [tempAddons, setTempAddons] = useState<any[]>([]);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://branchapi.ristestate.com/api/products/products-get', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Automatically calculate total price when items or options change
  useEffect(() => {
    let total = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        let itemPrice = parseFloat(product.price);
        if (item.selected_addons) {
          item.selected_addons.forEach((addon: any) => {
            if (addon.price) itemPrice += parseFloat(addon.price);
          });
        }
        return sum + (itemPrice * parseInt(item.quantity));
      }
      return sum;
    }, 0);

    // Add bundle-level custom option prices
    if (showExtras) {
      bundleAddons.forEach(addon => {
        if (addon.price) total += parseFloat(addon.price);
      });
    }

    // Apply discount
    const discountVal = parseFloat(formData.discount || '0');
    if (discountVal > 0 && discountVal <= 100) {
      total = total * (1 - discountVal / 100);
    }

    if (total > 0) {
      setFormData(prev => ({ ...prev, price: total.toFixed(2) }));
    }
  }, [items, products, bundleAddons, formData.discount, showExtras]);

  const handleAddItem = () => {
    if (newItem.product_id && newItem.quantity) {
      const product = products.find(p => p.id === newItem.product_id);
      if (product && product.product_addons && product.product_addons.length > 0) {
        setCurrentAddonsProduct(product);
        setTempAddons([]);
        setShowAddonsModal(true);
      } else {
        setItems([...items, newItem]);
        setNewItem({ product_id: '', product_name: '', quantity: '1', selected_addons: [] });
      }
    }
  };

  const confirmAddons = () => {
    setItems([...items, { ...newItem, selected_addons: tempAddons }]);
    setNewItem({ product_id: '', product_name: '', quantity: '1', selected_addons: [] });
    setShowAddonsModal(false);
    setCurrentAddonsProduct(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddBundleAddon = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();

    if (newBundleAddon.name && newBundleAddon.price !== '') {
      setBundleAddons([...bundleAddons, {
        name: newBundleAddon.name,
        price: newBundleAddon.price || '0'
      }]);
      setNewBundleAddon({ name: '', price: '' });
    }
  };

  const handleRemoveBundleAddon = (index: number) => {
    setBundleAddons(bundleAddons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('At least one product is required in the bundle.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      let imageUrl = null;

      // Upload image if file is selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadResponse = await fetch('https://branchapi.ristestate.com/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.imageUrl;
        } else {
          throw new Error('Image upload failed');
        }
      } else if (items.length > 0) {
        // Fallback to first item's image if none provided
        const firstProduct = products.find(p => p.id === items[0].product_id);
        if (firstProduct) imageUrl = firstProduct.image_url;
      }

      // Prepare bundle data
      const bundleData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount || '0'),
        image_url: imageUrl,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity),
          selected_addons: item.selected_addons
        })),
        bundle_addons: showExtras ? bundleAddons.map(a => ({ name: a.name, price: parseFloat(a.price) })) : []
      };

      const response = await fetch('https://branchapi.ristestate.com/api/bundles/bundles-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bundleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create bundle');
      }

      // Success - Soft Refresh
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-3xl w-full rounded-[2rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'} max-h-[90vh] flex flex-col`}>

        {/* Header */}
        <div className={`relative overflow-hidden shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-[#0f1115] via-[#121418] to-[#1a1d23]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-90 z-10" />

          <div className="relative px-6 pt-5 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border transition-colors ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                <Gift className="text-emerald-500" size={24} />
              </div>
              <div>
                <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Create Bundle</h2>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mt-0.5">Combine multiple products into a single package</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* LEFT COLUMN: Identity & Pricing */}
              <div className="space-y-4">

                {/* Bundle Identity Card */}
                <div className={`p-4 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 opacity-80" />

                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-amber-500/10 p-1.5 rounded-lg">
                      <Tag size={14} className="text-amber-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bundle Identity</span>
                  </div>

                  <div className="flex gap-4 mb-4">
                    {/* Image Upload */}
                    <div className="relative shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        id="bundle-image-main"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            const url = URL.createObjectURL(file);
                            setFormData({ ...formData, image_url: url });
                          }
                        }}
                      />
                      <label
                        htmlFor="bundle-image-main"
                        className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer group ${formData.image_url
                          ? 'border-emerald-500/40 p-0 overflow-hidden'
                          : isDarkMode ? 'border-slate-700 hover:border-amber-500/50 bg-[#1a1d23]' : 'border-slate-200 hover:border-amber-400 bg-white'
                          }`}
                      >
                        {formData.image_url ? (
                          <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <ImageIcon size={14} className="text-amber-500/60 group-hover:text-amber-500 transition-colors mb-0.5" />
                            <span className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">Photo</span>
                          </>
                        )}
                      </label>
                      {formData.image_url && (
                        <button
                          type="button"
                          onClick={() => { setFormData({ ...formData, image_url: '' }); setImageFile(null); }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg"
                        >
                          <X size={8} />
                        </button>
                      )}
                    </div>

                    {/* Bundle Name */}
                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Bundle Name *</span>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Tactical Family Provisioning"
                        className={`w-full px-3 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-medium ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <span className={`text-[8px] font-bold uppercase tracking-widest block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Description</span>
                    <textarea
                      required
                      rows={2}
                      placeholder="Briefly describe what's inside this bundle..."
                      className={`w-full px-3 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-normal resize-none leading-relaxed ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900'}`}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pricing & Discount Card */}
                <div className={`p-4 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-80" />

                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                      <Calculator size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Strategy</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Calculated Price</span>
                      <div className="relative">
                        <input
                          required
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className={`w-full px-3 py-2 pr-12 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                          value={formData.price}
                          onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-emerald-500 uppercase">ETB</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Bundle Discount</span>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0"
                          className={`w-full px-3 py-2 pr-8 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-rose-500' : 'bg-white border-slate-200 text-rose-600'}`}
                          value={formData.discount}
                          onChange={e => setFormData({ ...formData, discount: e.target.value })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bundle Extras Card (with Toggle) */}
                <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'} ${showExtras ? 'ring-2 ring-purple-500/20' : ''}`}>
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-500 opacity-80" />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-500/10 p-1.5 rounded-lg">
                        <Zap size={14} className="text-purple-500" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bundle Extras</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExtras(!showExtras)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showExtras ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-500'}`}
                    >
                      {showExtras ? 'Enabled' : 'Disabled'}
                      <ChevronRight size={10} className={`transition-transform duration-300 ${showExtras ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {showExtras ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Gift Wrap"
                          className={`flex-1 px-3 py-2.5 rounded-xl border transition-all focus:outline-none text-xs font-bold ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          value={newBundleAddon.name}
                          onChange={e => setNewBundleAddon({ ...newBundleAddon, name: e.target.value })}
                          onKeyDown={handleAddBundleAddon}
                        />
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="0"
                            className={`w-20 px-3 py-2.5 rounded-xl border transition-all focus:outline-none text-xs font-black text-right pr-10 ${isDarkMode ? 'bg-[#1a1d23] border-slate-700 text-emerald-400' : 'bg-white border-slate-200'}`}
                            value={newBundleAddon.price}
                            onChange={e => setNewBundleAddon({ ...newBundleAddon, price: e.target.value })}
                            onKeyDown={handleAddBundleAddon}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-500">ETB</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddBundleAddon()}
                          className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="max-h-[120px] overflow-y-auto custom-scrollbar space-y-1.5">
                        {bundleAddons.map((addon, idx) => (
                          <div key={idx} className={`flex items-center justify-between px-3 py-2.5 rounded-xl group transition-all ${isDarkMode ? 'bg-[#1a1d23] hover:bg-[#1e2129]' : 'bg-white hover:bg-slate-50 shadow-sm'}`}>
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-md ${isDarkMode ? 'bg-purple-500/10 text-purple-500/60' : 'bg-purple-50 text-purple-300'}`}>{idx + 1}</span>
                              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{addon.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">+{addon.price} ETB</span>
                              <button type="button" onClick={() => handleRemoveBundleAddon(idx)} className="p-1 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={`py-4 text-center transition-all ${isDarkMode ? 'text-slate-700 font-bold' : 'text-slate-300'}`}>
                      <span className="text-[9px] font-bold uppercase tracking-widest">Toggle to add custom bundle-level options</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Inventory Manifest */}
              <div className={`p-4 rounded-2xl border relative overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-emerald-400 to-green-500 opacity-80" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-teal-500/10 p-1.5 rounded-lg">
                      <ShoppingBag size={14} className="text-teal-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Products in Bundle</span>
                  </div>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${isDarkMode ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Add Product Row */}
                <div className={`flex gap-2 p-3 rounded-xl mb-4 ${isDarkMode ? 'bg-[#1a1d23]' : 'bg-white shadow-sm border border-slate-100'}`}>
                  <select
                    className={`flex-1 min-w-0 px-3 py-2.5 rounded-lg border transition-all focus:outline-none text-xs font-bold truncate ${isDarkMode ? 'bg-[#0f1115] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={newItem.product_id}
                    onChange={e => {
                      const selectedProduct = products.find(p => p.id === e.target.value);
                      setNewItem({
                        ...newItem,
                        product_id: e.target.value,
                        product_name: selectedProduct ? selectedProduct.name : ''
                      });
                    }}
                  >
                    <option value="">Select a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    className={`w-16 px-3 py-2.5 rounded-lg border transition-all focus:outline-none text-xs font-black text-center ${isDarkMode ? 'bg-[#0f1115] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    value={newItem.quantity}
                    onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!newItem.product_id}
                    className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 min-h-[250px]">
                  {items.length === 0 ? (
                    <div className={`h-full flex flex-col items-center justify-center py-20 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      <ListPlus size={40} className="mb-4 opacity-30" />
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">Manifest Empty</p>
                      <p className="text-[8px] font-bold">Select a product and quantity to begin</p>
                    </div>
                  ) : (
                    items.map((item, index) => {
                      const product = products.find(p => p.id === item.product_id);
                      const itemTotal = product ? (parseFloat(product.price) * parseInt(item.quantity)).toFixed(2) : '0.00';
                      return (
                        <div key={index} className={`flex items-center justify-between px-4 py-3.5 rounded-2xl group transition-all ${isDarkMode ? 'bg-[#1a1d23] hover:bg-[#1e2129]' : 'bg-white hover:bg-slate-50 shadow-sm border border-slate-100'}`}>
                          <div className="flex items-center gap-3.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                              {item.quantity}x
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-xs font-bold leading-none mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.product_name}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] text-slate-500 font-bold">@{product?.price || '0'} ETB</span>
                                {item.selected_addons && item.selected_addons.length > 0 && (
                                  <span className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-tighter">+{item.selected_addons.length} MODS</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-emerald-500 tabular-nums">{itemTotal} ETB</span>
                            <button type="button" onClick={() => handleRemoveItem(index)} className="p-1.5 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className={`px-6 py-4 flex items-center justify-between border-t shrink-0 ${isDarkMode ? 'bg-[#121418]/95 border-slate-800 backdrop-blur-md' : 'bg-white/95 border-slate-100 backdrop-blur-md'}`}>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {parseFloat(formData.price || '0').toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                ETB Total
                {formData.discount !== '0' && <span className="text-[9px] text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded ml-1">-{formData.discount}%</span>}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-[9px] transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.97] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {loading ? 'Creating...' : 'Create Bundle'}
              </button>
            </div>
          </div>
        </form>

        {/* Sub-Modal: Addon Selection */}
        {showAddonsModal && currentAddonsProduct && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`max-w-md w-full rounded-[2.5rem] border overflow-hidden animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800 shadow-2xl shadow-black/80' : 'bg-white border-slate-200'}`}>
              <div className={`relative overflow-hidden ${isDarkMode ? 'bg-[#0f1115]' : 'bg-slate-50'}`}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-400 to-green-500 opacity-90" />
                <div className="px-8 pt-8 pb-5 flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl">
                    <Sparkles size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Select Add-ons</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">for {currentAddonsProduct.name}</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                {currentAddonsProduct.product_addons?.map((addon: any, idx: number) => {
                  const isSelected = tempAddons.some(a => a.name === addon.name);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isSelected) setTempAddons(prev => prev.filter(a => a.name !== addon.name));
                        else setTempAddons(prev => [...prev, addon]);
                      }}
                      className={`px-4 py-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'bg-emerald-500/10 border-emerald-500' : isDarkMode ? 'bg-[#0f1115] border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500' : isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? 'text-emerald-500' : isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{addon.name}</span>
                      </div>
                      <span className={`text-xs font-black tabular-nums transition-all ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>+{addon.price} ETB</span>
                    </div>
                  );
                })}
              </div>

              <div className="px-8 pb-8 pt-3 flex gap-3">
                <button
                  onClick={() => { setShowAddonsModal(false); setNewItem({ product_id: '', product_name: '', quantity: '1', selected_addons: [] }); }}
                  className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  Back
                </button>
                <button
                  onClick={confirmAddons}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.97]"
                >
                  Confirm {tempAddons.length > 0 ? `(${tempAddons.length} selected)` : ''}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.3); }
        `}</style>
      </div>
    </div>
  );
};

export default AddBundleModal;
