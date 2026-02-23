
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie, ComposedChart
} from 'recharts';
import {
  TrendingUp, Clock, Users, DollarSign,
  Zap, ArrowUpRight, ArrowDownRight, Activity,
  Package, CheckCircle, AlertCircle, MessageSquare, Star, Loader2,
  Megaphone, Heart, Smartphone, ShoppingBag, Brain, Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  kpis: {
    revenue: { value: string; trend: string; up: boolean };
    rating: { value: string; trend: string; up: boolean };
    wait: { value: string; trend: string; up: boolean };
    orders: { value: string; trend: string; up: boolean };
    products: { value: string; trend: string; up: boolean };
  };
  hourlyData: any[];
  sentimentData: any[];
  insights: any[];
  mix: {
    ads: { activeAds: string; totalAds: string };
    stories: { activeStories: string; totalStories: string; totalLikes: string; totalComments: string };
    products: { name: string; value: string; image_url: string }[];
  };
  aiPredictions?: {
    revenue: number;
    product: string;
    growth: string;
    insight: string;
    confidence: number;
  };
}

interface AnalyticsProps {
  isDarkMode: boolean;
}

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${isDarkMode ? 'bg-[#1a1d23]/90 border-slate-700' : 'bg-white/90 border-slate-200'
        }`}>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {entry.name}: <span className="text-emerald-500">{entry.value.toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics: React.FC<AnalyticsProps> = ({ isDarkMode }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      // 1. Fetch main stats (FAST)
      const response = await fetch('https://branchapi.ristestate.com/api/analytics/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
        setLoading(false); // Show the dashboard immediately

        // 2. Fetch AI predictions (SLOW)
        try {
          const aiResponse = await fetch('https://branchapi.ristestate.com/api/analytics/prediction', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (aiResponse.ok) {
            const aiResult = await aiResponse.json();
            setData(prev => prev ? { ...prev, aiPredictions: aiResult } : null);
          }
        } catch (aiErr) {
          console.error('AI Prediction fetch failed', aiErr);
        } finally {
          setAiLoading(false);
        }

      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Scanning Telemetry Channels...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-10">
        <AlertCircle className="text-rose-500 mb-4" size={48} />
        <h2 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Signal Lost</h2>
        <p className="text-slate-500 max-w-md">{error || 'Unable to establish connection with intelligence nodes.'}</p>
        <button onClick={fetchAnalytics} className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">Retry Connection</button>
      </div>
    );
  }

  const kpiStats = [
    { label: 'Revenue', value: data.kpis.revenue.value, trend: data.kpis.revenue.trend, up: data.kpis.revenue.up, icon: <DollarSign size={20} />, color: 'text-emerald-500' },
    { label: 'Avg Rating', value: data.kpis.rating.value, trend: data.kpis.rating.trend, up: data.kpis.rating.up, icon: <Star size={20} />, color: 'text-amber-500' },
    { label: 'Handover Time', value: data.kpis.wait.value, trend: data.kpis.wait.trend, up: data.kpis.wait.up, icon: <Clock size={20} />, color: 'text-blue-500' },
    { label: 'Total Orders', value: data.kpis.orders.value, trend: data.kpis.orders.trend, up: data.kpis.orders.up, icon: <Package size={20} />, color: 'text-purple-500' },
    { label: 'Total Products', value: data.kpis.products.value, trend: data.kpis.products.trend, up: data.kpis.products.up, icon: <ShoppingBag size={20} />, color: 'text-indigo-500' },
  ];

  // Derive Key Highlights from hourlyData (which is actually monthly data)
  const totalRevenue = data.hourlyData.reduce((acc, curr) => acc + (parseFloat(curr.revenue) || 0), 0);
  const totalOrders = data.hourlyData.reduce((acc, curr) => acc + (parseInt(curr.orders) || 0), 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const sortedByRevenue = [...data.hourlyData].sort((a, b) => (parseFloat(b.revenue) || 0) - (parseFloat(a.revenue) || 0));
  const bestMonth = sortedByRevenue.length > 0 ? sortedByRevenue[0] : null;

  const kpiHighlights = [
    { label: 'Avg Order Value', value: `${aov.toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB`, sub: 'Per transaction average', color: 'text-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Peak Sales Month', value: bestMonth ? bestMonth.time : 'N/A', sub: bestMonth ? `Revenue: ${(parseFloat(bestMonth.revenue) / 1000).toFixed(1)}k` : '', color: 'text-blue-500', barColor: 'bg-blue-500' },
    { label: 'Orders this Year', value: totalOrders.toLocaleString(), sub: 'Total volume', color: 'text-purple-500', barColor: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            System <span className="text-emerald-600">Performance</span>
          </h1>
          <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm mt-1 flex items-center gap-2`}>
            <Activity size={14} className="text-emerald-500" />
            Branch telemetry and operational intelligence
          </p>
        </div>
        <div className="flex gap-3">
          <div className={`flex items-center p-1 rounded-xl border ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-sm'}`}>1D</button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500">1W</button>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs tracking-widest uppercase transition-all shadow-lg shadow-emerald-600/20">
            Export Data
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {kpiStats.map((stat, i) => (
          <div key={i} className={`group relative border p-4 rounded-2xl transition-all overflow-hidden ${isDarkMode ? 'bg-[#121418] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm'
            }`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${stat.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <h3 className={`text-xl font-black tracking-tighter mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</h3>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Revenue Chart */}
        <div className={`border p-5 rounded-2xl transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Revenue Stream</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Monthly Volume Overview</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourlyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Sentiment Analytics */}
        <div className={`border p-5 rounded-2xl transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Feedback Analytics</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Customer Sentiment Scorecard</p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
              <MessageSquare size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {data.sentimentData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-black text-emerald-500">
                  {Math.round((data.sentimentData.find(s => s.name === 'Excellent')?.value || 0) / Math.max(1, data.sentimentData.reduce((a, b) => a + b.value, 0)) * 100)}%
                </p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Excellent</p>
              </div>
            </div>
            <div className="space-y-4">
              {data.sentimentData.map((s, i) => {
                const total = data.sentimentData.reduce((acc, curr) => acc + curr.value, 0);
                const perc = Math.round((s.value / Math.max(1, total)) * 100);
                return (
                  <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.name}</span>
                      </div>
                      <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{perc}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${perc}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Foresight Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`col-span-1 md:col-span-3 p-1 rounded-[2.5rem] bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600`}>
          <div className={`h-full rounded-[2.3rem] p-5 ${isDarkMode ? 'bg-[#121418]' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 animate-pulse">
                <Brain size={24} />
              </div>
              <div>
                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  AI Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Foresight</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Powered by Gemini Pro</p>
              </div>
            </div>

            {aiLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-40 rounded-3xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Prediction 1: Revenue */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
                      <TrendingUp size={20} />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black">
                      {data.aiPredictions?.growth || '+0%'}
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Next Month Revenue</p>
                  <h4 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {(data.aiPredictions?.revenue || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">ETB</span>
                  </h4>
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Confidence Score</span>
                      <span>{data.aiPredictions?.confidence || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                        style={{ width: `${data.aiPredictions?.confidence || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Prediction 2: Product */}
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-500">

                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Top Product Forecast</p>
                  <h4 className={`text-xl font-black line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {data.aiPredictions?.product || 'Calculating...'}
                  </h4>
                  <p className="mt-2 text-xs font-bold text-fuchsia-500">
                    Predicted Leader
                  </p>
                </div>

                {/* Prediction 3: Insight */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain size={64} />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Strategic Insight</p>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    "{data.aiPredictions?.insight || 'AI is analyzing current market trends...'}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Performance (Replaces Rating Velocity) */}
        <div className={`lg:col-span-2 border p-5 rounded-2xl transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Sales Performance</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Orders vs Revenue</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-slate-500">Orders</span>
              </div>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* @ts-ignore */}
              <ComposedChart data={data.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <Bar yAxisId="left" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.6} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: isDarkMode ? '#121418' : '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Highlights */}
        <div className={`border p-8 rounded-[2.5rem] transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          } lg:col-span-1`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Key Highlights</h3>
            <Zap size={16} className="text-amber-500" />
          </div>
          <div className="space-y-6">
            {kpiHighlights.map((metric, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{metric.label}</p>
                  <div className={`w-2 h-2 rounded-full ${metric.barColor}`} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} ${metric.color}`}>{metric.value}</span>
                  <span className="text-[10px] text-slate-500 font-bold">{metric.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Section: Engagement & Products */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <h3 className={`text-xl font-black mb-8 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/20">
            <Megaphone size={20} />
          </div>
          Engagement & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Inventory</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">


          {/* Stories Card - Vibrant Pink Gradient */}
          <div className={`p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/20 ${isDarkMode ? 'bg-gradient-to-br from-[#1a1d26] to-[#121418] border border-slate-800' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-pink-500/20 transition-all duration-700"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                <Heart size={24} />
              </div>
              <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isDarkMode ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                Live
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="group/stat">
                <h4 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {parseInt(data.mix?.stories?.totalLikes || '0') >= 1000
                    ? (parseInt(data.mix?.stories?.totalLikes || '0') / 1000).toFixed(1) + 'k'
                    : data.mix?.stories?.totalLikes || '0'}
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 group-hover/stat:text-pink-500 transition-colors">Net Likes</p>
              </div>
              <div className="group/stat">
                <h4 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{data.mix?.stories?.totalComments || 0}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 group-hover/stat:text-pink-500 transition-colors">Comments</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <div className="flex justify-between items-center group/stat cursor-default">
                <span className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-slate-500 group-hover/stat:text-slate-300' : 'text-slate-400 group-hover/stat:text-slate-600'}`}>Total Stories</span>
                <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{data.mix?.stories?.totalStories || 0}</span>
              </div>
            </div>
          </div>

          {/* Top Products Card - Vibrant Emerald Gradient */}
          <div className={`p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20 ${isDarkMode ? 'bg-gradient-to-br from-[#1a1d26] to-[#121418] border border-slate-800' : 'bg-white border border-slate-100 shadow-xl shadow-slate-200/50'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700"></div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h4 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Top Movers</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Highest Volume</p>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              {(data.mix?.products || []).map((p, i) => (
                <div key={i} className="flex items-center gap-4 group/item">


                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{p.name}</p>
                      <span className="text-xs font-black text-emerald-500">{p.value}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 ease-out group-hover/item:w-full" style={{ width: `${Math.min(100, (parseInt(p.value) / 100) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.mix?.products || data.mix.products.length === 0) && (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Smartphone className="text-slate-300 dark:text-slate-700 mb-2" size={32} />
                  <p className="text-xs text-slate-400 font-bold">No sales data available</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
