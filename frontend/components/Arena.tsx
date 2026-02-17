import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonsterData } from '../utils/GameLogic';
import { BattleState, INITIAL_BATTLE_STATE, calculateDamage, getEnemyMove, getTurnOrder, XP_PER_WIN } from '../utils/BattleLogic';
import { Socket } from 'socket.io-client';
import { Sprite } from './Sprite';
import { LcdBackground } from './LcdBackground';
import { Flame, Shield, Trophy, Coins, Zap } from 'lucide-react';

interface ArenaProps {
    playerMonster: MonsterData;
    opponentMonster?: MonsterData;
    socket?: Socket | null;
    opponentId?: string | null;
    isChallenger?: boolean;
    currentBackground?: string | number;
    onClose: () => void;
    onBattleEnd: (win: boolean, xp: number, rewardMode?: 'CLAIM' | 'BURN') => void;
}

export interface ArenaRef {
    handleAction: (move: 'ATTACK' | 'HEAL' | 'BLOCK' | 'SPECIAL') => void;
    handleQTEInput: () => void;
    startBattle: () => void;
}

export const Arena = forwardRef<ArenaRef, ArenaProps>(({
    playerMonster,
    opponentMonster,
    socket,
    opponentId,
    isChallenger,
    currentBackground,
    onClose,
    onBattleEnd
}, ref) => {
    // Enemy Data
    const [enemyMonster] = useState<MonsterData>(opponentMonster || {
        id: 999, name: 'Shadow Beast', tier: 'RARE', type: 'FIRE',
        baseImageIndex: 1, variant: 'SHADOW',
        baseStats: { hp: 120, maxHp: 120, atk: 12, def: 8, spd: 10, exp: 0, level: 5, weight: 50, power: 40, bodyCondition: 'NORMAL' }
    });

    const playerStats = playerMonster.baseStats || { hp: 100, maxHp: 100 };
    const enemyStats = enemyMonster.baseStats || { hp: 100, maxHp: 100 };

    const [battle, setBattle] = useState<BattleState>({
        ...INITIAL_BATTLE_STATE,
        phase: 'LOBBY',
        playerHp: playerStats.hp,
        playerMaxHp: playerStats.maxHp,
        enemyHp: enemyStats.hp || 100,
        enemyMaxHp: enemyStats.maxHp || 100
    });

    // Refs for transient states
    const pendingMoveRef = useRef<'ATTACK' | 'HEAL' | 'BLOCK' | 'SPECIAL' | undefined>(undefined);
    const incomingAttackRef = useRef<{ action: 'ATTACK' | 'HEAL' | 'BLOCK' | 'SPECIAL', hitQuality: string } | undefined>(undefined);
    const qteAnimationFrame = useRef<number | undefined>(undefined);
    const qteDirection = useRef(1);

    // Animation States
    const [playerState, setPlayerState] = useState<'IDLE' | 'READY' | 'ATTACK' | 'WALK' | 'FAINTED' | 'BLOCK' | 'HIT'>('READY');
    const [enemyState, setEnemyState] = useState<'IDLE' | 'READY' | 'ATTACK' | 'WALK' | 'FAINTED' | 'BLOCK' | 'HIT'>('READY');
    const [animationPhase, setAnimationPhase] = useState<'IDLE' | 'STRIKE' | 'IMPACT'>('IDLE');

    // QTE UI State
    const [qteValue, setQteValue] = useState(0);
    const [qteSweetSpot, setQteSweetSpot] = useState({ start: 45, width: 10 });

    useImperativeHandle(ref, () => ({
        handleAction: (move: 'ATTACK' | 'HEAL' | 'BLOCK' | 'SPECIAL') => {
            if (battle.phase === 'ATTACK_QTE' || battle.phase === 'DEFEND_QTE') {
                handleQTEInput();
                return;
            }
            if (battle.phase === 'LOBBY') {
                startBattle();
            } else {
                handleActionInternal(move);
            }
        },
        handleQTEInput: () => handleQTEInput(),
        startBattle: () => startBattle()
    }));

    const startBattle = () => {
        const first = isChallenger ? 'PLAYER' : 'ENEMY';
        setBattle(prev => ({
            ...prev,
            phase: first === 'PLAYER' ? 'SELECT' : 'RESOLVE',
            turn: first,
            log: [`BATTLE START!`],
            qteActive: false
        }));
    };

    // --- SOCKET LISTENERS ---
    useEffect(() => {
        if (!socket) return;

        socket.on('opponentAction', (data: { action: string, success: boolean }) => {
            setBattle(prev => ({
                ...prev,
                phase: 'DEFEND_QTE',
                log: [...prev.log, `Incoming ${data.action}! Defend!`]
            }));
            incomingAttackRef.current = { action: data.action as any, hitQuality: data.success ? 'PERFECT' : 'NORMAL' };
        });

        socket.on('turn_result', (data: { damage: number, message: string, chargeSpecial?: boolean }) => {
            setBattle(prev => {
                const isMyTurn = prev.turn === 'PLAYER';
                let nextSpecial = prev.specialMeter;
                if (isMyTurn && data.chargeSpecial) {
                    nextSpecial = Math.min(3, nextSpecial + 1);
                }

                return {
                    ...prev,
                    playerHp: !isMyTurn ? Math.max(0, prev.playerHp - data.damage) : prev.playerHp,
                    enemyHp: isMyTurn ? Math.max(0, prev.enemyHp - data.damage) : prev.enemyHp,
                    specialMeter: nextSpecial,
                    phase: 'RESOLVE',
                    log: [...prev.log, data.message]
                };
            });

            if (battle.turn === 'PLAYER') {
                setTimeout(() => {
                    setBattle(prev => ({ ...prev, turn: 'ENEMY' }));
                }, 2000);
            }
        });

        socket.on('battleEnded', (data: { win: boolean, reason?: string }) => {
            setBattle(prev => ({
                ...prev,
                phase: data.win ? 'VICTORY' : 'DEFEAT',
                log: [...prev.log, data.reason || (data.win ? "Opponent Defeated!" : "You were defeated!")]
            }));
        });

        return () => {
            socket.off('opponentAction');
            socket.off('turn_result');
            socket.off('battleEnded');
        };
    }, [socket, battle.turn, opponentId]);

    // --- QTE LOOP ---
    useEffect(() => {
        if (battle.phase === 'ATTACK_QTE' || battle.phase === 'DEFEND_QTE') {
            const speed = battle.phase === 'ATTACK_QTE' ? 1.5 + (playerMonster.baseStats.spd / 50) : 2.0;
            const animate = () => {
                setQteValue(v => {
                    let next = v + (speed * qteDirection.current);
                    if (next >= 100) { next = 100; qteDirection.current = -1; }
                    else if (next <= 0) { next = 0; qteDirection.current = 1; }
                    return next;
                });
                qteAnimationFrame.current = requestAnimationFrame(animate);
            };
            qteAnimationFrame.current = requestAnimationFrame(animate);
        }
        return () => { if (qteAnimationFrame.current) cancelAnimationFrame(qteAnimationFrame.current); };
    }, [battle.phase, playerMonster.baseStats.spd]);

    // Update Sweet Spot
    useEffect(() => {
        const width = battle.phase === 'ATTACK_QTE'
            ? 10 + ((playerMonster.baseStats.power || 10) * 0.15)
            : 15 + ((playerMonster.baseStats.def || 10) * 0.2);
        setQteSweetSpot({ start: 50 - (width / 2), width });
    }, [battle.phase, playerMonster.baseStats]);

    const handleActionInternal = (move: 'ATTACK' | 'HEAL' | 'BLOCK' | 'SPECIAL') => {
        if (battle.phase !== 'SELECT') return;
        if (move === 'SPECIAL' && battle.specialMeter < 3) return;
        if (move === 'SPECIAL') setBattle(prev => ({ ...prev, specialMeter: 0 }));

        pendingMoveRef.current = move;
        setBattle(prev => ({ ...prev, phase: 'ATTACK_QTE', qteActive: true }));

        if (socket && opponentId) {
            socket.emit('battleAction', { targetId: opponentId, action: move, success: true });
        }
    };

    const resolveTurn = (move: 'ATTACK' | 'HEAL' | 'SPECIAL', success: boolean) => {
        setPlayerState('ATTACK');
        setAnimationPhase('STRIKE');

        setTimeout(() => {
            setAnimationPhase('IMPACT');
            if (!opponentId) {
                // AI RESOLUTION
                const isBlocked = Math.random() > 0.7;
                const result = calculateDamage(playerMonster.baseStats, enemyMonster.baseStats, move, success, playerMonster.type, enemyMonster.type, isBlocked);
                setBattle(prev => ({
                    ...prev,
                    enemyHp: Math.max(0, prev.enemyHp - result.damage),
                    playerHp: Math.min(prev.playerMaxHp, prev.playerHp + result.heal),
                    phase: 'RESOLVE',
                    log: [...prev.log, `${move}: ${result.message}`]
                }));
                setTimeout(() => setBattle(prev => ({ ...prev, turn: 'ENEMY' })), 1500);
            } else {
                setBattle(prev => ({ ...prev, phase: 'RESOLVE', log: [...prev.log, `Waiting for opponent...`] }));
            }
        }, 500);

        setTimeout(() => { setPlayerState('IDLE'); setAnimationPhase('IDLE'); }, 1200);
    };

    const handleQTEInput = () => {
        if (battle.phase !== 'ATTACK_QTE' && battle.phase !== 'DEFEND_QTE') return;
        if (qteAnimationFrame.current) cancelAnimationFrame(qteAnimationFrame.current);

        const val = qteValue;
        const target = qteSweetSpot;
        const hit = val >= target.start && val <= (target.start + target.width);

        if (battle.phase === 'ATTACK_QTE') {
            if (pendingMoveRef.current) resolveTurn(pendingMoveRef.current as any, hit);
        } else if (battle.phase === 'DEFEND_QTE') {
            const incoming = incomingAttackRef.current || { action: 'ATTACK', hitQuality: 'NORMAL' };
            const result = calculateDamage(enemyMonster.baseStats, playerMonster.baseStats, incoming.action, true, enemyMonster.type, playerMonster.type, hit);

            setBattle(prev => {
                const newHp = Math.max(0, prev.playerHp - result.damage);
                if (socket && opponentId) {
                    socket.emit('calculate_result', {
                        targetId: opponentId,
                        damage: result.damage,
                        chargeSpecial: incoming.action === 'ATTACK' && !hit,
                        message: `Opponent ${hit ? 'blocked' : 'took hit'}! ${result.damage} damage.`
                    });
                    if (newHp <= 0) socket.emit('battleEnd', { targetId: opponentId, win: false });
                }
                return {
                    ...prev,
                    playerHp: newHp,
                    phase: 'RESOLVE',
                    turn: 'PLAYER',
                    log: [...prev.log, `Defended! Took ${result.damage} DMG.`]
                };
            });

            setTimeout(() => {
                setBattle(prev => (prev.phase !== 'VICTORY' && prev.phase !== 'DEFEAT' ? { ...prev, phase: 'SELECT', turn: 'PLAYER' } : prev));
            }, 2000);
        }
    };

    const handleForfeit = () => {
        if (socket && opponentId) socket.emit('forfeit', { targetId: opponentId });
        setBattle(prev => ({ ...prev, phase: 'DEFEAT', log: [...prev.log, "You forfeited the match."] }));
    };

    const handleBattleEnd = (mode: 'CLAIM' | 'BURN' = 'CLAIM') => {
        onBattleEnd(battle.phase === 'VICTORY', battle.phase === 'VICTORY' ? XP_PER_WIN : 0, mode);
        onClose();
    };

    return (
        <div className="w-full h-full bg-[#0a0a0a] flex flex-col p-2 font-black">
            <div className="flex-1 relative rounded-xl border-2 border-black/80 overflow-hidden shadow-inner bg-[#9bbc0f] group">
                <LcdBackground id="DUEL_ARENA" />

                {/* TOP LABELS (STREET FIGHTER STYLE) */}
                <div className="absolute top-4 inset-x-4 z-50 flex justify-between items-start pointer-events-none">
                    {/* Player HP */}
                    <div className="flex flex-col gap-1 w-[42%]">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-black text-cyan-400 italic tracking-tighter">YOU</span>
                            <span className="text-[8px] font-bold text-white/60 tracking-widest truncate max-w-[50px]">{playerMonster.name}</span>
                        </div>
                        <div className="h-4 bg-black/40 rounded-sm border border-white/10 p-0.5 relative overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_cyan]"
                                animate={{ width: `${(battle.playerHp / battle.playerMaxHp) * 100}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[8px] font-mono font-black text-white drop-shadow-md">
                                    {Math.floor(battle.playerHp)} / {battle.playerMaxHp} HP
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* VS BADGE */}
                    <div className="flex flex-col items-center mt-2">
                        <div className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded italic text-[10px] text-yellow-500">VS</div>
                    </div>

                    {/* Enemy HP */}
                    <div className="flex flex-col gap-1 w-[42%] items-end text-right">
                        <div className="flex justify-between items-end mb-1 w-full">
                            <span className="text-[8px] font-bold text-white/60 tracking-widest truncate max-w-[50px]">{enemyMonster.name}</span>
                            <span className="text-[10px] font-black text-red-500 italic tracking-tighter">ENEMY</span>
                        </div>
                        <div className="h-4 bg-black/40 rounded-sm border border-white/10 p-0.5 relative overflow-hidden w-full">
                            <motion.div
                                className="h-full bg-gradient-to-l from-red-600 to-red-400 shadow-[0_0_10px_red] ml-auto"
                                animate={{ width: `${(battle.enemyHp / battle.enemyMaxHp) * 100}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[8px] font-mono font-black text-white drop-shadow-md">
                                    {Math.floor(battle.enemyHp)} / {battle.enemyMaxHp} HP
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute inset-x-0 bottom-[15%] z-10 pointer-events-none flex items-end justify-center gap-12">
                    {/* Player Sprite */}
                    <motion.div animate={animationPhase === 'STRIKE' ? { x: [0, 100, 0], scale: [1.3, 1.5, 1.3] } : { x: 0, scale: 1.3 }} transition={{ duration: 0.5 }} className="relative z-10 flex flex-col items-center">
                        <Sprite id={playerMonster.id} variant={playerMonster.variant} state={playerState} spriteSheet={playerMonster.spriteSheet} className="w-24 h-24" />
                    </motion.div>

                    {/* Opponent Sprite */}
                    <motion.div className="relative z-10 -scale-x-100 flex flex-col items-center" animate={battle.turn === 'ENEMY' && animationPhase === 'STRIKE' ? { x: [0, -100, 0], scale: [1.3, 1.5, 1.3] } : { x: 0, scale: 1.3 }} style={{ imageRendering: 'pixelated' }}>
                        <Sprite id={enemyMonster.id} variant={enemyMonster.variant} state={enemyState} spriteSheet={enemyMonster.spriteSheet} className="w-24 h-24" />
                    </motion.div>
                </div>

                {/* Log Overlay */}
                <div className="absolute bottom-4 inset-x-0 px-4 pointer-events-none z-30 flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.div key={battle.log.length} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-black/80 text-white text-[9px] px-4 py-1.5 rounded-full font-bold shadow-xl backdrop-blur-sm">
                            {battle.log[battle.log.length - 1]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* INSTRUCTIONAL OVERLAYS */}
                <AnimatePresence>
                    {battle.phase === 'SELECT' && (
                        <motion.div key="select-overlay" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                            <div className="bg-black/80 border-2 border-cyan-500/30 p-8 rounded-[2rem] flex flex-col items-center gap-6 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase">
                                    Your Turn!
                                </motion.div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleActionInternal('ATTACK')}
                                        className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white hover:text-black transition-all group"
                                    >
                                        <div className="text-xl font-black">A</div>
                                        <div className="text-[7px] font-bold uppercase tracking-widest">ATTACK</div>
                                    </button>
                                    <button
                                        onClick={() => handleActionInternal('SPECIAL')}
                                        disabled={battle.specialMeter < 3}
                                        className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${battle.specialMeter >= 3 ? 'bg-cyan-500 shadow-[0_0_20px_cyan] text-white border-white animate-pulse' : 'bg-black/40 border-white/5 text-white/20'}`}
                                    >
                                        <div className="text-xl font-black italic">S</div>
                                        <div className="text-[7px] font-bold uppercase tracking-widest">SPECIAL</div>
                                    </button>
                                </div>
                                <p className="text-[6px] text-white/40 font-mono tracking-widest uppercase">Select Combat Module_</p>
                            </div>
                        </motion.div>
                    )}

                    {(battle.phase === 'ATTACK_QTE' || battle.phase === 'DEFEND_QTE') && (
                        <motion.div key="qte-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] flex flex-col items-center justify-center p-8 gap-6 pointer-events-auto" onClick={handleQTEInput}>
                            <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border-2 border-white/10 flex flex-col items-center gap-6 shadow-2xl">
                                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-sm font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                                    {battle.phase === 'ATTACK_QTE' ? (
                                        <><Flame size={16} className="text-orange-500 animate-pulse" /> TAP TO STRIKE!</>
                                    ) : (
                                        <><Shield size={16} className="text-cyan-400 animate-pulse" /> TAP TO BLOCK!</>
                                    )}
                                </motion.div>
                                <div className="w-56 h-6 bg-black/80 rounded-full relative overflow-hidden border-2 border-white/10 p-1">
                                    <div className="absolute top-0 bottom-0 bg-white/30 rounded-sm" style={{ left: `${qteSweetSpot.start}%`, width: `${qteSweetSpot.width}%` }} />
                                    <motion.div className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_20px_white] rounded-full" style={{ left: `${qteValue}%` }} />
                                </div>
                                <div className="text-[8px] font-bold text-white/40 tracking-[0.3em] uppercase italic">Precision is Key_</div>
                            </div>
                        </motion.div>
                    )}

                    {(battle.phase === 'VICTORY' || battle.phase === 'DEFEAT') && (
                        <motion.div key="end-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-6 text-center px-4">
                            <h2 className={`text-4xl italic font-black ${battle.phase === 'VICTORY' ? 'text-yellow-400' : 'text-red-500'}`}>{battle.phase}</h2>

                            {battle.phase === 'VICTORY' ? (
                                <div className="space-y-4">
                                    <div className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest mb-2">CHOOSE YOUR DESTINY</div>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => handleBattleEnd('CLAIM')}
                                            className="bg-white text-black text-[10px] px-8 py-3 rounded-full font-black tracking-widest uppercase shadow-xl hover:bg-yellow-400 transition-colors w-64 flex items-center justify-center gap-2"
                                        >
                                            <Coins size={14} /> CLAIM GAMA
                                        </button>
                                        <button
                                            onClick={() => handleBattleEnd('BURN')}
                                            className="bg-transparent border-2 border-yellow-400 text-yellow-400 text-[10px] px-8 py-3 rounded-full font-black tracking-widest uppercase shadow-xl hover:bg-yellow-400/10 transition-colors w-64 flex items-center justify-center gap-2"
                                        >
                                            <Flame size={14} /> BURN FOR PRESTIGE
                                        </button>
                                    </div>
                                    <p className="text-[8px] text-gray-500 italic max-w-xs uppercase font-bold">Burning rewards grants permanent +HP or +ATK boosts.</p>
                                </div>
                            ) : (
                                <button onClick={() => handleBattleEnd()} className="bg-white text-black text-[10px] px-8 py-3 rounded-full font-black tracking-widest uppercase shadow-xl hover:bg-gray-200 transition-colors">CONTINUE</button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {(battle.phase === 'SELECT' || battle.phase === 'LOBBY') && (
                    <button onClick={handleForfeit} className="absolute top-2 right-2 z-[110] bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 px-3 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all">FORFEIT</button>
                )}
            </div>

            {/* Bottom Status Bar */}
            <div className="h-4 flex items-center justify-center opacity-40 mt-1">
                <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-cyan-400"
                        animate={{ width: `${(battle.specialMeter / 3) * 100}%` }}
                        transition={{ type: 'spring', damping: 10 }}
                    />
                </div>
                <span className="text-[6px] text-white ml-2 font-mono tracking-widest uppercase">Spec_Charged</span>
            </div>
        </div>
    );
});

Arena.displayName = 'Arena';
