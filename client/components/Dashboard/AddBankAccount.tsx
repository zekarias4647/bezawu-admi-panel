
import React, { useState, useEffect } from 'react';
import { Landmark, Save, AlertCircle, CheckCircle2, Loader2, User, Building, Hash, ChevronDown, Eye, EyeOff, Plus, ArrowRight } from 'lucide-react';
import { BASE_API_URL } from '../../constants';

const ETHIOPIAN_BANKS = [
    "Abay Bank S.C.",
    "Abyssinia Bank S.C.",
    "Ahadu Bank S.C.",
    "Addis (International) Bank",
    "Amhara Bank S.C.",
    "Awash International Bank S.C.",
    "Bank of Abyssinia S.C.",
    "Berhan Bank S.C.",
    "Bunna International Bank S.C.",
    "Commercial Bank of Ethiopia (CBE)",
    "Cooperative Bank of Oromia S.C.",
    "Dashen Bank S.C.",
    "Development Bank of Ethiopia",
    "Enat Bank S.C.",
    "Gadaa Bank S.C.",
    "Global Bank S.C.",
    "Goh Betoch Bank S.C.",
    "Hibret Bank S.C.",
    "Hijra Bank S.C.",
    "Lion International Bank S.C.",
    "National Bank of Ethiopia",
    "Nib International Bank S.C.",
    "OMO Bank S.C.",
    "Oromia Bank S.C.",
    "Rammis Bank S.C.",
    "Shabelle Bank S.C.",
    "Sidama Bank S.C.",
    "Siinqee Bank S.C.",
    "Siket Bank S.C.",
    "Tsedey Bank S.C.",
    "Tsehay Bank S.C.",
    "Wegagen Bank S.C.",
    "ZamZam Bank S.C.",
    "Zemen Bank S.C."
];

interface AddBankAccountProps {
    isDarkMode: boolean;
    user: any;
}

const AddBankAccount: React.FC<AddBankAccountProps> = ({ isDarkMode, user }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
    const [isAddingNew, setIsAddingNew] = useState(false);

    const [formData, setFormData] = useState({
        account_name: '',
        account_number: '',
        bank_name: ''
    });

    const fetchBankAccounts = async () => {
        setFetching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_API_URL}/api/bank`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setAccounts(data);
                    // If we have accounts, but none are being edited, don't show the form immediately
                    if (data.length > 0 && !isAddingNew) {
                        setIsAddingNew(false);
                    } else if (data.length === 0) {
                        setIsAddingNew(true);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch bank accounts:', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const toggleShowNumber = (id: string) => {
        setShowNumbers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_API_URL}/api/bank`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save bank account');
            }

            await fetchBankAccounts();
            setSuccess(true);
            setIsAddingNew(false);
            setFormData({ account_name: '', account_number: '', bank_name: '' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching && accounts.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <Landmark className="text-emerald-500" size={24} />
                        </div>
                        Financial Hub
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Manage multiple settlement accounts and payout preferences.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchBankAccounts}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                            ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Loader2 size={14} className={fetching ? 'animate-spin text-emerald-500' : ''} />
                        Refresh
                    </button>
                    {!isAddingNew && (
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
                        >
                            <Plus size={14} />
                            Add Account
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Accounts List */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-2 ml-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Linked Accounts ({accounts.length})</h3>
                    </div>

                    <div className="space-y-4">
                        {accounts.map((account) => (
                            <div key={account.id} className={`relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-500 group
                                ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50'}`}>

                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Bank Name</p>
                                            <h4 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{account.bank_name}</h4>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleShowNumber(account.id)}
                                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {showNumbers[account.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            {account.is_primary && (
                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                    <CheckCircle2 className="text-emerald-500" size={16} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Account Holder</p>
                                        <p className={`text-sm font-bold tracking-tight uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{account.account_name}</p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800/10 dark:border-slate-800/50">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Account Number</p>
                                                <p className={`text-lg font-mono font-black tracking-[0.1em] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {showNumbers[account.id]
                                                        ? account.account_number
                                                        : `•••• •••• ${account.account_number.slice(-4)}`}
                                                </p>
                                            </div>
                                            {account.is_primary && (
                                                <div className={`px-2 py-1 rounded-full text-[8px] font-black tracking-widest uppercase
                                                    ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                    Default
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {accounts.length === 0 && !fetching && (
                            <div className={`p-10 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center gap-4
                                ${isDarkMode ? 'bg-[#1a1d23]/50 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <div className="p-4 bg-slate-500/5 rounded-full">
                                    <Landmark size={32} />
                                </div>
                                <p className="text-sm font-bold">No accounts linked</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-7">
                    {isAddingNew ? (
                        <div className={`rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-white border-slate-100'} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500`}>
                            <div className="p-8 md:p-10">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 ml-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account Configuration</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => accounts.length > 0 && setIsAddingNew(false)}
                                            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-sm font-bold animate-in shake duration-500">
                                            <AlertCircle size={18} />
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Account Holder Name</label>
                                            <div className="relative group">
                                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-600'}`}>
                                                    <User size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.account_name}
                                                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                                    placeholder="Full name as per bank record"
                                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all border-2 
                                                        ${isDarkMode
                                                            ? 'bg-[#14171c] border-slate-800 focus:border-emerald-500/30 focus:bg-[#1a1d23] text-white'
                                                            : 'bg-slate-50 border-slate-100 focus:border-emerald-500/20 focus:bg-white text-slate-900'}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Bank</label>
                                            <div className="relative group">
                                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-600'}`}>
                                                    <Building size={18} />
                                                </div>
                                                <select
                                                    required
                                                    value={formData.bank_name}
                                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                                    className={`w-full pl-12 pr-10 py-4 rounded-2xl text-sm font-bold outline-none transition-all border-2 appearance-none
                                                        ${isDarkMode
                                                            ? 'bg-[#14171c] border-slate-800 focus:border-emerald-500/30 focus:bg-[#1a1d23] text-white'
                                                            : 'bg-slate-50 border-slate-100 focus:border-emerald-500/20 focus:bg-white text-slate-900'}`}
                                                >
                                                    <option value="" disabled>Choose provider</option>
                                                    {ETHIOPIAN_BANKS.map((bank) => (
                                                        <option key={bank} value={bank}>{bank}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Account Number</label>
                                            <div className="relative group">
                                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-600'}`}>
                                                    <Hash size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.account_number}
                                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                                    placeholder="Enter numeric value"
                                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all border-2 
                                                        ${isDarkMode
                                                            ? 'bg-[#14171c] border-slate-800 focus:border-emerald-500/30 focus:bg-[#1a1d23] text-white'
                                                            : 'bg-slate-50 border-slate-100 focus:border-emerald-500/20 focus:bg-white text-slate-900'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800/10 dark:border-slate-800/50 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 text-xs tracking-widest uppercase"
                                        >
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Link Account</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className={`rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1a1d23] border-slate-800' : 'bg-white border-slate-100'} p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]`}>
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                <Plus size={32} />
                            </div>
                            <div className="space-y-2 max-w-sm">
                                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add New Bank Source</h3>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">Diversify your payout options by adding more bank accounts. You can manage and switch between them easily.</p>
                            </div>
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 text-xs tracking-widest uppercase"
                            >
                                <Plus size={18} /> Get Started
                            </button>
                        </div>
                    )}

                    {success && !isAddingNew && (
                        <div className="mt-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-4">
                            <CheckCircle2 size={18} />
                            Success! Your new financial vault is ready.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddBankAccount;
