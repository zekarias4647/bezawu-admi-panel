
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Package, AlertTriangle, CheckCircle2, X, TrendingUp, BarChart2, Info, Edit3, Save, Sparkles, Scale, Box, Trash2, PlusCircle, Infinity, Loader2, RotateCcw } from 'lucide-react';

interface InventoryProps {
  isDarkMode: boolean;
  onAddProduct: () => void;
  onSelectProduct: (product: any) => void;
}

const getImageUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://branchapi.ristestate.com${url.startsWith('/') ? '' : '/'}${url}`;
};

export const Inventory: React.FC<InventoryProps> = ({ isDarkMode, onAddProduct, onSelectProduct }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const fetchItems = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`https://branchapi.ristestate.com/api/products/products-get?showDeleted=${showTrash}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error('Expected array of products, got:', data);
          setItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://branchapi.ristestate.com/api/categories/categories-get', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.filter((c: any) => !c.parent_id)); // Only main categories
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      item.name?.toLowerCase().includes(searchLower) ||
      item.id?.toString().toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower) ||
      item.subcategory?.toLowerCase().includes(searchLower)
    );
    const matchesCategory = selectedCategoryId ? item.category_id === selectedCategoryId : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [showTrash]);

  const handleToggleStatus = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://branchapi.ristestate.com/api/products/${productId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === productId ? { ...item, is_active: !item.is_active } : item));
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleRestore = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://branchapi.ristestate.com/api/products/${productId}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Failed to restore product', err);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Inventory...</div>;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* ... (Header) ... */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{showTrash ? 'Recycle Bin' : 'Branch Inventory'}</h1>
          <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-xs mt-0.5`}>{showTrash ? 'Restore previously deleted products' : 'Manage product availability and stock levels'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchItems}
            className={`border px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >

            REFRESH
          </button>
          <button
            onClick={onAddProduct}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
          >
            <Plus size={16} />
            ADD PRODUCT
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className={`flex-1 border rounded-xl px-4 py-2 flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800 focus-within:border-green-500/50' : 'bg-white border-slate-200 focus-within:border-green-500'
          }`}>
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search catalog..."
            className="bg-transparent border-none w-full focus:outline-none placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowTrash(!showTrash)}
          className={`border px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${showTrash
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'
            : isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
        >
          <Trash2 size={18} />
          {showTrash ? 'View Active' : 'Recycle Bin'}
        </button>
        <button className={`border px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Horizontal Category Filter */}
      {!showTrash && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${!selectedCategoryId
              ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
              : isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategoryId === cat.id
                ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                : isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className={`border rounded-2xl overflow-hidden transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`border-b transition-colors ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <tr>
                <th className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Product</th>
                <th className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Category</th>
                <th className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Price</th>
                <th className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Stock</th>
                <th className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Availability</th>
                <th className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Status</th>
                <th className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-right ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {filteredItems.map((item) => (
                <tr key={item.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors overflow-hidden ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                        {item.image_url ? (
                          <img src={getImageUrl(item.image_url) || ''} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                          {item.is_fasting && (
                            <span className="bg-emerald-500/10 text-emerald-500 text-[7px] font-black px-1 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tighter">Fasting</span>
                          )}
                        </div>
                        <p className={`text-[9px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${isDarkMode ? 'text-slate-400 bg-slate-800' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
                        {item.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.price} ETB</span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-bold flex items-center gap-1 ${item.stock === -1 ? 'text-indigo-400' : item.stock < 10 ? 'text-red-500' : isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.stock === -1 ? (
                        <Infinity size={12} className="opacity-70" />
                      ) : (
                        `${item.stock}`
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${item.status === 'In Stock' ? 'text-green-500' :
                        item.status === 'Low Stock' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${item.is_active
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                        : 'bg-slate-700/10 border-slate-700/20 text-slate-500 hover:bg-slate-700/20'
                        }`}
                    >
                      <div className={`w-1 h-1 rounded-full ${item.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onSelectProduct(item)}
                      className={`text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-slate-500 hover:text-green-500' : 'text-slate-400 hover:text-green-600'
                        }`}
                    >
                      Inspect
                    </button>
                    {showTrash ? (
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="ml-4 text-xs font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw size={16} />
                        RESTORE
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to move this product to Trash?')) {
                            const token = localStorage.getItem('token');
                            fetch(`https://branchapi.ristestate.com/api/products/${item.id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            })
                              .then(res => {
                                if (res.ok) fetchItems();
                              })
                              .catch(err => console.error(err));
                          }
                        }}
                        className="ml-4 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors"
                        title="Move to Trash"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdjustStockModal: React.FC<{ product: any, onClose: () => void, onSuccess: () => void, isDarkMode: boolean }> = ({ product, onClose, onSuccess, isDarkMode }) => {
  const [newStock, setNewStock] = useState(product.stock.toString());
  const [newPrice, setNewPrice] = useState(product.price.toString());
  const [categoryId, setCategoryId] = useState(product.category_id || '');
  const [subcategoryId, setSubcategoryId] = useState(product.subcategory_id || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://branchapi.ristestate.com/api/categories/categories-get', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://branchapi.ristestate.com/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stock: parseFloat(newStock),
          price: parseFloat(newPrice),
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null
        })
      });
      if (res.ok) {
        onSuccess(); // Refresh list without reload
        onClose();   // Close modal
      } else {
        console.error('Failed to update product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#1a1d23] border-slate-700' : 'bg-white border-slate-200'
        }`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-700/10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500">
              <Edit3 size={20} />
            </div>
            <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Adjust Product</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Unit Count</label>
              <input
                type="number"
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Price (ETB)</label>
              <input
                type="number"
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
              Category
              {catLoading && <Loader2 size={10} className="animate-spin text-blue-500" />}
            </label>
            <select
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId('');
              }}
            >
              <option value="">Uncategorized</option>
              {categories.filter(c => !c.parent_id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">Subcategory</label>
            <select
              disabled={!categoryId}
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                } ${!categoryId ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
            >
              <option value="">None</option>
              {categories.filter(c => c.parent_id === categoryId).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProductDetailModal: React.FC<{ product: any, onClose: () => void, onRefresh: () => void, isDarkMode: boolean }> = ({ product, onClose, onRefresh, isDarkMode }) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const stockPercentage = Math.min((product.stock / 150) * 100, 100);
  const isWeightBased = ['kg', 'g', 'lb', 'oz'].includes(product.unit?.toLowerCase());

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'} max-h-[90vh] flex flex-col`}>

        {/* Hero Header */}
        <div className={`relative overflow-hidden shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-[#0f1115] via-[#121418] to-[#1a1d23]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90 z-10" />

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, currentColor 1px, transparent 0)', backgroundSize: '50px 50px' }} />

          <div className="relative px-6 pt-6 pb-5 flex items-start gap-4">
            {/* Product Image */}
            <div className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 shadow-lg ${isDarkMode ? 'border-slate-700 bg-[#0f1115]' : 'border-slate-200 bg-slate-50'}`}>
              {product.image_url ? (
                <img src={getImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className={`${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} size={32} />
                </div>
              )}
            </div>

            {/* Title + Meta */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${product.is_active !== false
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
                  }`}>
                  {product.is_active !== false ? '● Active' : '● Inactive'}
                </div>
                {product.is_fasting && (
                  <div className="px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500">
                    🌙 Fasting
                  </div>
                )}
                <div className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${product.status === 'In Stock' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                  {product.status}
                </div>
              </div>
              <h2 className={`text-2xl font-bold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{product.name}</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                SKU: {product.id?.slice(0, 12)}...
              </p>
            </div>

            {/* Close */}
            <button onClick={onClose} className={`p-2 rounded-xl transition-all shrink-0 ${isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Stock Card */}
            <div className={`p-5 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-violet-500 opacity-80" />

              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-500/10 p-1.5 rounded-md">
                  <Package size={14} className="text-blue-500" />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stock Integrity</span>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <h3 className={`text-3xl font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {product.stock === -1 ? <Infinity size={36} className="text-indigo-500" /> : product.stock}
                </h3>
                <div className="flex flex-col pb-0.5">
                  <span className="text-xs text-blue-500 font-bold uppercase tracking-widest leading-none">
                    {product.stock === -1 ? 'Unlimited' : (product.unit || 'Units')}
                  </span>
                  <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {product.stock === -1 ? 'No stock monitoring' : (isWeightBased ? 'Measured by Weight' : 'Counted Asset')}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${product.stock === -1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : product.stock < 20 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                    style={{ width: `${product.stock === -1 ? 100 : stockPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Current Level</span>
                  <span>{product.stock === -1 ? 'Continuous Supply' : `${Math.round(stockPercentage)}% Capacity`}</span>
                </div>
              </div>
            </div>

            {/* Pricing & Category Card */}
            <div className="space-y-4">
              {/* Price */}
              <div className={`p-4 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 opacity-80" />

                <div className="flex items-center gap-2 mb-2.5">
                  <div className="bg-amber-500/10 p-1.5 rounded-md">
                    <TrendingUp size={12} className="text-amber-500" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Market Price</span>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.price}</span>
                  <span className="text-xs font-bold text-amber-500">ETB</span>
                  <span className="text-[9px] text-slate-500 font-bold">/ {product.unit || 'Unit'}</span>
                </div>

                <div className={`mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${isDarkMode ? 'bg-[#1a1d23]' : 'bg-white'}`}>
                  <div className="bg-blue-500/10 p-1 rounded">
                    {isWeightBased ? <Scale size={10} className="text-blue-500" /> : <Box size={10} className="text-blue-500" />}
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    {isWeightBased ? 'Price per Weight' : 'Price per Unit'}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className={`p-4 rounded-2xl border relative overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-80" />

                <div className="flex items-center gap-2 mb-2.5">
                  <div className="bg-emerald-500/10 p-1.5 rounded-md">
                    <BarChart2 size={12} className="text-emerald-500" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Category</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.category}</span>
                  {product.subcategory && (
                    <>
                      <div className={`w-4 h-[2px] rounded-full ${isDarkMode ? 'bg-gradient-to-r from-emerald-500/50 to-cyan-500/50' : 'bg-gradient-to-r from-emerald-300 to-cyan-300'}`} />
                      <span className="text-xs font-bold text-emerald-500">{product.subcategory}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Specs Card - Full Width */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className={`p-5 rounded-2xl border relative overflow-hidden md:col-span-2 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-500 opacity-80" />

                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-purple-500/10 p-1.5 rounded-md">
                    <Sparkles size={12} className="text-purple-500" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Specifications</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className={`px-3 py-2 rounded-xl ${isDarkMode ? 'bg-[#1a1d23]' : 'bg-white'}`}>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">{key.replace(/_/g, ' ')}</span>
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {typeof value === 'boolean' ? (value ? '✓ Yes' : '✗ No') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addons Card - Full Width */}
            {product.product_addons && product.product_addons.length > 0 && (
              <div className={`p-5 rounded-2xl border relative overflow-hidden md:col-span-2 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-pink-400 to-fuchsia-500 opacity-80" />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-rose-500/10 p-1.5 rounded-md">
                      <PlusCircle size={12} className="text-rose-500" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Available Addons</span>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-500'}`}>
                    {product.product_addons.length} option{product.product_addons.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.product_addons.map((addon: any, index: number) => (
                    <div key={index} className={`flex items-center justify-between px-3 py-2 rounded-xl ${isDarkMode ? 'bg-[#1a1d23]' : 'bg-white'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded ${isDarkMode ? 'bg-rose-500/10 text-rose-500/60' : 'bg-rose-50 text-rose-300'}`}>{index + 1}</span>
                        <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{addon.name}</span>
                      </div>
                      {addon.price && (
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          +{addon.price} ETB
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Strip */}
            <div className={`md:col-span-2 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              <Info size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">
                {isWeightBased ? 'Stock measured via calibrated digital scales.' : 'Asset tracked via individual SKU counts.'}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className={`px-6 py-4 flex items-center justify-between border-t shrink-0 ${isDarkMode ? 'bg-[#121418]/95 border-slate-800 backdrop-blur-md' : 'bg-white/95 border-slate-100 backdrop-blur-md'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Last updated: </span>
            <span className={`text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              Close
            </button>
            <button
              onClick={() => setShowAdjust(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-[10px] font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.97] uppercase tracking-widest flex items-center gap-1.5"
            >
              <Edit3 size={12} />
              Adjust Inventory
            </button>
          </div>
        </div>

        {showAdjust && (
          <AdjustStockModal
            product={product}
            onClose={() => setShowAdjust(false)}
            onSuccess={onRefresh}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;
