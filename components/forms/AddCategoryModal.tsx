
import React, { useState } from 'react';
import { X, Layers, Tag, Save, Sparkles } from 'lucide-react';

interface AddCategoryModalProps {
  onClose: () => void;
  isDarkMode: boolean;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, isDarkMode }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding Category:', categoryName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`max-w-md w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
              <Layers className="text-amber-500" size={32} />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>New Category</h2>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Definition Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag size={12} /> Category Identifier
            </label>
            <input 
              required
              autoFocus
              type="text"
              placeholder="e.g. Household Supplies"
              className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
            />
          </div>

          <div className={`p-6 rounded-2xl border border-dashed ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
             <div className="flex gap-4 items-start">
               <Sparkles size={16} className="text-amber-500 mt-1" />
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                 Adding a new category will update the global branch catalog and enable localized telemetry for these assets.
               </p>
             </div>
          </div>

          <div className="flex gap-4">
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
              className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-amber-600/20 active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <Save size={18} />
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
