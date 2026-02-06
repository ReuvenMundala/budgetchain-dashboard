import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const navigate = useNavigate();
    const { loginAsAdmin, loginAsGuest } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = loginAsAdmin(username, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError('Invalid username or password. Please try again.');
        }
        setIsLoading(false);
    };

    const handleGuestEntry = () => {
        loginAsGuest();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-[#001f3f] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-400/20 shadow-2xl">
                        <Shield size={40} className="text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">
                        BUDGET<span className="text-amber-400">CHAIN</span>
                    </h1>
                    <p className="text-slate-500 text-xs uppercase tracking-widest mt-2 font-bold">
                        GAA 2026 Transparency Portal
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#0a0e17] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Admin Login Section */}
                    <div className="p-8 border-b border-white/5">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center">
                            <Lock size={16} className="mr-2 text-amber-400" />
                            Administrator Access
                        </h2>

                        <form onSubmit={handleAdminLogin} className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                    Username
                                </label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-[#001f3f] border border-white/10 rounded-lg text-white text-sm font-bold focus:border-amber-400 focus:outline-none transition-colors"
                                        placeholder="Enter username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-[#001f3f] border border-white/10 rounded-lg text-white text-sm font-bold focus:border-amber-400 focus:outline-none transition-colors"
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                                >
                                    <AlertCircle size={16} className="text-red-400 mr-2" />
                                    <span className="text-red-400 text-xs font-bold">{error}</span>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !username || !password}
                                className="w-full py-4 bg-amber-400 text-blue-900 font-black uppercase text-sm rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Login as Admin
                                        <ArrowRight size={18} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Guest Entry Section */}
                    <div className="p-8 bg-[#001f3f]/30">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center">
                            <User size={16} className="mr-2 text-slate-400" />
                            Public Access
                        </h2>
                        <p className="text-slate-500 text-xs mb-6 font-bold leading-relaxed">
                            Enter as a guest to view the budget dashboard and submit reports.
                            You won't be able to add or modify projects.
                        </p>
                        <button
                            onClick={handleGuestEntry}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-sm rounded-lg hover:bg-white/10 hover:border-amber-400/30 active:scale-[0.98] transition-all flex items-center justify-center"
                        >
                            Continue as Guest
                            <ArrowRight size={18} className="ml-2" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                        Bagong Pilipinas • Department of Budget and Management
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
