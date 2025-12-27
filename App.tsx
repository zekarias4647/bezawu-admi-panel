
import React, { useState, useEffect } from 'react';
import { AuthStep, User } from './types';
import Login from './components/Auth/Login';
import OTP from './components/Auth/OTP';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import DashboardLayout from './components/Dashboard/DashboardLayout';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AuthStep>(AuthStep.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'Abebe Bikila',
        role: 'ADMIN',
        branchId: 'B-001',
        branchName: 'Bole Medhanealem Branch'
      });
      setCurrentStep(AuthStep.DASHBOARD);
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentStep(AuthStep.LOGIN);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0f1115] text-slate-200' : 'bg-slate-50 text-slate-900'} antialiased selection:bg-green-500/30`}>
      {isLoading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
          <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {currentStep === AuthStep.LOGIN && (
        <Login 
          onLogin={handleLogin} 
          onForgot={() => setCurrentStep(AuthStep.FORGOT_PASSWORD)} 
          isDarkMode={isDarkMode}
        />
      )}
      
      {currentStep === AuthStep.OTP && (
        <OTP 
          onSuccess={() => setCurrentStep(AuthStep.RESET_PASSWORD)} 
          onBack={() => setCurrentStep(AuthStep.FORGOT_PASSWORD)} 
          isDarkMode={isDarkMode}
        />
      )}

      {currentStep === AuthStep.FORGOT_PASSWORD && (
        <ForgotPassword 
          onBack={() => setCurrentStep(AuthStep.LOGIN)} 
          onSuccess={() => setCurrentStep(AuthStep.OTP)}
          isDarkMode={isDarkMode}
        />
      )}

      {currentStep === AuthStep.RESET_PASSWORD && (
        <ResetPassword 
          onSuccess={() => setCurrentStep(AuthStep.LOGIN)} 
          isDarkMode={isDarkMode}
        />
      )}

      {currentStep === AuthStep.DASHBOARD && user && (
        <DashboardLayout 
          user={user} 
          onLogout={handleLogout} 
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

export default App;
