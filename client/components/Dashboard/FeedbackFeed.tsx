
import React, { useState, useEffect } from 'react';
import {
  Star,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  X,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { BranchFeedback } from '../../types';



export const FeedbackFeed: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [showSummary, setShowSummary] = useState(false);
  const [feedback, setFeedback] = useState<BranchFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://branchapi.bezawcurbside.com/api/feedback/feedback-get', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Branch <span className="text-emerald-600">Feedback</span>
          </h1>

        </div>
        <button
          onClick={() => setShowSummary(true)}
          className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95"
        >
          <ClipboardList size={18} className="text-emerald-400" />
          Branch Performance Summary
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2 px-2">
            <MessageSquare size={18} className="text-emerald-600" />
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Customer Reviews
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Establishing Feedback Uplink...</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <MessageSquare size={48} className="text-slate-500 mb-4" />
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No customer reviews detected</p>
            </div>
          ) : (
            feedback.map((f) => (
              <div
                key={f.id}
                className={`p-8 rounded-[2.5rem] border transition-all hover:translate-x-1 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-800'
                      }`}>
                      {f.customerName ? f.customerName[0] : 'U'}
                    </div>
                    <div>
                      <h4 className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{f.customerName || 'Unknown Customer'}</h4>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < f.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${f.rating === 5 ? 'bg-emerald-500/10 text-emerald-500' :
                    f.rating === 4 ? 'bg-teal-500/10 text-teal-500' :
                      f.rating === 3 ? 'bg-blue-500/10 text-blue-500' :
                        f.rating === 2 ? 'bg-orange-500/10 text-orange-500' :
                          'bg-rose-500/10 text-rose-500'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${f.rating === 5 ? 'bg-emerald-500' :
                      f.rating === 4 ? 'bg-teal-500' :
                        f.rating === 3 ? 'bg-blue-500' :
                          f.rating === 2 ? 'bg-orange-500' :
                            'bg-rose-500'
                      }`} />
                    {
                      f.rating === 5 ? 'Excellent' :
                        f.rating === 4 ? 'Very Good' :
                          f.rating === 3 ? 'Good' :
                            f.rating === 2 ? 'Bad' :
                              'Worst'
                    }
                  </div>
                </div>

                <p className={`text-base leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  "{f.comment}"
                </p>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Alerts & Heatmap */}
        <div className="space-y-8">
          {/* Internal Alerts */}
        </div>
      </div>

      {/* Summary Modal */}
      {
        showSummary && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-700' : 'bg-white border-slate-100'
              }`}>
              <div className="p-8 relative overflow-hidden">
                {/* Deco */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <button onClick={() => setShowSummary(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-xl shadow-emerald-600/30">
                    <ClipboardList size={28} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Branch Summary</h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Operational Overview</p>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-800/10" />
                      <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.3em]">EXECUTIVE HIGHLIGHTS</span>
                      <div className="h-px flex-1 bg-slate-800/10" />
                    </div>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Customer satisfaction trended upward by 14% due to <span className="text-emerald-500">Fast Picking</span> KPIs.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Expected peak surge at <span className="text-amber-500">1:30 PM</span>. Deploy 2 additional pickers from Stockroom to mitigate delays.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Review quality protocols for produce in CMC branch based on localized feedback.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98]"
                  >
                    Acknowledge Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default FeedbackFeed;
