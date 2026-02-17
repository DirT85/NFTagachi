"use client";

import { useState, useEffect } from "react";
import { useMetaplex } from "../../../hooks/useMetaplex";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { DEVICE_URIS } from "../../../utils/DeviceMetadata";
import { BACKGROUND_URIS } from "../../../utils/BackgroundMetadata";
import { MONSTER_URIS } from "../../../utils/MonsterMetadata";
import { getMonsterData } from "../../../utils/GameLogic";
import { createCollection, create } from "@metaplex-foundation/mpl-core";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { Device } from "../../../components/Device";
import { LcdBackground } from "../../../components/LcdBackground";
import { Sprite } from "../../../components/Sprite";
import { Copy, Info, Layers, Monitor, Gamepad2, Users, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminMintPage() {
    const wallet = useWallet();
    const umi = useMetaplex();
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'DEVICE' | 'BACKGROUNDS' | 'MONSTERS'>('DEVICE');

    // State
    const [deviceCollection, setDeviceCollection] = useState<string | null>(null);
    const [bgCollection, setBgCollection] = useState<string | null>(null);
    const [monsterCollection, setMonsterCollection] = useState<string | null>(null);
    const [mintedItems, setMintedItems] = useState<Record<string, string>>({});
    const [isprocessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const col1 = localStorage.getItem("nftagachi_skin_collection");
        if (col1) setDeviceCollection(col1);

        const col2 = localStorage.getItem("nftagachi_bg_collection");
        if (col2) setBgCollection(col2);

        const col3 = localStorage.getItem("nftagachi_monster_collection");
        if (col3) setMonsterCollection(col3);
    }, []);

    const log = (msg: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!mounted) return <div className="p-8 bg-gray-900 text-white font-mono">Loading Admin Mint...</div>;

    // 1. Create Collection
    const createCollectionNft = async (type: 'DEVICE' | 'BACKGROUNDS' | 'MONSTERS') => {
        if (!umi) return;
        setIsProcessing(true);
        try {
            let name = "NFTagachi Devices Gen1";
            if (type === 'BACKGROUNDS') name = "NFTagachi Backgrounds Gen1";
            if (type === 'MONSTERS') name = "NFTagachi Species Gen1";

            log(`🏗️ Creating Static Collection: '${name}'...`);

            const collectionSigner = generateSigner(umi);

            await createCollection(umi, {
                collection: collectionSigner,
                name: name,
                uri: "https://arweave.net/COLLECTION_METADATA_PLACEHOLDER",
                plugins: [{ type: "PermanentFreezeDelegate", authority: { type: "None" }, frozen: false }]
            }).sendAndConfirm(umi);

            log(`✅ Collection Created! Address: ${collectionSigner.publicKey}`);

            if (type === 'DEVICE') {
                setDeviceCollection(collectionSigner.publicKey.toString());
                localStorage.setItem("nftagachi_skin_collection", collectionSigner.publicKey.toString());
            } else if (type === 'BACKGROUNDS') {
                setBgCollection(collectionSigner.publicKey.toString());
                localStorage.setItem("nftagachi_bg_collection", collectionSigner.publicKey.toString());
            } else {
                setMonsterCollection(collectionSigner.publicKey.toString());
                localStorage.setItem("nftagachi_monster_collection", collectionSigner.publicKey.toString());
            }

        } catch (e: any) {
            log(`❌ Error: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // 2. Mint Item
    const mintItem = async (id: string, type: 'DEVICE' | 'BACKGROUNDS' | 'MONSTERS') => {
        let collectionAddr = deviceCollection;
        let uriMap: Record<string, string> = DEVICE_URIS;
        let namePrefix = "Device";

        if (type === 'BACKGROUNDS') {
            collectionAddr = bgCollection;
            uriMap = BACKGROUND_URIS;
            namePrefix = "Background";
        } else if (type === 'MONSTERS') {
            collectionAddr = monsterCollection;
            uriMap = MONSTER_URIS;
            namePrefix = "Species";
        }

        if (!umi || !collectionAddr) return log("❌ No Collection Address.");
        const uri = uriMap[id];
        if (!uri) return log(`❌ No URI found for ${id}.`);

        setIsProcessing(true);
        try {
            log(`🔨 Minting ${id}...`);
            const assetSigner = generateSigner(umi);

            await create(umi, {
                asset: assetSigner,
                collection: { publicKey: publicKey(collectionAddr) },
                name: `NFTagachi ${namePrefix}: ${id}`,
                uri: uri,
            }).sendAndConfirm(umi);

            log(`✅ Minted ${id}: ${assetSigner.publicKey}`);
            setMintedItems(p => ({ ...p, [id]: assetSigner.publicKey.toString() }));

        } catch (e: any) {
            log(`❌ Failed: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // 3. Mint All (Batch)
    const mintAll = async (type: 'DEVICE' | 'BACKGROUNDS' | 'MONSTERS') => {
        const uriMap = type === 'DEVICE' ? DEVICE_URIS : (type === 'BACKGROUNDS' ? BACKGROUND_URIS : MONSTER_URIS);
        const keys = Object.keys(uriMap);
        for (const id of keys) {
            await mintItem(id, type);
            await new Promise(r => setTimeout(r, 1000));
        }
    };

    const activeCollection = activeTab === 'DEVICE' ? deviceCollection : (activeTab === 'BACKGROUNDS' ? bgCollection : monsterCollection);
    const activeUris = activeTab === 'DEVICE' ? DEVICE_URIS : (activeTab === 'BACKGROUNDS' ? BACKGROUND_URIS : MONSTER_URIS);

    const pillarInfo = {
        'DEVICE': {
            title: "Digital Consoles",
            desc: "The hardware skins players use to interact with their pets. These change the entire UI frame.",
            color: "text-green-400",
            icon: <Gamepad2 className="text-green-400" size={32} />
        },
        'BACKGROUNDS': {
            title: "Living Environments",
            desc: "The 8-bit LCD worlds your pets inhabit. These are equippable via the Inventory.",
            color: "text-purple-400",
            icon: <Monitor className="text-purple-400" size={32} />
        },
        'MONSTERS': {
            title: "Pet Species",
            desc: "The actual 1,000 Monster NFTs. Owners of these are the only ones who can play.",
            color: "text-red-400",
            icon: <Users className="text-red-400" size={32} />
        }
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Layers className="text-yellow-500" size={32} />
                            <h1 className="text-4xl font-black text-yellow-500 tracking-tighter italic">
                                THE THREE PILLARS
                            </h1>
                        </div>
                        <p className="text-gray-400 text-sm max-w-xl uppercase tracking-widest font-black opacity-60 leading-relaxed">
                            Every NFTagachi is made of three distinct collections.
                            <br />
                            <span className="text-white">You must create a "Master Collection" for each before minting.</span>
                        </p>
                    </div>
                    <WalletMultiButton className="!bg-yellow-500 !text-black !font-black !rounded-full hover:!scale-105 !transition-transform" />
                </div>

                {/* GUIDANCE HUB */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {(Object.keys(pillarInfo) as Array<keyof typeof pillarInfo>).map(key => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`p-6 bg-black/40 border-2 rounded-3xl text-left transition-all relative overflow-hidden group ${activeTab === key ? 'border-yellow-500 ring-4 ring-yellow-500/20 bg-black/60 scale-105' : 'border-white/5 hover:border-white/20'}`}
                        >
                            <div className="mb-4">{pillarInfo[key].icon}</div>
                            <h3 className={`text-xl font-black uppercase mb-1 ${pillarInfo[key].color}`}>{pillarInfo[key].title}</h3>
                            <p className="text-[10px] text-white/40 font-bold leading-tight uppercase">{pillarInfo[key].desc}</p>

                            {/* Status Indicator */}
                            <div className="mt-4 flex items-center gap-2">
                                {localStorage.getItem(key === 'DEVICE' ? "nftagachi_skin_collection" : (key === 'BACKGROUNDS' ? "nftagachi_bg_collection" : "nftagachi_monster_collection")) ? (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full">
                                        <CheckCircle2 size={10} className="text-green-500" />
                                        <span className="text-[8px] font-black text-green-500 uppercase">Deployed</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 rounded-full">
                                        <AlertCircle size={10} className="text-red-500" />
                                        <span className="text-[8px] font-black text-red-500 uppercase">Required</span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* ACTIVE PILLAR WORKSPACE */}
                <div className="bg-black/60 rounded-[40px] border border-white/10 p-10 backdrop-blur-3xl shadow-2xl mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
                        <div className="flex-1">
                            <h2 className={`text-3xl font-black uppercase mb-2 ${pillarInfo[activeTab].color}`}>
                                Configure {activeTab}s
                            </h2>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                                {activeCollection ?
                                    "Collection address locked. You can now mint individual items or batch mint the entire set." :
                                    "Begin by creating the Master Collection on the Solana Network."}
                            </p>
                        </div>

                        {activeCollection && (
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Collection Address</div>
                                <div className="flex items-center gap-3 bg-white/5 p-2 pr-1 rounded-2xl border border-white/5 group">
                                    <span className="text-[10px] font-mono text-white/60 px-2 max-w-[200px] truncate">{activeCollection}</span>
                                    <button
                                        onClick={() => copyToClipboard(activeCollection, activeTab)}
                                        className="p-2 bg-white/10 hover:bg-yellow-500 hover:text-black rounded-xl transition-all"
                                    >
                                        {copied === activeTab ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 1: Collection */}
                    <div className="mb-12">
                        {!activeCollection ? (
                            <div className="p-8 bg-black/40 border-2 border-dashed border-white/10 rounded-3xl text-center">
                                <h4 className="text-lg font-black uppercase text-white/80 mb-4 italic">Action Required: Deploy Master Collection</h4>
                                <button
                                    onClick={() => createCollectionNft(activeTab)}
                                    disabled={isprocessing}
                                    className={`px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 transition-all text-white ${activeTab === 'DEVICE' ? 'bg-green-600 shadow-green-500/20' :
                                        activeTab === 'BACKGROUNDS' ? 'bg-purple-600 shadow-purple-500/20' : 'bg-red-600 shadow-red-500/20'
                                        }`}
                                >
                                    {isprocessing ? "Deploying..." : `Create ${activeTab} Collection`}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Batch Mint */}
                                <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl flex flex-col items-center justify-center text-center">
                                    <h4 className="text-blue-400 font-black uppercase text-sm mb-2 italic">Factory Batch</h4>
                                    <p className="text-[10px] font-bold text-white/40 uppercase mb-6">Mint every single {activeTab.toLowerCase()} in the generator map automatically.</p>
                                    <button
                                        onClick={() => mintAll(activeTab)}
                                        disabled={isprocessing}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-black text-[10px] uppercase shadow-xl shadow-blue-500/20 transition-all"
                                    >
                                        Execute Batch Mint
                                    </button>
                                </div>

                                {/* Guidance Card */}
                                <div className="p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Info className="text-yellow-500" size={18} />
                                        <h4 className="text-yellow-500 font-black uppercase text-sm italic">Inventory Logic</h4>
                                    </div>
                                    <p className="text-[10px] font-bold text-white/60 uppercase leading-relaxed">
                                        Once minted, these items will automatically appear in anyone's <span className="text-white">Backpack</span> if they hold the NFT. The game engine uses the collection address to filter skins from monsters.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Assets */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {Object.keys(activeUris).map(id => {
                            const monsterData = activeTab === 'MONSTERS' ? getMonsterData(Number(id)) : null;

                            return (
                                <div key={id} className={`bg-black/40 p-6 rounded-3xl border transition-all flex flex-col items-center group relative overflow-hidden ${mintedItems[id] ? 'border-green-500/40 opacity-60' : 'border-white/5 hover:border-white/20'}`}>
                                    <div className="scale-0.5 origin-center mb-[-40px] mt-[-40px] w-full flex justify-center grayscale group-hover:grayscale-0 transition-all">
                                        {activeTab === 'DEVICE' ? (
                                            <Device device={id} hideLogo>
                                                <div className="w-full h-full bg-black/20" />
                                            </Device>
                                        ) : activeTab === 'BACKGROUNDS' ? (
                                            <div className="w-96 h-64 relative border-4 border-black overflow-hidden scale-50">
                                                <LcdBackground id={id} />
                                            </div>
                                        ) : (
                                            <div className="w-64 h-64 relative bg-gray-800 border-4 border-black/50 overflow-hidden flex items-center justify-center rounded-3xl">
                                                <div className="scale-150">
                                                    <Sprite id={Number(id)} spriteSheet={monsterData?.spriteSheet} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`font-black text-[10px] mb-4 mt-6 uppercase ${mintedItems[id] ? 'text-green-400' : 'text-white/40'}`}>{id}</div>

                                    {mintedItems[id] ? (
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 size={10} className="text-green-500" />
                                            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">On-Chain</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => mintItem(id, activeTab)}
                                            disabled={isprocessing || !activeCollection}
                                            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest"
                                        >
                                            Mint Core
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SYSTEM LOGS */}
                <div className="bg-black/80 rounded-3xl border border-white/10 overflow-hidden">
                    <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Chain Response Stream</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-75" />
                        </div>
                    </div>
                    <div className="p-6 h-48 overflow-y-auto font-mono text-[10px] text-white/60 custom-scrollbar">
                        {logs.length === 0 ? (
                            <div className="opacity-20 uppercase font-black tracking-widest text-center py-10 italic">Awaiting Transaction...</div>
                        ) : (
                            logs.map((l, i) => (
                                <div key={i} className="mb-2 border-l-2 border-yellow-500/20 pl-3 py-1 bg-white/5 rounded-r-md">
                                    {l}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
