
import React, { useState, useRef } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

interface OTPProps {
    email: string;
    onSuccess: () => void;
    onBack: () => void;
    isDarkMode: boolean;
}

const OTP: React.FC<OTPProps> = ({ email, onSuccess, onBack }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const verifyOtp = async (otpValue: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/forget/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: otpValue }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid OTP');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
            // Reset OTP on failure (optional, but good UX)
            // setOtp(['', '', '', '', '', '']); 
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value !== '' && index < 5) {
            inputs.current[index + 1]?.focus();
        }

        if (newOtp.every(val => val !== '')) {
            verifyOtp(newOtp.join(''));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center p-6 bg-white overflow-hidden relative">
            {/* Liquid Elements for White Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ecfdf5] rounded-full blur-[120px] animate-blob-heavy"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f1f5f9] rounded-full blur-[120px] animate-blob-heavy" style={{ animationDelay: '-8s' }}></div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <button onClick={onBack} className="flex items-center gap-3 mb-10 transition-all group text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900">
                    <div className="p-3 rounded-2xl bg-white border border-slate-100 group-hover:border-[#10b981]/30 transition-all shadow-sm">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                    Abort Procedure
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-8 rounded-[2.5rem] mb-8 bg-emerald-50 text-[#059669] animate-liquid-slow shadow-xl shadow-emerald-500/5 border border-emerald-100/50">
                        <ShieldCheck size={56} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter mb-4 text-slate-900 leading-none">Identity.</h2>
                    <p className="text-slate-400 text-[10px] font-black max-w-[280px] mx-auto leading-relaxed tracking-[0.2em] uppercase italic opacity-60">
                        Verify session via the 6-digit cryptographic sequence.
                    </p>
                </div>

                <div className="bg-white/60 glass-surface border border-white/80 rounded-[3.5rem] p-12 shadow-2xl liquid-card-shadow transition-all">
                    {error && (
                        <div className="mb-8 text-center bg-red-50 text-red-500 text-xs font-bold py-3 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}
                    <div className="flex justify-between gap-3 mb-12">
                        {otp.map((data, index) => (
                            <div key={index} className="relative group flex-1">
                                <input
                                    type="text"
                                    maxLength={1}
                                    ref={(el) => { inputs.current[index] = el; }}
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-full h-24 border-2 border-[#f1f5f9] bg-[#f8fafc] rounded-2xl text-center text-4xl font-black transition-all text-slate-900 focus:bg-white focus:border-[#10b981] focus:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.15)] focus:outline-none"
                                    autoFocus={index === 0}
                                />
                                {!data && (
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-[3px] h-10 bg-[#10b981]/20 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-4 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#f1f5f9] text-slate-500 font-black py-6 rounded-2xl transition-all text-[10px] uppercase tracking-[0.4em] group"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-1000" />
                        Recycle Sequence (0:45)
                    </button>
                </div>

                <div className="mt-14 flex flex-col items-center gap-6 opacity-30 group">
                    <div className="flex items-center gap-4">
                        <KeyRound size={24} className="text-[#10b981] group-hover:scale-110 transition-transform" />
                        <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Bezaw Strategic Protocol v4</span>
                </div>
            </div>
        </div>
    );
};

export default OTP;
