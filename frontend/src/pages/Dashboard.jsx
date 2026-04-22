import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { io } from 'socket.io-client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Briefcase, Zap } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, token } = useAuthStore();
    const [stocks, setStocks] = useState([]);
    const [portfolio, setPortfolio] = useState({ holdings: [] });

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/portfolio', { headers: { Authorization: `Bearer ${token}` } });
                setPortfolio(res.data);
            } catch (e) { console.error("Portfolio fetch error"); }
        };
        fetchPortfolio();

        const socket = io('http://localhost:5000');
        socket.on('market-update', (updatedStocks) => {
            setStocks(updatedStocks);
        });
        return () => socket.disconnect();
    }, [token]);

    const currentHoldings = portfolio?.holdings || [];
    let totalInvested = currentHoldings.reduce((acc, h) => acc + ((h.averagePrice || 0) * (h.quantity || 0)), 0);
    let currentValue = currentHoldings.reduce((acc, h) => {
        const stock = stocks.find(s => s._id === (h.stockId?._id || h.stockId));
        return acc + (stock ? stock.currentPrice * (h.quantity || 0) : (h.averagePrice || 0) * (h.quantity || 0));
    }, 0);

    const totalPnL = currentValue - totalInvested;
    const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const isProfit = totalPnL >= 0;

    const formatINR = (val) => {
        return val?.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
    };

    return (
        <div className="animate-in fade-in duration-700 max-w-7xl mx-auto pb-24">
            <header className="mb-12">
                <div className="flex items-end gap-4 mb-4">
                    <h1 className="text-5xl font-extrabold font-manrope tracking-tighter">Performance Hub</h1>
                    <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-2 border border-primary/20 flex items-center gap-1">
                        <Zap size={10} fill="currentColor" />
                        Live Terminal
                    </div>
                </div>
                <p className="text-on-surface-variant text-lg">Detailed analytical overview of your Indian equity exposures.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-surface-container-low p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full"></div>
                    <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">Total Invested</p>
                    <p className="text-3xl font-extrabold font-manrope">₹{formatINR(totalInvested)}</p>
                </div>

                <div className="bg-surface-container p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                    <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">Current Value</p>
                    <p className="text-3xl font-extrabold font-manrope">₹{formatINR(currentValue)}</p>
                </div>

                <div className="bg-surface-container shadow-2xl p-8 rounded-[2rem] border border-white/5 col-span-1 md:col-span-2 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"></div>
                    <div>
                        <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">Total Returns (P&L)</p>
                        <div className={`flex items-baseline gap-3 ${isProfit ? 'text-primary' : 'text-error'}`}>
                            <span className="text-4xl font-extrabold font-manrope tracking-tighter">
                                {isProfit ? '+' : ''}₹{formatINR(totalPnL)}
                            </span>
                            <span className="text-lg font-bold">
                                ({pnlPercent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isProfit ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'} border border-current/10`}>
                        {isProfit ? <TrendingUp size={32} /> : <Briefcase size={32} />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold font-manrope tracking-tight">Market Momentum</h2>
                        <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline transition-all">View All Index</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stocks.slice(0, 4).map((stock) => {
                            const isUp = stock.currentPrice >= stock.previousPrice;
                            return (
                                <div key={stock.symbol} className="bg-surface-container-high/40 p-6 rounded-[2rem] border border-white/5 hover:bg-surface-container-high transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold font-manrope">{stock.symbol}</h3>
                                            <p className="text-[0.65rem] text-on-surface-variant font-bold uppercase tracking-widest">{stock.name}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-black uppercase ${isUp ? 'text-primary' : 'text-error'}`}>
                                            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            {((stock.currentPrice - stock.previousPrice) / stock.previousPrice * 100).toFixed(2)}%
                                        </div>
                                    </div>

                                    <div className="h-20 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stock.history || []}>
                                                <defs>
                                                    <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={isUp ? "#00D09C" : "#EB5B3C"} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={isUp ? "#00D09C" : "#EB5B3C"} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    type="monotone"
                                                    dataKey="price"
                                                    stroke={isUp ? "#00D09C" : "#EB5B3C"}
                                                    strokeWidth={3}
                                                    fill={`url(#grad-${stock.symbol})`}
                                                    isAnimationActive={false}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="mt-4 flex justify-between items-center">
                                        <p className="text-2xl font-black font-manrope">₹{formatINR(stock.currentPrice)}</p>
                                        <Link to={`/market?stock=${stock.symbol}`} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[0.6rem] font-black uppercase tracking-widest text-on-surface-variant transition-all">Details</Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-surface-container shadow-2xl rounded-[2.5rem] p-8 h-full border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 blur-3xl rounded-full"></div>
                    <h2 className="text-2xl font-bold font-manrope tracking-tight mb-8">Access Terminal</h2>

                    <div className="space-y-6">
                        <div className="p-6 bg-surface-container-low rounded-3xl border border-white/5">
                            <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Available to Trade</p>
                            <p className="text-3xl font-black font-manrope">₹{formatINR(user?.balance)}</p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest px-2">Recent Notifications</p>
                            <div className="space-y-3">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4 items-center">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                    <p className="text-xs text-on-surface-variant leading-relaxed">
                                        Market opened with <span className="text-primary font-bold">Positive Bias</span> for energy sector.
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-on-surface-variant"></div>
                                    <p className="text-xs text-on-surface-variant leading-relaxed">
                                        Identity verification successful. High-Frequency enabled.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-5 rounded-2xl bg-gradient-to-tr from-surface-container-high to-surface-container-highest border border-white/10 text-[0.7rem] font-black uppercase tracking-[0.3em] hover:brightness-125 transition-all mt-10">
                            Configure Preferences
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
