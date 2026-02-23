
import React from 'react';
import { Orbit, CloudOff, Radio, Database, ShieldCheck, Cpu, Binary } from 'lucide-react';

interface OmniLockdownProps {
  onRestore?: () => void;
  onLogout?: () => void;
  vendorName?: string;
  branchCount?: number;
}

const OmniLockdown: React.FC<OmniLockdownProps> = ({ onRestore, onLogout, vendorName, branchCount }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 overflow-hidden transition-all duration-1000 bg-[#02040a] selection:bg-cyan-500/30">

      {/* Neural Link Overlay (Atmospheric Scanline) */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(0,255,255,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(0,100,255,0.1),rgba(0,255,255,0.05),rgba(0,100,255,0.1))] bg-[length:100%_4px,4px_100%]"></div>

      {/* Floating Data Particles (Frost) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-cyan-400/20 rounded-full blur-[1px] animate-pulse"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: Math.random() * 3 + 2 + 's',
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[1000px] h-[1000px] border border-cyan-500/5 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute w-[800px] h-[800px] border border-cyan-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
        <div className="absolute w-[600px] h-[600px] border-t border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute w-[1200px] h-[1200px] bg-cyan-900/5 blur-[160px] animate-pulse"></div>
      </div>

      {/* Main Content Terminal */}
      <div className="relative z-10 max-w-3xl w-full text-center space-y-16">

        {/* The Core Icon */}
        <div className="relative inline-block">
          <div className="p-14 rounded-[5rem] border-2 transition-all duration-1000 bg-cyan-950/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_80px_rgba(34,211,238,0.15)] relative z-10">
            <Orbit size={100} strokeWidth={1} className="animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck size={40} className="text-cyan-500 animate-pulse" />
            </div>
          </div>
          {/* Echo Rings */}
          <div className="absolute -inset-6 border border-cyan-500/20 rounded-[5.5rem] animate-ping opacity-20" style={{ animationDuration: '4s' }}></div>
          <div className="absolute -inset-12 border border-cyan-500/10 rounded-[6rem] animate-ping opacity-10" style={{ animationDuration: '6s' }}></div>
        </div>

        {/* Status Text Area */}
        <div className="space-y-6">
          <h1 className="text-9xl font-black tracking-tighter leading-none italic text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-800 uppercase">{vendorName || 'BEZAW'}</h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-500/40" />
              <p className="text-[13px] font-black uppercase tracking-[0.8em] text-cyan-400 animate-pulse">
                OMNI-BRANCH STANDBY MODE
              </p>
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-500/40" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{vendorName?.toUpperCase()} NETWORK STATUS: LOCKDOWN</p>
          </div>
        </div>

        {/* Tactical Readout */}
        <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2.5rem] border border-cyan-500/10 bg-cyan-950/5 flex flex-col items-center gap-4 group hover:bg-cyan-900/10 transition-all">
            <CloudOff size={24} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Grid Connectivity</p>
              <p className="text-xs font-black text-cyan-400">ZERO_LINK</p>
            </div>
          </div>
          <div className="p-8 rounded-[2.5rem] border border-cyan-500/10 bg-cyan-950/5 flex flex-col items-center gap-4 group hover:bg-cyan-900/10 transition-all">
            <Database size={24} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Storage</p>
              <p className="text-xs font-black text-cyan-400">READ_ONLY</p>
            </div>
          </div>
          <div className="p-8 rounded-[2.5rem] border border-cyan-500/10 bg-cyan-950/5 flex flex-col items-center gap-4 group hover:bg-cyan-900/10 transition-all">
            <Cpu size={24} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Infrastructure</p>
              <p className="text-xs font-black text-cyan-400">DORMANT</p>
            </div>
          </div>
        </div>

        {/* Footer Interaction Placeholder */}
        <div className="pt-8 flex flex-col items-center gap-8">
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-8 py-3 rounded-xl border border-cyan-500/20 text-cyan-500 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500/10 transition-all active:scale-95"
            >
              Relinquish Terminal Access
            </button>
          )}
          <div className="inline-flex items-center gap-8 px-10 py-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-cyan-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/60">Awaiting Primary Handshake</span>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-cyan-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
            </div>
          </div>
        </div>

      </div>

      {/* Metadata Corners */}
      <div className="absolute top-12 right-12 text-right">
        <p className="text-[10px] font-black text-cyan-500/50 uppercase tracking-[0.3em] mb-1">Total Assets Locked</p>
        <p className="text-xl font-mono font-black text-white">{branchCount || 0}/{branchCount || 0} <span className="text-[10px] text-cyan-400">BRANCHES</span></p>
      </div>

      <div className="absolute bottom-12 left-12">
        <div className="p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md">
          <p className="text-[10px] font-mono text-slate-500">
            <span className="text-cyan-500 font-black">BEZAW_LOCKDOWN</span><br />
            BUILD: 9.4.0-COBALT<br />
            HASH: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OmniLockdown;
