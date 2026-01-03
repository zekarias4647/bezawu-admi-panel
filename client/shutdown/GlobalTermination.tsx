
import React, { useEffect, useState } from 'react';
import { ZapOff, Radio, Binary } from 'lucide-react';

interface GlobalTerminationProps {
  onRestore?: () => void;
}

const GlobalTermination: React.FC<GlobalTerminationProps> = ({ onRestore }) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 overflow-hidden transition-all duration-1000 bg-[#050505] selection:bg-rose-500/30">
      
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Cyber Noise Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Dynamic Background Elements */}
      <div className={`absolute w-[800px] h-[800px] rounded-full blur-[150px] animate-morph transition-colors duration-1000 ${
        glitch ? 'bg-rose-900 opacity-40 scale-110' : 'bg-rose-600 opacity-20'
      }`}></div>

      {/* Main Content Terminal - Perfectly Centered */}
      <div className={`relative z-10 max-w-2xl w-full text-center space-y-12 transition-transform duration-300 ${glitch ? 'translate-x-1 skew-x-1' : ''}`}>
        
        {/* The Icon Core */}
        <div className="relative inline-block">
          <div className="p-12 rounded-[4rem] border-2 transition-all duration-700 shadow-2xl relative z-10 bg-rose-950/20 border-rose-500/40 text-rose-500 shadow-rose-500/20">
            <ZapOff size={90} strokeWidth={1} className="animate-pulse" />
          </div>
          <div className="absolute -inset-4 border border-dashed rounded-[4.5rem] animate-[spin_10s_linear_infinite] opacity-30 border-rose-500"></div>
          <div className="absolute -inset-8 border border-dotted rounded-[5rem] animate-[spin_15s_linear_infinite_reverse] opacity-20 border-rose-400"></div>
        </div>
        
        {/* Status Text Area */}
        <div className="space-y-4">
          <h1 className="text-8xl font-black tracking-tighter leading-none italic text-white uppercase">GRID DARK</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-rose-500/30" />
            <p className="text-[12px] font-black uppercase tracking-[0.6em] text-rose-500">
              ORGANIZATION HANDSHAKE TERMINATED
            </p>
            <div className="h-px w-12 bg-rose-500/30" />
          </div>
        </div>

        {/* Data readout */}
        <div className="max-w-md mx-auto p-10 rounded-[3rem] border backdrop-blur-2xl relative overflow-hidden bg-rose-950/5 border-rose-500/10">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-rose-500/40"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-rose-500/40"></div>

          <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
            Emergency signal 0x00F8 detected. All Bezaw network clusters have entered a failsafe shutdown. Manual override by Corporate HQ required to restore synchronization.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all border-rose-500/20 bg-rose-500/5">
               <Radio size={20} className="text-rose-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Signal Integrity</span>
               <span className="text-xs font-bold text-rose-400">LOW/STABLE</span>
            </div>
            <div className="p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all border-rose-500/20 bg-rose-500/5">
               <Binary size={20} className="text-rose-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core State</span>
               <span className="text-xs font-bold text-rose-400">TERMINATED</span>
            </div>
          </div>
        </div>

        {/* Info Controls */}
        <div className="flex flex-col items-center gap-6 opacity-40">
           <div className="flex gap-1">
             {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose-500" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Handshake Protocol: Pending</span>
           <div className="flex gap-1">
             {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose-500" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
           </div>
        </div>

      </div>

      {/* Interface Metadata Overlay */}
      <div className="absolute top-12 left-12 flex items-center gap-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-rose-500/30 text-rose-500">
           <Binary size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bezaw-OS Kernel 9.4.2</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Security Context: EMERGENCY_GLOBAL</span>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 text-right">
        <div className="inline-block p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-mono text-slate-500 leading-tight">
            <span className="text-rose-500">ERR_HANDSHAKE_TIMEOUT</span><br/>
            COORD: 9.0192° N, 38.7468° E<br/>
            RELAY_ID: BZW-{Math.random().toString(36).substring(7).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalTermination;
