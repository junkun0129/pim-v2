
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
            onLogin('user_full');
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black font-sans p-4 relative overflow-hidden">
            {/* Breathing Aurora Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-400/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-emerald-400/20 rounded-full blur-[100px] animate-pulse delay-2000"></div>
            </div>

            <div className="w-full max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-zinc-700/50 p-8 md:p-10 relative z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2 font-display">PIM Pro</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Next Gen Product Management</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <Input 
                            label="Email" 
                            placeholder="user@company.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white/50 dark:bg-zinc-950/50"
                        />
                        <Input 
                            label="Password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-white/50 dark:bg-zinc-950/50"
                        />
                    </div>
                    
                    <Button type="submit" className="w-full py-3 text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-xl shadow-zinc-500/20 transition-all hover:scale-[1.02]">
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-700/50">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-4">Quick Login (Dev)</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => onLogin(user.id)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:scale-105 transition-all text-xs font-medium text-zinc-600 dark:text-zinc-300"
                            >
                                <img src={user.avatarUrl} className="w-4 h-4 rounded-full" alt="" />
                                {user.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-6 text-center w-full text-[10px] text-zinc-400 mix-blend-difference">
                &copy; 2024 PIM Pro System. All rights reserved.
            </div>
        </div>
    );
}
