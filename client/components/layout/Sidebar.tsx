
import React from 'react';
import { LogOut, ShoppingCart } from 'lucide-react';
import { NAVIGATION } from '../../constants';
import { User } from '../../types';
import LogoImage from '../../assets/Bezaw logo (2).png'


interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, onLogout, isDarkMode }) => {
  return (
    <aside className={`w-[190px] border-r flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200'
      }`}>
      <div className="p-4 flex items-center gap-2">
        <div className="bg-white-600 rounded-lg p-1 shadow-lg shadow-emerald-900/20">
          <img src={LogoImage} alt="Bezaw Logo" className="w-[50px] h-auto relative z-10 animate-float-soft drop-shadow-2xl" />
        </div>
        <div>
          <h1 className={`text-base font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.vendorName?.toUpperCase()}</h1>
          <p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.2em]">Command Node</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        <div className={`text-[8px] font-black uppercase px-3 mb-1 tracking-[0.3em] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Strategic Menu</div>
        {NAVIGATION.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group border ${activeTab === item.id
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-900/20'
              : `border-transparent ${isDarkMode ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
              }`}
          >
            <span className={activeTab === item.id ? 'text-white' : `${isDarkMode ? 'text-slate-500' : 'text-slate-400'} group-hover:text-emerald-500 transition-colors`}>
              {React.cloneElement(item.icon as React.ReactElement, { size: 16 })}
            </span>
            <span className="font-bold text-[8px] uppercase tracking-widest">{item.name}</span>

          </button>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border border-transparent ${isDarkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-400/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
        >
          <LogOut size={16} />
          <span className="font-bold text-[8px] uppercase tracking-widest">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
