import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Image as ImageIcon, PawPrint, Swords, Heart, Zap } from 'lucide-react';
import { MonsterData } from '../utils/GameLogic';
import { Sprite } from './Sprite';
import { NftCard } from './NftCard';

interface InventoryProps {
    isOpen: boolean;
    onClose: () => void;
    ownedMonsters: MonsterData[];
    currentMonsterId?: number;
    onSwitchMonster: (id: number) => void;
    ownedDevices: string[];
    ownedBackgrounds: string[];
    currentDevice: string;
    currentBackground: string;
    onEquipDevice: (id: string) => void;
    onEquipBackground: (id: string) => void;
    isAuthenticating?: boolean;
    onSyncMetadata?: () => void;
    gameBalance?: number;
    tokenBalance?: number;
}

export const Inventory = ({
    isOpen, onClose,
    ownedMonsters, currentMonsterId, onSwitchMonster,
    ownedDevices, ownedBackgrounds,
    currentDevice, currentBackground,
    onEquipDevice, onEquipBackground,
    isAuthenticating,
    onSyncMetadata,
    gameBalance = 0,
    tokenBalance = 0
}: InventoryProps) => {
    const [tab, setTab] = useState<'DEVICE' | 'BG' | 'PETS'>('PETS');
    const [viewingMonster, setViewingMonster] = useState<MonsterData | null>(null);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-950">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
                                INVENTORY
                            </h2>
                            {onSyncMetadata && (
                                <button
                                    onClick={onSyncMetadata}
                                    className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-[8px] font-black rounded-full border border-blue-500/30 flex items-center gap-1.5 transition-all active:scale-95"
                                    title="Bake Stats to On-Chain NFT"
                                >
                                    <Zap size={10} fill="currentColor" />
                                    BAKE TO CHAIN
                                </button>
                            )}
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-800 bg-gray-950/50">
                        <button
                            onClick={() => setTab('PETS')}
                            className={`flex-1 py-3 text-[10px] font-black flex items-center justify-center gap-2 transition-colors ${tab === 'PETS' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400 shadow-[inset_0_-10px_10px_-10px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <PawPrint size={14} /> COLLECTION
                        </button>
                        <button
                            onClick={() => setTab('DEVICE')}
                            className={`flex-1 py-3 text-[10px] font-black flex items-center justify-center gap-2 transition-colors ${tab === 'DEVICE' ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Smartphone size={14} /> SKINS
                        </button>
                        <button
                            onClick={() => setTab('BG')}
                            className={`flex-1 py-3 text-[10px] font-black flex items-center justify-center gap-2 transition-colors ${tab === 'BG' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <ImageIcon size={14} /> THEMES
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 h-[440px] overflow-y-auto bg-gray-900 custom-scrollbar">
                        {viewingMonster ? (
                            <div className="flex flex-col items-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-300">
                                <div className="w-full max-w-[280px]">
                                    <NftCard monster={viewingMonster} />
                                </div>
                                <div className="flex gap-4 w-full max-w-[320px]">
                                    <button
                                        onClick={() => setViewingMonster(null)}
                                        className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-black rounded-2xl border border-white/5 uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        Back to Collection
                                    </button>
                                    <button
                                        disabled={currentMonsterId === viewingMonster.id || isAuthenticating}
                                        onClick={() => {
                                            onSwitchMonster(viewingMonster.id);
                                            setViewingMonster(null);
                                            onClose(); // Auto-close inventory
                                        }}
                                        className={`flex-1 py-4 font-black rounded-2xl uppercase text-[10px] tracking-widest transition-all ${currentMonsterId === viewingMonster.id
                                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                                            : 'bg-white text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] shadow-xl'
                                            }`}
                                    >
                                        {currentMonsterId === viewingMonster.id ? 'Active' : isAuthenticating ? 'Summoning...' : 'Summon Monster'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {tab === 'PETS' ? (
                                    <>
                                        {ownedMonsters.slice(0, 50).map(monster => (
                                            <MonsterCard
                                                key={monster.id}
                                                monster={monster}
                                                isActive={currentMonsterId === monster.id}
                                                onEquip={() => setViewingMonster(monster)}
                                                isAuthenticating={isAuthenticating}
                                            />
                                        ))}
                                        {ownedMonsters.length > 50 && (
                                            <div className="col-span-2 text-center py-4 text-xs text-gray-500 italic">
                                                Only showing first 50 pets to improve performance.
                                            </div>
                                        )}
                                    </>
                                ) : tab === 'DEVICE' ? (
                                    ownedDevices.map(device => (
                                        <ItemCard
                                            key={device}
                                            name={device}
                                            isActive={currentDevice === device}
                                            onEquip={() => onEquipDevice(device)}
                                            type="DEVICE"
                                        />
                                    ))
                                ) : (
                                    ownedBackgrounds.map(bg => (
                                        <ItemCard
                                            key={bg}
                                            name={bg}
                                            isActive={currentBackground === bg}
                                            onEquip={() => onEquipBackground(bg)}
                                            type="BG"
                                        />
                                    ))
                                )}
                            </div>
                        )}
                        {((tab === 'DEVICE' && ownedDevices.length === 0) || (tab === 'BG' && ownedBackgrounds.length === 0) || (tab === 'PETS' && ownedMonsters.length === 0)) && !viewingMonster && (
                            <div className="flex flex-col items-center justify-center mt-20 text-gray-600 gap-2">
                                <Zap size={32} className="opacity-20" />
                                <div className="text-center italic text-sm">Empty... Visit the GAMA shop!</div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
};

// Memoized Components to reduce lag
const MonsterCard = React.memo(({ monster, isActive, onEquip, isAuthenticating }: { monster: MonsterData, isActive: boolean, onEquip: () => void, isAuthenticating?: boolean }) => {
    return (
        <div
            onClick={!isActive && !isAuthenticating ? onEquip : undefined}
            className={`
                relative cursor-pointer group
                p-3 rounded-xl border-2 transition-all duration-200
                ${isAuthenticating && !isActive ? 'opacity-70 grayscale cursor-wait' : ''}
                ${isActive
                    ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'border-gray-800 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'}
            `}
        >
            <div className="h-20 rounded-lg mb-2 flex items-center justify-center bg-black/40 overflow-hidden relative">
                <div className="scale-[1.8] image-render-pixel">
                    <Sprite id={monster.id} variant={monster.variant} state="IDLE" spriteSheet={monster.spriteSheet} />
                </div>
                {isActive && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                        <Zap size={10} fill="currentColor" />
                    </div>
                )}
            </div>

            <div className="space-y-1.5 px-1">
                <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
                    <span className="font-mono font-black text-[11px] text-white uppercase truncate tracking-tight">{monster.name}</span>
                    <span className="text-[9px] text-blue-400 font-black bg-blue-500/10 px-1.5 rounded-sm">L{monster.baseStats.level}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase">
                    <div className="flex items-center gap-1.5 text-red-500/90 group-hover:text-red-400 transition-colors">
                        <Heart size={10} fill="currentColor" className="opacity-40" />
                        <span>{monster.baseStats.maxHp} HP</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-500/90 group-hover:text-orange-400 transition-colors">
                        <Swords size={10} fill="currentColor" className="opacity-40" />
                        <span>{monster.baseStats.atk} ATK</span>
                    </div>
                </div>

                {isActive ? (
                    <div className="mt-2 text-center bg-blue-500 text-black text-[8px] font-black rounded-md py-1 uppercase tracking-tighter shadow-[0_0_10px_rgba(59,130,246,0.5)]">EQUIPPED</div>
                ) : isAuthenticating ? (
                    <div className="mt-2 text-center bg-blue-900 text-blue-400 text-[8px] font-black rounded-md py-1 uppercase tracking-tighter animate-pulse flex items-center justify-center gap-1">
                        <Zap size={8} className="animate-bounce" /> SIGNING...
                    </div>
                ) : (
                    <div className="mt-2 text-center bg-gray-700 text-gray-400 text-[8px] font-black rounded-md py-1 group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase tracking-tighter">SELECT</div>
                )}
            </div>
        </div>
    );
});

const ItemCard = React.memo(({ name, isActive, onEquip, type }: { name: string, isActive: boolean, onEquip: () => void, type: 'DEVICE' | 'BG' }) => {
    const getLabel = (n: string) => n.replace(/_/g, ' ');
    const getColor = (n: string) => {
        // Original
        if (n === 'MATTE_BLACK') return 'bg-gray-900 border-gray-700';
        if (n === 'MATTE_WHITE') return 'bg-gray-100 border-gray-300';
        if (n === 'CLEAR_PURPLE') return 'bg-purple-500/30 border-purple-500/50';
        if (n === 'METAL_SILVER') return 'bg-gray-400 border-gray-300';
        if (n === 'STARDUST') return 'bg-gradient-to-br from-indigo-900 to-purple-600 border-purple-400';

        // NEW SKINS
        if (n === 'MINECRAFT_GRASS') return 'bg-[#5f9e35] border-[#3a251e]';
        if (n === 'WARNING_STRIPE') return 'bg-yellow-400 border-black';
        if (n === 'WOOD_GRAIN') return 'bg-[#8b5a2b] border-[#3e2714]';
        if (n === 'CARBON_FIBER') return 'bg-gray-900 border-gray-600';
        if (n === 'GALAXY_SWIRL') return 'bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-900 border-indigo-500';
        if (n === 'GOLD_PLATED') return 'bg-yellow-500 border-yellow-700';

        // PLASTICS
        if (n === 'FIRE_RED') return 'bg-red-600 border-red-800';
        if (n === 'ELECTRIC_BLUE') return 'bg-blue-600 border-blue-800';
        if (n === 'PIKACHU_YELLOW') return 'bg-yellow-400 border-yellow-600';
        if (n === 'HOT_PINK') return 'bg-pink-500 border-pink-700';
        if (n === 'OFF_WHITE') return 'bg-[#f0f0e0] border-[#d0d0c0]';

        // CLEARS
        if (n === 'GLACIER_ICE') return 'bg-cyan-400/30 border-cyan-400/50';
        if (n === 'SMOKE_BLACK') return 'bg-black/40 border-white/20';
        if (n === 'JUNGLE_GREEN') return 'bg-green-600/40 border-green-500/50';
        if (n === 'ATOMIC_PURPLE') return 'bg-purple-600/40 border-purple-500/50';

        return 'bg-gray-800 border-gray-700';
    };

    return (
        <div
            onClick={onEquip}
            className={`
                relative cursor-pointer group
                p-3 rounded-xl border-2 transition-all duration-200
                ${isActive
                    ? 'border-green-500 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                    : 'border-gray-800 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'}
            `}
        >
            <div className={`h-20 rounded-lg mb-2 flex items-center justify-center overflow-hidden ${type === 'BG' ? 'bg-black' : ''}`}>
                {type === 'DEVICE' && (
                    <div className={`w-8 h-12 rounded-md ${getColor(name)} shadow-lg border flex items-center justify-center`}>
                        {name.startsWith('CLEAR') || ['GLACIER', 'SMOKE', 'JUNGLE', 'ATOMIC'].some(s => name.includes(s)) ? (
                            <div className="text-[6px] opacity-30 font-mono">PCB</div>
                        ) : null}
                    </div>
                )}
                {type === 'BG' && (
                    <div className={`w-full h-full opacity-80`} style={{ background: getBgStyle(name) }}></div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[9px] text-white uppercase truncate">{getLabel(name)}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
            </div>
        </div>
    );
});

export const getBgStyle = (bgId: string | number) => {
    // Original
    if (bgId === 'SPACE') return 'radial-gradient(circle, #1a1a2e 0%, #000 100%)';
    if (bgId === 'MATRIX') return '#000';
    if (bgId === 'VOLCANO') return 'linear-gradient(to bottom, #300, #500)';
    if (bgId === 'OCEAN') return 'linear-gradient(to bottom, #001f3f, #001)';
    if (bgId === 'FOREST') return 'linear-gradient(to bottom, #87CEEB 0%, #87CEEB 60%, #228B22 60%)';
    if (bgId === 'BEDROOM') return 'linear-gradient(to bottom, #F0E68C 0%, #F0E68C 70%, #8B4513 70%)';
    if (bgId === 'BACKYARD') return 'linear-gradient(to bottom, #87CEEB 0%, #32CD32 100%)';

    // NEW PREVIEWS
    if (bgId === 'MINECRAFT_WORLD') return 'linear-gradient(to bottom, #87CEEB 50%, #5f9e35 50%)';
    if (bgId === 'CYBER_CITY') return 'linear-gradient(to bottom, #000033, #ff00ff)';
    if (bgId === 'DESERT_DUNES') return 'linear-gradient(to bottom, #87CEEB, #f4a460)';
    if (bgId === 'UNDERWATER') return 'linear-gradient(to bottom, #00ffff, #00008b)';
    if (bgId === 'CANDY_LAND') return 'linear-gradient(to bottom, #ffc0cb, #98fb98)';
    if (bgId === 'SNOW_PEAK') return 'linear-gradient(to bottom, #87CEEB, #fff)';
    if (bgId === 'RAINY_WINDOW') return 'linear-gradient(to bottom, #708090, #2f4f4f)';
    if (bgId === 'SUNSET_BLVD') return 'linear-gradient(to bottom, #ff4500, #800080)';
    if (bgId === 'TOXIC_WASTE') return 'linear-gradient(to bottom, #2e8b57, #000)';
    if (bgId === 'BLUE_SCREEN') return '#0000AA';
    if (bgId === 'PAPER_NOTEBOOK') return '#fff';
    if (bgId === 'CIRCUIT_BOARD') return '#006400';
    if (bgId === 'STARRY_NIGHT') return '#191970';
    if (bgId === 'HOSPITAL_CLEAN') return '#e0ffff';

    return '#8bac0f'; // Default
};
