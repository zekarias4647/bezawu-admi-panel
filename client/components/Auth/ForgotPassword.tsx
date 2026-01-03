
import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, Sparkles, Database } from 'lucide-react';

interface ForgotPasswordProps {
    onBack: () => void;
    onSuccess: (email: string) => void;
    isDarkMode: boolean;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/forget/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            onSuccess(email);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center p-6 bg-white overflow-hidden relative">
            {/* Liquid Elements */}
            <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] bg-[#ecfdf5] rounded-full blur-[140px] animate-blob-heavy opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f1f5f9] rounded-full blur-[140px] animate-blob-heavy opacity-40" style={{ animationDelay: '-5s' }}></div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <button onClick={onBack} className="flex items-center gap-3 mb-10 transition-all group text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900">
                    <div className="p-3 rounded-2xl bg-white border border-slate-100 group-hover:border-[#10b981]/30 transition-all shadow-sm">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                    Return to Portal
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-8 rounded-[2.5rem] mb-8 bg-emerald-50 text-[#059669] animate-liquid-slow shadow-xl shadow-emerald-500/5 border border-emerald-100/50">
                        <Database size={56} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter mb-4 text-slate-900 leading-none">Recovery.</h2>
                    <p className="text-slate-400 text-[10px] font-black max-w-[320px] mx-auto leading-relaxed tracking-[0.2em] uppercase italic opacity-60 text-center">
                        Identify your terminal via email to initiate the reset sequence.
                    </p>
                </div>

                <div className="bg-white/60 glass-surface border border-white/80 rounded-[3.5rem] p-12 shadow-2xl liquid-card-shadow transition-all">
                    {error && (
                        <div className="mb-4 text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Terminal Identity</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[#f8fafc] border-2 border-[#f1f5f9] focus:border-[#10b981]/20 focus:bg-white rounded-[1.8rem] px-8 py-6 focus:outline-none transition-all text-sm font-black text-slate-900 placeholder:text-slate-300"
                                    placeholder="abebe@bezaw.com"
                                />
                                <Mail size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-[#10b981]" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="group relative w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[2.2rem] overflow-hidden transition-all transform active:scale-[0.98] shadow-2xl text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-4"
                        >
                            <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Transmit Key
                        </button>
                    </form>
                </div>

                <div className="mt-14 flex justify-center">
                    <div className="flex items-center gap-4 px-8 py-4 rounded-full glass-surface shadow-md">
                        <Sparkles size={16} className="text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bezaw Security Ledger 4.2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
