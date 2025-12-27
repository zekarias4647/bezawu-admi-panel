
import React, { useState } from 'react';
import { 
  Shield, Lock, Bell, Volume2, HardDrive, 
  Activity, Clock, Users, Eye, EyeOff, 
  CheckCircle2, AlertOctagon, Save, Mail,
  Zap, VolumeX, CheckSquare, Settings as SettingsIcon
} from 'lucide-react';

interface SettingsProps {
  isDarkMode: boolean;
  isBusy: boolean;
  onToggleBusy: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, isBusy, onToggleBusy }) => {
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('abebe@bezaw.com');
  
  const [config, setConfig] = useState({
    autoAccept: true,
    soundAlerts: true,
    capacity: 85
  });

  const passRules = [
    { label: '8+ Characters', met: password.length >= 8 },
    { label: 'Numbers & Symbols', met: /\d/.test(password) && /[^A-Za-z0-9]/.test(password) }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between border-b border-slate-800 pb-8">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Terminal <span className="text-green-500">Configuration</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <SettingsIcon size={14} /> Global System Parameters & Security
          </p>
        </div>
        <button className="hidden sm:flex bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all gap-2 items-center shadow-lg shadow-green-500/20">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Security Protocol Section */}
          <section className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 shadow-2xl' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <Shield size={24} />
              </div>
              <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Security Protocol</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Mail size={12} /> Security Email Address
                </label>
                <input 
                  type="email"
                  className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                  placeholder="admin@bezaw.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Credentials</label>
                  <div className="relative">
                    <input 
                      type={showPass ? 'text' : 'password'}
                      className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm Access</label>
                  <input 
                    type="password"
                    className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div className={`p-6 rounded-2xl border flex flex-wrap gap-6 items-center ${isDarkMode ? 'bg-[#0a0c10] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                {passRules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {r.met ? <CheckCircle2 size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                    <span className={`text-xs font-bold ${r.met ? 'text-slate-300' : 'text-slate-600'}`}>{r.label}</span>
                  </div>
                ))}
                <button className="ml-auto text-xs font-black text-blue-500 uppercase tracking-widest hover:underline">Commit Updates</button>
              </div>
            </div>
          </section>

          {/* Operational Parameters Section */}
          <section className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 shadow-2xl' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                <Zap size={24} />
              </div>
              <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Operational Parameters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {/* Auto Accept Toggle */}
                <div className={`flex items-center justify-between p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <CheckSquare size={18} className={config.autoAccept ? "text-green-500" : "text-slate-500"} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">Auto-Accept Orders</span>
                  </div>
                  <button 
                    onClick={() => setConfig({...config, autoAccept: !config.autoAccept})}
                    className={`w-14 h-7 rounded-full transition-all relative ${config.autoAccept ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all ${config.autoAccept ? 'left-8' : 'left-2'}`} />
                  </button>
                </div>

                {/* Sound Alerts Toggle */}
                <div className={`flex items-center justify-between p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    {config.soundAlerts ? <Volume2 size={18} className="text-blue-500" /> : <VolumeX size={18} className="text-slate-500" />}
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">Sound Notifications</span>
                  </div>
                  <button 
                    onClick={() => setConfig({...config, soundAlerts: !config.soundAlerts})}
                    className={`w-14 h-7 rounded-full transition-all relative ${config.soundAlerts ? 'bg-blue-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all ${config.soundAlerts ? 'left-8' : 'left-2'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Load Throttling</span>
                    <span className="text-xl font-black text-green-500">{config.capacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                    value={config.capacity}
                    onChange={(e) => setConfig({...config, capacity: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className={`p-4 rounded-xl border border-dashed ${isDarkMode ? 'bg-slate-800/10 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                     Throttling will engage if capacity exceeds 90%. System priority is given to pre-paid orders.
                   </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
           {/* Replaced Lockdown with Busy/Live Toggle Section */}
           <section className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center text-center ${
             isBusy 
               ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10' 
               : 'border-slate-800 bg-slate-900/20'
           }`}>
            {isBusy ? (
              <AlertOctagon size={40} className="text-red-500 mb-4 animate-pulse" />
            ) : (
              <Activity size={40} className="text-green-500 mb-4" />
            )}
            <h3 className={`text-lg font-black tracking-tight mb-2 uppercase italic ${isBusy ? 'text-red-500' : 'text-green-500'}`}>
              System Status
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-wider">
              {isBusy 
                ? 'Orders are currently throttled' 
                : 'Terminal is operating at full capacity'}
            </p>
            <button 
              onClick={onToggleBusy}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                isBusy 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-black/20'
              }`}
            >
              {isBusy ? 'Resume Live Mode' : 'Switch to Busy Mode'}
            </button>
          </section>

          <section className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`text-sm font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Terminal Metadata</h3>
            <div className="space-y-5">
              {[
                { label: 'Operating Hours', val: '06:00 — 22:00', icon: <Clock size={16} /> },
                { label: 'Staffing Status', val: '12 Operators Active', icon: <Users size={16} /> },
                { label: 'Core Integrity', val: '99.9% Up-time', icon: <HardDrive size={16} /> },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-800/50 rounded-xl text-slate-500">{m.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{m.label}</p>
                    <p className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{m.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
