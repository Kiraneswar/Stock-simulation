import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import { Trophy, History as HistoryIcon, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';

const Leaderboard = () => {
    const { token } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lRes, tRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/leaderboard', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/transactions', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setLeaderboard(lRes.data);
                setTransactions(tRes.data);
            } catch (e) { console.error("Data fetch error"); }
        };
        fetchData();
    }, [token]);

    const formatINR = (val) => val?.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

    return (
        <div className="animate-in fade-in duration-700 max-w-7xl mx-auto pb-24 font-inter">
            <header className="mb-12">
                <div className="flex items-end gap-4 mb-4">
                    <h1 className="text-5xl font-extrabold font-manrope tracking-tighter">Rankings & Ledger</h1>
                    <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-2 border border-primary/20 flex items-center gap-1">
                        <Trophy size={10} fill="currentColor" />
                        Community Hub
                    </div>
                </div>
                <p className="text-on-surface-variant text-lg">Institutional rankings and secure transaction audit trails.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-2xl font-bold font-manrope tracking-tight">Trader Rankings</h2>
                    </div>

                    <div className="bg-surface-container rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-surface-container-high/50">
                                        <th className="py-6 px-10 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] w-20">Rank</th>
                                        <th className="py-6 px-10 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Trader</th>
                                        <th className="py-6 px-10 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.2em] text-right">Total P&L</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leaderboard.map((trader, index) => (
                                        <tr key={trader._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-6 px-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-primary text-black' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="py-6 px-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary border border-white/5">
                                                        <User size={18} />
                                                    </div>
                                                    <p className="text-lg font-bold font-manrope">{trader.name}</p>
                                                </div>
                                            </td>
                                            <td className={`py-6 px-10 text-right font-black font-manrope ${trader.profit >= 0 ? 'text-primary' : 'text-error'}`}>
                                                ₹{formatINR(trader.profit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-2xl font-bold font-manrope tracking-tight">Audit Trail</h2>
                    </div>

                    <div className="bg-surface-container shadow-2xl rounded-[2.5rem] p-8 border border-white/5 flex flex-col gap-6 max-h-[700px] overflow-y-auto custom-scrollbar">
                        {transactions.length === 0 ? (
                            <div className="py-12 text-center opacity-30">
                                <HistoryIcon size={40} className="mx-auto mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest">No Recent Logs</p>
                            </div>
                        ) : transactions.map(tx => (
                            <div key={tx._id} className="p-6 bg-surface-container-low rounded-3xl border border-white/5 space-y-3 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-1 h-full ${tx.type === 'buy' ? 'bg-primary' : 'bg-error'} opacity-50`}></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-1">{tx.type} LOG</p>
                                        <h4 className="text-lg font-black font-manrope">{tx.stockId?.symbol || 'NIFTY'}</h4>
                                    </div>
                                    <p className="text-[0.6rem] font-bold text-on-surface-variant/40">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-xs font-bold text-on-surface-variant">
                                        <span className="text-on-surface">{tx.quantity}</span> Shares @ ₹{formatINR(tx.price)}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-widest">Total Value</p>
                                        <p className="text-sm font-black font-manrope">₹{formatINR(tx.totalPrice)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
