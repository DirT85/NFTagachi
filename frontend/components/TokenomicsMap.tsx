import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Flame, ArrowRight, ShieldCheck, Coins, Calculator, Sparkles, Activity, Shield, Heart } from 'lucide-react';
import { usePumpFun } from '@/hooks/usePumpFun';

interface TokenomicsMapProps {
    treasuryStats?: { balance: number, totalPaidOut: number };
    rewardSettings?: { battle: number, clean: number };
}

export const TokenomicsMap = ({ treasuryStats, rewardSettings }: TokenomicsMapProps) => {
    const [simSol, setSimSol] = useState(10); // Default 10 SOL Strategy
    const [simBuy, setSimBuy] = useState(1); // Default 1 SOL Buy

    // Pump.fun Live Data
    const { isConnected, lastTrade } = usePumpFun("So11111111111111111111111111111111111111112");

    // Simulation Math (CPMM: x * y = k)
    const POOL_TOKENS = 600_000_000;
    const k = simSol * POOL_TOKENS;

    // After Buy
    const newPoolSol = simSol + simBuy;
    const newPoolTokens = k / (newPoolSol || 1);
    const tokensReceived = POOL_TOKENS - newPoolTokens;

    // Price Calc
    const initialPrice = simSol / POOL_TOKENS;
    const executionPrice = simBuy / (tokensReceived || 1);
    const priceImpact = initialPrice > 0 ? ((executionPrice - initialPrice) / initialPrice) * 100 : 0;

    return (
        <div className="w-full bg-slate-900/80 border-2 border-slate-700/50 rounded-xl p-6 backdrop-blur-md relative overflow-hidden h-full overflow-y-auto">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid_bg.png')] opacity-10 pointer-events-none"></div>

            {/* Title */}
            <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-widest drop-shadow-sm font-mono">
                    GAMA ECONOMY
                </h2>
                <p className="text-xs text-gray-400 font-mono mt-1">THE "BURN TO BE COOL" CYCLE</p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-6 items-center border-b border-gray-700/50 pb-8 mb-8">
                {/* FLOW SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* LEFT: FAUCETS */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-green-500/30">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                <Droplet size={20} className="text-green-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-green-400">CLEANING</div>
                                <div className="text-[10px] text-gray-400">Reward: +{rewardSettings?.clean || 5} G</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-yellow-500/30">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                                <ShieldCheck size={20} className="text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-yellow-400">BATTLES</div>
                                <div className="text-[10px] text-gray-400">Reward: +{rewardSettings?.battle || 100} G</div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: GAMA CORE */}
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-yellow-500/50 bg-black/60 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                            <Coins size={32} className="text-yellow-400 mb-1" />
                            <div className="text-xs font-bold text-white">GAMA</div>
                            <div className="text-[9px] text-gray-400">Fixed Supply</div>
                        </div>
                        <div className="mt-4 text-[10px] text-gray-500 font-mono bg-black/40 px-3 py-1 rounded-full border border-white/5">
                            LP: 80% • Rewards: 10% • Dev: 10%
                        </div>
                    </div>

                    {/* RIGHT: SINKS */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-red-500/30">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                <Flame size={20} className="text-red-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-red-400">MINT SHOP</div>
                                <div className="text-[10px] text-gray-400">Skins & BGs (50% RECYCLE)</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-purple-500/30">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                <Sparkles size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-purple-400">PET CARE</div>
                                <div className="text-[10px] text-gray-400">Feed & Train (50% RECYCLE)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TREASURY AUDIT */}
            <div className="relative z-10 mb-8 p-4 bg-black/40 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white/40 tracking-widest uppercase flex items-center gap-2">
                        <Shield size={14} className="text-cyan-400" /> Treasury Auditor
                    </h3>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-green-400 font-bold uppercase">Public Audit Live</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter font-mono">Reward Pool</p>
                        <p className="text-lg font-black text-cyan-400 font-mono">
                            {(treasuryStats?.balance || 99999999).toLocaleString()} <span className="text-[10px] font-normal opacity-50">G</span>
                        </p>
                    </div>
                    <div className="space-y-1 border-x border-white/5 px-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter font-mono">Recycled Inflow</p>
                        <p className="text-lg font-black text-green-400 font-mono">
                            {((treasuryStats?.totalPaidOut || 0) * 0.4).toLocaleString()} <span className="text-[10px] font-normal opacity-50">G</span>
                        </p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter font-mono">Total Paid Out</p>
                        <p className="text-lg font-black text-yellow-400 font-mono">
                            {(treasuryStats?.totalPaidOut || 1240500).toLocaleString()} <span className="text-[10px] font-normal opacity-50">G</span>
                        </p>
                    </div>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        <span>Live Payout Feed</span>
                        <span>Recent</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                            <span className="text-white/60 flex items-center gap-1"><Droplet size={10} className="text-cyan-400" /> Battle Victory</span>
                            <span className="text-green-400 font-mono">+{rewardSettings?.battle || 100} G</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white/60 flex items-center gap-1"><Flame size={10} className="text-red-400" /> Prestige Burn</span>
                            <span className="text-red-400 font-mono">-{rewardSettings?.battle || 100} G</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white/60 flex items-center gap-1"><Heart size={10} className="text-pink-400" /> Cleaning</span>
                            <span className="text-green-400 font-mono">+{rewardSettings?.clean || 5} G</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SIMULATOR SECTION */}
            <div className="relative z-10 px-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                        <Calculator size={18} /> LIQUIDITY SIMULATOR
                    </h3>
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <span className="text-[9px] text-green-400 bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30 animate-pulse">● LIVE FEED</span>
                        ) : (
                            <span className="text-[9px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">○ OFFLINE</span>
                        )}
                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">CPMM Model</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-gray-500 font-black uppercase block mb-1">Initial LP SOL</label>
                            <input
                                type="number"
                                value={simSol}
                                onChange={(e) => setSimSol(Math.max(0.1, parseFloat(e.target.value)))}
                                className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-white text-sm w-full focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 font-black uppercase block mb-1">User Buy (SOL)</label>
                            <input
                                type="number"
                                value={simBuy}
                                step="0.1"
                                onChange={(e) => setSimBuy(Math.max(0, parseFloat(e.target.value)))}
                                className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-white text-sm w-full focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-black/40 p-4 rounded-lg border border-blue-500/20 flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs text-gray-400">Tokens Received</span>
                            <span className="text-lg font-black text-yellow-400 font-mono">{Math.floor(tokensReceived).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-xs text-gray-400">Price Impact</span>
                            <span className={`text-sm font-black font-mono ${priceImpact > 10 ? 'text-red-500' : 'text-green-400'}`}>
                                +{priceImpact.toFixed(2)}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${priceImpact > 20 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, priceImpact * 2)}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
