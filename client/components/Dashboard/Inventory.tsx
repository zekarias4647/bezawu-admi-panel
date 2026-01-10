
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Package, AlertTriangle, CheckCircle2, X, TrendingUp, BarChart2, Info, Edit3, Save, Sparkles, Scale, Box, Trash2 } from 'lucide-react';

interface InventoryProps {
  isDarkMode: boolean;
  onAddProduct: () => void;
  onSelectProduct: (product: any) => void;
}

const getImageUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
};

export const Inventory: React.FC<InventoryProps> = ({ isDarkMode, onAddProduct, onSelectProduct }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/products/products-get', {
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

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Inventory...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Branch Inventory</h1>
          <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm mt-1`}>Manage product availability and stock levels</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchItems}
            className={`border px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Sparkles size={18} className="text-emerald-500" />
            REFRESH
          </button>
          <button
            onClick={onAddProduct}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
          >
            <Plus size={20} />
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
          />
        </div>
        <button className={`border px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className={`border rounded-2xl overflow-hidden transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`border-b transition-colors ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Product</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Category</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Price</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Stock</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Status</th>
                <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {items.map((item) => (
                <tr key={item.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors overflow-hidden ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                        {item.image_url ? (
                          <img src={getImageUrl(item.image_url) || ''} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                        <p className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${isDarkMode ? 'text-slate-400 bg-slate-800' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.price} ETB</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${item.stock < 10 ? 'text-red-500' : isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.stock} {item.unit || 'units'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.status === 'In Stock' && <CheckCircle2 size={14} className="text-green-500" />}
                      {item.status === 'Low Stock' && <AlertTriangle size={14} className="text-yellow-500" />}
                      {item.status === 'Out of Stock' && <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500" />}
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${item.status === 'In Stock' ? 'text-green-500' :
                        item.status === 'Low Stock' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelectProduct(item)}
                      className={`text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-slate-500 hover:text-green-500' : 'text-slate-400 hover:text-green-600'
                        }`}
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          const token = localStorage.getItem('token');
                          fetch(`http://localhost:5000/api/products/${item.id}`, {
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
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

export const AdjustStockModal: React.FC<{ product: any, onClose: () => void, isDarkMode: boolean }> = ({ product, onClose, isDarkMode }) => {
  const [newStock, setNewStock] = useState(product.stock.toString());

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stock: parseFloat(newStock) })
      });
      if (res.ok) {
        onClose();
        window.location.reload(); // Simple reload to refresh data
      } else {
        console.error('Failed to update stock');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-md w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#1a1d23] border-slate-700' : 'bg-white border-slate-200'
        }`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-700/10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500">
              <Edit3 size={24} />
            </div>
            <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Adjust Units</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Unit Count</label>
            <input
              type="number"
              autoFocus
              className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Update Units
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProductDetailModal: React.FC<{ product: any, onClose: () => void, isDarkMode: boolean }> = ({ product, onClose, isDarkMode }) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const stockPercentage = Math.min((product.stock / 150) * 100, 100);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-3xl w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
        }`}>
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl border transition-colors overflow-hidden ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
              {product.image_url ? (
                <img src={getImageUrl(product.image_url)} alt={product.name} className="w-8 h-8 object-cover rounded-lg" />
              ) : (
                <Package className="text-blue-500" size={32} />
              )}
            </div>
            <div>
              <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{product.name}</h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] mt-1">PRODUCT SKU: {product.id}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
            <X size={28} />
          </button>
        </div>

        <div className="px-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`p-8 rounded-[2rem] border transition-colors flex flex-col justify-between ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stock Integrity</span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${product.status === 'In Stock' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {product.status}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {product.stock}
                  </h3>
                  <div className="flex flex-col">
                    <span className="text-lg text-emerald-500 font-black uppercase tracking-widest leading-none">{product.unit || 'Units'}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      {['kg', 'g', 'lb', 'oz'].includes(product.unit?.toLowerCase()) ? 'Measured by Weight' : 'Counted Asset'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${product.stock < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Current Level</span>
                  <span>Optimal: 150</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-[1.5rem] border flex items-center gap-4 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="bg-purple-500/10 p-3 rounded-xl">
                  <TrendingUp size={20} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Price</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {product.price} ETB
                    <span className="text-[10px] text-slate-500 font-medium ml-1">/ {product.unit || 'Unit'}</span>
                  </p>
                </div>
              </div>
              <div className={`p-6 rounded-[1.5rem] border flex items-center gap-4 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="bg-orange-500/10 p-3 rounded-xl">
                  <BarChart2 size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.category}</p>
                </div>
              </div>
              <div className={`p-6 rounded-[1.5rem] border flex items-center gap-4 ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="bg-blue-500/10 p-3 rounded-xl">
                  {['kg', 'g', 'lb', 'oz'].includes(product.unit?.toLowerCase()) ? <Scale size={20} className="text-blue-500" /> : <Box size={20} className="text-blue-500" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing Type</p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {['kg', 'g', 'lb', 'oz'].includes(product.unit?.toLowerCase()) ? 'Price per Weight' : 'Price per Unit'}
                  </p>
                </div>
              </div>
              <div className={`p-4 rounded-[1.5rem] border border-dashed flex items-center gap-3 transition-colors ${isDarkMode ? 'bg-slate-800/20 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                <Info size={18} />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {['kg', 'g', 'lb', 'oz'].includes(product.unit?.toLowerCase()) ? 'Stock measured via calibrated digital scales.' : 'Asset tracked via individual SKU counts.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-10 flex items-center justify-end border-t transition-colors ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-[#f8fafc] border-slate-100'}`}>
          <div className="flex gap-4">
            <button onClick={onClose} className={`px-10 py-4 rounded-2xl text-sm font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1]'}`}>
              Close Record
            </button>
            <button
              onClick={() => setShowAdjust(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-12 py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Adjust Inventory
            </button>
          </div>
        </div>

        {showAdjust && (
          <AdjustStockModal
            product={product}
            onClose={() => setShowAdjust(false)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;
