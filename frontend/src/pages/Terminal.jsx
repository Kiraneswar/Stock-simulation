import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { io } from 'socket.io-client';
import axios from 'axios';
import { ComposedChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X, TrendingUp, TrendingDown, Zap, Target, ShieldCheck, Wallet, Search, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Terminal = () => {
    const { user, token, updateBalance } = useAuthStore();
    const [stocks, setStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [isBuy, setIsBuy] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/stocks', { headers: { Authorization: `Bearer ${token}` } });
                setStocks(res.data);

                const targetSymbol = searchParams.get('stock');
                if (targetSymbol) {
                    const found = res.data.find(s => s.symbol.toUpperCase() === targetSymbol.toUpperCase());
                    if (found) setSelectedStock(found);
                } else if (res.data.length > 0) {
                    setSelectedStock(res.data[0]); // Default to first stock
                }
            } catch (e) { console.error("Initial fetch error"); }
        };
        fetchInitial();

        const socket = io('http://localhost:5000');
        socket.on('market-update', (updatedStocks) => {
            setStocks(updatedStocks);
            setSelectedStock(prev => {
                if (!prev) return prev;
                return updatedStocks.find(s => s._id === prev._id) || prev;
            });
        });
        return () => socket.disconnect();
    }, [token, searchParams]);

    const formatINR = (val) => val?.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

    const handleExecute = async () => {
        if (!selectedStock || quantity <= 0) return;
        const type = isBuy ? 'buy' : 'sell';
        try {
            const res = await axios.post(`http://localhost:5000/api/trade/${type}`, {
                stockId: selectedStock._id,
                quantity: Number(quantity)
            }, { headers: { Authorization: `Bearer ${token}` } });

            updateBalance(res.data.balance);
            toast.success(`${type.toUpperCase()} Order successful!`, {
                theme: "dark",
                style: { borderRadius: '24px', backgroundColor: '#010101', color: '#00D09C', border: '1px solid rgba(0, 208, 156, 0.2)' }
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Execution failed', { theme: "dark" });
        }
    };

    const prepareChartData = (history) => {
        if (!history || !Array.isArray(history)) return [];
        return history.map((h, i, arr) => {
            const prevPrice = i > 0 ? arr[i - 1].price : h.price;
            const momentum = h.price - prevPrice;
            return {
                ...h,
                momentum: momentum === 0 ? (Math.random() > 0.5 ? 0.05 : -0.05) : momentum
            };
        });
    };

    if (!selectedStock) return <div className="p-20 text-center animate-pulse">Initializing Terminal Engine...</div>;

    const changePercent = ((selectedStock.currentPrice - (selectedStock.previousPrice || 0)) / (selectedStock.previousPrice || 1) * 100).toFixed(2);
    const isUp = selectedStock.currentPrice >= (selectedStock.previousPrice || 0);

    return (
        <div className="animate-in fade-in duration-700 min-h-full flex flex-col gap-8 pb-20 font-inter max-w-6xl mx-auto">
            <ToastContainer position="bottom-right" />

            <header className="flex justify-between items-center px-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/market')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black font-manrope tracking-tighter">Execution Terminal</h1>
                        <p className="text-on-surface-variant text-sm font-medium">Institutional-grade trade execution node.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left: Visualization & Stats */}
                <div className="space-y-8">
                    <div className="glass rounded-[3.5rem] p-10 border-white/5 relative overflow-hidden">
                        <div className="flex flex-col gap-6 mb-10">
                            <div>
                                <span className="text-[0.6rem] font-black text-primary uppercase tracking-[0.3em] mb-2 block">Premium Analytics</span>
                                <h2 className="text-5xl font-black font-manrope tracking-tighter truncate">{selectedStock.symbol}</h2>
                                <p className="text-sm text-on-surface-variant font-bold uppercase tracking-widest mt-1">{selectedStock.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-5xl font-black font-manrope">₹{formatINR(selectedStock.currentPrice)}</p>
                                <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-black text-sm ${isUp ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {isUp ? '+' : ''}{changePercent}%
                                </div>
                            </div>
                        </div>
                        <div className="h-64 bg-surface-container-low/30 rounded-[2rem] p-8 border border-white/5">
                            <p className="text-[0.6rem] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mb-6 text-center">Momentum Spectrum Density</p>
                            <div className="w-full h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={prepareChartData(selectedStock.history)}>
                                        <Bar dataKey="momentum" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                            {prepareChartData(selectedStock.history).map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.momentum >= 0 ? '#00D09C' : '#EB5B3C'}
                                                    fillOpacity={0.8}
                                                />
                                            ))}
                                        </Bar>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                            <div className="p-6 bg-white/[0.02] rounded-3xl">
                                <p className="text-[0.6rem] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Open Price</p>
                                <p className="text-xl font-bold font-manrope">₹{formatINR(selectedStock.previousPrice)}</p>
                            </div>
                            <div className="p-6 bg-white/[0.02] rounded-3xl">
                                <p className="text-[0.6rem] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Day High</p>
                                <p className="text-xl font-bold font-manrope text-primary/80">₹{formatINR(selectedStock.currentPrice * 1.02)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3.5rem] p-10 flex flex-col relative overflow-hidden border-white/5 border-2">
                    <div className={`absolute top-0 right-0 w-64 h-64 blur-[120px] rounded-full opacity-20 pointer-events-none transition-all duration-700 ${isBuy ? 'bg-primary' : 'bg-error'}`}></div>

                    <div className="flex bg-surface-container-low/50 p-2 rounded-3xl mb-12 border border-white/5 relative">
                        <div className={`absolute inset-y-2 w-[calc(50%-8px)] rounded-2xl transition-all duration-500 shadow-xl ${isBuy ? 'left-2 bg-primary' : 'left-[calc(50%+4px)] bg-error'}`}></div>
                        <button onClick={() => setIsBuy(true)} className={`flex-1 flex justify-center items-center gap-2 py-5 rounded-2xl text-[0.75rem] font-black uppercase tracking-widest z-10 transition-colors ${isBuy ? 'text-black' : 'text-on-surface-variant'}`}>
                            Buy Asset
                        </button>
                        <button onClick={() => setIsBuy(false)} className={`flex-1 flex justify-center items-center gap-2 py-5 rounded-2xl text-[0.75rem] font-black uppercase tracking-widest z-10 transition-colors ${!isBuy ? 'text-white' : 'text-on-surface-variant'}`}>
                            Sell Asset
                        </button>
                    </div>

                    <div className="space-y-12 mb-12">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[0.65rem] font-black text-on-surface-variant uppercase tracking-[0.2em]">Quantity to Allocate</label>
                            </div>
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 bg-surface-container-high/40 p-2 rounded-[2.5rem] border border-white/5 shadow-inner">
                                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="w-16 h-16 flex-shrink-0 rounded-[1.5rem] bg-surface-container-high border border-white/10 flex items-center justify-center font-black text-2xl hover:brightness-125 transition-all text-on-surface active:scale-90">-</button>
                                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))} className="w-full bg-transparent text-center text-4xl font-black font-manrope outline-none tnum" />
                                <button onClick={() => setQuantity(prev => prev + 1)} className="w-16 h-16 flex-shrink-0 rounded-[1.5rem] bg-surface-container-high border border-white/10 flex items-center justify-center font-black text-2xl hover:brightness-125 transition-all text-on-surface active:scale-90">+</button>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6">
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <ShieldCheck size={14} className="text-primary/60" />
                                <span className="text-[0.6rem] font-black text-on-surface-variant/60 uppercase tracking-[0.2em]">Live Quote & Exposure</span>
                            </div>
                            <div className="space-y-5 px-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Wallet size={12} className="text-on-surface-variant" />
                                        <span className="text-[0.7rem] font-bold text-on-surface-variant/60 uppercase tracking-widest">Available Funds</span>
                                    </div>
                                    <span className="text-lg font-black font-manrope">₹{formatINR(user?.balance)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t border-white/ client-border">
                                    <span className="text-[0.7rem] font-black text-on-surface-variant uppercase tracking-widest">Capital Impact</span>
                                    <p className="text-3xl font-black font-manrope text-primary">₹{formatINR(selectedStock.currentPrice * quantity)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleExecute}
                        className={`w-full py-8 rounded-[2.5rem] text-[0.85rem] font-black uppercase tracking-[0.4em] transition-all shadow-2xl active:scale-[0.97] overflow-hidden group relative ${isBuy ? 'bg-primary text-black shadow-primary/20 hover:shadow-primary/40' : 'bg-error text-white shadow-error/20 hover:shadow-error/40'}`}
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {isBuy ? <Zap size={20} fill="currentColor" /> : <TrendingDown size={20} />}
                            Confirm Trade Execution
                        </span>
                    </button>

                    <p className="text-[0.5rem] text-center text-on-surface-variant/40 mt-6 uppercase tracking-widest font-bold">
                        Transaction secured by Obsidian Institutional Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terminal;
