
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, Fingerprint } from 'lucide-react';

interface ResetPasswordProps {
    email: string;
    onSuccess: () => void;
    isDarkMode: boolean;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ email, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const rules = [
        { label: '8+ Characters', met: password.length >= 8 },
        { label: 'Numerical Logic', met: /\d/.test(password) },
        { label: 'Symbolic Entropy', met: /[^A-Za-z0-9]/.test(password) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rules.every(r => r.met)) {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('http://localhost:5000/api/forget/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to reset password');
                }

                onSuccess();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center p-6 bg-white overflow-hidden relative">
            {/* Liquid Elements */}
            <div className="absolute top-[10%] right-[-5%] w-[55%] h-[55%] bg-[#ecfdf5] rounded-full blur-[140px] animate-blob-heavy opacity-60"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#f1f5f9] rounded-full blur-[140px] animate-blob-heavy opacity-40" style={{ animationDelay: '-3s' }}></div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-8 rounded-[2.5rem] mb-8 bg-emerald-50 text-[#059669] animate-liquid-slow shadow-xl shadow-emerald-500/5 border border-emerald-100/50">
                        <Fingerprint size={56} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter mb-4 text-slate-900 leading-none text-center">Pass-Overwrite.</h2>
                    <p className="text-slate-400 text-[10px] font-black max-w-[300px] mx-auto leading-relaxed tracking-[0.2em] uppercase italic opacity-60 text-center">
                        Establish a high-entropy access credential for this terminal.
                    </p>
                </div>

                <div className="bg-white/60 glass-surface border border-white/80 rounded-[3.5rem] p-12 shadow-2xl liquid-card-shadow transition-all">
                    {error && (
                        <div className="mb-4 text-center bg-red-50 text-red-500 text-xs font-bold py-3 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">New Security Hash</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#f8fafc] border-2 border-[#f1f5f9] focus:border-[#10b981]/20 focus:bg-white rounded-[1.8rem] px-8 py-6 focus:outline-none transition-all text-sm font-black text-slate-900 placeholder:text-slate-300 pr-20"
                                    placeholder="Set high-entropy key"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </button>
                            </div>
                        </div>

                        <div className="p-7 rounded-[2.2rem] bg-white/50 border border-slate-100/80 space-y-4 shadow-inner">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 px-1 text-center">Entropy Validation</p>
                            <div className="space-y-3">
                                {rules.map((rule, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${rule.met
                                            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                            : 'border-slate-200 bg-white'
                                            }`}>
                                            {rule.met && <CheckCircle2 size={14} className="text-emerald-500" />}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${rule.met ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!rules.every(r => r.met)}
                            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none disabled:cursor-not-allowed text-white font-black py-6 rounded-[2.2rem] transition-all transform active:scale-[0.98] shadow-2xl text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-4"
                        >
                            <Lock size={22} className="group-hover:rotate-12 transition-transform" />
                            Commit Overwrite
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
