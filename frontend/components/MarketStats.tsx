"use client";

import { TrendingUp, Flame, DollarSign, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const MarketStats = ({ onClick }: { onClick?: () => void }) => {
    const [stats, setStats] = useState({
        price: 0.00142,
        mcap: 1420000,
        burned: 124500,
        change: 5.2
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                price: prev.price * (1 + (Math.random() * 0.02 - 0.01)),
                mcap: prev.mcap * (1 + (Math.random() * 0.02 - 0.01)),
                change: prev.change + (Math.random() * 1 - 0.5)
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-8 text-[9px] font-mono font-black tracking-tight whitespace-nowrap animate-marquee-fast">
            {/* Stat Item: Price */}
            <div className="flex items-center gap-1 text-green-400">
                <DollarSign size={10} strokeWidth={3} />
                <span>${stats.price.toFixed(5)}</span>
            </div>

            {/* Stat Item: Change */}
            <div className={`flex items-center gap-1 ${stats.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp size={10} strokeWidth={3} className={stats.change < 0 ? "rotate-180" : ""} />
                <span>{stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}%</span>
            </div>

            {/* Stat Item: MCAP */}
            <div className="flex items-center gap-1 text-yellow-400">
                <Activity size={10} strokeWidth={3} />
                <span>MCAP: ${(stats.mcap / 1000000).toFixed(2)}M</span>
            </div>

            {/* Stat Item: Burned */}
            <div className="flex items-center gap-1 text-red-500">
                <Flame size={10} strokeWidth={3} />
                <span>BURNED: {(stats.burned).toLocaleString()}</span>
            </div>

            {/* Duplicate for Marquee Loop */}
            <div className="flex items-center gap-1 text-green-400 opacity-50">
                <DollarSign size={10} strokeWidth={3} />
                <span>${stats.price.toFixed(5)}</span>
            </div>
        </div>
    );
};
