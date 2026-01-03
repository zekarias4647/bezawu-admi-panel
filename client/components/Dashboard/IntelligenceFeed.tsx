
import React, { useState } from 'react';
import { 
  Star, 
  Sparkles, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  BrainCircuit,
  TrendingUp,
  X
} from 'lucide-react';
import { BranchFeedback, SystemAlert } from '../../types';

const mockFeedback: BranchFeedback[] = [
  {
    id: 'F-1',
    customerName: 'Dawit G.',
    rating: 5,
    comment: 'Super fast curbside pickup! The groceries were packed perfectly.',
    timestamp: '10:12 AM',
    sentiment: 'POSITIVE',
    suggestedAction: 'Send loyalty discount coupon'
  },
  {
    id: 'F-2',
    customerName: 'Sara A.',
    rating: 2,
    comment: 'Waited 15 minutes at Zone B. Seems like they are short-staffed today.',
    timestamp: '09:45 AM',
    sentiment: 'CRITICAL',
    suggestedAction: 'Increase Zone B picking priority'
  },
  {
    id: 'F-3',
    customerName: 'Yonas T.',
    rating: 4,
    comment: 'Items were fresh, but one apple was slightly bruised.',
    timestamp: '09:20 AM',
    sentiment: 'NEUTRAL',
    suggestedAction: 'Audit produce quality check protocol'
  }
];

const mockAlerts: SystemAlert[] = [
  { id: 'A-1', type: 'CAPACITY', message: 'Pick-up Zone A at 90% capacity', level: 'HIGH', time: '5m ago' },
  { id: 'A-2', type: 'STOCK', message: 'Milk (1L) stock critically low', level: 'MEDIUM', time: '12m ago' },
  { id: 'A-3', type: 'STAFF', message: 'Abebe B. logged off - Picker gap detected', level: 'LOW', time: '1h ago' }
];

export const IntelligenceFeed: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [showBriefing, setShowBriefing] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Branch <span className="text-emerald-600">Intelligence</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-500" />
            Live Feedback & AI Sentiment Streams
          </p>
        </div>
        <button 
          onClick={() => setShowBriefing(true)}
          className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95"
        >
          <BrainCircuit size={18} className="text-emerald-400" />
          Get Daily Briefing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2 px-2">
            <MessageSquare size={18} className="text-emerald-600" />
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Customer Feedback Stream
            </h3>
          </div>
          
          {mockFeedback.map((f) => (
            <div 
              key={f.id} 
              className={`p-8 rounded-[2.5rem] border transition-all hover:translate-x-1 ${
                isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-800'
                  }`}>
                    {f.customerName[0]}
                  </div>
                  <div>
                    <h4 className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{f.customerName}</h4>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < f.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  f.sentiment === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                  f.sentiment === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    f.sentiment === 'POSITIVE' ? 'bg-emerald-500' :
                    f.sentiment === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                  {f.sentiment}
                </div>
              </div>
              
              <p className={`text-base leading-relaxed mb-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                "{f.comment}"
              </p>

              {f.suggestedAction && (
                <div className={`p-5 rounded-[1.5rem] border-2 border-dashed flex items-center justify-between group cursor-pointer transition-all ${
                  isDarkMode ? 'bg-emerald-500/5 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-600/20">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AI Suggested Action</p>
                      <p className={`text-sm font-bold mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{f.suggestedAction}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Alerts & Heatmap */}
        <div className="space-y-8">
          {/* Internal Alerts */}
          <section>
            <div className="flex items-center gap-3 mb-4 px-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                System Pulse
              </h3>
            </div>
            <div className="space-y-4">
              {mockAlerts.map((a) => (
                <div 
                  key={a.id} 
                  className={`p-6 rounded-[2rem] border-l-4 transition-all hover:bg-opacity-80 ${
                    a.level === 'HIGH' ? 'border-rose-500' : 
                    a.level === 'MEDIUM' ? 'border-amber-500' : 'border-emerald-500'
                  } ${isDarkMode ? 'bg-[#121418] border-y border-r border-slate-800' : 'bg-white shadow-sm'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{a.message}</p>
                    <span className="text-[9px] font-black text-slate-500 uppercase">{a.time}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      a.level === 'HIGH' ? 'text-rose-500' : 
                      a.level === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {a.level} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Efficiency Widget */}
          <section className={`p-8 rounded-[2.5rem] border ${
            isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={20} className="text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800">Branch Velocity</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-emerald-900 tracking-tighter">94%</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase mb-1">Health Score</span>
              </div>
              <div className="h-2 w-full bg-emerald-900/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 w-[94%]" />
              </div>
              <p className="text-[10px] font-bold text-emerald-700/60 leading-relaxed italic uppercase">
                Currently 12% more efficient than Bole branch average.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Daily Briefing Modal (AI View) */}
      {showBriefing && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`max-w-2xl w-full rounded-[3rem] overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-500 ${
            isDarkMode ? 'bg-[#121418] border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <div className="p-12 relative overflow-hidden">
              {/* Deco */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <button onClick={() => setShowBriefing(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-10">
                <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-xl shadow-emerald-600/30">
                  <BrainCircuit size={32} />
                </div>
                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Strategy Briefing</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Protocol Branch v4.0.2</p>
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="h-px flex-1 bg-slate-800/10" />
                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">EXECUTIVE SUMMARY</span>
                     <div className="h-px flex-1 bg-slate-800/10" />
                   </div>
                   <ul className="space-y-5">
                      <li className="flex gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Customer satisfaction is up 14% this morning due to <span className="text-emerald-500">Fast Picking</span> performance.
                        </p>
                      </li>
                      <li className="flex gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Predicting a peak surge at <span className="text-amber-500">1:30 PM</span>. Recommend deploying 2 additional pickers from Stockroom.
                        </p>
                      </li>
                      <li className="flex gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Produce quality feedback noted in CMC branch; verify local "Organic" stock batch immediately.
                        </p>
                      </li>
                   </ul>
                </div>
              </div>

              <div className="mt-12">
                <button 
                  onClick={() => setShowBriefing(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20"
                >
                  Acknowledge Briefing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligenceFeed;
