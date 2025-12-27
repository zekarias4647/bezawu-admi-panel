
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
    <header className={`h-20 border-b px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0f1115]/80 border-slate-800' : 'bg-white/80 border-slate-200'
    }`}>
      <div className="flex items-center gap-6">
        <div>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.branchName}</h2>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isBusy ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className={`text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {isBusy ? 'Busy Mode Active' : 'System Online'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center border rounded-xl px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-green-500/20 transition-all ${
          isDarkMode ? 'bg-[#121418] border-slate-800 focus-within:border-green-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-green-500'
        }`}>
          <Search size={18} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="bg-transparent border-none text-sm focus:outline-none ml-3 w-full placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button 
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700 text-yellow-400 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={onToggleBusy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              isBusy 
                ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                : isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            <Activity size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Busy</span>
          </button>

          <button className={`p-2.5 border rounded-xl transition-all relative ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}>
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-[#0f1115]"></span>
          </button>

          <div className={`h-8 w-px mx-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user.role}</p>
            </div>
            <div className={`h-10 w-10 border rounded-xl flex items-center justify-center text-green-500 ${
              isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'
            }`}>
              <UserIcon size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
