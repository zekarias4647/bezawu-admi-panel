
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie
} from 'recharts';
import {
  TrendingUp, Clock, Users, DollarSign,
  Zap, ArrowUpRight, ArrowDownRight, Activity,
  Package, CheckCircle, AlertCircle, MessageSquare, Star, Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  kpis: {
    revenue: { value: string; trend: string; up: boolean };
    rating: { value: string; trend: string; up: boolean };
    wait: { value: string; trend: string; up: boolean };
    orders: { value: string; trend: string; up: boolean };
  };
  hourlyData: any[];
  sentimentData: any[];
  insights: any[];
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
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/analytics/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    { label: 'Revenue (ETB)', value: data.kpis.revenue.value, trend: data.kpis.revenue.trend, up: data.kpis.revenue.up, icon: <DollarSign size={20} />, color: 'text-emerald-500' },
    { label: 'Avg Rating', value: data.kpis.rating.value, trend: data.kpis.rating.trend, up: data.kpis.rating.up, icon: <Star size={20} />, color: 'text-amber-500' },
    { label: 'Handover Time', value: data.kpis.wait.value, trend: data.kpis.wait.trend, up: data.kpis.wait.up, icon: <Clock size={20} />, color: 'text-blue-500' },
    { label: 'Total Orders', value: data.kpis.orders.value, trend: data.kpis.orders.trend, up: data.kpis.orders.up, icon: <Package size={20} />, color: 'text-purple-500' },
  ];
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
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
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiStats.map((stat, i) => (
          <div key={i} className={`group relative border p-7 rounded-[2rem] transition-all overflow-hidden ${isDarkMode ? 'bg-[#121418] border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm'
            }`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${stat.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <h3 className={`text-3xl font-black tracking-tighter mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Revenue Chart */}
        <div className={`border p-8 rounded-[2.5rem] transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Revenue Stream</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Daily Volume Overview</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
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
        <div className={`border p-8 rounded-[2.5rem] transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
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
            <div className="h-[200px] relative">
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
                  {Math.round((data.sentimentData.find(s => s.name === 'Positive')?.value || 0) / Math.max(1, data.sentimentData.reduce((a, b) => a + b.value, 0)) * 100)}%
                </p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Positive</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Velocity */}
        <div className={`lg:col-span-2 border p-8 rounded-[2.5rem] transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Rating Velocity</h3>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] border border-amber-500/20 px-4 py-1.5 rounded-full">Score Trend</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: isDarkMode ? '#121418' : '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights */}
        <div className={`border p-8 rounded-[2.5rem] transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
          <h3 className={`text-lg font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Operational Insights</h3>
          <div className="space-y-6">
            {data.insights.map((metric, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">{metric.label}</span>
                  <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{metric.score}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200/20 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
