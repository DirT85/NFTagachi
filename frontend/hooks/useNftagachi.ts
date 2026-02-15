"use client";

import { useEffect, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../idl.json";
import { getMonsterData, MonsterData } from '../utils/GameLogic';
import { calculateLevelUp } from '../utils/BattleLogic';

import { generateSigner, transactionBuilder, percentAmount } from '@metaplex-foundation/umi';

import { create, fetchAssetsByOwner, updateV1, fetchAssetV1 } from '@metaplex-foundation/mpl-core';
import { useMetaplex } from './useMetaplex';

const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Set this to FALSE when you have deployed your contract to Devnet!
const MOCK_MODE = true;

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

                // 2. Fetch Metaplex Core Assets (Admin Minted)
                let coreSkins: string[] = [];
                let coreBgs: string[] = [];
                let coreMonsters: MonsterData[] = [];

                if (umi) {
                    try {
                        const assets = await fetchAssetsByOwner(umi, wallet.publicKey.toString());
                        assets.forEach(asset => {
                            if (asset.name.startsWith("NFTagachi Skin: ")) {
                                coreSkins.push(asset.name.replace("NFTagachi Skin: ", ""));
                            }
                            if (asset.name.startsWith("NFTagachi Background: ")) {
                                coreBgs.push(asset.name.replace("NFTagachi Background: ", ""));
                            }
                            if (asset.name.startsWith("NFTagachi Species: ")) {
                                const idStr = asset.name.replace("NFTagachi Species: ", "");
                                const id = parseInt(idStr);
                                if (!isNaN(id)) {
                                    const baseData = getMonsterData(id);
                                    if (baseData) {
                                        coreMonsters.push({
                                            ...baseData,
                                            mintAddress: asset.publicKey.toString(),
                                            baseStats: {
                                                level: 1,
                                                exp: 0,
                                                hp: baseData.baseStats.hp,
                                                maxHp: baseData.baseStats.hp,
                                                atk: baseData.baseStats.atk,
                                                def: baseData.baseStats.def,
                                                spd: baseData.baseStats.spd,
                                                hunger: 50,
                                                happiness: 50,
                                                energy: 100,
                                                waste: 0,
                                                weight: 20,
                                                power: 10,
                                                bodyCondition: 'NORMAL',
                                            }
                                        });
                                    }
                                }
                            }
                        });
                        console.log("Fetched Metaplex Assets:", coreSkins, coreBgs, coreMonsters.length);
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

                // 4. Fetch GAMA Token Balance
                if (wallet.publicKey) {
                    try {
                        const globalAccounts = await program.account.globalState.all();
                        if (globalAccounts.length > 0) {
                            const rewardMint = globalAccounts[0].account.rewardMint;
                            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
                                mint: rewardMint
                            });
                            if (tokenAccounts.value.length > 0) {
                                const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                                setTokenBalance(balance || 0);
                            }
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
        if (ownedMonsters.length > 0 && !monsterData) {
            setMonsterData(ownedMonsters[0]);
        }
    }, [ownedMonsters, monsterData]);

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
    const [boostActive, setBoostActive] = useState(false);

    // PERSISTENCE: Load Game Balance & History on Mount
    // PERSISTENCE: Load Game Balance & History on Mount
    useEffect(() => {
        const saved = localStorage.getItem('nftagachi_gameBalance_v2');
        if (saved) {
            const parsed = parseInt(saved, 10);
            // FORCE FIX: If user has the old hardcoded 150,000, nuke it.
            if (parsed === 150000) {
                console.log("Found glitch 150k balance. Resetting to 0.");
                setGameBalance(0);
                localStorage.setItem('nftagachi_gameBalance_v2', '0');
            } else {
                setGameBalance(parsed);
            }
        } else {
            // New User: Start with 0. Starter Pack (1000 G) is granted upon connecting a Monster.
            setGameBalance(0);
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

    // ... (existing sync logic)
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
                weight: monsterData.baseStats.weight ?? (isWhale ? 30 : 20),
                power: monsterData.baseStats.power ?? (isWhale ? 25 : 10),
                maxHp: monsterData.baseStats.maxHp,
                hp: monsterData.baseStats.hp,
                level: monsterData.baseStats.level,
                exp: monsterData.baseStats.exp
            });
        }
    }, [monsterData]);

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
                setGameBalance(prev => prev - 10);
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
                setGameBalance(prev => prev - 15);
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
                if (newState.waste > 0) {
                    setGameBalance(prev => prev + 5);
                    newState.waste -= 1;
                    newState.happiness = Math.min(100, newState.happiness + 20);
                    setGameState("HAPPY");
                }
            } else if (action === 'revive') {
                if (gameBalance < 50) { alert("Insufficient Game Balance (50 GAMA required)!"); setLoading(false); return; }
                setGameBalance(prev => prev - 50);
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
        // ALLOW GUEST MINTING IN MOCK MODE
        if ((!wallet || !program) && !MOCK_MODE) {
            alert("Connect wallet to mint on-chain!");
            return;
        }

        const SOL_COST = 0.01;
        const GAMA_BURN_AMOUNT = 1000;

        // Check SOL Balance (approximate, since we don't track SOL in state efficiently yet)
        // Assuming wallet has funds if they are connected, rely on wallet simulation to fail if not.

        if (tokenBalance < GAMA_BURN_AMOUNT) {
            alert(`Insufficient GAMA! You need ${GAMA_BURN_AMOUNT} GAMA to burn.`);
            return;
        }

        setLoading(true);
        try {
            // TREASURY WALLET (For buying GAMA/Airdrops)
            // FOR TESTING: We send the SOL to yourself (the connected wallet) so the transaction is valid.
            // TODO: Replace this with your actual Cold/Treasury Wallet Address
            // If Guest (no wallet), we skip this.
            const TREASURY_PUBKEY = wallet ? wallet.publicKey : null;

            // 1. Prepare SOL Transfer Instruction (Only if wallet exists)
            let transferSolIx = null;
            if (wallet && TREASURY_PUBKEY) {
                transferSolIx = web3.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: TREASURY_PUBKEY,
                    lamports: SOL_COST * web3.LAMPORTS_PER_SOL
                });
            }

            // 2. Prepare GAMA Burn Instruction (If we had the real mint)
            // For now, we simulate the burn by "checking" logic.

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
                const randomBg = available[Math.floor(Math.random() * available.length)];

                // MINT ON-CHAIN
                if (!MOCK_MODE && wallet && program && transferSolIx) {
                    const seed = `bg_${Date.now()}`;
                    const [bgPda] = await web3.PublicKey.findProgramAddress(
                        [
                            Buffer.from("background"),
                            wallet.publicKey.toBuffer(),
                            Buffer.from(seed)
                        ],
                        program.programId
                    );

                    await program.methods
                        .mintBackground(seed, randomBg, "RARE")
                        .accounts({
                            background: bgPda,
                            user: wallet.publicKey,
                            systemProgram: web3.SystemProgram.programId,
                        })
                        .preInstructions([transferSolIx]) // Attach SOL Transfer
                        .rpc();
                } else {
                    // Simulate On-Chain Delay
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    console.log(`[MOCK/GUEST] Minted Background ${randomBg} (Simulated)`);
                }

                // ECONOMY UPDATE: DUAL CURRENCY COST
                // Cost: 1000 GAMA + 0.01 SOL
                const GAMA_COST = 1000;
                const SOL_COST = 0.01;

                if (gameBalance < GAMA_COST) {
                    alert(`Insufficient GAMA! You need ${GAMA_COST.toLocaleString()} G to mint.`);
                    setLoading(false);
                    return;
                }

                // Process SOL Payment
                if (wallet) {
                    try {
                        const TREASURY_WALLET = wallet.publicKey;
                        const transaction = new web3.Transaction().add(
                            web3.SystemProgram.transfer({
                                fromPubkey: wallet.publicKey,
                                toPubkey: TREASURY_WALLET,
                                lamports: SOL_COST * web3.LAMPORTS_PER_SOL,
                            })
                        );
                        const signature = await sendTransaction(transaction, connection);
                        await connection.confirmTransaction(signature, 'processed');
                    } catch (paymentErr) {
                        console.error("SOL Payment Failed:", paymentErr);
                        alert("Mint Cancelled: SOL Payment Failed or Rejected.");
                        setLoading(false);
                        return;
                    }
                }

                setGameBalance(prev => prev - GAMA_COST);
                setOwnedBackgrounds(prev => {
                    const next = [...prev, randomBg];
                    return Array.from(new Set(next));
                });
                alert(`[SUCCESS] Minted Background: ${randomBg}. \n\n- ${GAMA_COST.toLocaleString()} GAMA Deducted\n- ${SOL_COST} SOL Sent to Treasury 💎`);
            }

            if (type === 'DEVICE') {
                const tiers = ['MATTE_BLACK', 'MATTE_WHITE', 'CLEAR_PURPLE', 'METAL_SILVER', 'STARDUST',
                    'OFF_WHITE', 'GLACIER_ICE', 'ATOMIC_PURPLE', 'JUNGLE_GREEN', 'SMOKE_BLACK',
                    'FIRE_RED', 'ELECTRIC_BLUE', 'PIKACHU_YELLOW', 'HOT_PINK',
                    'MINECRAFT_GRASS', 'GALAXY_SWIRL', 'GOLD_PLATED', 'CARBON_FIBER', 'WOOD_GRAIN', 'WARNING_STRIPE'];
                const available = tiers.filter(d => !ownedDevices.includes(d));
                if (available.length === 0) {
                    alert("All devices owned!");
                    return;
                }
                const randomDev = available[Math.floor(Math.random() * available.length)];

                // MINT ON-CHAIN (PDA + Metaplex Core)
                if (!MOCK_MODE && wallet && program && transferSolIx) {
                    const seed = `skin_${Date.now()}`;
                    const [skinPda] = await web3.PublicKey.findProgramAddress(
                        [
                            Buffer.from("skin"),
                            wallet.publicKey.toBuffer(),
                            Buffer.from(seed)
                        ],
                        program.programId
                    );

                    // 1. ANCHOR: Mint "Game Item" PDA (Backend Logic)
                    const tx = await program.methods
                        .mintSkin(seed, randomDev, "EPIC")
                        .accounts({
                            skin: skinPda,
                            user: wallet.publicKey,
                            systemProgram: web3.SystemProgram.programId,
                        })
                        .preInstructions([transferSolIx]) // Attach SOL Transfer
                        .transaction();

                    // Send Anchor Tx first (Payment + PDA)
                    const sig = await sendTransaction(tx, connection);
                    await connection.confirmTransaction(sig, 'confirmed');

                    // 2. METAPLEX: Mint Real NFT (Asset)
                    // Note: Ideally this would be done by the program or backend to ensure atomicity,
                    // but for this phase we do it on frontend.
                    try {
                        if (umi) {
                            const assetSigner = generateSigner(umi);
                            console.log("Minting Metaplex Asset:", assetSigner.publicKey.toString());

                            await create(umi, {
                                asset: assetSigner,
                                name: `NFTagachi Skin: ${randomDev}`,
                                uri: 'https://arweave.net/PLACEHOLDER_URI', // TODO: Dynamic URIs
                            }).sendAndConfirm(umi);

                            alert(`Minted Real NFT! ${assetSigner.publicKey.toString()}`);
                        }
                    } catch (e) {
                        console.error("Metaplex Mint Failed (PDA success):", e);
                    }

                } else {
                    // Simulate On-Chain Delay
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    console.log(`[MOCK/GUEST] Minted Skin ${randomDev} (Simulated)`);
                }

                // ECONOMY UPDATE:
                // Cost: 1000 GAMA
                // Split: 500 Burn, 500 Smart Wallet (Treasury)
                const MINT_COST = 1000;

                if (gameBalance < MINT_COST) {
                    alert("Insufficient GAMA! You need 1,000 G to mint.");
                    setLoading(false);
                    return;
                }

                setGameBalance(prev => prev - MINT_COST);
                // In a real contract: 500 is burned, 500 sent to Treasury wallet.
                // On frontend strict mode: We just deduct 1000. 
                // The "Burn" and "Treasury" happening is implicit in the deduction for now until we wire the token transfer.

                setOwnedDevices(prev => {
                    const next = [...prev, randomDev];
                    return Array.from(new Set(next));
                });
                alert(`[SUCCESS] Minted Skin: ${randomDev}. \n\n- 1,000 GAMA Deducted\n(500 Burned 🔥 / 500 Rewards 💎)`);
            }
        } catch (err: any) {
            console.error("Mint failed:", err);
            alert("Mint failed: " + err.message);
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
            // This allows the metadata API to return dynamic traits and a dynamic "baked" image
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
        if (gameBalance < amountGama) {
            alert("Insufficient Game Balance!");
            return;
        }

        // Simulation for now
        setLoading(true);
        setTimeout(() => {
            setGameBalance(prev => prev - amountGama);
            setTokenBalance(prev => prev + amountGama); // Move to "Wallet" (Simulation)
            setLoading(false);
            alert(`Withdrew ${amountGama.toLocaleString()} GAMA to Wallet!`);
        }, 1500);
    };

    const completeBattle = (win: boolean, xpGained: number) => {
        if (!monsterData) return;

        const currentStats = monsterData.baseStats;
        let newStats = { ...currentStats };

        if (!win) {
            // Take Damage on Loss
            newStats.hp = Math.max(0, newStats.hp - 20);

            // Deduction for Loss (Optional "Smart Wallet" logic)
            setGameBalance(prev => Math.max(0, prev - 25));
            alert("Battle Lost! Your monster took damage. (-25 GAMA)");
        } else {
            const { newLevel, newXp, didLevelUp } = calculateLevelUp(currentStats.level, currentStats.exp, xpGained);
            newStats = { ...newStats, level: newLevel, exp: newXp };

            // Reward for Win
            setGameBalance(prev => prev + 100);

            if (didLevelUp) {
                // Boost Stats by 10%
                newStats.hp = Math.floor(newStats.hp * 1.1);
                newStats.maxHp = Math.floor(newStats.maxHp * 1.1);
                newStats.atk = Math.floor(newStats.atk * 1.1);
                newStats.def = Math.floor(newStats.def * 1.1);
                newStats.spd = Math.floor(newStats.spd * 1.1);

                alert(`VICTORY! +100 GAMA! LEVEL UP! You are now Level ${newLevel}! Stats increased!`);
            } else {
                alert(`VICTORY! +100 GAMA! Gained ${xpGained} XP!`);
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
        swapOpen,
        setSwapOpen,

        // Actions
        mintItem,
        equipItem,
        performAction,
        buyGama: depositGama, // Alias for backward compatibility
        depositGama,
        withdrawGama,
        completeBattle,
        syncOnChainMetadata,
        setGameState, // Exported to reset state on loop completion

        // Auth
        ownedMonsters,
        switchMonster,
        isAuthenticating
    };
};
