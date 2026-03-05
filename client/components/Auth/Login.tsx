
import React, { useState } from 'react';
import { LogIn, Lock, ShoppingBag, Mail, Heart, ArrowRight, UserCheck, Eye, EyeOff } from 'lucide-react';
import LogoImage from '../../assets/Bezaw logo (2).png'
import HeroImage from '../../assets/ChatGPT Image Dec 27, 2025, 01_14_44 PM.png'

interface LoginProps {
  onLogin: (user: any) => void;
  onForgot: () => void;
  isDarkMode: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://branchapi.bezawcurbside.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.token);

      // Fetch full profile info securely
      const profileResponse = await fetch('https://branchapi.bezawcurbside.com/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch security clearance');
      }

      const profileData = await profileResponse.json();
      onLogin(profileData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center bg-[#fdfaf6] relative overflow-hidden selection:bg-emerald-100 font-sans">

      {/* Decorative Dark Green Elements - matching the requested "dark green like before" vibe */}
      <div className="absolute top-[-5%] right-[30%] w-[400px] h-[400px] bg-[#064e3b] rounded-full opacity-100 z-0 flex items-center justify-center animate-morph">
        <div className="w-[120px] h-[120px] bg-[#fdfaf6] rounded-full"></div>
      </div>
      <div className="absolute bottom-[-20%] left-[-5%] w-[600px] h-[600px] bg-[#064e3b] rounded-full opacity-100 z-0"></div>

      {/* Floating Sparkles/Particles for a "Fresh" Vibe */}
      <div className="absolute top-[15%] left-[10%] w-4 h-4 bg-emerald-400 rounded-full blur-sm animate-pulse"></div>
      <div className="absolute top-[60%] right-[40%] w-3 h-3 bg-emerald-200 rounded-full blur-sm animate-pulse delay-700"></div>

      {/* Main Container: Wide Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 lg:px-16 h-full py-8 md:py-16">

        {/* Left Section: Login Card */}
        <div className="w-full md:w-[450px] flex flex-col items-center">
          <div className="w-full bg-white rounded-[2.5rem] shadow-[0_60px_120px_-30px_rgba(6,78,59,0.15)] p-8 md:p-12 animate-in fade-in slide-in-from-left-12 duration-1000 border border-emerald-50/50">

            {/* Logo Section */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                <img src={LogoImage} alt="Bezaw Logo" className="w-[120px] h-auto relative z-10 animate-float-soft drop-shadow-2xl" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Bezaw</h1>
              <p className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                Curated with care <Heart size={14} className="text-emerald-500 fill-emerald-500 animate-pulse" />
              </p>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Login</h2>

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-center bg-red-50 text-red-500 text-sm font-bold py-3 rounded-xl border border-red-100 mb-4 animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter Email Id"
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500/20 focus:bg-white rounded-full pl-14 pr-6 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter Password"
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500/20 focus:bg-white rounded-full pl-14 pr-12 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password - Strategically placed under textboxes */}
              <div className="flex justify-end px-2">
                <button
                  type="button"
                  onClick={onForgot}
                  className="text-xs text-slate-400 hover:text-emerald-600 font-bold uppercase tracking-wider transition-all"
                >
                  Forgot Key Sequence?
                </button>
              </div>

              <div className="pt-4 flex flex-col items-center">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-full transition-all transform active:scale-95 shadow-[0_20px_40px_-10px_rgba(5,150,105,0.4)] text-sm tracking-[0.1em] uppercase flex items-center justify-center gap-2 group"
                >
                  {loading ? 'Authenticating...' : 'Login'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Section: Curbside Pickup Hero Image */}
        <div className="hidden md:block flex-1 h-full relative pl-16 py-10">
          <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000">

            {/* Liquid Splash Decal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] pointer-events-none opacity-40">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-100 fill-current animate-morph">
                <path d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.6,-31.3,86.9,-15.7,85.6,-0.7C84.3,14.2,78.5,28.5,70.2,41.2C61.8,53.8,50.8,64.9,37.8,72.4C24.8,79.9,9.8,83.8,-4.6,81.8C-19,79.8,-32.8,71.8,-45.1,62.1C-57.3,52.3,-68,40.8,-74.6,27.3C-81.2,13.8,-83.7,-1.8,-80.5,-16.1C-77.2,-30.3,-68.1,-43.3,-56.3,-52.1C-44.4,-60.9,-29.9,-65.6,-16,-72.1C-2.2,-78.6,11.1,-86.8,25.4,-84.9C39.6,-83,44.7,-76.4,44.7,-76.4Z" transform="translate(100 100)" />
              </svg>
            </div>

            {/* High-Quality Retail Presence */}
            <div className="relative z-10 w-full max-w-[700px] h-full flex items-center justify-center group">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-[4rem] blur-3xl scale-95 group-hover:scale-105 transition-transform duration-1000"></div>

              <img
                src={HeroImage}
                alt="Bezaw Hero"
                className="w-full h-full max-h-[600px] object-cover rounded-[4rem] shadow-[0_60px_100px_-30px_rgba(0,0,0,0.3)] transition-all duration-700 border-8 border-white group-hover:-translate-y-2"
              />

              {/* Info Badges */}
              <div className="absolute -top-10 right-0 bg-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center animate-float-soft">
                <div className="w-14 h-14 bg-[#064e3b] rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg shadow-emerald-950/20">
                  <UserCheck size={28} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Identity<br />Verified</p>
              </div>

              <div className="absolute -bottom-6 -left-10 bg-white/90 backdrop-blur-xl border border-white p-6 rounded-[3rem] shadow-2xl flex items-center gap-5 animate-in slide-in-from-left-12 duration-1000 delay-500">
                <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                  <ShoppingBag size={32} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Bezaw Curbside</p>
                  <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest">Active Fulfilment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
