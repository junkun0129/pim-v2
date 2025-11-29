
import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import type { User } from '../types';

interface LoginScreenProps {
    users: User[];
    onLogin: (userId: string) => void;
}

export default function LoginScreen({ users, onLogin }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            // For now, default to user_full if manual entry
            onLogin('user_full');
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black font-sans p-4 relative overflow-hidden group">
            <style>{`
                @keyframes float-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes float-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-30px, 50px) scale(1.1); }
                    66% { transform: translate(20px, -20px) scale(0.9); }
                }
                @keyframes float-3 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(0, 20px) rotate(10deg); }
                }
                .animate-float-1 { animation: float-1 20s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 25s ease-in-out infinite; }
                .animate-float-3 { animation: float-3 15s ease-in-out infinite; }
            `}</style>

            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orb 1 */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-400/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-float-1"></div>
                {/* Gradient Orb 2 */}
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-sky-400/30 dark:bg-sky-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 animate-float-2 animation-delay-2000"></div>
                {/* Gradient Orb 3 */}
                <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-pink-400/30 dark:bg-pink-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-float-1 animation-delay-4000"></div>
            </div>

            {/* Glass Card */}
            <div className="w-full max-w-md bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/50 dark:border-white/10 p-8 md:p-10 relative z-10 animate-fade-in-up transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(31,38,135,0.1)]">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 mb-6 animate-float-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">PIM System Professional</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <Input 
                            label="Email Address" 
                            placeholder="admin@company.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="transition-all focus-within:transform focus-within:scale-[1.02]"
                        />
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="transition-all focus-within:transform focus-within:scale-[1.02]"
                        />
                    </div>
                    
                    <Button type="submit" className="w-full py-3.5 text-base font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Authenticating...</span>
                            </div>
                        ) : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-10 pt-8 border-t border-zinc-200/50 dark:border-zinc-700/50">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-6">Quick Access (Dev)</p>
                    <div className="grid grid-cols-1 gap-3">
                        {users.map((user, index) => {
                            let roleLabel = '';
                            let ringColor = '';
                            let extraLabel = '';
                            
                            if (user.id === 'user_full') { 
                                roleLabel = 'Admin (Full Ext)'; 
                                ringColor = 'ring-indigo-500/20 group-hover:ring-indigo-500/40'; 
                                extraLabel = '★ All Features';
                            } else if (user.id === 'user_minimal') { 
                                roleLabel = 'Admin (No Ext)'; 
                                ringColor = 'ring-zinc-500/20 group-hover:ring-zinc-500/40'; 
                                extraLabel = 'Basic Only';
                            } else {
                                if (user.roleId === 'role_admin') { roleLabel = 'Admin'; ringColor = 'ring-purple-500/20 group-hover:ring-purple-500/40'; }
                                else if (user.roleId === 'role_manager') { roleLabel = 'Manager'; ringColor = 'ring-blue-500/20 group-hover:ring-blue-500/40'; }
                                else if (user.roleId === 'role_creator') { roleLabel = 'Creator'; ringColor = 'ring-orange-500/20 group-hover:ring-orange-500/40'; }
                                else { roleLabel = 'Staff'; ringColor = 'ring-zinc-500/20 group-hover:ring-zinc-500/40'; }
                            }

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => onLogin(user.id)}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    className="flex items-center w-full p-2.5 rounded-xl bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-md animate-fade-in-up"
                                >
                                    <div className={`p-0.5 rounded-full ring-2 ${ringColor} transition-all`}>
                                        <img src={user.avatarUrl} className="w-9 h-9 rounded-full" alt="" />
                                    </div>
                                    <div className="ml-4 flex-1 text-left">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{user.name}</span>
                                            <div className="flex gap-2">
                                                {extraLabel && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">{extraLabel}</span>}
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700/50 text-zinc-500">{roleLabel}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 block mt-0.5">ID: {user.id}</span>
                                    </div>
                                    <svg className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 transition-colors transform group-hover:translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-6 text-center w-full text-[10px] font-medium text-zinc-400 tracking-widest opacity-60">
                PIM PRO &copy; 2024
            </div>
        </div>
    );
}
