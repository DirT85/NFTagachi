"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprite } from './Sprite';
import { MonsterData } from '../utils/GameLogic';
import { isDarkBackground } from '../utils/BackgroundMetadata';
import { MessageCircle, Swords, Users, X, Crown } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface LobbyProps {
    userMonster: MonsterData;
    ownedMonsters?: MonsterData[];
    onSwitchMonster?: (id: number) => void;
    onJoinArena: (opponentId: string, opponentMonster: MonsterData, isChallenger: boolean) => void;
    onClose: () => void;
    isAuthenticating?: boolean;
    socket?: Socket | null;
    onResetLobby?: () => void;
    isWhale?: boolean;
}

interface Player {
    id: string;
    name: string;
    x: number;
    y: number;
    monsterId: number;
    variant?: string;
    message?: string;
    isUser?: boolean;
    state: 'IDLE' | 'WALK';
    isOwned?: boolean;
    spriteSheet?: any;
    baseStats: any;
    isWhale?: boolean;
}

export const Lobby = ({ userMonster, ownedMonsters = [], onSwitchMonster, onJoinArena, onClose, isAuthenticating, socket, isWhale }: LobbyProps) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [chatInput, setChatInput] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [incomingChallenge, setIncomingChallenge] = useState<{ id: string, name: string, monster: MonsterData } | null>(null);

    // Use ref to avoid stale closures without triggering re-subscriptions
    const onJoinArenaRef = useRef(onJoinArena);
    useEffect(() => {
        onJoinArenaRef.current = onJoinArena;
    }, [onJoinArena]);

    // Initial Join and Re-sync on Monster Switch
    useEffect(() => {
        if (!socket?.connected || !userMonster) return;

        const joinLobby = () => {
            // Randomize spawn position to avoid stacking
            const randomX = 30 + Math.random() * 40; // 30-70%
            const randomY = 30 + Math.random() * 50; // 30-80%
            socket.emit('join', {
                id: userMonster.id,
                name: userMonster.name.toUpperCase(),
                x: randomX,
                y: randomY,
                monsterId: userMonster.id,
                variant: userMonster.variant,
                spriteSheet: userMonster.spriteSheet,
                baseStats: userMonster.baseStats,
                tier: userMonster.tier,
                type: userMonster.type,
                baseImageIndex: userMonster.baseImageIndex,
                isWhale: isWhale
            });
        };

        joinLobby();

        // Also join on actual connection event
        socket.on('connect', joinLobby);
        return () => {
            socket.off('connect', joinLobby);
        };
    }, [socket, userMonster.id, userMonster.variant]);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('currentPlayers', (serverPlayers: Player[]) => {
            setPlayers(serverPlayers.map(p => ({
                ...p,
                isUser: p.id === socket.id
            })));
        });

        socket.on('playerJoined', (newPlayer: Player) => {
            setPlayers(prev => {
                const isMe = newPlayer.id === socket.id;
                const exists = prev.find(p => p.id === newPlayer.id);
                if (exists) {
                    return prev.map(p => p.id === newPlayer.id ? { ...newPlayer, isUser: isMe } : p);
                }
                return [...prev, { ...newPlayer, isUser: isMe }];
            });
        });

        socket.on('playerMoved', (updatedPlayer: Player) => {
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? { ...p, ...updatedPlayer, isUser: updatedPlayer.id === socket.id } : p));
        });

        socket.on('playerChat', ({ id, message }: { id: string, message: string }) => {
            setPlayers(prev => prev.map(p => p.id === id ? { ...p, message } : p));
            setTimeout(() => {
                setPlayers(prev => prev.map(p => p.id === id ? { ...p, message: undefined } : p));
            }, 5000);
        });

        socket.on('playerLeft', (id: string) => {
            setPlayers(prev => prev.filter(p => p.id !== id));
        });

        socket.on('challenged', ({ challengerId, challengerName, monster }: { challengerId: string, challengerName: string, monster: MonsterData }) => {
            setIncomingChallenge({ id: challengerId, name: challengerName, monster: monster });
        });

        socket.on('challengeAccepted', ({ opponentId, opponentName, monster }: { opponentId: string, opponentName: string, monster: MonsterData }) => {
            onJoinArenaRef.current(opponentId, monster, true);
        });

        return () => {
            socket.emit('leave');
            socket.off('currentPlayers');
            socket.off('playerJoined');
            socket.off('playerMoved');
            socket.off('playerChat');
            socket.off('playerLeft');
            socket.off('challenged');
            socket.off('challengeAccepted');
            setPlayers([]); // Explicitly clear local players state on unmount
        };
    }, [socket]); // Removed onJoinArena - using ref instead to prevent cleanup loop

    // Handle Keyboard Movement with consistent speed
    useEffect(() => {
        const moveSpeed = 2; // Consistent speed in percentage per frame
        let animationFrame: number;
        const pressedKeys = new Set<string>();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                pressedKeys.add(e.key);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            pressedKeys.delete(e.key);
        };

        const gameLoop = () => {
            if (pressedKeys.size > 0) {
                setPlayers(prev => {
                    const user = prev.find(p => p.isUser);
                    if (!user) return prev;

                    let dx = 0, dy = 0;
                    if (pressedKeys.has('ArrowUp')) dy = -moveSpeed;
                    if (pressedKeys.has('ArrowDown')) dy = moveSpeed;
                    if (pressedKeys.has('ArrowLeft')) dx = -moveSpeed;
                    if (pressedKeys.has('ArrowRight')) dx = moveSpeed;

                    // Clamp to expanded bounds
                    const newX = Math.max(-100, Math.min(200, user.x + dx));
                    const newY = Math.max(-100, Math.min(200, user.y + dy));

                    socket?.emit('move', { x: newX, y: newY, state: 'WALK' });
                    return prev.map(p => p.isUser ? { ...p, x: newX, y: newY, state: 'WALK' } : p);
                });
            } else {
                setPlayers(prev => prev.map(p => p.isUser && p.state === 'WALK' ? { ...p, state: 'IDLE' } : p));
            }
            animationFrame = requestAnimationFrame(gameLoop);
        };

        animationFrame = requestAnimationFrame(gameLoop);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [socket]);

    // Exposed Movement Helper (Defined outside effects)
    const triggerMoveTo = (targetX: number, targetY: number) => {
        // Simple linear interpolation interval
        setPlayers(prev => {
            const user = prev.find(p => p.isUser);
            if (!user) return prev;

            // Stop any existing wander? Ideally yes, but for now just override

            const dx = targetX - user.x;
            const dy = targetY - user.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const walkSpeed = 0.5;
            const steps = Math.ceil(distance / walkSpeed);
            if (steps <= 0) return prev;

            const stepX = dx / steps;
            const stepY = dy / steps;

            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                setPlayers(current => {
                    const u = current.find(p => p.isUser);
                    if (!u) { clearInterval(interval); return current; }

                    // If user interrupted with keys (state became WALK but different pos?), we should check.
                    // But simplified: just overwrite.

                    const nextX = u.x + stepX;
                    const nextY = u.y + stepY;

                    socket?.emit('move', { x: nextX, y: nextY, state: 'WALK' });

                    if (currentStep >= steps) {
                        clearInterval(interval);
                        socket?.emit('move', { x: targetX, y: targetY, state: 'IDLE' });
                        return current.map(p => p.isUser ? { ...p, x: targetX, y: targetY, state: 'IDLE' } : p);
                    }
                    return current.map(p => p.isUser ? { ...p, x: nextX, y: nextY, state: 'WALK' } : p);
                });
            }, 50); // 20fps

            return prev;
        });
    };

    // Auto-Wander Logic
    useEffect(() => {
        if (!socket) return;

        let wanderTimeout: NodeJS.Timeout;

        const startWandering = () => {
            // Pick random point nearby
            // Access latest players state? We need a ref or functional update.
            // Using setPlayers callback:
            setPlayers(current => {
                const user = current.find(p => p.isUser);
                if (user && user.state !== 'WALK') {
                    const range = 20;
                    const targetX = Math.max(20, Math.min(80, user.x + (Math.random() - 0.5) * range));
                    const targetY = Math.max(20, Math.min(80, user.y + (Math.random() - 0.5) * range));
                    triggerMoveTo(targetX, targetY);
                }
                return current;
            });

            // Re-schedule
            wanderTimeout = setTimeout(startWandering, 8000 + Math.random() * 5000);
        };

        const resetWanderTimer = () => {
            clearTimeout(wanderTimeout);
            wanderTimeout = setTimeout(startWandering, 5000);
        };

        // Listen for user interaction to reset timer
        window.addEventListener('keydown', resetWanderTimer);
        window.addEventListener('click', resetWanderTimer); // simplistic

        resetWanderTimer();

        return () => {
            window.removeEventListener('keydown', resetWanderTimer);
            window.removeEventListener('click', resetWanderTimer);
            clearTimeout(wanderTimeout);
        };
    }, [socket]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        socket?.emit('chat', chatInput);
        setPlayers(prev => prev.map(p => p.isUser ? { ...p, message: chatInput } : p));
        setChatInput("");
        setTimeout(() => setPlayers(prev => prev.map(p => p.isUser ? { ...p, message: undefined } : p)), 5000);
    };

    // Smooth walk-to-point on click
    const handleMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const currentPlayer = players.find(p => p.isUser);
        if (!currentPlayer) return;

        // Map click to virtual coordinates based on zoom
        // Since we scale from center, we need to map the relative offset from center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (e.clientX - rect.left - centerX) / zoomLevel;
        const offsetY = (e.clientY - rect.top - centerY) / zoomLevel;

        // Virtual target is offset from center of initial 100x100 space (which is 50,50)
        const targetX = 50 + (offsetX / rect.width) * 100;
        const targetY = 50 + (offsetY / rect.height) * 100;

        // Calculate distance and walk there smoothly
        const dx = targetX - currentPlayer.x;
        const dy = targetY - currentPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const walkSpeed = 0.8; // Slightly faster for larger spaces
        const steps = Math.ceil(distance / walkSpeed);
        const stepX = dx / steps;
        const stepY = dy / steps;

        let currentStep = 0;
        const walkInterval = setInterval(() => {
            currentStep++;
            setPlayers(prev => {
                const user = prev.find(p => p.isUser);
                if (!user) return prev;

                const newX = user.x + stepX;
                const newY = user.y + stepY;

                socket?.emit('move', { x: newX, y: newY, state: 'WALK' });

                if (currentStep >= steps) {
                    clearInterval(walkInterval);
                    socket?.emit('move', { x: targetX, y: targetY, state: 'IDLE' });
                    return prev.map(p => p.isUser ? { ...p, x: targetX, y: targetY, state: 'IDLE' } : p);
                }

                return prev.map(p => p.isUser ? { ...p, x: newX, y: newY, state: 'WALK' } : p);
            });
        }, 16); // ~60fps
    };

    const handlePlayerClick = (p: Player) => {
        if (p.isUser) return;
        if (p.isOwned && onSwitchMonster) {
            const monster = ownedMonsters.find(m => m.id === p.monsterId);
            if (monster) {
                setSelectedPlayer(p);
                setIsSwitchModalOpen(true);
            }
        } else {
            setSelectedPlayer(p);
            setIsSwitchModalOpen(false);
        }
    };

    // Calculate dynamic zoom based on player distribution and count
    const calculateZoom = () => {
        if (players.length === 0) return 1.0;

        // 1. Zoom based on count (as a baseline)
        const minCountZoom = 0.4;
        const maxCountZoom = 1.0;
        const countProgress = Math.min(1, Math.max(0, (players.length - 2) / 48));
        const countZoom = maxCountZoom - countProgress * (maxCountZoom - minCountZoom);

        // 2. Zoom based on bounding box
        const playerX = players.map(p => p.x);
        const playerY = players.map(p => p.y);
        const minX = Math.min(...playerX);
        const maxX = Math.max(...playerX);
        const minY = Math.min(...playerY);
        const maxY = Math.max(...playerY);

        const width = Math.max(100, maxX - minX);
        const height = Math.max(100, maxY - minY);

        // Target is to fit width/height in 100 units with 20% margin
        const spatialZoom = Math.min(100 / (width * 1.2), 100 / (height * 1.2));

        // Result is the tighter of the two, but not less than 0.25
        return Math.max(0.25, Math.min(countZoom, spatialZoom));
    };

    const zoomLevel = calculateZoom();

    const isDark = isDarkBackground('DEFAULT'); // Lobby currently defaults to greenish LCD, but we'll prepare it.

    return (
        <div className={`absolute inset-0 z-50 flex flex-col font-black ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#9bbc0f]'}`}>
            {/* Challenge Notification */}
            <AnimatePresence>
                {incomingChallenge && (
                    <motion.div initial={{ y: -50 }} animate={{ y: 10 }} exit={{ y: -50 }} className="absolute top-0 left-1/2 -translate-x-1/2 z-[100] bg-red-600 border border-white p-2 rounded shadow-2xl flex flex-col items-center gap-1">
                        <div className="text-white font-bold text-[8px] uppercase">CHALLENGE: {incomingChallenge.name}!</div>
                        <div className="flex gap-1">
                            <button onClick={() => {
                                const monster = incomingChallenge.monster;
                                const mappedMonster = { ...monster, id: monster.id ?? (monster as any).monsterId };
                                socket?.emit('acceptChallenge', incomingChallenge.id);
                                onJoinArenaRef.current(incomingChallenge.id, mappedMonster as MonsterData, false);
                                setIncomingChallenge(null);
                            }} className="bg-white text-red-600 px-2 py-0.5 rounded font-black text-[7px] uppercase">ACCEPT</button>
                            <button onClick={() => setIncomingChallenge(null)} className="bg-red-800 text-white px-2 py-0.5 rounded font-black text-[7px] uppercase">DECLINE</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-black/80 p-1 flex justify-between items-center border-b border-black/20">
                <div className="flex gap-1 items-center px-1">
                    <Users className="text-green-400" size={8} />
                    <span className="text-green-400 font-mono font-black text-[7px] uppercase tracking-tighter">
                        LOBBY: {players.length} ONLINE
                    </span>
                </div>
                <div className="flex gap-1 px-1">
                    <button onClick={() => {
                        const cpuMonster = {
                            id: 999, name: 'Shadow Beast', tier: 'RARE', type: 'FIRE',
                            baseImageIndex: 1, variant: 'SHADOW',
                            baseStats: { hp: 120, maxHp: 120, atk: 12, def: 8, spd: 10, exp: 0, level: 5, weight: 50, power: 40, bodyCondition: 'NORMAL' }
                        };
                        onJoinArena("", cpuMonster as any, true);
                    }} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-2 py-0.5 rounded text-[7px] uppercase tracking-tighter">
                        PRACTICE
                    </button>
                    <button onClick={onClose} className="text-white/40 hover:text-white font-black px-1 text-[7px] uppercase">EXIT</button>
                </div>
            </div>

            {/* Arena Area with Dynamic Zoom */}
            <div
                ref={containerRef}
                className="flex-1 relative cursor-crosshair bg-[#8bac0f] overflow-hidden"
                onClick={handleMove}
            >
                {/* Zoomable content wrapper */}
                <div
                    className="absolute inset-0 origin-center transition-transform duration-500"
                    style={{
                        transform: `scale(${zoomLevel})`,
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* Retro Grid Floor */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                    {/* Players */}
                    <AnimatePresence>
                        {players.map(p => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1, left: `${p.x}%`, top: `${p.y}%` }}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
                                onClick={(e) => { e.stopPropagation(); handlePlayerClick(p); }}
                            >
                                {/* Chat Bubble */}
                                {p.message && (
                                    <div className="absolute bottom-8 bg-white text-black px-1.5 py-0.5 rounded border border-black text-[7px] font-black whitespace-nowrap z-20 shadow-lg uppercase tracking-tighter">
                                        {p.message}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-3 border-transparent border-t-black"></div>
                                    </div>
                                )}

                                {/* Label */}
                                <div className={`text-[6px] font-black mb-0.5 px-1 rounded whitespace-nowrap uppercase tracking-tighter ${p.isUser ? 'bg-black text-green-400' : 'bg-black/60 text-white/70'}`}>
                                    {p.name} {p.isUser && '(YOU)'}
                                </div>

                                {/* Sprite Wrapper */}
                                <div className="relative hover:scale-110 transition-transform">
                                    {/* Whale Aura */}
                                    {p.isWhale && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 -m-4 border-2 border-yellow-400 rounded-full blur-sm pointer-events-none"
                                        />
                                    )}

                                    <Sprite
                                        id={p.isUser ? userMonster.id : p.monsterId}
                                        variant={p.variant as any}
                                        state={p.state}
                                        spriteSheet={p.spriteSheet}
                                        style={{ transform: p.isWhale ? 'scale(1.2)' : 'none' }}
                                        className="w-8 h-8"
                                    />

                                    {/* Whale Badge */}
                                    {p.isWhale && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                            <motion.div
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="bg-yellow-400 text-black p-0.5 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                            >
                                                <Crown size={12} fill="currentColor" />
                                            </motion.div>
                                            <span className="text-[6px] font-black text-yellow-400 uppercase tracking-tighter bg-black/40 px-1 rounded">WHALE</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Challenge Modal */}
            {selectedPlayer && (
                <div className="absolute inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#9bbc0f] border-2 border-black p-4 rounded flex flex-col items-center gap-3 shadow-2xl">
                        <div className="text-black font-black text-[10px] uppercase tracking-tighter">CHALLENGE {selectedPlayer.name}?</div>
                        <div className="scale-125">
                            <Sprite id={selectedPlayer.monsterId} variant={selectedPlayer.variant} state="IDLE" spriteSheet={selectedPlayer.spriteSheet} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { socket?.emit('challenge', selectedPlayer.id); setSelectedPlayer(null); }} className="bg-red-600 text-white px-4 py-1.5 rounded font-black text-[8px] uppercase flex items-center gap-1 shadow-lg">
                                <Swords size={10} /> BATTLE
                            </button>
                            <button onClick={() => setSelectedPlayer(null)} className="bg-black/10 text-black/60 px-4 py-1.5 rounded font-black text-[8px] uppercase">WAIT</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Input Area */}
            <form onSubmit={handleSendMessage} className="p-1.5 bg-black/5 border-t border-black/10 flex gap-1">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="TYPE MESSAGE..."
                    className="flex-1 bg-black/10 border border-black/20 rounded px-2 py-1 text-black font-black text-[8px] uppercase focus:outline-none focus:border-black/40"
                />
                <button type="submit" className="bg-black text-[#9bbc0f] px-3 py-1 rounded font-black text-[8px] uppercase">
                    SEND
                </button>
            </form>
        </div>
    );
};
