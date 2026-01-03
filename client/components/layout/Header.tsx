
import React from 'react';
import { Bell, Search, Activity, User as UserIcon, Sun, Moon } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  user: User;
  isBusy: boolean;
  onToggleBusy: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isBusy, onToggleBusy, isDarkMode, onToggleTheme }) => {
  return (
    <header className={`h-16 border-b px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115]/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`h-3 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <h2 className={`text-xl font-black uppercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {user.branchName} branch
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${isBusy ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {isBusy ? 'Operational Constraint' : 'Hub Online'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center border rounded-xl px-4 py-1.5 w-64 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500'
          }`}>
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search manifests..."
            className="bg-transparent border-none text-xs focus:outline-none ml-3 w-full placeholder:text-slate-600 font-bold"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all ${isDarkMode
              ? 'bg-slate-800/50 border-slate-700 text-yellow-400 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={onToggleBusy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${isBusy
              ? 'bg-red-500/10 border-red-500/50 text-red-500'
              : isDarkMode
                ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
          >
            <Activity size={14} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Busy</span>
          </button>

          <button className={`p-2 border rounded-xl transition-all relative ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}>
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-[#0f1115]"></span>
          </button>

          <div className={`h-6 w-px mx-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{user.role}</p>
            </div>
            <div className={`h-9 w-9 border rounded-xl flex items-center justify-center text-emerald-500 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
              }`}>
              <UserIcon size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
