"use client";

import { useEffect, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../idl.json";
import { getMonsterData, MonsterData } from '../utils/GameLogic';
import { calculateLevelUp } from '../utils/BattleLogic';

import { generateSigner, transactionBuilder, percentAmount, publicKey } from '@metaplex-foundation/umi';
import { DEVICE_URIS } from '../utils/DeviceMetadata';
import { BACKGROUND_URIS } from '../utils/BackgroundMetadata';

import { create, fetchAssetsByOwner, updateV1, fetchAssetV1 } from '@metaplex-foundation/mpl-core';
import { useMetaplex } from './useMetaplex';
import { GAMA_MINT_ADDRESS, TREASURY_ADDRESS, INITIAL_GAME_BALANCE, DEVICE_COLLECTION, BACKGROUND_COLLECTION } from '../utils/constants';

// Helper for GAMA Balance fetching
const getGamaBalance = async (connection: any, owner: PublicKey) => {
    try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
            mint: new PublicKey(GAMA_MINT_ADDRESS)
        });
        if (tokenAccounts.value.length > 0) {
            return tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
        }
    } catch (e) {
        console.error("Error fetching GAMA balance:", e);
    }
    return 0;
};
import {
    TOKEN_PROGRAM_ID,
    createTransferInstruction,
    getAssociatedTokenAddress
} from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Set this to FALSE when you have deployed your contract to Devnet!
const MOCK_MODE = false;

export interface PetState {
    hunger: number;
    strength: number; // For backward compatibility/simplicity
    happiness: number;
    energy: number;
    waste: number;
    isFainted: boolean;
    // New Advanced Stats
    weight: number;
    power: number;
    maxHp: number;
    hp: number;
    level: number;
    exp: number;
}


export const useNftagachi = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const { sendTransaction } = useWallet();
    const [program, setProgram] = useState<Program | null>(null);

    const mintTestMonster = async () => {
        setLoading(true);
        console.log("[MINT] Summoning Trial Dragon...");
        // Artificial delay for feedback
        await new Promise(resolve => setTimeout(resolve, 800));

        // Use Date.now() for unique ID so we can have multiple
        const uniqueId = Math.floor(Date.now() % 100000);
        const testMonster: MonsterData = {
            id: uniqueId,
            name: `Trial Dragon #${uniqueId}`,
            tier: "LEGENDARY",
            type: "FIRE",
            variant: "GLOWING",
            baseImageIndex: 0,
            baseStats: {
                level: 1, exp: 0, hp: 100, maxHp: 100,
                atk: 15, def: 12, spd: 14,
                hunger: 50, happiness: 80, energy: 100,
                waste: 0, weight: 20, power: 10, bodyCondition: 'NORMAL'
            }
        };

        setOwnedMonsters(prev => {
            const exists = prev.find(m => m.id === testMonster.id);
            if (exists) return prev;
            return [...prev, testMonster];
        });

        setMonsterData(testMonster);
        setLoading(false);
        console.log(`[MINT] Trial Dragon #${uniqueId} Summoned Successfully.`);
    };

    // Metaplex Umi Instance
    const umi = useMetaplex();

    // Initial Program Load
    useEffect(() => {
        if (!wallet) return;

        const provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: 'processed',
        });
        const programObj = new Program(idl as Idl, PROGRAM_ID, provider);
        setProgram(programObj);
        console.log("Anchor Program Initialized:", PROGRAM_ID.toString());
    }, [wallet, connection]);

    // Fetch On-Chain Skins & Backgrounds
    useEffect(() => {
        if (!wallet || !program) return;

        const fetchChainData = async () => {
            try {
                // 1. Fetch Owned Skins (Anchor Program)
                const skinAccounts = await program.account.skin.all([
                    {
                        memcmp: {
                            offset: 8, // owner pubkey
                            bytes: wallet.publicKey.toBase58(),
                        },
                    },
                ]);
                const chainSkins = skinAccounts.map(s => (s.account as any).variantId);

                // 2. Fetch Metaplex Core Assets (Collection Based)
                let coreSkins: string[] = [];
                let coreBgs: string[] = [];
                let coreMonsters: MonsterData[] = [];

                if (umi) {
                    try {
                        const monsterCol = localStorage.getItem("nftagachi_monster_collection");
                        const skinCol = localStorage.getItem("nftagachi_skin_collection");
                        const bgCol = localStorage.getItem("nftagachi_bg_collection");

                        const assets = await fetchAssetsByOwner(umi, wallet.publicKey.toString());

                        // Use Promise.all with metadata hydration
                        const hydratedResults = await Promise.all(assets.map(async (asset) => {
                            try {
                                // 1. Check if asset belongs to our collections (OR has our prefix as legacy fallback)
                                const updateAuth = asset.updateAuthority?.address?.toString();
                                const isMonster = (monsterCol && updateAuth === monsterCol) || asset.name.startsWith("NFTagachi Species: ");
                                const isSkin = (skinCol && updateAuth === skinCol) || asset.name.startsWith("NFTagachi Skin: ");
                                const isBg = (bgCol && updateAuth === bgCol) || asset.name.startsWith("NFTagachi Background: ");

                                if (!isMonster && !isSkin && !isBg) return null;

                                // 2. Fetch JSON Metadata
                                const metaRes = await fetch(asset.uri, { signal: AbortSignal.timeout(5000) });
                                const metadata = await metaRes.json();

                                if (isSkin) coreSkins.push(metadata.name || asset.name.replace("NFTagachi Skin: ", ""));
                                if (isBg) coreBgs.push(metadata.name || asset.name.replace("NFTagachi Background: ", ""));

                                if (isMonster) {
                                    const idStr = asset.name.split("#").pop() || "";
                                    const id = parseInt(idStr) || Math.floor(Math.random() * 999999);

                                    // Extract components
                                    const props = metadata.properties || {};
                                    const assetsMap = props.assets || {};

                                    return {
                                        id,
                                        name: metadata.name || asset.name,
                                        tier: metadata.attributes?.find((a: any) => a.trait_type === 'Tier')?.value || 'COMMON',
                                        type: metadata.attributes?.find((a: any) => a.trait_type === 'Type')?.value || 'EARTH',
                                        weapon: metadata.attributes?.find((a: any) => a.trait_type === 'Weapon')?.value || 'None',
                                        variant: 'NORMAL',
                                        baseImageIndex: 0,
                                        spriteSheet: assetsMap.spritesheet_uri ? {
                                            src: assetsMap.spritesheet_uri,
                                            frameSize: 128,
                                            framesPerRow: 8,
                                            rows: {
                                                IDLE: { row: 0, frames: 1 },
                                                WALK: { row: 0, frames: 8 },
                                                ATTACK: { row: 4, frames: 8 },
                                                DIE: { row: 5, frames: 6 }
                                            }
                                        } : undefined,
                                        originalSrc: metadata.image || asset.uri.replace(".json", ".png"),
                                        mintAddress: asset.publicKey.toString(),
                                        baseStats: props.stats || {
                                            level: 1, exp: 0, hp: 100, maxHp: 100,
                                            atk: 10, def: 10, spd: 10,
                                            hunger: 50, happiness: 50, energy: 100,
                                            waste: 0, weight: 20, power: 10, bodyCondition: 'NORMAL'
                                        }
                                    } as MonsterData;
                                }
                            } catch (e) {
                                console.warn("Failed to hydrate metadata for asset:", asset.name, e);
                            }
                            return null;
                        }));

                        coreMonsters = hydratedResults.filter((m): m is MonsterData => m !== null);
                        console.log("Fetched & Hydrated Metaplex Assets:", coreSkins.length, coreBgs.length, coreMonsters.length);
                    } catch (fetchErr) {
                        console.error("Metaplex fetch failed:", fetchErr);
                    }
                }

                // MERGE & SET SKINS
                if (chainSkins.length > 0 || coreSkins.length > 0) {
                    setOwnedDevices(prev => {
                        const next = Array.from(new Set([...prev, ...chainSkins, ...coreSkins]));
                        return next.length !== prev.length ? next : prev;
                    });
                }

                // 3. Fetch Owned Backgrounds (Anchor Program)
                const bgAccounts = await program.account.background.all([
                    {
                        memcmp: {
                            offset: 8, // owner pubkey
                            bytes: wallet.publicKey.toBase58(),
                        },
                    },
                ]);
                const chainBgs = bgAccounts.map(b => (b.account as any).bgId);

                // MERGE & SET BACKGROUNDS
                if (chainBgs.length > 0 || coreBgs.length > 0) {
                    setOwnedBackgrounds(prev => {
                        const next = Array.from(new Set([...prev, ...chainBgs, ...coreBgs]));
                        return next.length !== prev.length ? next : prev;
                    });
                }

                // 4. Fetch GAMA Token Balance & SOL Balance
                if (wallet.publicKey) {
                    // SOL Balance
                    try {
                        const sol = await connection.getBalance(wallet.publicKey);
                        setSolBalance(sol / web3.LAMPORTS_PER_SOL);
                    } catch (solErr) {
                        console.error("Failed to fetch SOL balance:", solErr);
                    }

                    // GAMA Balance
                    try {
                        if (GAMA_MINT_ADDRESS !== "YOUR_GAMA_MINT_ADDRESS_HERE") {
                            try {
                                const balance = await getGamaBalance(connection, wallet.publicKey);
                                setTokenBalance(balance);
                            } catch (e) {
                                console.warn("Invalid GAMA_MINT_ADDRESS constant or failed to fetch balance:", e);
                                setTokenBalance(0);
                            }
                        } else if (MOCK_MODE) {
                            // Give some mock balance for testing whale features
                            setTokenBalance(5000000);
                            setGameBalance(6000000); // 11M Total = Whale
                        } else {
                            console.warn("GAMA Mint Address not configured in constants.ts and not found on-chain.");
                            setTokenBalance(0);
                        }
                    } catch (tokenErr) {
                        console.error("Failed to fetch token balance:", tokenErr);
                        setTokenBalance(0);
                    }
                }

                // MERGE & SET MONSTERS
                if (coreMonsters.length > 0) {
                    setOwnedMonsters(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const newMonsters = coreMonsters.filter(m => !existingIds.has(m.id));
                        return [...prev, ...newMonsters];
                    });
                }

            } catch (err) {
                console.error("Failed to fetch on-chain art:", err);
            }
        };

        fetchChainData();
    }, [wallet, program, umi]);


    // Persistent Monster Data
    const [monsterData, setMonsterData] = useState<MonsterData | null>(null);
    const [bgId, setBgId] = useState<string | number>('FOREST');

    // Multi-Monster / Collection State
    const [ownedMonsters, setOwnedMonsters] = useState<MonsterData[]>([]);

    // Persistent Selection
    const [currentShape, setCurrentShape] = useState<'CLASSIC' | 'DIGI'>('CLASSIC');
    const [currentDevice, setCurrentDevice] = useState<string>('CLASSIC');
    const [currentBackground, setCurrentBackground] = useState<string>('RETRO');
    const [ownedDevices, setOwnedDevices] = useState<string[]>(['CLASSIC', 'DIGI']);
    const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>(['RETRO', 'FOREST', 'BEDROOM', 'BACKYARD']);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Initialize Monster on Mount (Default to first owned if not set)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedActiveId = localStorage.getItem('nftagachi_active_monster_id');
            if (ownedMonsters.length > 0) {
                if (savedActiveId) {
                    const active = ownedMonsters.find(m => m.id === parseInt(savedActiveId));
                    if (active) setMonsterData(active);
                    else setMonsterData(ownedMonsters[0]);
                } else {
                    setMonsterData(ownedMonsters[0]);
                }
            } else if (MOCK_MODE) {
                console.log("[DEBUG] MOCK_MODE active - Forcing Trial Dragon grant...");
                mintTestMonster();
            }
        }
    }, [ownedMonsters]);

    // Force-expose to window for ultimate debug accessibility
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).mintTestMonster = mintTestMonster;
        }
    }, [mintTestMonster]);

    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const switchMonster = async (id: number) => {
        setIsAuthenticating(true);
        // Simulate Phantom "Sign Message" delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const target = ownedMonsters.find(m => m.id === id);
        if (target) {
            setMonsterData(target);
            setPetState({
                hunger: target.baseStats.hunger ?? 20,
                happiness: target.baseStats.happiness ?? 80,
                strength: target.baseStats.atk,
                energy: target.baseStats.spd * 5, // Derived energy or just use saved
                waste: (target.baseStats as any).waste ?? 0,
                isFainted: target.baseStats.hp <= 0,
                weight: target.baseStats.weight ?? 20,
                power: target.baseStats.power ?? 10,
                maxHp: target.baseStats.maxHp,
                hp: target.baseStats.hp,
                level: target.baseStats.level,
                exp: target.baseStats.exp
            });
            localStorage.setItem('nftagachi_active_monster_id', id.toString());

            // RESET TO DEFAULTS
            setCurrentDevice('CLASSIC');
            setCurrentBackground('FOREST');

            setGameState('HAPPY');
            setTimeout(() => setGameState('IDLE'), 1000);
        }
        setIsAuthenticating(false);
    };
    // Stats
    const [petState, setPetState] = useState<PetState>({
        hunger: 80,
        happiness: 100,
        strength: 10,
        waste: 0,
        energy: 100,
        isFainted: false,
        weight: 20,
        power: 10,
        maxHp: 100,
        hp: 100,
        level: 1,
        exp: 0
    });
    const [gameState, setGameState] = useState<"IDLE" | "SLEEP" | "EATING" | "TRAINING" | "HAPPY" | "CLEANING" | "SAD" | "FAINTED" | "BORN">("IDLE");
    const [loading, setLoading] = useState(false);

    // Save to LocalStorage on Change (GUARDED BY isLoaded)
    useEffect(() => {
        if (!hasLoaded || typeof window === 'undefined') return;
        localStorage.setItem('nftagachi_current_shape', currentShape);
        localStorage.setItem('nftagachi_current_device', currentDevice);
        localStorage.setItem('nftagachi_current_bg', currentBackground);
        localStorage.setItem('nftagachi_owned_devices', JSON.stringify(ownedDevices));
        localStorage.setItem('nftagachi_owned_bgs', JSON.stringify(ownedBackgrounds));
        localStorage.setItem('nftagachi_owned_monsters_v18', JSON.stringify(ownedMonsters));
        if (monsterData) {
            localStorage.setItem('nftagachi_active_monster_id', monsterData.id.toString());
        }
    }, [currentShape, currentDevice, currentBackground, ownedDevices, ownedBackgrounds, ownedMonsters, monsterData, hasLoaded]);

    const [tokenBalance, setTokenBalance] = useState(0);
    const [gameBalance, setGameBalance] = useState(0); // "Session" Balance
    const [treasuryStats, setTreasuryStats] = useState({ balance: 0, totalPaidOut: 0 });
    const [rewardSettings, setRewardSettings] = useState({ battle: 100, clean: 5 });
    const [logs, setLogs] = useState<any[]>([]);

    const addLog = (type: 'BURN' | 'RECYCLE' | 'WIN' | 'CLEAN' | 'SYSTEM', message: string) => {
        const newLog = {
            id: Math.random().toString(36).slice(2, 11),
            type,
            message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setLogs(prev => [newLog, ...prev].slice(0, 20)); // Keep last 20
    };

    const isWhale = (tokenBalance + gameBalance) >= 10_000_000;
    const holderHpMultiplier = isWhale ? 1.2 : 1.0; // 20% Health Boost for Whales
    const [solBalance, setSolBalance] = useState(0); // New SOL Balance
    const [boostActive, setBoostActive] = useState(false);

    // Dynamic Reward Settings
    useEffect(() => {
        const saved = localStorage.getItem("nftagachi_reward_settings");
        if (saved) {
            try {
                setRewardSettings(JSON.parse(saved));
            } catch (e) { /* Fallback to default */ }
        }
    }, []);

    const fetchTreasuryStats = async () => {
        if (!connection || TREASURY_ADDRESS === "YOUR_TREASURY_WALLET_ADDRESS_HERE") return;
        try {
            const treasuryPK = new PublicKey(TREASURY_ADDRESS);
            const balance = await getGamaBalance(connection, treasuryPK);

            // Calculate "Paid Out" by comparing with a reference initial supply (e.g. 100M allocated to treasury)
            // This is a heuristic for the UI transparency.
            const INITIAL_TREASURY_POOL = 300_000_000;
            const paidOut = Math.max(0, INITIAL_TREASURY_POOL - balance);

            setTreasuryStats({ balance, totalPaidOut: paidOut });
        } catch (e) {
            console.error("Failed to fetch treasury stats:", e);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchTreasuryStats, 30000); // 30s refresh
        fetchTreasuryStats();
        return () => clearInterval(interval);
    }, [connection]);

    // PERSISTENCE: Load Game Balance & History on Mount
    // PERSISTENCE: Load Game Balance & History on Mount
    useEffect(() => {
        const saved = localStorage.getItem('nftagachi_gameBalance_v2');
        if (saved) {
            const parsed = parseInt(saved, 10);
            // FORCE FIX: If user has the old hardcoded 150,000, nuke it.
            if (parsed === 150000) {
                console.log("Found glitch 150k balance. Resetting to 0.");
                setGameBalance(INITIAL_GAME_BALANCE);
                localStorage.setItem('nftagachi_gameBalance_v2', INITIAL_GAME_BALANCE.toString());
            } else {
                setGameBalance(parsed);
            }
        } else {
            // New User: Start with default.
            setGameBalance(INITIAL_GAME_BALANCE);
        }
    }, [wallet]); // Re-run on wallet connect to ensure fresh checks

    // PERSISTENCE: Save Game Balance on Change (Version 2)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Always save, even if 0, to track state
            localStorage.setItem('nftagachi_gameBalance_v2', gameBalance.toString());
        }
    }, [gameBalance]);

    // STARTER PACK: Virtual Unlock (1000 GAMA) when Monster is detected
    useEffect(() => {
        if (!monsterData || typeof window === 'undefined') return;

        const claimed = localStorage.getItem('nftagachi_starter_claimed_v1');
        if (!claimed) {
            console.log("New User with Monster detected! Granting Starter Pack...");

            // Grant 1000 GAMA
            setGameBalance(prev => prev + 1000); // Effect above will clean up persistence

            // Mark as Claimed
            localStorage.setItem('nftagachi_starter_claimed_v1', 'true');

            // Alert user (Simulation of "Unlocking")
            setTimeout(() => {
                alert("🎉 WELCOME TAMER! \n\nStarter Pack Unlocked:\n- 1,000 GAMA\n- Default Gear\n\nCheck your Game Wallet!");
            }, 1000);
        }
    }, [monsterData]);

    // Initial Load Effect (Hydration Safe)
    // Initial Load Effect (Hydration Safe)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Load Selections
            const savedShape = localStorage.getItem('nftagachi_current_shape');
            const savedDevice = localStorage.getItem('nftagachi_current_device');
            const savedBg = localStorage.getItem('nftagachi_current_bg');

            if (savedShape) setCurrentShape(savedShape as any);
            if (savedDevice) setCurrentDevice(savedDevice);
            if (savedBg) setCurrentBackground(savedBg);

            // Load Inventory
            const savedOwnedDevs = localStorage.getItem('nftagachi_owned_devices');
            const savedOwnedBgs = localStorage.getItem('nftagachi_owned_bgs');

            if (savedOwnedDevs) {
                try {
                    setOwnedDevices(JSON.parse(savedOwnedDevs));
                } catch (e) { console.error("Failed to parse owned devices", e); }
            }

            if (savedOwnedBgs) {
                try {
                    setOwnedBackgrounds(JSON.parse(savedOwnedBgs));
                } catch (e) { console.error("Failed to parse owned bgs", e); }
            }

            // Game Balance is handled by its own persistent effect now

            setHasLoaded(true);
        }
    }, []);

    // Mock fetching token balance - CLEANED

    // Mock loading Game Balance (Deposit) -> Now handled by separate effect with Persistence
    // setGameBalance(1000); // REMOVED: Managed by localStorage effect below

    // Whale Boost Logic
    useEffect(() => {
        const isWhale = (tokenBalance / 1000000) >= 0.10;
        setBoostActive(isWhale);
    }, [tokenBalance]);

    // Sync initial petState with the active monster
    useEffect(() => {
        if (monsterData) {
            setPetState({
                hunger: monsterData.baseStats.hunger ?? 20,
                strength: monsterData.baseStats.atk,
                happiness: monsterData.baseStats.happiness ?? 80,
                energy: (monsterData.baseStats as any).energy ?? 90,
                waste: (monsterData.baseStats as any).waste ?? 0,
                isFainted: monsterData.baseStats.hp <= 0,
                weight: monsterData.baseStats.weight ?? (boostActive ? 30 : 20),
                power: monsterData.baseStats.power ?? (boostActive ? 25 : 10),
                maxHp: monsterData.baseStats.maxHp,
                hp: monsterData.baseStats.hp,
                level: monsterData.baseStats.level,
                exp: monsterData.baseStats.exp
            });
        }
    }, [monsterData, boostActive]);

    const depositGamaFromWallet = async (amountGama: number) => {
        if (!wallet || !wallet.publicKey) {
            alert("Connect wallet to deposit tokens!");
            return;
        }

        // 1. Resolve Mint Address
        let mintPK: PublicKey | null = null;
        try {
            if (GAMA_MINT_ADDRESS && GAMA_MINT_ADDRESS !== "YOUR_GAMA_MINT_ADDRESS_HERE") {
                mintPK = new PublicKey(GAMA_MINT_ADDRESS);
            }
        } catch (e) {
            console.warn("Invalid GAMA_MINT_ADDRESS config:", e);
        }

        if (!mintPK) {
            alert("GAMA Token Mint address not set in constants.ts! Using simulation mode for UI testing.");
            // Fallback simulation for testing UI without real tokens
            setLoading(true);
            await new Promise(r => setTimeout(r, 1000));
            setTokenBalance(prev => Math.max(0, prev - amountGama));
            setGameBalance(prev => prev + amountGama);
            setLoading(false);
            return;
        }

        const treasuryPK = new PublicKey(TREASURY_ADDRESS === "YOUR_TREASURY_WALLET_ADDRESS_HERE" ? wallet.publicKey.toBase58() : TREASURY_ADDRESS);

        setLoading(true);
        try {
            // Check balance first
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
                mint: mintPK
            });

            const currentBalance = tokenAccounts.value.length > 0
                ? tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
                : 0;

            if (currentBalance < amountGama) {
                alert(`Insufficient Balance! You have ${currentBalance || 0} GAMA tokens.`);
                setLoading(false);
                return;
            }

            // Prepare Transaction
            const transaction = new Transaction();
            const sourceATA = await getAssociatedTokenAddress(mintPK, wallet.publicKey);
            const destATA = await getAssociatedTokenAddress(mintPK, treasuryPK);

            const DECIMALS = 9;
            const rawAmount = Math.round(amountGama * Math.pow(10, DECIMALS));

            transaction.add(
                createTransferInstruction(
                    sourceATA,
                    destATA,
                    wallet.publicKey,
                    rawAmount,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            setTokenBalance(prev => prev - amountGama);
            setGameBalance(prev => prev + amountGama);
            alert(`[SUCCESS] Deposited ${amountGama.toLocaleString()} GAMA!`);

        } catch (err: any) {
            console.error("Deposit Failed:", err);
            alert(`Deposit Failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const depositToGame = async (amount: number) => {
        if (tokenBalance < amount) {
            alert("Insufficient Wallet Balance!");
            return;
        }
        setLoading(true);
        // Simulate Deposit Tx
        await new Promise(r => setTimeout(r, 1000));
        setTokenBalance(prev => prev - amount);
        setGameBalance(prev => prev + amount);
        setLoading(false);
        alert(`Deposited ${amount} GAMA to Game Balance!`);
    };

    const performAction = async (action: 'feed' | 'train' | 'clean' | 'revive') => {
        if (!petState || loading) return;
        if (action !== 'revive' && petState.isFainted) return;

        setLoading(true);
        // Trigger Animation State
        if (action === 'feed') setGameState('EATING');
        else if (action === 'train') setGameState('TRAINING');
        else if (action === 'clean') setGameState('CLEANING');
        else if (action === 'revive') setGameState('BORN');

        try {
            await new Promise(r => setTimeout(r, 1000));
            const newState = { ...petState };

            // Apply Boost Multiplier Dynamically
            const strengthMultiplier = boostActive ? 1.5 : 1.0; // 50% Boost for demo visibility

            if (newState.isFainted) {
                if (action === 'revive') {
                    newState.isFainted = false;
                    newState.hunger = 50;
                    newState.energy = 50;
                    newState.waste = 0;
                    setGameState("HAPPY");
                    setPetState(newState);
                    setTimeout(() => setGameState("IDLE"), 2000);
                    setLoading(false);
                    return;
                } else {
                    setLoading(false);
                    return;
                }
            }

            if (action === 'feed') {
                if (gameBalance < 10) { alert("Insufficient Game Balance (10 GAMA required)!"); setLoading(false); return; }

                // BURN & RECYCLE LOGIC: 50% Burn, 50% Recycle (to fund rewards)
                setGameBalance(prev => prev - 10);
                setTreasuryStats(prev => ({
                    ...prev,
                    balance: prev.balance + 5 // Recycle 5 GAMA back to pool
                }));
                addLog('BURN', '10 G Spent: 5 Burned / 5 Recycled');
                console.log("[ECONOMY] 10 GAMA spent: 5 Burned / 5 Recycled to Treasury");

                newState.hunger = Math.max(0, newState.hunger - 20);
                newState.hp = Math.min(newState.maxHp, newState.hp + 5);
                newState.energy = Math.min(100, newState.energy + 10);
                newState.weight = Math.min(100, newState.weight + 2);
                if (newState.hunger < 20) {
                    newState.maxHp += 1;
                }
                if (Math.random() > 0.6) newState.waste += 1;
                setGameState("EATING");
            } else if (action === 'train') {
                if (gameBalance < 15) { alert("Insufficient Game Balance (15 GAMA required)!"); setLoading(false); return; }

                // BURN & RECYCLE LOGIC: 50% Burn, 50% Recycle
                setGameBalance(prev => prev - 15);
                setTreasuryStats(prev => ({
                    ...prev,
                    balance: prev.balance + 7.5
                }));
                addLog('BURN', '15 G Spent: 7.5 Burned / 7.5 Recycled');
                console.log("[ECONOMY] 15 GAMA spent: 7.5 Burned / 7.5 Recycled to Treasury");

                const gain = Math.floor(5 * strengthMultiplier);
                newState.power = Math.min(100, newState.power + gain);
                newState.strength += 1;
                newState.weight = Math.max(0, newState.weight - 5);
                newState.energy = Math.max(0, newState.energy - 15);
                newState.hunger = Math.min(100, newState.hunger + 10);

                // Track EXP and Level Up
                const { newLevel, newXp, didLevelUp } = calculateLevelUp(petState.level, petState.exp, 5);
                newState.level = newLevel;
                newState.exp = newXp;

                if (didLevelUp) {
                    newState.hp = Math.floor(newState.hp * 1.1);
                    newState.maxHp = Math.floor(newState.maxHp * 1.1);
                    alert(`LEVEL UP! You are now Level ${newLevel}!`);
                }

                setGameState("TRAINING");
            } else if (action === 'clean') {
                if (petState.waste > 0) {
                    newState.waste = 0;
                    const cleanReward = rewardSettings.clean;
                    setGameBalance(prev => prev + cleanReward);
                    addLog('CLEAN', `Environment Cleaned! +${cleanReward} G Rewards`);
                    console.log(`[ECONOMY] Monster Cleaned! +${cleanReward} GAMA Minted (Sustainability Reward)`);
                    newState.happiness = Math.min(100, newState.happiness + 20);
                    setGameState("HAPPY");
                }
            } else if (action === 'revive') {
                if (gameBalance < 50) { alert("Insufficient Game Balance (50 GAMA required)!"); setLoading(false); return; }
                setGameBalance(prev => prev - 50);
                addLog('BURN', 'Pet Revived: 50 G Burned/Recycled');
                console.log("[ECONOMY] 50 GAMA Burned via Revival");
                // State update handled by current revive logic block above this
            }

            // Sync with ownedMonsters to ensure persistence
            if (monsterData) {
                setOwnedMonsters(prev => prev.map(m =>
                    m.id === monsterData.id ? { ...m, baseStats: { ...m.baseStats, ...newState } } : m
                ));

                // Trigger On-Chain Sync if level up or fainted/revived
                if (action === 'revive' || newState.isFainted || newState.level > petState.level) {
                    syncOnChainMetadata();
                }
            }

            if (newState.waste >= 3 || newState.hunger >= 100) {
                newState.isFainted = true;
                setGameState("SAD");
            }

            setPetState(newState);
            if (!newState.isFainted) {
                setTimeout(() => setGameState("IDLE"), 2000);
            } else {
                setGameState("FAINTED");
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Inventory & Swap State
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [swapOpen, setSwapOpen] = useState(false);

    // ... existing useEffect ...

    const mintItem = async (type: 'DEVICE' | 'BG', cost: number) => {
        if (!wallet && !MOCK_MODE) {
            alert("Connect wallet to mint on-chain!");
            return;
        }

        const SOL_COST = 0.01;
        const GAMA_TOTAL_AMOUNT = 1000;

        const treasuryPK = new PublicKey(TREASURY_ADDRESS !== "YOUR_TREASURY_WALLET_ADDRESS_HERE" ? TREASURY_ADDRESS : wallet?.publicKey?.toBase58() || "11111111111111111111111111111111");

        // Primary check: Check In-Game Game Balance
        if (gameBalance < GAMA_TOTAL_AMOUNT) {
            alert(`Insufficient GAMA! You need ${GAMA_TOTAL_AMOUNT} GAMA in your Game Balance (50% Burn / 50% Treasury).`);
            return;
        }

        setLoading(true);
        try {
            let itemId = "";
            let itemType = "";

            if (type === 'BG') {
                const pool = ['SPACE', 'MATRIX', 'VOLCANO', 'OCEAN', 'FOREST', 'BEDROOM', 'BACKYARD',
                    'MINECRAFT_WORLD', 'CYBER_CITY', 'DESERT_DUNES', 'UNDERWATER', 'CANDY_LAND',
                    'SNOW_PEAK', 'RAINY_WINDOW', 'SUNSET_BLVD', 'TOXIC_WASTE', 'BLUE_SCREEN',
                    'PAPER_NOTEBOOK', 'CIRCUIT_BOARD', 'STARRY_NIGHT', 'HOSPITAL_CLEAN'];
                const available = pool.filter(bg => !ownedBackgrounds.includes(bg));
                if (available.length === 0) {
                    alert("All backgrounds owned!");
                    return;
                }
                itemId = available[Math.floor(Math.random() * available.length)];
                itemType = "Background";
            } else {
                const tiers = ['MATTE_BLACK', 'MATTE_WHITE', 'CLEAR_PURPLE', 'METAL_SILVER', 'STARDUST',
                    'OFF_WHITE', 'GLACIER_ICE', 'ATOMIC_PURPLE', 'JUNGLE_GREEN', 'SMOKE_BLACK',
                    'FIRE_RED', 'ELECTRIC_BLUE', 'PIKACHU_YELLOW', 'HOT_PINK',
                    'MINECRAFT_GRASS', 'GALAXY_SWIRL', 'GOLD_PLATED', 'CARBON_FIBER', 'WOOD_GRAIN', 'WARNING_STRIPE'];
                const available = tiers.filter(d => !ownedDevices.includes(d));
                if (available.length === 0) {
                    alert("All devices owned!");
                    return;
                }
                itemId = available[Math.floor(Math.random() * available.length)];
                itemType = "Device";
            }

            // --- ON-CHAIN MINTING (Metaplex Core) ---
            if (!MOCK_MODE && wallet && umi) {
                try {
                    const collectionVar = type === 'BG' ? BACKGROUND_COLLECTION : DEVICE_COLLECTION;
                    const storageKey = type === 'BG' ? "nftagachi_bg_collection" : "nftagachi_skin_collection";

                    const colAddress = (collectionVar && collectionVar !== "YOUR_BG_COLLECTION_ADDRESS" && collectionVar !== "YOUR_DEVICE_COLLECTION_ADDRESS")
                        ? collectionVar
                        : localStorage.getItem(storageKey) || "";

                    if (colAddress) {
                        const assetSigner = generateSigner(umi);
                        const uriMap = type === 'BG' ? BACKGROUND_URIS : DEVICE_URIS;
                        const uri = uriMap[itemId] || "https://gateway.irys.xyz/PLACEHOLDER";

                        await create(umi, {
                            asset: assetSigner,
                            collection: { publicKey: publicKey(colAddress) },
                            name: `NFTagachi ${itemType}: ${itemId}`,
                            uri: uri,
                        }).sendAndConfirm(umi);

                        console.log(`[ON-CHAIN] Minted ${itemType} NFT: ${assetSigner.publicKey}`);
                    }
                } catch (e) {
                    console.error(`Metaplex ${itemType} Mint Failed:`, e);
                }

                // Process SOL Payment
                try {
                    const transaction = new Transaction().add(
                        web3.SystemProgram.transfer({
                            fromPubkey: wallet.publicKey,
                            toPubkey: treasuryPK,
                            lamports: SOL_COST * web3.LAMPORTS_PER_SOL,
                        })
                    );
                    const signature = await sendTransaction(transaction, connection);
                    await connection.confirmTransaction(signature, 'processed');
                    console.log("[ECONOMY] SOL Payment Confirmed:", signature);
                } catch (paymentErr) {
                    console.error("SOL Payment Failed:", paymentErr);
                }
            } else {
                // Simulation Mode
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log(`[MOCK] Minted ${itemType} ${itemId} (Simulated)`);
            }

            // --- STATE UPDATE ---
            setGameBalance(prev => prev - GAMA_TOTAL_AMOUNT);
            if (type === 'BG') {
                setOwnedBackgrounds(prev => Array.from(new Set([...prev, itemId])));
            } else {
                setOwnedDevices(prev => Array.from(new Set([...prev, itemId])));
            }

            alert(`[SUCCESS] Minted ${itemType}: ${itemId}. \n\n- ${GAMA_TOTAL_AMOUNT.toLocaleString()} GAMA Deducted\n- Real NFT Minted into Collection 💎`);

        } catch (err: any) {
            console.error("Mint failed:", err);
            alert("Mint failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };



    const depositGama = async (amountSol: number) => {
        if (!wallet) {
            alert("Please connect your wallet first!");
            return;
        }

        setLoading(true);
        try {
            // FOR TESTING: We send the SOL to yourself.
            // TODO: Replace with your actual Treasury Address
            const TREASURY_WALLET = wallet.publicKey;

            const transaction = new web3.Transaction().add(
                web3.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: TREASURY_WALLET,
                    lamports: amountSol * web3.LAMPORTS_PER_SOL,
                })
            );

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'processed');

            // Success: Mint GAMA tokens to GAME BALANCE
            const gamaAmount = amountSol * 10000; // 1 SOL = 10,000 GAMA (Adjusted for game economy)
            setGameBalance(prev => prev + gamaAmount);
            alert(`Deposited ${amountSol} SOL for ${gamaAmount.toLocaleString()} GAMA!`);
        } catch (err: any) {
            console.error("Deposit failed:", err);
            alert("Deposit failed: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const withdrawGama = async (amountGama: number) => {
        if (!wallet || !wallet.publicKey) {
            alert("Connect wallet to withdraw!");
            return;
        }
        if (gameBalance < amountGama) {
            alert("Insufficient Game Balance!");
            return;
        }

        setLoading(true);
        try {
            console.log(`[WITHDRAW] Initiating on-chain transfer for ${amountGama} GAMA...`);
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userWallet: wallet.publicKey.toString(),
                    amount: amountGama
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Withdrawal failed");

            // Success
            setGameBalance(prev => prev - amountGama);
            setTokenBalance(prev => prev + amountGama); // Update local cache
            alert(`🎉 [SUCCESS] Withdrew ${amountGama.toLocaleString()} GAMA to your wallet!\n\nTx: ${result.signature.slice(0, 8)}...`);
            console.log("[WITHDRAW] Tx Complete:", result.signature);

        } catch (err: any) {
            console.error("Withdrawal API Failed:", err);
            alert(`Withdrawal Failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const equipItem = (type: 'DEVICE' | 'BG' | 'SHAPE', id: string) => {
        if (type === 'DEVICE') setCurrentDevice(id);
        if (type === 'BG') setCurrentBackground(id);
        if (type === 'SHAPE') setCurrentShape(id as any);

        // Auto-sync to "bake" the new skin/background to on-chain metadata
        setTimeout(() => syncOnChainMetadata(), 500);
    };

    const syncOnChainMetadata = async () => {
        if (!umi || !wallet || !monsterData || !monsterData.mintAddress) return;

        console.log("Syncing baked metadata for:", monsterData.name);
        setLoading(true);
        try {
            const asset = await fetchAssetV1(umi, monsterData.mintAddress as any);

            // Construct Dynamic URI with current state baked in as query params
            const baseUrl = window.location.origin;
            const params = new URLSearchParams({
                skin: currentDevice,
                bg: currentBackground.toString(),
                level: petState.level.toString(),
                hp: petState.hp.toString(),
                maxHp: petState.maxHp.toString(),
                atk: petState.strength.toString(),
                pwr: petState.power.toString(),
                wgt: petState.weight.toString(),
                type: (monsterData as any).type || 'NEUTRAL',
                tier: (monsterData as any).tier || 'COMMON'
            });

            const uri = `${baseUrl}/api/metadata/${monsterData.id}?${params.toString()}`;
            console.log("Baking Metadata URI:", uri);

            await updateV1(umi, {
                asset: asset.publicKey,
                newUri: uri,
            }).sendAndConfirm(umi);

            console.log("On-chain metadata baked successfully!");
        } catch (err) {
            console.error("Failed to bake on-chain metadata:", err);
        } finally {
            setLoading(false);
        }
    };




    const completeBattle = (win: boolean, xpGained: number, mode: 'CLAIM' | 'BURN' = 'CLAIM') => {
        if (!monsterData) return;

        const currentStats = monsterData.baseStats;
        let newStats = { ...currentStats };

        if (!win) {
            // Take Damage on Loss
            newStats.hp = Math.max(0, newStats.hp - 20);

            // Deduction for Loss (Optional "Smart Wallet" logic)
            setGameBalance(prev => Math.max(0, prev - 25));
            alert("Battle Lost! Your monster took damage. (-25 GAMA Burn)");
        } else {
            const { newLevel, newXp, didLevelUp } = calculateLevelUp(currentStats.level, currentStats.exp, xpGained);
            newStats = { ...newStats, level: newLevel, exp: newXp };

            // REWARD LOGIC
            const battleReward = rewardSettings.battle;

            if (mode === 'CLAIM') {
                setGameBalance(prev => prev + battleReward);
                setTreasuryStats(prev => ({ ...prev, balance: Math.max(0, prev.balance - battleReward), totalPaidOut: prev.totalPaidOut + battleReward }));
                console.log(`[ECONOMY] ${battleReward} GAMA Claimed to Game Balance`);
            } else {
                // BURN FOR PRESTIGE: Permanent Stat Boost
                const boostType = Math.random() > 0.5 ? 'hp' : 'atk';
                if (boostType === 'hp') {
                    newStats.maxHp += 2;
                    newStats.hp += 2;
                    alert(`🔥 PRESTIGE! ${battleReward} GAMA Burned. Permanent +2 MAX HP!`);
                } else {
                    newStats.atk += 1;
                    alert(`🔥 PRESTIGE! ${battleReward} GAMA Burned. Permanent +1 ATK!`);
                }
                console.log(`[ECONOMY] ${battleReward} GAMA Burned for Prestige Boost`);
            }

            if (didLevelUp) {
                // Boost Stats by 10%
                newStats.hp = Math.floor(newStats.hp * 1.1);
                newStats.maxHp = Math.floor(newStats.maxHp * 1.1);
                newStats.atk = Math.floor(newStats.atk * 1.1);
                newStats.def = Math.floor(newStats.def * 1.1);
                newStats.spd = Math.floor(newStats.spd * 1.1);

                alert(`VICTORY! +${battleReward} GAMA! LEVEL UP! You are now Level ${newLevel}! Stats increased!`);
            } else {
                alert(`VICTORY! +${battleReward} GAMA! Gained ${xpGained} XP!`);
            }
        }

        setMonsterData(prev => prev ? ({ ...prev, baseStats: newStats }) : null);
        setPetState(prev => ({ ...prev, hp: newStats.hp, maxHp: newStats.maxHp }));
    };

    return {
        // State
        wallet,
        gameState,
        petState,
        inventoryOpen,
        setInventoryOpen,
        ownedDevices,
        ownedBackgrounds,
        currentDevice,
        currentShape,
        currentBackground,
        monsterData,
        bgId,
        loading,
        boostActive,
        tokenBalance,
        gameBalance,
        solBalance,
        treasuryStats,
        rewardSettings,
        swapOpen,
        setSwapOpen,

        // Actions
        mintItem,
        equipItem,
        performAction,
        buyGama: depositGama, // Alias for backward compatibility
        depositGama, // SOL -> GAME
        depositGamaFromWallet, // GAMA -> GAME
        withdrawGama,
        completeBattle,
        syncOnChainMetadata,
        setGameState, // Exported to reset state on loop completion

        // Auth
        ownedMonsters,
        switchMonster,
        isAuthenticating,
        mintTestMonster,
        isWhale,
        holderHpMultiplier
    };
};
