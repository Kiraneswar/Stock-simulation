import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { ShieldCheck, ChevronRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen bg-background text-on-surface font-inter flex flex-col md:flex-row relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="hidden md:flex flex-col justify-center p-16 md:w-1/2 relative z-10">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-container shadow-[0_0_20px_rgba(0,208,156,0.4)]"></div>
                    <span className="text-2xl font-extrabold tracking-tighter font-manrope uppercase">Obsidian</span>
                </div>

                <h1 className="text-6xl font-extrabold font-manrope leading-[1.1] mb-8 max-w-md tracking-tight">
                    Precision is not <span className="text-primary tracking-tighter">an option.</span>
                </h1>

                <p className="text-on-surface-variant text-lg max-w-sm mb-12 leading-relaxed">
                    Access high-frequency data streams, editorial charting, and institutional-grade execution in a terminal built for mastery.
                </p>

                <div className="flex items-center gap-4 text-sm font-medium text-on-surface-variant/60 uppercase tracking-widest">
                    <ShieldCheck size={18} className="text-primary" />
                    <span>Security Protocol Active</span>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md glass rounded-[2.5rem] p-10 md:p-12 shadow-2xl">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-bold font-manrope tracking-tight mb-3">Welcome Back</h2>
                        <p className="text-on-surface-variant text-sm">Enter your credentials to access your secure portfolio.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error text-xs font-semibold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                            <div className="w-2 h-2 rounded-full bg-error"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-surface-container border border-transparent focus:border-primary/50 px-5 py-4 rounded-2xl text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30 text-sm"
                                placeholder="trader@obsidian.io"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Password</label>
                                <button type="button" className="text-[0.65rem] text-primary/70 hover:text-primary transition-colors tracking-widest font-bold uppercase">Forgot Password?</button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-surface-container border border-transparent focus:border-primary/50 px-5 py-4 rounded-2xl text-on-surface outline-none transition-all placeholder:text-on-surface-variant/30 text-sm font-mono"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full group mt-4 flex items-center justify-between py-5 px-8 rounded-2xl bg-primary text-background font-black font-manrope hover:brightness-110 transition-all shadow-[0_10px_30px_-5px_#00d09c33]"
                        >
                            <span className="uppercase tracking-widest">Sign In</span>
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-sm text-on-surface-variant">
                            Don't have an identity yet?
                            <Link to="/register" className="ml-2 text-primary font-bold hover:underline transition-all">Sign Up</Link>
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-10 pt-10 border-t ghost-border opacity-30 text-[0.6rem] font-bold uppercase tracking-widest text-center">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span className="text-primary flex items-center justify-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                            Operational
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
