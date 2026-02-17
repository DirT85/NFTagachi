import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Flame, ShieldCheck, Coins, PieChart, Sparkles, Activity, Shield, Heart, ExternalLink, Zap, Info, TrendingUp, RefreshCw, Lock, Users, BarChart3 } from 'lucide-react';
import { usePumpFun } from '@/hooks/usePumpFun';
import { TREASURY_ADDRESS } from '@/utils/constants';

interface TokenomicsMapProps {
    treasuryStats?: { balance: number, totalPaidOut: number };
    rewardSettings?: { battle: number, clean: number };
}

export const TokenomicsMap = ({ treasuryStats, rewardSettings }: TokenomicsMapProps) => {
    // Pump.fun Live Data (Mocked pool for demo)
    const { isConnected } = usePumpFun("So11111111111111111111111111111111111111112");

    // Eco-Stats
    const balance = treasuryStats?.balance || 0;
    const paidOut = treasuryStats?.totalPaidOut || 0;
    const totalCirculation = 1_000_000_000; // 1 Billion GAMA Total Supply

    // Heuristics
    const healthPercent = Math.min(100, (balance / 300_000_000) * 100); // Sustainable relative to the 300M allocation

    return (
        <div className="w-full bg-slate-900/90 border-2 border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden h-full overflow-y-auto custom-scrollbar">
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
                        <BarChart3 size={14} className="text-yellow-400" /> Supply Metrics (Estimates)
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Treasury Status</p>
                        <p className="text-xl font-black text-white font-mono">30%</p>
                        <p className="text-[8px] text-cyan-500/60 mt-1 uppercase">LOCKED FOR REWARDS</p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center relative group">
                        <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-lg pointer-events-none" />
                        <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">Circulating Supply</p>
                        <p className="text-xl font-black text-white font-mono">15%</p>
                        <p className="text-[8px] text-yellow-500/60 mt-1 uppercase tracking-tighter">Distributed to Strategic Holders</p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] text-gray-500 uppercase font-mono mb-1">LP Capacity</p>
                        <p className="text-xl font-black text-green-400 font-mono">55%</p>
                        <p className="text-[8px] text-green-400/60 mt-1 uppercase">ALLOCATED TO DEX LP</p>
                    </div>
                </div>
            </div>

            {/* DISTRIBUTION MAP (REPLACES SIMULATOR) */}
            <div className="relative z-10 bg-slate-800/40 border-2 border-slate-700/30 rounded-3xl p-6 mb-8 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2 italic">
                            <PieChart size={18} className="text-purple-400" /> SUPPLY DISTRIBUTION MAP
                        </h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em] mt-1">Genesis Allocation: 1,000,000,000 GAMA Fixed Supply</p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                        <Lock size={12} className="text-yellow-500" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Burn-First Model</span>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    {/* Distribution Bar */}
                    <div className="flex h-12 w-full rounded-2xl overflow-hidden border border-white/10 p-1.5 gap-1.5 bg-black/50">
                        <motion.div
                            className="bg-green-500/80 hover:bg-green-400 transition-colors cursor-help relative group/bar"
                            style={{ width: '55%' }}
                            initial={{ width: 0 }}
                            animate={{ width: '55%' }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center font-black text-[9px] text-white">LP 55%</div>
                        </motion.div>
                        <motion.div
                            className="bg-cyan-500/80 hover:bg-cyan-400 transition-colors cursor-help relative"
                            style={{ width: '30%' }}
                            initial={{ width: 0 }}
                            animate={{ width: '30%' }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center font-black text-[9px] text-white">TREASURY 30%</div>
                        </motion.div>
                        <motion.div
                            className="bg-yellow-500/80 hover:bg-yellow-400 transition-colors cursor-help relative"
                            style={{ width: '15%' }}
                            initial={{ width: 0 }}
                            animate={{ width: '15%' }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center font-black text-[9px] text-black">STRAT 15%</div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="flex gap-3">
                            <div className="w-1.5 h-auto bg-green-500 rounded-full" />
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-tighter italic">55% Liquidity Pool</h4>
                                <p className="text-[9px] text-white/40 font-bold leading-tight mt-1 uppercase">Paired with SOL to provide high trade volume and price stability. 100% Marketplace focused.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1.5 h-auto bg-cyan-500 rounded-full" />
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-tighter italic">30% Eco-Treasury</h4>
                                <p className="text-[9px] text-white/40 font-bold leading-tight mt-1 uppercase">Reserved for in-game rewards (feeding/winning). Restocked via 50% spending recycle.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-1.5 h-auto bg-yellow-500 rounded-full" />
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-tighter italic">15% Strategic</h4>
                                <p className="text-[9px] text-white/40 font-bold leading-tight mt-1 uppercase">Distributed to 5 early supporters (3% base). Essential for ecosystem security and initial node support.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="relative z-10 flex flex-col items-center gap-2">
                <p className="text-[8px] text-gray-600 text-center uppercase tracking-[0.2em] font-mono leading-relaxed max-w-lg">
                    NFTAGACHI PROTOCOL // SUPPLY DATA DERIVED FROM GENESIS PARAMETERS // AUDIT YOUR ASSETS // ECO-PULSE V2
                </p>
                <div className="flex items-center gap-4 py-2 border-t border-white/5 w-full justify-center">
                    <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                        <Info size={10} className="text-white" />
                        <span className="text-[7px] font-black text-white uppercase tracking-widest">Heuristic Estimates Applied to Burn Maths</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
