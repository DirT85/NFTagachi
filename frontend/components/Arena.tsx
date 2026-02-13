import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonsterData } from '../utils/GameLogic';
import { BattleState, INITIAL_BATTLE_STATE, calculateDamage, getEnemyMove, getTurnOrder, XP_PER_WIN } from '../utils/BattleLogic';
import { Socket } from 'socket.io-client';
import { Sprite } from './Sprite';
import { LcdBackground } from './LcdBackground';

interface ArenaProps {
    playerMonster: MonsterData;
    opponentMonster?: MonsterData;
    socket?: Socket | null;
    opponentId?: string | null;
    isChallenger?: boolean;
    currentBackground?: string | number;
    onClose: () => void;
    onBattleEnd: (win: boolean, xp: number) => void;
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

    const handleBattleEnd = () => {
        onBattleEnd(battle.phase === 'VICTORY', battle.phase === 'VICTORY' ? XP_PER_WIN : 0);
        onClose();
    };

    return (
        <div className="w-full h-full bg-[#0a0a0a] flex flex-col p-2 font-black">
            <div className="flex-1 relative rounded-xl border-2 border-black/80 overflow-hidden shadow-inner bg-[#9bbc0f] group">
                <LcdBackground id="DUEL_ARENA" />

                <div className="absolute inset-x-0 bottom-[10%] z-10 pointer-events-none flex items-end justify-center gap-2 pb-2">
                    {/* Player */}
                    <motion.div animate={animationPhase === 'STRIKE' ? { x: [0, 80, 0], scale: [1.2, 1.35, 1.2] } : { x: 0, scale: 1.2 }} transition={{ duration: 0.5 }} className="relative z-10 flex flex-col items-center">
                        <div className="mb-2 flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                <span className="text-[9px] font-bold text-white uppercase tracking-wide">{playerMonster.name}</span>
                                <span className="text-[10px] font-black text-cyan-300 tabular-nums">{Math.floor(battle.playerHp)}</span>
                            </div>
                            <div className="h-1 bg-black/10 rounded-full overflow-hidden border border-black/5 relative transition-all duration-500" style={{ width: `4rem` }}>
                                <motion.div className="h-full bg-cyan-400" animate={{ width: `${(battle.playerHp / battle.playerMaxHp) * 100}%` }} />
                            </div>
                        </div>
                        <Sprite id={playerMonster.id} variant={playerMonster.variant} state={playerState} spriteSheet={playerMonster.spriteSheet} className="w-16 h-16" />
                    </motion.div>

                    {/* Opponent */}
                    <motion.div className="relative z-10 -scale-x-100 flex flex-col items-center" animate={battle.turn === 'ENEMY' && animationPhase === 'STRIKE' ? { x: [0, -80, 0], scale: [1.2, 1.35, 1.2] } : { x: 0, scale: 1.2 }} style={{ imageRendering: 'pixelated' }}>
                        <div className="mb-2 flex flex-col items-center gap-1 -scale-x-100">
                            <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                <span className="text-[9px] font-bold text-white uppercase tracking-wide">{enemyMonster.name}</span>
                                <span className="text-[10px] font-black text-red-300 tabular-nums">{Math.floor(battle.enemyHp)}</span>
                            </div>
                            <div className="w-16 h-1 bg-black/10 rounded-full overflow-hidden border border-black/5">
                                <motion.div className="h-full bg-red-500" animate={{ width: `${(battle.enemyHp / battle.enemyMaxHp) * 100}%` }} />
                            </div>
                        </div>
                        <Sprite id={enemyMonster.id} variant={enemyMonster.variant} state={enemyState} spriteSheet={enemyMonster.spriteSheet} className="w-16 h-16" />
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

                {/* QTE Overlay */}
                <AnimatePresence>
                    {(battle.phase === 'ATTACK_QTE' || battle.phase === 'DEFEND_QTE') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex flex-col items-center justify-center p-8 gap-4">
                            <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl border-2 border-white/20 flex flex-col items-center gap-3">
                                <div className="text-[10px] font-black tracking-widest text-white uppercase">
                                    {battle.phase === 'ATTACK_QTE' ? 'TIMING HIT!' : 'BLOCK NOW!'}
                                </div>
                                <div className="w-56 h-6 bg-black/80 rounded-full relative overflow-hidden border border-white/10">
                                    <div className="absolute top-0 bottom-0 bg-white/20" style={{ left: `${qteSweetSpot.start}%`, width: `${qteSweetSpot.width}%` }} />
                                    <motion.div className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_10px_white]" style={{ left: `${qteValue}%` }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {(battle.phase === 'VICTORY' || battle.phase === 'DEFEAT') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6">
                            <h2 className={`text-4xl italic ${battle.phase === 'VICTORY' ? 'text-yellow-400' : 'text-red-500'}`}>{battle.phase}</h2>
                            <button onClick={handleBattleEnd} className="bg-white text-black text-[10px] px-8 py-3 rounded-full font-black tracking-widest uppercase shadow-xl hover:bg-yellow-400 transition-colors">CONTINUE</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls / Info */}
            {(battle.phase === 'SELECT' || battle.phase === 'LOBBY') && (
                <button onClick={handleForfeit} className="absolute top-2 right-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 px-3 py-1 rounded-full text-[8px] font-bold tracking-widest transition-all">FORFEIT</button>
            )}

            <div className="h-10 flex items-center justify-between px-4">
                <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`w-3 h-1.5 rounded-sm ${battle.specialMeter > i ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-white/10'}`} />
                    ))}
                    <span className="text-[7px] text-white/50 ml-1">SPEC</span>
                </div>
                {battle.phase === 'SELECT' && (
                    <div className="flex gap-4">
                        <span className="text-[8px] text-white/60 hover:text-white cursor-pointer" onClick={() => handleActionInternal('ATTACK')}>[A] ATTK</span>
                        <span className={`text-[8px] ${battle.specialMeter >= 3 ? 'text-cyan-400' : 'text-white/20'}`} onClick={() => handleActionInternal('SPECIAL')}>[C] SPEC</span>
                    </div>
                )}
            </div>
        </div>
    );
});

Arena.displayName = 'Arena';
