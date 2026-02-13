import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Flame, ArrowRight, ShieldCheck, Coins, Calculator, Sparkles, Activity } from 'lucide-react';
import { usePumpFun } from '@/hooks/usePumpFun';

export const TokenomicsMap = () => {
    const [simSol, setSimSol] = useState(5); // Default 5 SOL
    const [simBuy, setSimBuy] = useState(1); // Default 1 SOL Buy

    // Pump.fun Live Data (Placeholder Mint for connection test)
    const { isConnected, lastTrade } = usePumpFun("So11111111111111111111111111111111111111112"); // Monitor Wrapped SOL as a test? or a known pump token?
    // Let's just use a dummy mint to test connection: "PUMP_DEMO" won't work on real socket probably.
    // Better to not break it. I'll comment out the mint for now or make it optional.

    // Simulation Math (CPMM: x * y = k)
    const POOL_TOKENS = 600_000_000;
    const k = simSol * POOL_TOKENS;

    // After Buy
    const newPoolSol = simSol + simBuy;
    const newPoolTokens = k / (newPoolSol || 1); // Avoid div/0
    const tokensReceived = POOL_TOKENS - newPoolTokens;

    // Price Calc (SOL per GAMA)
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

                {/* LEFT: FAUCETS (Sources) */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-green-500/30">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <Droplet size={20} className="text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-green-400">CLEANING</div>
                            <div className="text-[10px] text-gray-400">Daily care rewards (Low)</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-yellow-500/30">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                            <ShieldCheck size={20} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-yellow-400">BATTLES</div>
                            <div className="text-[10px] text-gray-400">PvP Wins (Medium)</div>
                        </div>
                    </div>
                </div>

                {/* CENTER: SUPPLY & LP */}
                <div className="flex flex-col items-center py-4">
                    {/* Flow Arrows In */}
                    <div className="flex flex-col items-center mb-2 animate-pulse text-green-400/50">
                        <ArrowRight className="rotate-90" size={24} />
                    </div>

                    <div className="w-32 h-32 rounded-full border-4 border-yellow-500/50 bg-black/60 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.2)] relative group">
                        <Coins size={32} className="text-yellow-400 mb-1" />
                        <div className="text-xs font-bold text-white">GAMA</div>
                        <div className="text-[9px] text-gray-400">Fixed Supply</div>

                        {/* Tooltip for LP */}
                        <div className="absolute -bottom-16 w-48 text-center bg-black/90 text-white text-[10px] p-2 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            60% Locked in Liquidity Pool<br />Fair Launch (No Pre-sale)
                        </div>
                    </div>

                    <div className="mt-2 text-[10px] text-gray-500 font-mono bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        LP: 60% • Dev: 15% • Airdrop: 15%
                    </div>

                    {/* Flow Arrows Out */}
                    <div className="flex flex-col items-center mt-2 animate-pulse text-red-400/50">
                        <ArrowRight className="rotate-90" size={24} />
                    </div>
                </div>

                {/* RIGHT: SINKS (Burn) */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-end gap-3 bg-black/40 p-3 rounded-lg border border-red-500/30 text-right">
                        <div className="flex items-center gap-3 flex-row-reverse">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                <Flame size={20} className="text-red-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-red-400">MINT SHOP</div>
                                <div className="text-[10px] text-gray-400">Backgrounds & Skins (High Burn)</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 bg-black/40 p-3 rounded-lg border border-purple-500/30 text-right">
                        <div className="flex items-center gap-3 flex-row-reverse">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                <Sparkles size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-purple-400">LEVEL UP</div>
                                <div className="text-[10px] text-gray-400">Training & Stat Boosts</div>
                            </div>
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
                            <span className="text-[9px] text-green-400 bg-green-900/30 px-2 py-0.5 rounded border border-green-500/30 animate-pulse">
                                ● LIVE FEED
                            </span>
                        ) : (
                            <span className="text-[9px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                ○ OFFLINE
                            </span>
                        )}
                        <div className="text-[10px] text-gray-500 font-mono">CPMM (x*y=k)</div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* INPUTS */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 font-bold block mb-1">INITIAL LP SOL</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={simSol}
                                    onChange={(e) => setSimSol(Math.max(0.1, parseFloat(e.target.value)))}
                                    className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-white text-sm w-full focus:border-blue-500 outline-none"
                                />
                            </div>
                            <span className="text-[10px] text-gray-500">~${(simSol * 85).toLocaleString()}</span>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 font-bold block mb-1">USER BUY (SOL)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={simBuy}
                                    step="0.1"
                                    onChange={(e) => setSimBuy(Math.max(0, parseFloat(e.target.value)))}
                                    className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-white text-sm w-full focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RESULTS */}
                    <div className="bg-black/40 p-4 rounded-lg border border-blue-500/20 flex flex-col justify-center relative overflow-hidden">

                        {isConnected && lastTrade ? (
                            <>
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <span className="text-xs text-gray-400">Live Price (SOL)</span>
                                    <span className="text-xl font-bold text-green-400 font-mono">{lastTrade.price.toFixed(9)}</span>
                                </div>
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <span className="text-xs text-gray-400">Last Trade</span>
                                    <span className={`text-sm font-bold ${lastTrade.isBuy ? 'text-green-400' : 'text-red-400'}`}>
                                        {lastTrade.isBuy ? 'BUY' : 'SELL'} {Math.floor(lastTrade.tokenAmount).toLocaleString()}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <span className="text-xs text-gray-400">You Get</span>
                                    <span className="text-lg font-bold text-yellow-400">{Math.floor(tokensReceived).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    <span className="text-xs text-gray-400">Impact</span>
                                    <span className={`text-sm font-bold ${priceImpact > 10 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                                        +{priceImpact.toFixed(2)}%
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Impact Bar or Bonding Curve */}
                        {isConnected ? (
                            <div className="mt-3 relative z-10">
                                <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                                    <span>Bonding Curve</span>
                                    <span>12% / 100%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[12%] animate-pulse"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mt-2 relative z-10">
                                <motion.div
                                    className={`h-full ${priceImpact > 20 ? 'bg-red-500' : 'bg-green-500'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, priceImpact * 2)}%` }} // Visual scale
                                />
                            </div>
                        )}

                        {/* Background warning tint */}
                        {priceImpact > 50 && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
                    </div>
                </div>
            </div>

            {/* Visual Flow Animation (Particles) */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20 -z-10 blur-sm"></div>
        </div>
    );
};
