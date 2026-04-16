import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { io } from 'socket.io-client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Briefcase, ArrowUpRight, ArrowDownRight, TrendingUp, Filter } from 'lucide-react';

const Portfolio = () => {
    const { token, user } = useAuthStore();
    const [portfolio, setPortfolio] = useState({ holdings: [] });
    const [stocks, setStocks] = useState([]);
  
    useEffect(() => {
        const fetchPortfolio = async () => {
             try {
                const res = await axios.get('http://localhost:5000/api/portfolio', { headers: { Authorization: `Bearer ${token}` }});
                setPortfolio(res.data);
             } catch(e) { console.error("Error fetching portfolio"); }
        }
        fetchPortfolio();

        const fetchStocks = async () => {
            try {
              const res = await axios.get('http://localhost:5000/api/stocks', { headers: { Authorization: `Bearer ${token}` } });
              setStocks(res.data);
            } catch (e) { console.error("Failed to fetch initial stocks"); }
        };
        fetchStocks();

        const socket = io('http://localhost:5000');
        socket.on('market-update', (updatedStocks) => {
            setStocks(updatedStocks);
        });
        return () => socket.disconnect();
    }, [token]);

    const formatINR = (val) => val?.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

    let totalInvested = 0;
    let currentValue = 0;

    const currentHoldings = portfolio?.holdings || [];
    const enrichedHoldings = currentHoldings.map(h => {
         const stockId = h.stockId?._id || h.stockId;
         const currentStock = stocks.find(s => s._id === stockId);
         const ltp = currentStock ? currentStock.currentPrice : h.averagePrice;
         const value = ltp * h.quantity;
         const cost = (h.averagePrice || 1) * h.quantity;
         const profit = value - cost;
         const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;
         
         totalInvested += cost;
         currentValue += value;
         
         return {
             ...h,
             symbol: currentStock?.symbol || 'HOLDING',
             name: currentStock?.name || 'NIFTY Asset',
             ltp,
             value,
             profit,
             profitPercent
         };
    });

    const totalPnL = currentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const isProfit = totalPnL >= 0;

    // Data for Allocation Chart
    const allocationData = enrichedHoldings.map(h => ({
        name: h.symbol,
        value: h.value
    })).slice(0, 5); // Show top 5

    const COLORS = ['#00D09C', '#bcc2ff', '#2d3449', '#1b1e28', '#11141d'];

    return (
        <div className="animate-in fade-in duration-700 max-w-7xl mx-auto pb-24 font-inter">
            <header className="mb-12">
                <div className="flex items-end gap-4 mb-4">
                    <h1 className="text-5xl font-extrabold font-manrope tracking-tighter">Portfolio Analysis</h1>
                    <div className="bg-secondary/10 px-3 py-1 rounded-full text-secondary text-xs font-black uppercase tracking-widest mb-2 border border-secondary/20 flex items-center gap-1">
                        <ArrowUpRight size={10} fill="currentColor" />
                        Live Allocation
                    </div>
                </div>
                <p className="text-on-surface-variant text-lg">Cross-instrument performance monitoring and equity exposure metrics.</p>
            </header>

            {/* High-Level Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-white/5 col-span-1 lg:col-span-2 flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full"></div>
                    
                    <div className="space-y-6 flex-1">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Total Invested</p>
                                <p className="text-2xl font-black font-manrope">₹{formatINR(totalInvested)}</p>
                            </div>
                            <div>
                                <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Current Value</p>
                                <p className="text-2xl font-black font-manrope">₹{formatINR(currentValue)}</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <p className="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Total Returns</p>
                            <div className={`flex items-baseline gap-3 ${isProfit ? 'text-primary' : 'text-error'}`}>
                                <span className="text-5xl font-black font-manrope tracking-tighter">
                                    {isProfit ? '+' : ''}₹{formatINR(totalPnL)}
                                </span>
                                <span className="text-xl font-bold">({totalPnLPercent.toFixed(2)}%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData.length > 0 ? allocationData : [{name: 'Empty', value: 1}]}
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    {allocationData.length === 0 && <Cell fill="#1b1e28" />}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#11141d', border: 'none', borderRadius: '16px' }}
                                    itemStyle={{ color: '#00D09C' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface-container shadow-2xl rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-bold font-manrope tracking-tight mb-2">Capital Pool</h3>
                        <p className="text-sm text-on-surface-variant mb-6">Unallocated leverage available.</p>
                        <p className="text-4xl font-black font-manrope">₹{formatINR(user?.balance)}</p>
                    </div>
                    <button className="w-full py-5 px-6 bg-gradient-to-tr from-surface-container-high to-surface-container-highest border border-white/5 rounded-2xl text-[0.7rem] font-bold uppercase tracking-[0.2em] mt-8 hover:brightness-125 transition-all">
                        Optimize Allocation
                    </button>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                    <h2 className="text-2xl font-bold font-manrope tracking-tight">Active Exposures</h2>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:text-on-surface">
                            <Filter size={14} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="bg-surface-container rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-surface-container-high/50">
                                    <th className="py-6 px-10 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Instrument</th>
                                    <th className="py-6 px-10 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] text-center">Qty</th>
                                    <th className="py-6 px-10 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] text-center">Avg. Cost</th>
                                    <th className="py-6 px-10 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] text-center">LTP</th>
                                    <th className="py-6 px-10 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] text-right">P&L Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {enrichedHoldings.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-24 text-center">
                                            <div className="flex flex-col items-center opacity-30">
                                                <Briefcase size={48} className="mb-4" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No active exposures detected</p>
                                                <p className="text-xs lowercase mt-1">Initiate a trade in the markets discovery panel</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : enrichedHoldings.map(h => (
                                    <tr key={h._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-6 px-10">
                                            <p className="text-lg font-bold font-manrope group-hover:text-primary transition-colors">{h.symbol}</p>
                                            <p className="text-[0.6rem] text-on-surface-variant font-bold uppercase tracking-widest truncate w-48">{h.name}</p>
                                        </td>
                                        <td className="py-6 px-10 text-center font-bold font-manrope">{h.quantity}</td>
                                        <td className="py-6 px-10 text-center font-bold font-manrope">₹{formatINR(h.averagePrice)}</td>
                                        <td className="py-6 px-10 text-center font-bold font-manrope">
                                            <div className="flex flex-col items-center">
                                                <span>₹{formatINR(h.ltp)}</span>
                                                <span className={`text-[0.6rem] ${h.ltp >= h.averagePrice ? 'text-primary' : 'text-error'} font-black`}>
                                                    {h.ltp >= h.averagePrice ? '+' : ''}{((h.ltp - h.averagePrice) / h.averagePrice * 100).toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className={`py-6 px-10 text-right font-black font-manrope ${h.profit >= 0 ? 'text-primary' : 'text-error'}`}>
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg">
                                                    {h.profit >= 0 ? '+' : ''}₹{formatINR(h.profit)}
                                                </span>
                                                <span className="text-xs">
                                                    {h.profit >= 0 ? <TrendingUp size={12} className="inline mr-1" /> : <ArrowDownRight size={12} className="inline mr-1" />}
                                                    {h.profitPercent.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
