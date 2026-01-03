
import React, { useState, useEffect } from 'react';
import { X, Plus, Gift, Tag, DollarSign, Image as ImageIcon, TextQuote, Save, Trash2, ListPlus, Percent } from 'lucide-react';

interface BundleItemInput {
  product_id: string;
  product_name: string;
  quantity: string;
}

interface AddBundleModalProps {
  onClose: () => void;
  isDarkMode: boolean;
}

const AddBundleModal: React.FC<AddBundleModalProps> = ({ onClose, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [items, setItems] = useState<BundleItemInput[]>([]);
  const [newItem, setNewItem] = useState<BundleItemInput>({ product_id: '', product_name: '', quantity: '1' });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/products/products-get', {
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

  // Automatically calculate total price when items change
  useEffect(() => {
    const total = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        return sum + (parseFloat(product.price) * parseInt(item.quantity));
      }
      return sum;
    }, 0);

    setFormData(prev => ({ ...prev, price: total > 0 ? total.toFixed(2) : '' }));
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
    setError('');

    try {
      const token = localStorage.getItem('token');

      let imageUrl = formData.image_url;

      // Upload image if file is selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadResponse = await fetch('http://localhost:5000/api/upload/image', {
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
          quantity: parseInt(item.quantity)
        }))
      };

      const response = await fetch('http://localhost:5000/api/bundles/bundles-post', {
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

      // Success - close modal
      onClose();
      window.location.reload(); // Refresh to show new bundle
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`max-w-4xl w-full rounded-[3rem] overflow-hidden shadow-[0_60px_100px_-30px_rgba(0,0,0,0.5)] transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
        }`}>
        <div className="px-12 pt-12 pb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
              <Gift className="text-emerald-500" size={36} />
            </div>
            <div>
              <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Initiate Package</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mt-1">Bundle Manifest Definition Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-3 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
            <X size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-12 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Basic Info */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Tag size={12} className="text-emerald-500" /> Manifest Label
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Tactical Family Provisioning"
                  className={`w-full px-8 py-5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <TextQuote size={12} className="text-emerald-500" /> Tactical Briefing
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description for the customer catalog..."
                  className={`w-full px-8 py-5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-medium leading-relaxed ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <DollarSign size={12} className="text-emerald-500" /> Target Price (ETB)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full px-8 py-5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-black ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Percent size={12} className="text-emerald-500" /> Discount (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    className={`w-full px-8 py-5 rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-black ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                    <ImageIcon size={12} className="text-emerald-500" /> Bundle Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="bundle-image"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          // Create preview URL
                          const url = URL.createObjectURL(file);
                          setFormData({ ...formData, image_url: url });
                        }
                      }}
                    />
                    <label
                      htmlFor="bundle-image"
                      className={`w-full px-8 py-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 hover:border-emerald-500 ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                    >
                      <ImageIcon size={18} className="text-emerald-500" />
                      <span className="text-sm font-medium truncate">
                        {imageFile ? imageFile.name : 'Choose...'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                  <p className="text-rose-500 text-sm font-bold">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Item Manifest Addition */}
            <div className="space-y-8 flex flex-col">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <ListPlus size={12} className="text-emerald-500" /> Manifest Inventory
                </label>

                <div className="flex gap-4">
                  <select
                    className={`flex-1 px-6 py-4 rounded-xl border transition-all focus:outline-none font-bold text-sm ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
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
                    <option value="">Select Product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty"
                    className={`w-24 px-4 py-4 rounded-xl border transition-all focus:outline-none font-black text-center text-sm ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    value={newItem.quantity}
                    onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="p-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/20 active:scale-90 mr-1"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>

              <div className={`flex-1 rounded-[2rem] border overflow-y-auto max-h-[300px] custom-scrollbar ${isDarkMode ? 'bg-[#0f1115] border-slate-800/50' : 'bg-slate-50 border-slate-200'
                }`}>
                {items.length === 0 ? (
                  <div className="h-full flex flex-shrink-0 items-center justify-center flex-col text-slate-600 italic p-10">
                    <ListPlus size={40} className="opacity-10 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No assets in manifest</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/20">
                    {items.map((item, index) => {
                      const product = products.find(p => p.id === item.product_id);
                      const itemTotal = product ? (parseFloat(product.price) * parseInt(item.quantity)).toFixed(2) : '0.00';

                      return (
                        <div key={index} className="p-5 flex items-center justify-between group hover:bg-emerald-500/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">{item.quantity}</span>
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{item.product_name}</span>
                              <span className="text-[10px] text-slate-500 font-medium">@ {product ? parseFloat(product.price).toFixed(2) : '0.00'} ETB</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-sm font-black text-emerald-500">{itemTotal} ETB</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                            >
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

          <div className="mt-12 flex gap-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              Abort Entry
            </button>
            <button
              type="submit"
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl text-xs transition-all shadow-[0_20px_40px_-10px_rgba(5,150,105,0.4)] active:scale-[0.98] uppercase tracking-[0.4em] flex items-center justify-center gap-3"
            >
              <Save size={20} />
              Commit Bundle Manifest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBundleModal;
