import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Trash2, Power, Loader2, Mail, Phone, Clock, Activity, Shield, MoreVertical } from 'lucide-react';
import { Runner } from '../../types';

interface RunnersProps {
    isDarkMode: boolean;
    onAddRunner: () => void;
}

const Runners: React.FC<RunnersProps> = ({ isDarkMode, onAddRunner }) => {
    const [runners, setRunners] = useState<Runner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

    const fetchRunners = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('https://branchapi.ristestate.com/api/runners/runners-get', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRunners(data);
            }
        } catch (err) {
            console.error('Failed to fetch runners:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRunners();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            const response = await fetch(`https://branchapi.ristestate.com/api/runners/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setRunners(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
            }
        } catch (err) {
            console.error('Failed to toggle runner status:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Terminate this runner contract? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.ristestate.com/api/runners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setRunners(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete runner:', err);
        }
    };

    const filteredRunners = runners.filter(r => {
        const matchesSearch = r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.phone.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' || r.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getImageUrl = (url?: string) => {
        if (!url) return 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100';
        if (url.startsWith('http')) return url;
        return `https://branchapi.ristestate.com${url}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse font-mono">
                    Syncing Personnel Database...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/30">
                            <UserCheck className="text-white" size={24} />
                        </div>
                        <div className="absolute -inset-1 bg-indigo-500 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Delivery Runners
                        </h1>
                        <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-sm font-medium`}>
                            Management of active node fulfillment personnel
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchRunners}
                        className={`border px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Activity size={18} className="text-indigo-500" />
                        REFRESH
                    </button>
                    <div className={`relative ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            className={`w-64 pl-10 pr-4 py-2.5 rounded-xl border transition-all text-sm font-bold ${isDarkMode
                                ? 'bg-slate-800/50 border-slate-700 focus:border-indigo-500'
                                : 'bg-white border-slate-200 focus:border-indigo-500'
                                }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={onAddRunner}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all gap-2 items-center flex shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus size={16} />
                        Add Runner
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'Active Runners', value: runners.filter(r => r.status === 'ACTIVE').length, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Total Workforce', value: runners.length, icon: UserCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Branch Coverage', value: '100%', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-xl font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                            </div>
                            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Personnel</th>
                                <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                                <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Last Active</th>
                                <th className="px-5 py-3 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                            {filteredRunners.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-slate-500 font-bold italic">No runners found matching current criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRunners.map((runner) => (
                                    <tr key={runner.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl overflow-hidden shadow-sm border border-slate-200/20">
                                                    <img src={getImageUrl(runner.pro_image)} alt={runner.full_name} className="h-full w-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className={`font-black text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{runner.full_name}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">ID: {runner.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                    <Phone size={10} className="text-indigo-500" />
                                                    {runner.phone}
                                                </div>
                                                {runner.email && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                        <Mail size={10} className="text-indigo-500" />
                                                        {runner.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${runner.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${runner.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                                                {runner.status}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                <Clock size={12} />
                                                {new Date(runner.last_active).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleToggleStatus(runner.id, runner.status)}
                                                    className={`p-1.5 rounded-lg transition-all ${runner.status === 'ACTIVE'
                                                        ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                                                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                        }`}
                                                    title={runner.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                >
                                                    <Power size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(runner.id)}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Runners;
