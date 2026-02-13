"use client";

import { motion } from "framer-motion";
import { Trophy, History as HistoryIcon, Coins, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState } from "react";

interface ActivityPanelProps {
    balance: number;
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    balance: number;
    wins: number;
}

export const ActivityPanel = ({ balance }: ActivityPanelProps) => {
    const [activeTab, setActiveTab] = useState<"ACTIVITY" | "LEADERBOARD">("ACTIVITY");

    const leaderboard: LeaderboardEntry[] = [
        { rank: 1, name: "CYBER_WIZARD", balance: 25400, wins: 42 },
        { rank: 2, name: "SOL_WHALE", balance: 18200, wins: 38 },
        { rank: 3, name: "DUEL_MASTER", balance: 12500, wins: 31 },
        { rank: 4, name: "NFT_COLLECTOR", balance: 8900, wins: 24 },
        { rank: 5, name: "GAMA_FITT", balance: 4200, wins: 15 },
    ];

    return (
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl">
            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-white/5">
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
                    TOP PLAYERS
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === "ACTIVITY" ? (
                    <div className="space-y-4">
                        <div className="text-center py-10 opacity-30">
                            <HistoryIcon size={32} className="mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No System Logs Found</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4 animate-in slide-in-from-top-2 duration-500">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-black text-blue-400 uppercase">System Status</span>
                                <span className="text-[8px] font-mono text-blue-400/60">OK</span>
                            </div>
                            <p className="text-[8px] text-white/60 leading-relaxed uppercase">
                                <span className="text-yellow-400 font-bold">[READY]</span> HUD Balance Linked: {balance.toLocaleString()} G (Active)
                                <br />
                                <span className="text-cyan-400 font-bold">[SYNC]</span> Metadata Baking: Dynamic URIs Enabled
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[8px] text-white/40 leading-relaxed uppercase">
                                <span className="text-cyan-400 font-bold">[!]</span> The Game Wallet (G) is used for in-game actions such as feeding, training, and cleaning. Winnings from the Arena are also deposited here.
                            </p>
                        </div>
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

            {/* Footer Info */}
            <div className="p-3 bg-white/5 border-t border-white/5">
                <div className="flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-1.5">
                        <Coins size={12} className="text-yellow-500" />
                        <span className="text-[8px] font-black text-white uppercase">Game Wallet</span>
                    </div>
                    <span className="text-[10px] font-mono font-black text-white tracking-widest">{balance.toLocaleString()} G</span>
                </div>
            </div>
        </div >
    );
};
