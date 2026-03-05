
import React, { useState, useEffect } from 'react';
import {
    Shield, Bell, Volume2, HardDrive,
    Activity, Clock, Users, Eye, EyeOff,
    CheckCircle2, AlertOctagon, Save, Mail,
    Zap, VolumeX, CheckSquare, Settings as SettingsIcon,
    Power, ZapOff, Orbit
} from 'lucide-react';

interface SettingsProps {
    isDarkMode: boolean;
    isBusy: boolean;
    onToggleBusy: () => void;
    onShutdownBranch: () => void;
    onShutdownGrid: () => void;
    onOmniShutdown?: () => void;
}

const availableSounds = [
    { id: 'sonar', name: 'Sonar Ping', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
    { id: 'chime', name: 'Elegant Chime', url: 'https://assets.mixkit.co/active_storage/sfx/2860/2860-preview.mp3' },
    { id: 'pulse', name: 'Tech Pulse', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
    { id: 'glass', name: 'Crystal Glass', url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' }
];

const Settings: React.FC<SettingsProps> = ({ isDarkMode, isBusy, onToggleBusy, onShutdownBranch, onShutdownGrid, onOmniShutdown }) => {
    const [showPass, setShowPass] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [config, setConfig] = useState({
        autoAccept: true,
        soundAlerts: localStorage.getItem('soundAlerts') !== 'false',
        notificationSound: localStorage.getItem('notificationSound') || 'sonar',
        openingHours: '06:00',
        closingHours: '22:00'
    });

    useEffect(() => {
        localStorage.setItem('soundAlerts', config.soundAlerts.toString());
        localStorage.setItem('notificationSound', config.notificationSound);
    }, [config.soundAlerts, config.notificationSound]);

    const previewSound = (soundId: string) => {
        const sound = availableSounds.find(s => s.id === soundId);
        if (sound) {
            const audio = new Audio(sound.url);
            audio.play().catch(e => console.error('Audio playback failed:', e));
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://branchapi.bezawcurbside.com/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setEmail(data.email);
                    setConfig(prev => ({
                        ...prev,
                        openingHours: data.openingHours || '06:00',
                        closingHours: data.closingHours || '22:00'
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleCommitUpdates = async () => {
        if (!password || password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match or are empty' });
            return;
        }
        if (password.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://branchapi.bezawcurbside.com/api/settings/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword: password })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Credentials updated successfully' });
                setPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Update failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateHours = async () => {
        setUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://branchapi.bezawcurbside.com/api/settings/update-hours', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    openingHours: config.openingHours,
                    closingHours: config.closingHours
                })
            });

            const data = await response.json();
            if (response.ok) {
                setMessage({ type: 'success', text: 'Operational hours updated successfully' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Update failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setUpdating(false);
        }
    };

    const passRules = [
        { label: '8+ Characters', met: password.length >= 8 },
        { label: 'Numbers & Symbols', met: /\d/.test(password) && /[^A-Za-z0-9]/.test(password) }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between border-b border-slate-800 pb-8">
                <div>
                    <h1 className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Terminal <span className="text-green-500">Configuration</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <SettingsIcon size={14} /> Global System Parameters & Security
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Security Protocol Section */}
                    <section className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 shadow-2xl' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                <Shield size={24} />
                            </div>
                            <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Security Protocol</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Mail size={12} /> Security Email Address
                                </label>
                                <input
                                    type="email"
                                    readOnly
                                    className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                    value={loading ? 'Fetching identity...' : email}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Credentials</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            disabled={updating}
                                            className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                        >
                                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm Access</label>
                                    <input
                                        type="password"
                                        disabled={updating}
                                        className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'}`}
                                        placeholder="Repeat password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className={`p-6 rounded-2xl border flex flex-wrap gap-6 items-center ${isDarkMode ? 'bg-[#0a0c10] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                {passRules.map((r, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        {r.met ? <CheckCircle2 size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                                        <span className={`text-xs font-bold ${r.met ? 'text-slate-300' : 'text-slate-600'}`}>{r.label}</span>
                                    </div>
                                ))}
                                <button
                                    onClick={handleCommitUpdates}
                                    disabled={updating}
                                    className="ml-auto text-xs font-black text-blue-500 uppercase tracking-widest hover:underline disabled:opacity-50"
                                >
                                    {updating ? 'Processing...' : 'Commit Updates'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Operational Hours Section */}
                    <section className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 shadow-2xl' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                <Clock size={24} />
                            </div>
                            <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Operational Hours</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Opening Time</label>
                                <input
                                    type="time"
                                    disabled={updating}
                                    className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 focus:border-amber-500'}`}
                                    value={config.openingHours}
                                    onChange={(e) => setConfig({ ...config, openingHours: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Closing Time</label>
                                <input
                                    type="time"
                                    disabled={updating}
                                    className={`w-full px-6 py-4 rounded-2xl border transition-all focus:outline-none ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 focus:border-amber-500'}`}
                                    value={config.closingHours}
                                    onChange={(e) => setConfig({ ...config, closingHours: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#0a0c10] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-xs text-slate-500 font-bold max-w-[60%]">
                                These times determine when the branch appears as "Open" to customers on the platform.
                            </p>
                            <button
                                onClick={handleUpdateHours}
                                disabled={updating}
                                className="text-xs font-black text-amber-500 uppercase tracking-widest hover:underline disabled:opacity-50"
                            >
                                {updating ? 'Syncing...' : 'Update Hours'}
                            </button>
                        </div>
                    </section>

                    {/* Operational Parameters Section */}
                    <section className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-[#121418] border-slate-800 shadow-2xl' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                <Zap size={24} />
                            </div>
                            <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Operational Parameters</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">


                                <div className={`flex items-center justify-between p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center gap-3">
                                        {config.soundAlerts ? <Volume2 size={18} className="text-blue-500" /> : <VolumeX size={18} className="text-slate-500" />}
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-300">Sound Notifications</span>
                                    </div>
                                    <button
                                        onClick={() => setConfig({ ...config, soundAlerts: !config.soundAlerts })}
                                        className={`w-14 h-7 rounded-full transition-all relative ${config.soundAlerts ? 'bg-blue-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1.5 w-4 h-4 bg-white rounded-full transition-all ${config.soundAlerts ? 'left-8' : 'left-2'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notification Soundscape</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {availableSounds.map((sound) => (
                                        <div
                                            key={sound.id}
                                            onClick={() => setConfig({ ...config, notificationSound: sound.id })}
                                            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${config.notificationSound === sound.id
                                                ? 'border-blue-500 bg-blue-500/5 shadow-sm'
                                                : isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${config.notificationSound === sound.id ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />
                                                <span className={`text-xs font-bold ${config.notificationSound === sound.id ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
                                                    {sound.name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); previewSound(sound.id); }}
                                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-500 hover:text-blue-500' : 'hover:bg-white text-slate-400 hover:text-blue-500'}`}
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* System Status & Shutdown Controls */}
                    <section className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center text-center ${isBusy
                        ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                        : 'border-slate-800 bg-slate-900/20'
                        }`}>
                        {isBusy ? (
                            <AlertOctagon size={40} className="text-red-500 mb-4 animate-pulse" />
                        ) : (
                            <Activity size={40} className="text-green-500 mb-4" />
                        )}
                        <h3 className={`text-lg font-black tracking-tight mb-2 uppercase italic ${isBusy ? 'text-red-500' : 'text-green-500'}`}>
                            System Status
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mb-6 uppercase tracking-wider">
                            {isBusy
                                ? 'Orders are currently throttled'
                                : 'Terminal is operating at full capacity'}
                        </p>
                        <button
                            onClick={onToggleBusy}
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${isBusy
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-black/20'
                                }`}
                        >
                            {isBusy ? 'Resume Live Mode' : 'Switch to Busy Mode'}
                        </button>
                    </section>




                </div>
            </div>
        </div>
    );
};

export default Settings;
