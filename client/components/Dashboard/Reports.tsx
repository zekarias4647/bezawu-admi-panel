import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, Loader2, CheckCircle2, Clock, MessageSquare, ExternalLink } from 'lucide-react';

interface Report {
    id: number;
    customerId: string;
    orderId: string;
    reason: string;
    description: string;
    status: string;
    createdAt: string;
    branchId: string;
    customerName?: string;
    customerPhone?: string;
}

interface ReportsProps {
    isDarkMode: boolean;
}

const STATUS_CONFIG: Record<string, { icon: any, color: string, bg: string }> = {
    'Pending': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    'Reviewed': { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'Resolved': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

const Reports: React.FC<ReportsProps> = ({ isDarkMode }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('https://branchapi.ristestate.com/api/reports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setReports(data || []);
            } else {
                throw new Error('Failed to fetch reports');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://branchapi.ristestate.com/api/reports/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
                if (selectedReport?.id === id) {
                    setSelectedReport({ ...selectedReport, status });
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Fetching Reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-10">
                <AlertCircle className="text-rose-500 mb-4" size={48} />
                <h2 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Sync Error</h2>
                <p className="text-slate-500 max-w-md">{error}</p>
                <button onClick={fetchReports} className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Retry</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Customer <span className="text-rose-500">Reports</span>
                    </h1>
                    <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} text-xs mt-1 flex items-center gap-2 font-bold uppercase tracking-widest`}>
                        <FileText size={14} className="text-rose-500" />
                        Active issues and feedback
                    </p>
                </div>
            </div>

            <div className={`border rounded-[2rem] overflow-hidden transition-colors ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'bg-[#1a1d23] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <th className="px-5 py-3">Report ID</th>
                                <th className="px-5 py-3">Order Ref</th>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3">Reason</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <FileText size={40} className="mx-auto text-slate-500 opacity-50 mb-3" />
                                        <p className="text-sm font-bold text-slate-500 opacity-70">No reports found.</p>
                                    </td>
                                </tr>
                            ) : (
                                reports.map(report => {
                                    const statusConf = STATUS_CONFIG[report.status] || { icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-500/10' };
                                    const StatusIcon = statusConf.icon;

                                    return (
                                        <tr key={report.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                                            <td className="px-5 py-4">
                                                <span className={`text-[11px] font-bold font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>#{report.id}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[11px] font-bold tracking-tight text-emerald-500`}>{report.orderId}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{report.customerName || report.customerId}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-medium truncate max-w-[200px] block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{report.reason}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusConf.bg} ${statusConf.color}`}>
                                                    <StatusIcon size={12} />
                                                    {report.status}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedReport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`max-w-md w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#1a1d23] border-slate-700' : 'bg-white border-slate-200'}`}>
                        <div className="p-5 border-b border-slate-700/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-500/10 rounded-xl">
                                    <FileText size={20} className="text-rose-500" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Report Details</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: #{selectedReport.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                                <AlertCircle size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Customer</span>
                                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{selectedReport.customerName || selectedReport.customerId}</p>
                                {selectedReport.customerPhone && <p className="text-xs text-slate-500 mt-0.5">{selectedReport.customerPhone}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Order Ref</span>
                                    <p className="text-sm font-mono font-bold text-emerald-500">{selectedReport.orderId}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Reported At</span>
                                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{new Date(selectedReport.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Reason</span>
                                <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{selectedReport.reason}</p>
                            </div>

                            <div className={`p-4 rounded-xl text-sm ${isDarkMode ? 'bg-[#0f1115] text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Description</span>
                                <p className="leading-relaxed whitespace-pre-wrap">{selectedReport.description}</p>
                            </div>

                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Update Status</span>
                                <div className="flex gap-2">
                                    {['Pending', 'Reviewed', 'Resolved'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(selectedReport.id, status)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${selectedReport.status === status
                                                ? (status === 'Pending' ? 'bg-amber-500 text-white border-amber-500' : status === 'Reviewed' ? 'bg-blue-500 text-white border-blue-500' : 'bg-emerald-500 text-white border-emerald-500')
                                                : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50')
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`p-5 border-t ${isDarkMode ? 'border-slate-800 bg-[#121418]' : 'border-slate-100 bg-[#f8fafc]'}`}>
                            <button onClick={() => setSelectedReport(null)} className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
