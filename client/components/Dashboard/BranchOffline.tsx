
import React from 'react';
import { Lock, Radio, Cpu, Binary } from 'lucide-react';

interface BranchOfflineProps {
  branchName?: string;
  onRestore?: () => void;
}

const BranchOffline: React.FC<BranchOfflineProps> = ({ branchName, onRestore }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 overflow-hidden transition-all duration-1000 bg-[#0f1115] selection:bg-amber-500/30">
      
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,165,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Cyber Noise Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-[600px] h-[600px] border-[40px] border-amber-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute w-[450px] h-[450px] border-[20px] border-amber-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        <div className="absolute w-[800px] h-[800px] bg-amber-500/10 blur-[120px] animate-pulse"></div>
      </div>

      {/* Main Content Terminal - Centered Perfectly */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
        
        {/* The Icon Core */}
        <div className="relative inline-block">
          <div className="p-12 rounded-[4rem] border-2 transition-all duration-700 shadow-2xl relative z-10 bg-amber-950/20 border-amber-500/40 text-amber-500 shadow-amber-500/20">
            <Lock size={90} strokeWidth={1} />
          </div>
          <div className="absolute -inset-4 border border-dashed rounded-[4.5rem] animate-[spin_10s_linear_infinite] opacity-30 border-amber-500"></div>
          <div className="absolute -inset-8 border border-dotted rounded-[5rem] animate-[spin_15s_linear_infinite_reverse] opacity-20 border-amber-400"></div>
        </div>
        
        {/* Status Text Area */}
        <div className="space-y-4">
          <h1 className="text-8xl font-black tracking-tighter leading-none italic text-slate-100 uppercase">BRANCH OFFLINE</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-amber-500/30" />
            <p className="text-[12px] font-black uppercase tracking-[0.6em] text-amber-500">
              STATION SECURED: {branchName?.toUpperCase()}
            </p>
            <div className="h-px w-12 bg-amber-500/30" />
          </div>
        </div>

        {/* Data readout */}
        <div className="max-w-md mx-auto p-10 rounded-[3rem] border backdrop-blur-2xl relative overflow-hidden bg-slate-900/40 border-slate-800">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/40"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/40"></div>

          <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
            Local terminal integrity check passed. Station is currently in a high-security dormant state. No live orders or telemetry are being processed at this coordinate.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all border-amber-500/20 bg-amber-500/5">
               <Radio size={20} className="text-amber-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Signal Integrity</span>
               <span className="text-xs font-bold text-amber-400">NOMINAL</span>
            </div>
            <div className="p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all border-amber-500/20 bg-amber-500/5">
               <Cpu size={20} className="text-amber-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Process</span>
               <span className="text-xs font-bold text-amber-400">DORMANT</span>
            </div>
          </div>
        </div>

        {/* Action Controls Removed per Request */}
        <div className="flex items-center justify-center gap-6 opacity-40">
           <div className="flex gap-1">
             {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Status: Secure Dormancy</span>
           <div className="flex gap-1">
             {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
           </div>
        </div>

      </div>

      {/* Interface Metadata Overlay */}
      <div className="absolute top-12 left-12 flex items-center gap-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-amber-500/30 text-amber-500">
           <Binary size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bezaw-OS Station OS v2.1</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
            Security Context: STATION_ISOLATED
          </span>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 text-right">
        <div className="inline-block p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-mono text-slate-500 leading-tight">
            <span className="text-amber-500">ERR_NODE_SLEEP</span><br/>
            COORD: 9.0192° N, 38.7468° E<br/>
            TERMINAL_ID: BZW-{Math.random().toString(36).substring(7).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BranchOffline;
