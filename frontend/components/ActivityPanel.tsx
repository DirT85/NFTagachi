"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Drumstick, Dumbbell, Sparkles, Swords, Home as HomeIcon, Info, X,
    History as HistoryIcon, Wallet, TrendingUp, Activity, BarChart3,
    RefreshCw, Shield, Zap, Search, History, Trophy, Coins, ArrowUpRight,
    ArrowDownLeft, Flame, Heart, Droplet, ShieldCheck, PieChart, Lock, Users
} from "lucide-react";
import { useState } from "react";

interface LogEntry {
    id: string;
    type: 'BURN' | 'RECYCLE' | 'WIN' | 'CLEAN' | 'SYSTEM';
    message: string;
    time: string;
    txId?: string;
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    balance: number;
    wins: number;
}

interface ActivityPanelProps {
    balance: number;
    logs?: LogEntry[];
    ecoLogs?: any[];
}

export const ActivityPanel = ({ balance, logs = [], ecoLogs = [] }: ActivityPanelProps) => {
    const [activeTab, setActiveTab] = useState<"ACTIVITY" | "LEADERBOARD">("ACTIVITY");

    const leaderboard: LeaderboardEntry[] = [
        { rank: 1, name: "CYBER_WIZARD", balance: 25400, wins: 42 },
        { rank: 2, name: "SOL_WHALE", balance: 18200, wins: 38 },
        { rank: 3, name: "DUEL_MASTER", balance: 12500, wins: 31 },
        { rank: 4, name: "NFT_COLLECTOR", balance: 8900, wins: 24 },
        { rank: 5, name: "GAMA_FITT", balance: 4200, wins: 15 },
    ];

    const getIcon = (type: LogEntry['type']) => {
        switch (type) {
            case 'BURN': return <Flame size={12} className="text-red-400" />;
            case 'RECYCLE': return <RefreshCw size={12} className="text-cyan-400" />;
            case 'WIN': return <Trophy size={12} className="text-yellow-400" />;
            case 'CLEAN': return <Heart size={12} className="text-pink-400" />;
            default: return <Zap size={12} className="text-blue-400" />;
        }
    };

    return (
        <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl relative">
            {/* Background Glow */}
            <div className="absolute top-0 inset-x-0 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-white/5 relative z-10">
                <button
                    onClick={() => setActiveTab("ACTIVITY")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black transition-all ${activeTab === "ACTIVITY" ? "bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500" : "text-white/40 hover:text-white"
                        }`}
                >
                    <HistoryIcon size={14} />
                    SYSTEM LOGS
                </button>
                <button
                    onClick={() => setActiveTab("LEADERBOARD")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black transition-all ${activeTab === "LEADERBOARD" ? "bg-yellow-500/20 text-yellow-500 border-b-2 border-yellow-500" : "text-white/40 hover:text-white"
                        }`}
                >
                    <Trophy size={14} />
                    TOP HOLDERS
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
                {activeTab === "ACTIVITY" ? (
                    <div className="space-y-3">
                        {/* Default Info Card */}
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-black text-blue-400 uppercase">OS_RELAY</span>
                                <span className="text-[8px] font-mono text-blue-400/60 font-bold">ACTIVE</span>
                            </div>
                            <p className="text-[9px] text-white/60 leading-relaxed uppercase font-bold">
                                Treasury Sync: <span className="text-green-400">ONLINE</span>
                                <br />
                                Deflationary Burn: <span className="text-red-400">ENABLED</span>
                            </p>
                        </div>

                        {logs.length === 0 ? (
                            <div className="text-center py-10 opacity-20">
                                <HistoryIcon size={32} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest font-mono">Standby for Pulse...</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors"
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {getIcon(log.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${log.type === 'BURN' ? 'text-red-400' : log.type === 'RECYCLE' ? 'text-cyan-400' : 'text-gray-500'}`}>
                                                        {log.type}
                                                    </span>
                                                    {log.txId && (
                                                        <span className="text-[7px] font-mono text-cyan-400/80 bg-cyan-400/10 px-1 rounded border border-cyan-400/20 uppercase">
                                                            ID: {log.txId}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[8px] font-mono text-white/20">{log.time}</span>
                                            </div>
                                            <p className="text-[10px] text-white/70 font-bold uppercase leading-tight truncate">
                                                {log.message}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry) => (
                            <div key={entry.rank} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:border-yellow-500/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${entry.rank === 1 ? "bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]" :
                                        entry.rank === 2 ? "bg-gray-300 text-black" :
                                            entry.rank === 3 ? "bg-orange-400 text-black" : "bg-white/10 text-white/40"
                                        }`}>
                                        #{entry.rank}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white uppercase">{entry.name}</div>
                                        <div className="text-[8px] text-white/40 font-mono">{entry.wins} WINS</div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono font-black text-yellow-500">
                                    {entry.balance.toLocaleString()} G
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="p-4 bg-white/5 border-t border-white/5 relative z-10 group">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 group-hover:animate-ping" />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Protocol Version 1.1</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        <Coins size={10} className="text-yellow-500" />
                        <span className="text-[10px] font-mono font-black text-white tracking-widest">{balance.toLocaleString()} G</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
