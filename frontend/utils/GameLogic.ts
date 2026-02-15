// Game mechanics and constants

export const MONSTER_TYPES = {
    WATER: { name: 'Water', color: '#3b82f6', weak: 'EARTH', strong: 'FIRE' },
    FIRE: { name: 'Fire', color: '#ef4444', weak: 'WATER', strong: 'EARTH' },
    EARTH: { name: 'Earth', color: '#22c55e', weak: 'FIRE', strong: 'WATER' },
    MAGIC: { name: 'Magic', color: '#a855f7', weak: 'NONE', strong: 'ALL' },
    HUMAN: { name: 'Human', color: '#fcd34d', weak: 'MAGIC', strong: 'NONE' }
};

// 50 Unique Styles// GameLogic.ts
// ... existing constants ...

export const getRandomVariant = () => {
    const variants = ['NORMAL', 'SHADOW', 'SPECTRAL', 'GOLD', 'UNDEAD', 'MAGMA', 'TOXIC'];
    return variants[Math.floor(Math.random() * variants.length)];
};

export const generateFusionAccessories = (baseType: 'WATER' | 'FIRE' | 'GRASS') => {
    // 30% Chance to have accessories
    if (Math.random() > 0.3) return [];

    const accessories = [];

    // Example Logic: Give Wings to Non-Fire types (since Fire dragon has wings)
    if (baseType !== 'FIRE' && Math.random() > 0.5) {
        accessories.push({
            type: 'WING',
            source: '/pet_fire.png',
            cut: [2, 18, 20, 24], // Rough coords for Left Wing
            dest: [-5, 15] // Attach to back
        });
        accessories.push({
            type: 'WING',
            source: '/pet_fire.png',
            cut: [42, 18, 20, 24], // Rough coords for Right Wing
            dest: [45, 15] // Attach to back
        });
    }

    // Example: Give Shell to Non-Grass types
    if (baseType !== 'GRASS' && Math.random() > 0.7) {
        accessories.push({
            type: 'SHELL',
            source: '/pet_water.png', // Wait, water is turtle, grass is... wait.
            // Let's assume pet_water.png is turtle.
            cut: [16, 16, 32, 32],
            dest: [16, 16]
        });
    }

    return accessories;
};

// ... existing export ...
export const MONSTER_STYLES = [
    // MYTHIC (Top 5)
    { id: 0, name: 'Cosmic Dragon', tier: 'MYTHIC', type: 'MAGIC', baseIndex: 1, variant: 'SPECTRAL' },
    { id: 1, name: 'Void Walker', tier: 'MYTHIC', type: 'MAGIC', baseIndex: 0, variant: 'SHADOW' },
    { id: 2, name: 'Time Weaver', tier: 'MYTHIC', type: 'MAGIC', baseIndex: 2, variant: 'GOLD' },
    { id: 3, name: 'Chaos Engine', tier: 'MYTHIC', type: 'FIRE', baseIndex: 1, variant: 'MAGMA' },
    { id: 4, name: 'Gaia Prime', tier: 'MYTHIC', type: 'EARTH', baseIndex: 2, variant: 'TOXIC' },

    // RARE (Unique Styles)
    { id: 5, name: 'Phoenix', tier: 'RARE', type: 'FIRE', baseIndex: 1, variant: 'GOLD' }, // Golden Fire
    { id: 6, name: 'Obsidian Golem', tier: 'RARE', type: 'EARTH', baseIndex: 2, variant: 'SHADOW' },
    { id: 7, name: 'Spectral Hydra', tier: 'RARE', type: 'WATER', baseIndex: 0, variant: 'SPECTRAL' },
    { id: 8, name: 'Undead Mage', tier: 'RARE', type: 'MAGIC', baseIndex: 2, variant: 'UNDEAD' },
    { id: 9, name: 'Paladin', tier: 'RARE', type: 'HUMAN', baseIndex: 1, variant: 'GOLD' }, // Use Fire base for now
    { id: 10, name: 'Swamp Thing', tier: 'RARE', type: 'EARTH', baseIndex: 2, variant: 'TOXIC' },
    { id: 11, name: 'Abyssal Kraken', tier: 'RARE', type: 'WATER', baseIndex: 0, variant: 'SHADOW' },
    { id: 12, name: 'Inferno Efreet', tier: 'RARE', type: 'FIRE', baseIndex: 1, variant: 'MAGMA' },
    { id: 13, name: 'Lich King', tier: 'RARE', type: 'MAGIC', baseIndex: 0, variant: 'UNDEAD' },
    { id: 14, name: 'Bio-Mech', tier: 'RARE', type: 'HUMAN', baseIndex: 2, variant: 'TOXIC' },
    // Defaults for others to avoid index errors
];

export interface MonsterStats {
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    spd: number;
    exp: number;
    level: number;
    weight: number; // New: 0-100 (influence def/spd)
    power: number;  // New: 0-100 (influence atk)
    bodyCondition: 'THIN' | 'NORMAL' | 'HEAVY'; // Derived or explicit
    hunger?: number;
    happiness?: number;
    energy?: number;
    waste?: number;
}

// Sprite Sheet Definition
export interface SpriteSheet {
    src: string;
    frameSize: number; // e.g., 64 (for 64x64 frames)
    rows: Record<string, { row: number, frames: number }>;
    framesPerRow: number; // Max width for calculations
    blinkRow?: number; // Specific row for blinking animation
    yOffset?: number; // Adjustment for sheets with vertical leakage
    removeBackground?: boolean; // Legacy: Force removal of background color
}

export type MonsterTier = 'COMMON' | 'RARE' | 'EPIC' | 'MYTHIC' | 'LEGENDARY';

export interface MonsterData {
    id: number;
    name: string;
    tier: MonsterTier;
    type: 'WATER' | 'FIRE' | 'EARTH' | 'MAGIC' | 'HUMAN';
    baseImageIndex: number; // 0=Water, 1=Fire, 2=Earth (Legacy Static)
    variant: string; // Visual filter style
    baseStats: MonsterStats; // Now using full stats object
    spriteSheet?: SpriteSheet; // New Animation Support
    originalSrc?: string; // Static image fallback
    mintAddress?: string; // On-chain Asset PK
}

export const getMonsterData = (id: number): MonsterData | null => {
    let name = `Monster #${id}`;
    let type: MonsterData['type'] = 'EARTH';
    let tier: MonsterData['tier'] = 'COMMON';
    let baseImageIndex = id % 3;
    let variant: string = 'NORMAL';
    let spriteSheet: SpriteSheet | undefined = undefined;



    // 1. ELITE (IDs 100-110)
    if (id >= 101 && id <= 110) {
        tier = 'MYTHIC';
        name = `Cyber Thug #${id - 100}`;
        type = 'MAGIC';
        variant = 'NORMAL';
    }
    // 1.5 WIZARD CLASS (IDs 120-129) - Procedural High-Quality Variants
    else if (id >= 120 && id <= 129) {
        tier = 'MYTHIC'; // Keep high rarity
        const variants = ['NORMAL', 'SPECTRAL', 'TOXIC', 'MAGMA', 'UNDEAD', 'GOLD', 'SHADOW'];
        const variantIndex = (id - 120) % variants.length;
        const variantNames = ['', 'Spectral', 'Toxic', 'Infernal', 'Undead', 'Golden', 'Shadow'];
        name = `${variantNames[variantIndex]} Wizard #${id - 120}`;
        type = 'MAGIC';
        variant = variants[variantIndex];
    }
    // 2. LEGENDARY (ID 42)
    else if (id === 42) {
        tier = 'LEGENDARY';
        name = 'Cyber Thug';
        type = 'MAGIC';
        baseImageIndex = 0;
        variant = 'NORMAL';
        const frames = 10;
        spriteSheet = {
            src: `/collection_v8/sheet_${id}.png?v=23`,
            frameSize: 64,
            rows: {
                IDLE: { row: 0, frames: 1 },
                WALK: { row: 0, frames: 8 },
                EAT: { row: 6, frames: 8 },
                EATING: { row: 6, frames: 8 },
                ATTACK: { row: 4, frames: 8 },
                TRAIN: { row: 7, frames: 8 },
                TRAINING: { row: 7, frames: 8 },
                CLEAN: { row: 0, frames: 8 },
                DIE: { row: 5, frames: 6 }
            },
            framesPerRow: 8
        };
    }
    // 3. NEW CUSTOM SPECIES (IDs 200+)
    else if (id >= 200 && id <= 207) {
        const speciesMap: Record<number, { name: string, src: string, frames: number, type: MonsterData['type'] }> = {
            200: { name: 'Space Alien', src: '/alien.png', frames: 13, type: 'MAGIC' },
            201: { name: 'Bad Baby', src: '/badbaby.png', frames: 18, type: 'EARTH' },
            202: { name: 'Black Beast', src: '/blackbeast.png', frames: 18, type: 'FIRE' },
            203: { name: 'Copper Cupid', src: '/coppercupid.png', frames: 18, type: 'MAGIC' },
            204: { name: 'Frankie', src: '/frankenstein.png', frames: 18, type: 'EARTH' },
            205: { name: 'Bully Alien', src: '/greenstrongalien.png', frames: 13, type: 'MAGIC' },
            206: { name: 'Mino Dragon X', src: '/minodragon1.png', frames: 13, type: 'FIRE' },
            207: { name: 'Mino Dragon Y', src: '/minodragon2.png', frames: 13, type: 'WATER' }
        };

        const s = speciesMap[id];
        name = s.name;
        type = s.type;
        tier = 'EPIC';
        const frames = (id === 201 || id === 202 || id === 203 || id === 204) ? 18 : 13;

        spriteSheet = {
            src: `/collection_v8/sheet_${id}.png?v=23`,
            frameSize: 64,
            rows: {
                IDLE: { row: 0, frames: 1 },
                WALK: { row: 0, frames: 8 },
                EAT: { row: 6, frames: 8 },
                EATING: { row: 6, frames: 8 },
                ATTACK: { row: 4, frames: 8 },
                TRAIN: { row: 7, frames: 8 },
                TRAINING: { row: 7, frames: 8 },
                CLEAN: { row: 0, frames: 8 },
                DIE: { row: 5, frames: 6 }
            },
            framesPerRow: 8,
            removeBackground: true
        };
    }
    // 4. COMMON & Procedural (Default logic)
    else {
        if (id % 3 === 0) { type = 'WATER'; baseImageIndex = 0; name = 'Sea Critter'; }
        else if (id % 3 === 1) { type = 'FIRE'; baseImageIndex = 1; name = 'Ember Spirit'; }
        else { type = 'EARTH'; baseImageIndex = 2; name = 'Forest Imp'; }

        // Rare variants of Common
        if (id % 20 === 0) { type = 'HUMAN'; baseImageIndex = 1; name = 'Nomad'; variant = 'GOLD'; tier = 'RARE'; }
        if (id % 50 === 0) { type = 'MAGIC'; baseImageIndex = 0; name = 'Apprentice'; variant = 'SPECTRAL'; tier = 'MYTHIC'; }

        // V23 Full LPC Support (21 Rows - Dynamic Width)
        // Includes baked weapons and food props for ALL monsters
        spriteSheet = {
            src: `/collection_v8/sheet_${id}.png?v=23`,
            frameSize: 128,
            rows: {
                IDLE: { row: 0, frames: 1 },
                WALK: { row: 0, frames: 8 },
                EAT: { row: 6, frames: 8 },
                EATING: { row: 6, frames: 8 },
                ATTACK: { row: 4, frames: 8 },
                TRAIN: { row: 7, frames: 8 },
                TRAINING: { row: 7, frames: 8 },
                CLEAN: { row: 0, frames: 8 },
                DIE: { row: 5, frames: 6 }
            },
            framesPerRow: 8
        };
        if (id === 100 || id === 42) spriteSheet.framesPerRow = 10;
    }

    // Apply Stats based on Tier
    let stats: MonsterStats = { hp: 100, maxHp: 100, atk: 10, def: 5, spd: 10, exp: 0, level: 1, weight: 20, power: 10, bodyCondition: 'NORMAL' };
    if (tier === 'RARE') {
        stats = { ...stats, hp: 120, maxHp: 120, atk: 15, def: 8, spd: 12 };
    } else if (tier === 'EPIC') {
        stats = { ...stats, hp: 130, maxHp: 130, atk: 20, def: 10, spd: 15 };
    } else if (tier === 'MYTHIC') {
        stats = { ...stats, hp: 150, maxHp: 150, atk: 25, def: 15, spd: 20 };
    } else if (tier === 'LEGENDARY') {
        stats = { ...stats, hp: 200, maxHp: 200, atk: 30, def: 20, spd: 25 };
    }

    return {
        id,
        name,
        type,
        tier,
        variant,
        baseImageIndex,
        baseStats: stats,
        spriteSheet
    };
};
