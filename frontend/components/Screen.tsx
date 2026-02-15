"use client";

import { MonsterData } from "../utils/GameLogic";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LcdBackground } from "./LcdBackground";
import { Sprite } from "./Sprite";

interface ScreenProps {
    state: "IDLE" | "SLEEP" | "EATING" | "TRAINING" | "HAPPY" | "CLEANING" | "SAD" | "FAINTED" | "BORN";
    skin: "EGG" | "MONSTER";
    stats?: {
        hunger: number;
        happiness: number;
        strength: number;
        energy: number;
        waste: number;
        weight: number;
        power: number;
        hp: number;
        maxHp: number;
    };
    monsterData?: MonsterData | null;
    backgroundId?: string | number;
    actionLabels?: string[];
    tokenBalance?: number;
    solBalance?: number; // New SOL Prop
    loopLimit?: number; // New
    onAnimationComplete?: () => void; // New
}

const HUDStat = ({ label, value, icon }: { label: string, value: string | number, icon: string }) => (
    <div className="flex items-center gap-1.5 h-3">
        <span className="text-[7.5px] opacity-50 filter grayscale">{icon}</span>
        <div className="flex items-baseline gap-0.5">
            <span className="text-[7px] font-black text-black/30 tracking-tighter uppercase">{label}</span>
            <span className="text-[8.5px] font-black text-black/80 tabular-nums leading-none tracking-tight">{value}</span>
        </div>
    </div>
);

function getAnimation(state: string) {
    switch (state) {
        case "IDLE": return { y: [0, -2, 0], transition: { repeat: Infinity, duration: 1 } };
        case "SLEEP": return { opacity: [0.5, 0.8, 0.5], transition: { repeat: Infinity, duration: 2 } };
        case "EATING": return { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 0.5 } };
        case "TRAINING": return { x: [-10, 10, -10], transition: { repeat: Infinity, duration: 0.5 } };
        case "HAPPY": return { y: [0, -15, 0], rotate: [0, 10, -10, 0], transition: { duration: 0.6 } };
        case "BORN": return { scale: [0, 1.2, 1], y: [20, 0], transition: { duration: 1 } };
        case "FAINTED": return { rotate: 90, y: 20, transition: { duration: 0.5 } };
        default: return {};
    }
}

export const Screen = ({ state, skin, stats, monsterData, backgroundId = 0, actionLabels, tokenBalance, solBalance, loopLimit, onAnimationComplete }: ScreenProps) => {
    const [hueRotate, setHueRotate] = useState<number>(0);

    useEffect(() => {
        if (!monsterData) return;
        let hue = 0;
        if (monsterData.type === 'FIRE') hue = -20;
        if (monsterData.type === 'WATER') hue = 200;
        if (monsterData.type === 'EARTH') hue = 100;
        if (monsterData.type === 'MAGIC') hue = 260;
        setHueRotate(hue + (Math.random() * 20 - 10));
    }, [monsterData]);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-end pb-4 bg-transparent overflow-hidden rounded-inner shadow-inner isolate font-sans">
            {/* LCD Background Layer - Z-Index 0 */}
            <LcdBackground id={backgroundId} active={state === 'TRAINING'} />

            {/* Stats Overlay - Z-Index 20 */}
            <div className="absolute inset-x-0 top-0 p-1.5 pointer-events-none z-20 flex flex-col gap-0.5 select-none bg-gradient-to-b from-black/20 to-transparent">
                <div className="flex justify-between items-center opacity-90">
                    {/* SOL Balance (Top Left) */}
                    <div className="flex items-center gap-1 bg-black/5 px-1.5 rounded-full">
                        <span className="text-[6px] font-black text-black/40 uppercase">SOL</span>
                        <span className="text-[8px] font-black text-blue-900/90 tabular-nums leading-none">
                            {(solBalance || 0).toFixed(3)}
                        </span>
                    </div>

                    {/* GAMA Balance (Top Right) */}
                    <div className="flex items-center gap-1 bg-black/5 px-1.5 rounded-full">
                        <span className="text-[6px] font-black text-black/40 uppercase">BANK</span>
                        <span className="text-[8px] font-black text-yellow-900/90 tabular-nums leading-none">
                            {(tokenBalance === 150000 ? 0 : (tokenBalance || 0)).toLocaleString()}
                        </span>
                        <span className="text-[6px] font-bold text-yellow-900/80 tracking-tighter">G</span>
                    </div>
                </div>

                {/* Prominent HP Bar - Always Visible for Mon */}
                <div className="flex flex-col gap-0.5 mt-0">
                    <div className="flex justify-between items-center px-0.5">
                        <span className="text-[7px] font-black text-black/60 tracking-widest uppercase">VITALITY</span>
                        <span className="text-[8px] font-black text-black/90 tabular-nums">{Math.floor(stats?.hp || monsterData?.baseStats?.hp || 0)}</span>
                    </div>
                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden border border-black/10 relative p-[1px]">
                        <motion.div
                            className={`h-full rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.2)] ${(stats?.hp || monsterData?.baseStats?.hp || 0) / (monsterData?.baseStats?.maxHp || 100) < 0.3 ? 'bg-red-500' : 'bg-[#3b82f6]' // Blue/Red
                                }`}
                            initial={{ width: "100%" }}
                            animate={{
                                width: `${((stats?.hp || monsterData?.baseStats?.hp || 0) / (monsterData?.baseStats?.maxHp || 100)) * 100}%`,
                                opacity: (stats?.hp || 0) / (monsterData?.baseStats?.maxHp || 100) < 0.3 ? [1, 0.5, 1] : 1
                            }}
                            transition={{
                                opacity: { repeat: Infinity, duration: 1 },
                                width: { duration: 0.5 }
                            }}
                        />
                        {/* Diffuser Shine */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-3 gap-x-1 gap-y-0.5 pt-0.5 border-t border-black/5">
                    <HUDStat label="HNG" value={Math.floor(stats?.hunger || 0)} icon="🍎" />
                    <HUDStat label="HAP" value={Math.floor(stats?.happiness || 0)} icon="💖" />
                    <HUDStat label="NRG" value={Math.floor(stats?.energy || 0)} icon="⚡" />
                    <HUDStat label="STR" value={Math.floor(stats?.strength || 0)} icon="💪" />
                    <HUDStat label="PWR" value={Math.floor(stats?.power || 0)} icon="💥" />
                    <HUDStat label="WGT" value={Math.floor(stats?.weight || 0)} icon="⚖️" />
                </div>
            </div>

            {/* Rendering POOP - Z-Index 20 */}
            {stats && stats.waste > 0 && (
                <div className="absolute bottom-4 right-4 flex gap-1 z-20 pointer-events-none">
                    {Array.from({ length: stats.waste }).map((_, i) => (
                        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl">
                            💩
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Monster Shadow */}
            {skin !== 'EGG' && (
                <div className="absolute bottom-9 w-24 h-4 bg-black/20 rounded-full blur-md z-0 transform translate-y-4" />
            )}

            {skin === 'EGG' ? (
                <motion.img
                    src="/egg.svg"
                    alt="Egg"
                    animate={getAnimation(state)}
                    className="w-32 h-32 pixelated rendering-pixelated z-10 relative mb-8"
                />
            ) : (
                <Sprite
                    id={monsterData?.id || 0}
                    variant={monsterData?.variant}
                    animate={getAnimation(state)}
                    className={`z-10 ${state === 'FAINTED' ? 'grayscale opacity-50' : ''}`}
                    style={{
                        transform: 'scale(2.5)',
                        filter: monsterData?.spriteSheet
                            ? `drop-shadow(0 4px 2px rgba(0,0,0,0.2))`
                            : `hue-rotate(${hueRotate}deg) drop-shadow(0 4px 2px rgba(0,0,0,0.2))`
                    }}
                    originalSrc={monsterData?.baseImageIndex === 0 ? '/pet_water.png' : monsterData?.baseImageIndex === 1 ? '/pet_fire.png' : '/pet_grass.png'}
                    spriteSheet={monsterData?.spriteSheet}
                    state={state}
                    loopLimit={loopLimit}
                    onAnimationComplete={onAnimationComplete}
                />
            )}

            {state === "SLEEP" && <div className="absolute top-4 right-4 text-xs font-bold animate-pulse text-black/70 z-20">Zzz...</div>}
            {state === "FAINTED" && (
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 bg-black/20 flex items-center justify-center text-red-900 font-extrabold tracking-[.3em] z-30 text-xs"
                >
                    FAINTED
                </motion.div>
            )}

        </div>
    );
};
