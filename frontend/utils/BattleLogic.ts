import { MonsterData, MonsterStats } from "./GameLogic";

export interface BattleState {
    turn: 'PLAYER' | 'ENEMY';
    phase: 'LOBBY' | 'SELECT' | 'ATTACK_QTE' | 'DEFEND_QTE' | 'RESOLVE' | 'VICTORY' | 'DEFEAT';
    playerHp: number;
    playerMaxHp: number;
    enemyHp: number;
    enemyMaxHp: number;
    log: string[];
    qteActive: boolean;
    qteSuccess: boolean;
    specialMeter: number; // 0-3
}

export const INITIAL_BATTLE_STATE: BattleState = {
    turn: 'PLAYER',
    phase: 'SELECT',
    playerHp: 100,
    playerMaxHp: 100,
    enemyHp: 100,
    enemyMaxHp: 100,
    log: ['Battle Start!'],
    qteActive: false,
    qteSuccess: false,
    specialMeter: 0
};

// --- CONSTANTS ---
export const XP_PER_WIN = 50;

// --- TYPE LOGIC ---
export const getTypeEffectiveness = (attackerType: string, defenderType: string): number => {
    // Normalization
    const atk = attackerType?.toUpperCase() || 'NORMAL';
    const def = defenderType?.toUpperCase() || 'NORMAL';

    if (atk === 'MAGIC') return 1.2; // Glass Cannon
    if (def === 'MAGIC') return 1.2;

    if (atk === 'WATER' && def === 'FIRE') return 1.5;
    if (atk === 'FIRE' && def === 'EARTH') return 1.5;
    if (atk === 'EARTH' && def === 'WATER') return 1.5;

    if (atk === 'FIRE' && def === 'WATER') return 0.5;
    if (atk === 'EARTH' && def === 'FIRE') return 0.5;
    if (atk === 'WATER' && def === 'EARTH') return 0.5;

    return 1.0;
};

// --- BATTLE LOGIC ---

export const getTurnOrder = (playerSpd: number, enemySpd: number): 'PLAYER' | 'ENEMY' => {
    // If speeds are equal, random coin flip. Otherwise, faster unit goes first.
    if (playerSpd === enemySpd) return Math.random() > 0.5 ? 'PLAYER' : 'ENEMY';
    // Small RNG factor to speed? No, definitive for now.
    return playerSpd >= enemySpd ? 'PLAYER' : 'ENEMY';
};

export const getEnemyMove = () => {
    // Simple AI: 80% Attack, 20% Heal (if damaged)
    return Math.random() > 0.2 ? 'ATTACK' : 'HEAL';
};

export const calculateDamage = (
    attacker: MonsterStats,
    defender: MonsterStats,
    move: 'ATTACK' | 'HEAL' | 'BLOCK' | 'SPECIAL',
    qteSuccess: boolean, // For Player only
    attackerType: string = 'NORMAL',
    defenderType: string = 'NORMAL',
    isDefenderBlocking: boolean = false
) => {
    if (move === 'HEAL') {
        const healAmount = Math.floor(attacker.maxHp * 0.4); // Heal 40%
        return { damage: 0, heal: healAmount, isCrit: false, effectiveness: 1.0, message: 'Recovered HP!' };
    }

    if (move === 'BLOCK') {
        return { damage: 0, heal: 0, isCrit: false, effectiveness: 1.0, message: 'Bracing for impact!' };
    }

    // 1. Base Damage = Attack Power
    let damage = attacker.atk;

    // Special move = 2x damage but harder QTE (handled in UI)
    if (move === 'SPECIAL') damage *= 2.0;

    // 2. QTE Multiplier (Player only)
    // If qteSuccess is true (Player Perfect OR Enemy Logic), we boost dmg.
    const isCrit = qteSuccess;
    if (isCrit) damage *= 1.5;

    // 3. Type Effectiveness
    const effectiveness = getTypeEffectiveness(attackerType, defenderType);
    damage *= effectiveness;

    // 4. Defense Reduction
    // Damage = (Atk * Multipliers) - (Def * 0.5)
    let netDamage = Math.max(1, damage - (defender.def * 0.5));

    // 5. Block Mitigations
    if (isDefenderBlocking) {
        netDamage *= 0.4; // 60% reduction
    }

    let message = '';
    if (effectiveness > 1) message = 'It\'s Super Effective!';
    if (effectiveness < 1) message = 'It\'s not very effective...';
    if (isCrit) message += ' Critical Hit!';
    if (isDefenderBlocking) message += ' Blocked!';

    return {
        damage: Math.floor(netDamage),
        heal: 0,
        isCrit,
        effectiveness,
        message: message.trim()
    };
};

// --- XP LOGIC ---
export const calculateLevelUp = (currentLevel: number, currentXp: number, gainedXp: number) => {
    let newXp = currentXp + gainedXp;
    let newLevel = currentLevel;
    let didLevelUp = false;

    // Threshold: Level * 100 (e.g., Lvl 1 needs 100xp, Lvl 2 needs 200xp)
    const threshold = newLevel * 100;

    if (newXp >= threshold) {
        newLevel++;
        newXp -= threshold; // Rollover XP
        didLevelUp = true;
    }

    return { newLevel, newXp, didLevelUp };
};
