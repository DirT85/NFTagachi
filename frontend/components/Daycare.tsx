"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonsterData } from '../utils/GameLogic';
import { Sprite } from './Sprite';

interface DaycareProps {
    ownedMonsters: MonsterData[];
    activeMonsterId?: number;
}

interface Roamer {
    id: number;
    monsterId: number;
    name: string;
    variant: string;
    spriteSheet: any;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    state: 'IDLE' | 'WALK';
    flip: boolean;
}

export const Daycare = ({ ownedMonsters, activeMonsterId }: DaycareProps) => {
    const [roamers, setRoamers] = useState<Roamer[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Roamers
    useEffect(() => {
        // Only roam a few monsters for performance (max 15)
        const inactive = ownedMonsters
            .filter(m => m.id !== activeMonsterId)
            .sort(() => 0.5 - Math.random()) // Randomize which ones appear
            .slice(0, 15);

        setRoamers(inactive.map(m => ({
            id: m.id,
            monsterId: m.id,
            name: m.name,
            variant: m.variant,
            spriteSheet: m.spriteSheet,
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            targetX: Math.random() * 80 + 10,
            targetY: Math.random() * 60 + 20,
            state: 'IDLE',
            flip: false
        })));
    }, [ownedMonsters, activeMonsterId]);

    // Movement Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setRoamers(prev => prev.map(r => {
                if (r.state === 'IDLE') {
                    // 10% chance to start walking
                    if (Math.random() > 0.9) {
                        return {
                            ...r,
                            state: 'WALK',
                            targetX: Math.random() * 80 + 10,
                            targetY: Math.random() * 60 + 20
                        };
                    }
                    return r;
                }

                // WALK Logic
                const dx = r.targetX - r.x;
                const dy = r.targetY - r.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 1) {
                    return { ...r, state: 'IDLE' };
                }

                const speed = 0.3;
                const newX = r.x + (dx / dist) * speed;
                const newY = r.y + (dy / dist) * speed;

                return {
                    ...r,
                    x: newX,
                    y: newY,
                    flip: dx < 0
                };
            }));
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 grayscale-[0.5] blur-[1px]">
            <AnimatePresence>
                {roamers.map(r => (
                    <motion.div
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute"
                        style={{
                            left: `${r.x}%`,
                            top: `${r.y}%`,
                            transform: `translate(-50%, -50%) scale(${r.flip ? -1 : 1}, 1)`,
                            zIndex: Math.floor(r.y)
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <Sprite
                                id={r.monsterId}
                                variant={r.variant}
                                state={r.state}
                                spriteSheet={r.spriteSheet}
                                className="w-16 h-16"
                            />
                            <div className="bg-black/20 px-1 rounded text-[8px] text-white/50 font-bold uppercase tracking-widest mt-1">
                                {r.name}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
