
import React from 'react';
import { LogOut, ShoppingCart } from 'lucide-react';
import { NAVIGATION } from '../../constants';

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout, isDarkMode }) => {
  return (
    <aside className={`w-72 border-r flex flex-col transition-colors duration-300 ${
      isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="p-8 flex items-center gap-3">
        <div className="bg-emerald-600 rounded-lg p-2 shadow-lg shadow-emerald-900/20">
          <ShoppingCart className="text-white" size={24} />
        </div>
        <div>
          <h1 className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>BEZAW</h1>
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">Command Node</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <div className={`text-[10px] font-black uppercase px-4 mb-4 tracking-[0.3em] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Strategic Menu</div>
        {NAVIGATION.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] transition-all group border ${
              activeTab === item.id
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-900/20'
                : `border-transparent ${isDarkMode ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
            }`}
          >
            <span className={activeTab === item.id ? 'text-white' : `${isDarkMode ? 'text-slate-500' : 'text-slate-400'} group-hover:text-emerald-500 transition-colors`}>
              {item.icon}
            </span>
            <span className="font-bold text-xs uppercase tracking-widest">{item.name}</span>
            {item.id === 'orders' && (
              <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === item.id ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'
              }`}>
                12
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] transition-all border border-transparent ${
            isDarkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-400/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <LogOut size={20} />
          <span className="font-bold text-xs uppercase tracking-widest">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
