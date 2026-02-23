
import React, { useState, useEffect } from 'react';
import { AuthStep, User } from './types';
import Login from './components/Auth/Login';
import OTP from './components/Auth/OTP';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import DashboardLayout from './components/layout/DashboardLayout';
import SessionExpiredModal from './components/Auth/SessionExpiredModal';
import GlobalTermination from './shutdown/GlobalTermination';
import OmniLockdown from './shutdown/OmniLockdown';
import BranchOffline from './shutdown/BranchOffline';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<AuthStep>(AuthStep.LOGIN);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    const [resetEmail, setResetEmail] = useState('');

    // Intercept 401s globally
    useEffect(() => {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            if (response.status === 401) {
                // Check if it's a login attempt failure, we don't want to show session expired modal for that
                // Usually login endpoints are public, but if they return 401 it means invalid credentials, not expired session
                // We can check the URL or relying on the fact that if we are logged in (token exists), a 401 likely means expired
                if (localStorage.getItem('token')) {
                    setIsSessionExpired(true);
                }
            }
            return response;
        };
        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    // Check System Status & Branch Status
    useEffect(() => {
        const checkSystemStatus = async () => {
            try {
                const response = await fetch('https://branchapi.ristestate.com/api/system/status');
                if (response.ok) {
                    const status = await response.json();

                    if (status.GLOBAL_SHUTDOWN?.toLowerCase() !== 'active') {
                        setCurrentStep(AuthStep.GLOBAL_TERMINATION);
                        return;
                    }
                    if (status.OMNILOCKDOWN_HUB?.toLowerCase() !== 'active') {
                        setCurrentStep(AuthStep.OMNI_LOCKDOWN);
                        return;
                    }
                }
            } catch (err) {
                console.error('Failed to check system status', err);
            }
        };

        checkSystemStatus();
    }, []);

    // Persist session on refresh & check branch status
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoading(true);
            fetch('https://branchapi.ristestate.com/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Session expired');
                    return res.json();
                })
                .then(userData => {
                    setUser(userData);
                    const smStatus = userData.vendorStatus?.toLowerCase();
                    const bStatus = userData.branchStatus?.toLowerCase();

                    if (smStatus !== 'active') {
                        setCurrentStep(AuthStep.OMNI_LOCKDOWN);
                    } else if (bStatus !== 'active') {
                        setCurrentStep(AuthStep.BRANCH_OFFLINE);
                    } else {
                        setCurrentStep(AuthStep.DASHBOARD);
                    }
                })
                .catch(() => {
                    // Silent fail on load, just don't log in
                    localStorage.removeItem('token');
                    setCurrentStep(AuthStep.LOGIN);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleLogin = (userData: User) => {
        setIsLoading(true);
        // Simulate a small delay for smooth transition or any final checks
        setTimeout(() => {
            setUser(userData);
            const smStatus = userData.vendorStatus?.toLowerCase();
            const bStatus = userData.branchStatus?.toLowerCase();

            if (smStatus !== 'active') {
                setCurrentStep(AuthStep.OMNI_LOCKDOWN);
            } else if (bStatus !== 'active') {
                setCurrentStep(AuthStep.BRANCH_OFFLINE);
            } else {
                setCurrentStep(AuthStep.DASHBOARD);
            }
            setIsLoading(false);
        }, 500);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setCurrentStep(AuthStep.LOGIN);
    };

    const handleSessionExpiredLogin = () => {
        setIsSessionExpired(false);
        handleLogout();
    };

    return (
        <div className={`h-screen w-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0f1115] text-slate-200' : 'bg-slate-50 text-slate-900'} antialiased selection:bg-green-500/30`}>
            {isLoading && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
                    <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <SessionExpiredModal
                isOpen={isSessionExpired}
                onLogin={handleSessionExpiredLogin}
                isDarkMode={isDarkMode}
            />

            {currentStep === AuthStep.LOGIN && (
                <Login
                    onLogin={handleLogin}
                    onForgot={() => setCurrentStep(AuthStep.FORGOT_PASSWORD)}
                    isDarkMode={isDarkMode}
                />
            )}

            {currentStep === AuthStep.OTP && (
                <OTP
                    email={resetEmail}
                    onSuccess={() => setCurrentStep(AuthStep.RESET_PASSWORD)}
                    onBack={() => setCurrentStep(AuthStep.FORGOT_PASSWORD)}
                    isDarkMode={isDarkMode}
                />
            )}

            {currentStep === AuthStep.FORGOT_PASSWORD && (
                <ForgotPassword
                    onBack={() => setCurrentStep(AuthStep.LOGIN)}
                    onSuccess={(email) => {
                        setResetEmail(email);
                        setCurrentStep(AuthStep.OTP);
                    }}
                    isDarkMode={isDarkMode}
                />
            )}

            {currentStep === AuthStep.RESET_PASSWORD && (
                <ResetPassword
                    email={resetEmail}
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

            {currentStep === AuthStep.GLOBAL_TERMINATION && (
                <GlobalTermination onLogout={handleLogout} />
            )}

            {currentStep === AuthStep.OMNI_LOCKDOWN && (
                <OmniLockdown
                    vendorName={user?.vendorName}
                    branchCount={user?.vendorBranchCount}
                    onLogout={handleLogout}
                />
            )}

            {currentStep === AuthStep.BRANCH_OFFLINE && (
                <BranchOffline
                    branchName={user?.branchName}
                    onLogout={handleLogout}
                />
            )}
        </div>
    );
};

export default App;
