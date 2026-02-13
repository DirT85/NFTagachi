"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MonsterData } from '../utils/GameLogic';
import { Sprite } from './Sprite';
import { Heart, Shield, Sword, Zap, Weight, Star } from 'lucide-react';

interface NftCardProps {
    monster: MonsterData;
    isSelected?: boolean;
    onClick?: () => void;
}

export const NftCard = ({ monster, isSelected, onClick }: NftCardProps) => {
    // Holographic Rarity Colors
    const getRarityStyles = (tier: string) => {
        switch (tier) {
            case 'MYTHIC': return 'bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.3)] ring-amber-400/50';
            case 'LEGENDARY': return 'bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] ring-pink-400/50';
            case 'EPIC': return 'bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-indigo-400/50';
            default: return 'bg-zinc-800 border-white/10 ring-white/5 shadow-xl';
        }
    };

    const styles = getRarityStyles(monster.tier);

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
                relative w-full aspect-[2/3] rounded-[24px] p-0.5 cursor-pointer overflow-hidden transition-all duration-300 ring-2
                ${isSelected ? 'ring-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'ring-transparent'}
            `}
        >
            {/* Card Content */}
            <div className={`w-full h-full rounded-[22px] overflow-hidden flex flex-col ${monster.tier === 'COMMON' ? 'bg-zinc-900 border border-white/5' : styles}`}>

                {/* Holographic Overlay (Animated) */}
                {monster.tier !== 'COMMON' && (
                    <motion.div
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 bg-[length:200%_200%] pointer-events-none z-10 mix-blend-overlay"
                    />
                )}

                {/* Header Area */}
                <div className="p-3 pb-0 flex justify-between items-start z-20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">Level {monster.baseStats.level}</span>
                        <h3 className="text-sm font-black text-white truncate max-w-[120px] drop-shadow-md">{monster.name}</h3>
                    </div>
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={8} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[9px] font-bold text-white">{monster.tier}</span>
                    </div>
                </div>

                {/* Sprite Preview (Floating) */}
                <div className="flex-1 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-black/10 rounded-full blur-3xl scale-50 group-hover:scale-75 transition-transform duration-500" />
                    <Sprite
                        id={monster.id}
                        spriteSheet={monster.spriteSheet}
                        className="w-32 h-32 scale-[2.2] group-hover:scale-[2.4] transition-transform duration-500 -translate-y-2"
                        state="IDLE"
                    />
                </div>

                {/* Footer Area: Stats & Info */}
                <div className="bg-black/60 backdrop-blur-xl p-3 border-t border-white/10 z-20">
                    {/* Stat Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <StatItem icon={<Heart size={10} className="text-red-400" />} label="HP" value={`${monster.baseStats.hp}/${monster.baseStats.maxHp}`} />
                        <StatItem icon={<Sword size={10} className="text-orange-400" />} label="ATK" value={monster.baseStats.atk} />
                        <StatItem icon={<Shield size={10} className="text-blue-400" />} label="DEF" value={monster.baseStats.def} />
                        <StatItem icon={<Zap size={10} className="text-yellow-400" />} label="SPD" value={monster.baseStats.spd} />
                    </div>

                    {/* Weight & Power Footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Weight size={10} className="text-zinc-500" />
                            <span className="text-[9px] font-bold text-zinc-400">{monster.baseStats.weight || 20}kg</span>
                        </div>
                        <div className="bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Power {monster.baseStats.power || 10}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Tick */}
            {isSelected && (
                <div className="absolute -top-1 -right-1 z-30 bg-cyan-500 text-white p-1 rounded-full shadow-lg border-2 border-zinc-900">
                    <CheckCircle size={10} />
                </div>
            )}
        </motion.div>
    );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex items-center gap-2">
        {icon}
        <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 font-black uppercase leading-none">{label}</span>
            <span className="text-[10px] text-white font-black leading-none">{value}</span>
        </div>
    </div>
);

const CheckCircle = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
