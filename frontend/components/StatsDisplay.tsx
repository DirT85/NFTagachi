"use client";

import { motion } from "framer-motion";

interface StatsProps {
    hunger: number;
    strength: number;
    happiness: number;
    energy: number;
}

export const StatsDisplay = ({ hunger, strength, happiness, energy }: StatsProps) => {
    return (
        <div className="absolute top-2 left-2 right-2 flex justify-between text-[10px] font-mono opacity-60">
            <div className="flex flex-col gap-1">
                <StatRow label="HNG" value={hunger} max={100} color="bg-red-500" inverse />
                <StatRow label="HAP" value={happiness} max={100} color="bg-yellow-500" />
            </div>
            <div className="flex flex-col gap-1 items-end">
                <StatRow label="STR" value={strength} max={100} color="bg-blue-500" />
                <StatRow label="ENR" value={energy} max={100} color="bg-green-500" />
            </div>
        </div>
    );
};

const StatRow = ({ label, value, max, color, inverse = false }: { label: string, value: number, max: number, color: string, inverse?: boolean }) => {
    // If inverse, higher is bad (like hunger). 
    // Normal: higher is good.
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="flex items-center gap-1 group relative">
            <span>{label}</span>
            <div className="w-8 h-1.5 bg-gray-800/20 rounded-sm overflow-hidden border border-gray-800/10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    )
}
