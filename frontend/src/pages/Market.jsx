import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { io } from 'socket.io-client';
import axios from 'axios';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Search, ArrowRight, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Market = () => {
    const { token } = useAuthStore();
    const [stocks, setStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/stocks', { headers: { Authorization: `Bearer ${token}` } });
                setStocks(res.data);
            } catch (e) { console.error("Initial fetch error"); }
        };
        fetchInitial();

        const socket = io('http://localhost:5000');
        socket.on('market-update', (updatedStocks) => {
            setStocks(updatedStocks);
        });
        return () => socket.disconnect();
    }, [token]);

    const formatINR = (val) => val?.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

    const processedStocks = stocks.map(stock => ({
        ...stock,
        changePercent: ((stock.currentPrice - stock.previousPrice) / (stock.previousPrice || 1) * 100)
    })).filter(s =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const gainers = [...processedStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 30);
    const losers = [...processedStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 30);

    const StockCard = ({ stock, type }) => {
        const isUp = type === 'gainer';
        return (
            <div
                onClick={() => navigate(`/terminal?stock=${stock.symbol}`)}
                className="group p-5 rounded-[2.5rem] bg-surface-container-low/40 border border-white/5 hover:border-primary/20 hover:bg-surface-container-high/60 cursor-pointer transition-all duration-500"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isUp ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                            {stock.symbol[0]}
                        </div>
                        <div>
                            <h3 className="text-lg font-black font-manrope tracking-tight leading-none mb-1">{stock.symbol}</h3>
                            <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest truncate w-32">{stock.name}</p>
                        </div>
                    </div>

                    <div className="hidden xl:block w-32 h-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stock.history || []}>
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={isUp ? "#00D09C" : "#EB5B3C"}
                                    strokeWidth={3}
                                    fill={isUp ? "rgba(0, 208, 156, 0.1)" : "rgba(235, 91, 60, 0.1)"}
                                    isAnimationActive={false}
                                    connectNulls
                                />
                                <YAxis hide domain={['auto', 'auto']} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="text-right">
                        <p className="text-xl font-black font-manrope">₹{formatINR(stock.currentPrice)}</p>
                        <div className={`flex items-center justify-end gap-1 text-[0.7rem] font-black ${isUp ? 'text-primary' : 'text-error'}`}>
                            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-700 w-full flex flex-col gap-10 pb-20 font-inter">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[0.6rem] font-black text-primary uppercase tracking-[0.4em]">Market Overview</span>
                    </div>
                    <h1 className="text-5xl font-black font-manrope tracking-tighter">Market Pulse</h1>
                    <p className="text-sm text-on-surface-variant font-medium mt-2">Real-time analysis of Top 30 Gainers and Top 30 Losers across the Indian Index.</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search instrument..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-container-low border border-white/5 focus:border-primary/40 pl-14 pr-6 py-5 rounded-[2rem] text-sm outline-none transition-all placeholder:text-on-surface-variant/30 font-bold shadow-2xl"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 overflow-hidden">
                <div className="flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between px-6 border-l-4 border-primary bg-primary/5 py-4 rounded-r-3xl">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-primary" size={24} />
                            <h2 className="text-2xl font-black font-manrope uppercase tracking-tighter text-primary">Bullish Surge</h2>
                        </div>
                        <span className="px-3 py-1 bg-primary/20 rounded-full text-[0.6rem] font-black text-primary uppercase tracking-widest">Top 30</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {gainers.map(s => <StockCard key={s._id} stock={s} type="gainer" />)}
                    </div>
                </div>

                <div className="flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between px-6 border-l-4 border-error bg-error/5 py-4 rounded-r-3xl">
                        <div className="flex items-center gap-3">
                            <TrendingDown className="text-error" size={24} />
                            <h2 className="text-2xl font-black font-manrope uppercase tracking-tighter text-error">Bearish Pressure</h2>
                        </div>
                        <span className="px-3 py-1 bg-error/20 rounded-full text-[0.6rem] font-black text-error uppercase tracking-widest">Top 30</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {losers.map(s => <StockCard key={s._id} stock={s} type="loser" />)}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-12 right-12 z-50">
                <button
                    onClick={() => navigate('/terminal')}
                    className="p-6 rounded-[2rem] bg-primary text-black shadow-[0_20px_50px_-10px_rgba(0,208,156,0.5)] flex items-center gap-4 hover:scale-110 transition-all font-black uppercase text-xs tracking-widest border-2 border-white/20 active:scale-95"
                >
                    <Zap size={24} fill="currentColor" />
                    Open Trading Terminal
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Market;
