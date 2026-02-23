import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';

interface SessionExpiredModalProps {
    isOpen: boolean;
    onLogin: () => void;
    isDarkMode: boolean;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onLogin, isDarkMode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className={`
          w-full max-w-sm p-6 rounded-3xl shadow-2xl transform transition-all scale-100 
          ${isDarkMode ? 'bg-[#1e293b] border border-slate-700' : 'bg-white border border-slate-100'}
        `}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-5 animate-bounce">
                        <AlertTriangle size={24} className="text-amber-600" />
                    </div>

                    <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Session Expired
                    </h2>

                    <p className={`text-xs font-medium mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Your security token has expired. Please log in again to continue managing your dashboard.
                    </p>

                    <button
                        onClick={onLogin}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 uppercase tracking-wider text-[10px]"
                    >
                        <LogOut size={14} />
                        Login Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
