import React, { useState, useEffect } from 'react';
import { Bell, Search, Activity, User as UserIcon, Sun, Moon, Percent } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  user: User;
  isBusy: boolean;
  onToggleBusy: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isBusy, onToggleBusy, isDarkMode, onToggleTheme }) => {
  const [commissionRate, setCommissionRate] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const response = await fetch('https://branchapi.bezawcurbside.com/api/system/commission');
        if (response.ok) {
          const data = await response.json();
          setCommissionRate(data.commission_rate);
        }
      } catch (err) {
        console.error('Failed to fetch commission rate:', err);
      }
    };
    fetchCommission();
  }, []);

  return (
    <header className={`h-20 border-b px-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl transition-all duration-300 ${isDarkMode ? 'bg-[#0f1115]/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className={`h-2.5 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
              <h2 className={`text-base font-black uppercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {user.branchName} branch
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`h-1 w-1 rounded-full ${isBusy ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {isBusy ? 'Operational Constraint' : 'Hub Online'}
              </span>
            </div>
          </div>

          {commissionRate && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border animate-in fade-in slide-in-from-left-4 duration-500 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}>
              <Percent size={10} className="animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black leading-none uppercase tracking-widest">Comm.</span>
                <span className="text-[10px] font-black">{(parseFloat(commissionRate)).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center border rounded-lg px-3 py-1 w-48 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-500'
          }`}>
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search manifests..."
            className="bg-transparent border-none text-[10px] focus:outline-none ml-2 w-full placeholder:text-slate-600 font-bold"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-all ${isDarkMode
              ? 'bg-slate-800/50 border-slate-700 text-yellow-400 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={onToggleBusy}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${isBusy
              ? 'bg-red-500/10 border-red-500/50 text-red-500'
              : isDarkMode
                ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
          >
            <Activity size={12} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Busy</span>
          </button>



          <div className={`h-5 w-px mx-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden lg:block">
              <p className={`text-[11px] font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{user.role}</p>
            </div>
            <div className={`h-8 w-8 border rounded-lg flex items-center justify-center text-emerald-500 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
              }`}>
              <UserIcon size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

