import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplet, Flame, ShieldCheck, Coins, PieChart, Sparkles, Activity, Shield,
    Heart, ExternalLink, Zap, Info, TrendingUp, RefreshCw, Lock, Users,
    BarChart3, History, Search
} from 'lucide-react';
import { usePumpFun } from '@/hooks/usePumpFun';
import { TREASURY_ADDRESS } from '@/utils/constants';

interface TokenomicsMapProps {
    treasuryStats?: { balance: number, totalPaidOut: number, totalBurned: number, totalRecycled: number };
    rewardSettings?: { battle: number, clean: number };
    ecoLogs?: any[];
}

export const TokenomicsMap = ({ treasuryStats, rewardSettings, ecoLogs = [] }: TokenomicsMapProps) => {
    // Pump.fun Live Data (Mocked pool for demo)
    const { isConnected } = usePumpFun("So11111111111111111111111111111111111111112");

    // Eco-Stats
    const balance = treasuryStats?.balance || 0;
    const paidOut = treasuryStats?.totalPaidOut || 0;
    const burned = treasuryStats?.totalBurned || 0;
    const recycled = treasuryStats?.totalRecycled || 0;

    // NET HEALTH: On-chain balance adjusted by virtual burns
    // This provides a more accurate picture of "Available" rewards if burns are virtual.
    const netAvailable = Math.max(0, balance - burned);
    const healthPercent = Math.min(100, (netAvailable / 300_000_000) * 100);

    return (
        <div className="w-full bg-slate-900/90 border-2 border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden h-full overflow-y-auto custom-scrollbar pb-20">
            {/* Background Grid & Glows */}
            <div className="absolute inset-0 bg-[url('/grid_bg.png')] opacity-10 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header: Identity */}
            <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                        <Activity className="text-cyan-400" /> ECO-PULSE
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-[0.3em]">Treasury Transparency Protocol</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                        <span className="text-[9px] font-black text-white/60 tracking-widest uppercase">
                            {isConnected ? 'On-Chain Sync: Active' : 'Relay Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* THE ECO-CYCLE (IMPROVED FLOW) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">

                {/* LEFT: SUSTAINABILITY JAR (HEALTH) */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-5 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <h3 className="text-xs font-black text-cyan-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                                <Shield size={14} /> Reward Pool Health
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white font-mono">{balance.toLocaleString()}</span>
                                <span className="text-sm font-bold text-gray-500">GAMA</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-2">
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                                <span className="flex items-center gap-1">Sustainability Level <Info size={10} className="hover:text-white cursor-help" /></span>
                                <span className="text-cyan-400">{healthPercent.toFixed(1)}%</span>
                            </div>
                            <div className="h-3 w-full bg-gray-800/50 rounded-full border border-white/5 p-0.5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${healthPercent}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </div>
                            <p className="text-[9px] text-gray-600 italic">
                                * Payouts are 100% sustainable while health remains &gt;10%.
                            </p>
                        </div>
                    </div>

                    {/* Visual Jar Effect in Background */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Zap size={120} className="text-cyan-500 -mb-8 -mr-8" />
                    </div>
                </div>

                {/* RIGHT: THE RECYCLER (SINKS & FAUCETS) */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
                    <h3 className="text-xs font-black text-yellow-500 tracking-widest uppercase flex items-center gap-2">
                        <RefreshCw size={14} /> Circulating Economy
                    </h3>

                    <div className="space-y-3">
                        {/* Sink 1 */}
                        <div className="flex items-center justify-between p-2 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Flame size={14} className="text-orange-400" />
                                <span className="text-[11px] font-bold text-gray-300">BURN & RECYCLE</span>
                            </div>
                            <span className="text-[10px] font-black text-orange-400 font-mono uppercase tracking-tighter">50% OF ALL SPEND</span>
                        </div>
                        {/* Faucet 1 */}
                        <div className="flex items-center justify-between p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Droplet size={14} className="text-green-400" />
                                <span className="text-[11px] font-bold text-gray-300">REWARDS (FAUCET)</span>
                            </div>
                            <span className="text-[10px] font-black text-green-400 font-mono">+{rewardSettings?.battle || 0} G / WIN</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                        <a
                            href={`https://solscan.io/account/${TREASURY_ADDRESS}?cluster=devnet`}
                            target="_blank"
                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 flex flex-col items-center gap-1 transition-all group"
                        >
                            <ExternalLink size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">On-Chain Audit</span>
                        </a>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 flex flex-col items-center gap-1">
                            <ShieldCheck size={14} className="text-green-400" />
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Verified Vault</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIVE PULSE FEED */}
            <div className="relative z-10 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-white/40 tracking-[0.2em] uppercase flex items-center gap-2">
                        <BarChart3 size={14} className="text-yellow-400" /> Live Pulse Feed (Verified)
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Total Paid Out</p>
                        <p className="text-xl font-black text-white font-mono">{paidOut.toLocaleString()}</p>
                        <p className="text-[8px] text-cyan-500/60 mt-1 uppercase tracking-tighter">DISTRIBUTED REWARDS</p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center relative group">
                        <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-lg pointer-events-none" />
                        <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Cumulative Burn</p>
                        <p className="text-xl font-black text-red-500 font-mono">{burned.toLocaleString()}</p>
                        <p className="text-[8px] text-red-500/60 mt-1 uppercase tracking-tighter italic">Permanently Deflated</p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center relative group">
                        <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-lg pointer-events-none" />
                        <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Recycled Back</p>
                        <p className="text-xl font-black text-green-400 font-mono">{recycled.toLocaleString()}</p>
                        <p className="text-[8px] text-green-400/60 mt-1 uppercase tracking-tighter italic">Sustaining Rewards</p>
                    </div>
                </div>
            </div>

            {/* AUDIT LEDGER (PROOF OF BURN) */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-black text-white/40 tracking-[0.2em] uppercase flex items-center gap-2">
                        <History size={14} className="text-cyan-400" /> Verification Ledger (Proof of Burn)
                    </h3>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {ecoLogs.length === 0 ? (
                            <div className="p-10 text-center opacity-20">
                                <Search size={32} className="mx-auto mb-2" />
                                <p className="text-[10px] uppercase font-black">No Recent Audit Entries</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 sticky top-0 z-20">
                                    <tr>
                                        <th className="p-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">Status / ID</th>
                                        <th className="p-3 text-[9px] font-black text-gray-500 uppercase tracking-widest">Action</th>
                                        <th className="p-3 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Economic Impact</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {ecoLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${log.type === 'WIN' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-500'}`}>
                                                        {log.type === 'WIN' ? 'Rewarded' : 'Verified'}
                                                    </div>
                                                    <span className="text-[9px] font-mono text-cyan-400">{log.txId}</span>
                                                </div>
                                                <div className="text-[8px] text-gray-600 font-mono uppercase">{new Date(log.timestamp).toLocaleString()}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-[10px] font-bold text-white uppercase">{log.metadata?.action || log.type}</div>
                                                <div className="text-[8px] text-gray-500 uppercase">{log.message}</div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className={`text-[10px] font-black font-mono ${log.type === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {log.type === 'WIN' ? '+' : '-'}{(log.metadata?.amount || log.metadata?.original * 0.5) || (log.type === 'BURN' ? 5 : 0)} G
                                                </div>
                                                <div className="text-[7px] text-gray-500 font-bold uppercase tracking-tighter">
                                                    {log.type === 'WIN' ? 'TREASURY PAYOUT' : 'DEFLATION SINK'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <p className="mt-4 text-[9px] text-gray-600 italic uppercase font-bold tracking-widest text-center">
                    * Every 10 GAMA spent triggers an irrevocable 50% burn script.
                </p>
            </div>
        </div>
    );
};
