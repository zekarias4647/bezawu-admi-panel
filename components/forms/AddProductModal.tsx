
import React, { useState } from 'react';
import { X, PlusCircle, Tag, Layers, DollarSign, Database, Plus } from 'lucide-react';

interface AddProductModalProps {
  onClose: () => void;
  onAddCategory: () => void;
  isDarkMode: boolean;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddCategory, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Groceries',
    price: '',
    stock: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding product:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/15 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`max-w-xl w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
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

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} /> Product Name
              </label>
              <input 
                required
                type="text"
                placeholder="e.g. Organic Avocado"
                className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={12} /> Category
                </label>
                <select 
                  className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${
                    isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>Groceries</option>
                  <option>Dairy</option>
                  <option>Bakery</option>
                  <option>Beverages</option>
                  <option>Personal Care</option>
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
                  className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${
                    isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Database size={12} /> Initial Stock Level
              </label>
              <input 
                required
                type="number"
                placeholder="Enter quantity"
                className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${
                  isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${
                isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-95 uppercase tracking-widest"
            >
              Create Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
