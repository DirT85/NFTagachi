"use client";

import { useState, useEffect } from "react";
import { useMetaplex } from "../../../hooks/useMetaplex";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SKIN_URIS } from "../../../utils/SkinMetadata";
import { BACKGROUND_URIS } from "../../../utils/BackgroundMetadata";
import { MONSTER_URIS } from "../../../utils/MonsterMetadata";
import { getMonsterData } from "../../../utils/GameLogic";
import { createCollection, create, fetchCollection } from "@metaplex-foundation/mpl-core";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { Device } from "../../../components/Device";
import { LcdBackground } from "../../../components/LcdBackground";
import { Sprite } from "../../../components/Sprite";

export default function AdminMintPage() {
    const wallet = useWallet();
    const umi = useMetaplex();
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'SKINS' | 'BACKGROUNDS' | 'MONSTERS'>('SKINS');

    // State
    const [skinCollection, setSkinCollection] = useState<string | null>(null);
    const [bgCollection, setBgCollection] = useState<string | null>(null);
    const [monsterCollection, setMonsterCollection] = useState<string | null>(null);
    const [mintedItems, setMintedItems] = useState<Record<string, string>>({});
    const [isprocessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setMounted(true);
        const col1 = localStorage.getItem("nftagachi_skin_collection");
        if (col1) setSkinCollection(col1);

        const col2 = localStorage.getItem("nftagachi_bg_collection");
        if (col2) setBgCollection(col2);

        const col3 = localStorage.getItem("nftagachi_monster_collection");
        if (col3) setMonsterCollection(col3);
    }, []);

    const log = (msg: string) => setLogs(p => [msg, ...p]);

    if (!mounted) return <div className="p-8 bg-gray-900 text-white font-mono">Loading Admin Mint...</div>;

    // 1. Create Collection
    const createCollectionNft = async (type: 'SKINS' | 'BACKGROUNDS' | 'MONSTERS') => {
        if (!umi) return;
        setIsProcessing(true);
        try {
            let name = "NFTagachi Skins Gen1";
            if (type === 'BACKGROUNDS') name = "NFTagachi Backgrounds Gen1";
            if (type === 'MONSTERS') name = "NFTagachi Species Gen1";

            log(`🏗️ Creating Collection: '${name}'...`);

            const collectionSigner = generateSigner(umi);

            await createCollection(umi, {
                collection: collectionSigner,
                name: name,
                uri: "https://arweave.net/COLLECTION_METADATA_PLACEHOLDER",
                plugins: [{ type: "PermanentFreezeDelegate", authority: { type: "None" }, frozen: false }]
            }).sendAndConfirm(umi);

            log(`✅ Collection Created! Address: ${collectionSigner.publicKey}`);

            if (type === 'SKINS') {
                setSkinCollection(collectionSigner.publicKey.toString());
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
    const mintItem = async (id: string, type: 'SKINS' | 'BACKGROUNDS' | 'MONSTERS') => {
        let collectionAddr = skinCollection;
        let uriMap: Record<string, string> = SKIN_URIS;
        let namePrefix = "Skin";

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
    const mintAll = async (type: 'SKINS' | 'BACKGROUNDS' | 'MONSTERS') => {
        const uriMap = type === 'SKINS' ? SKIN_URIS : (type === 'BACKGROUNDS' ? BACKGROUND_URIS : MONSTER_URIS);
        for (const id of Object.keys(uriMap)) {
            await mintItem(id, type);
            await new Promise(r => setTimeout(r, 1000));
        }
    };

    const activeCollection = activeTab === 'SKINS' ? skinCollection : (activeTab === 'BACKGROUNDS' ? bgCollection : monsterCollection);
    const activeUris = activeTab === 'SKINS' ? SKIN_URIS : (activeTab === 'BACKGROUNDS' ? BACKGROUND_URIS : MONSTER_URIS);

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-yellow-500">
                            Mint Master Editions
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Mint the official on-chain copies of each asset.
                        </p>
                    </div>
                    <WalletMultiButton />
                </div>

                {/* TABS */}
                <div className="flex gap-4 mb-6 border-b border-gray-700 pb-1">
                    <button
                        onClick={() => setActiveTab('SKINS')}
                        className={`px-4 py-2 font-bold ${activeTab === 'SKINS' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500'}`}
                    >
                        SKINS
                    </button>
                    <button
                        onClick={() => setActiveTab('BACKGROUNDS')}
                        className={`px-4 py-2 font-bold ${activeTab === 'BACKGROUNDS' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500'}`}
                    >
                        BACKGROUNDS
                    </button>
                    <button
                        onClick={() => setActiveTab('MONSTERS')}
                        className={`px-4 py-2 font-bold ${activeTab === 'MONSTERS' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-500'}`}
                    >
                        MONSTERS
                    </button>
                </div>

                {/* STEP 1: COLLECTION */}
                <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Step 1: Create Collection</h2>
                    {activeCollection ? (
                        <div className="text-green-400 break-all">
                            ✅ Active Collection: <span className="text-white font-mono bg-black px-2 py-1 rounded">
                                {activeCollection}
                            </span>
                        </div>
                    ) : (
                        <button
                            onClick={() => createCollectionNft(activeTab)}
                            disabled={isprocessing}
                            className={`px-6 py-2 rounded font-bold ${activeTab === 'SKINS' ? 'bg-green-600' :
                                activeTab === 'BACKGROUNDS' ? 'bg-purple-600' : 'bg-red-600'
                                }`}
                        >
                            Create "{activeTab}" Collection
                        </button>
                    )}
                </div>

                {/* STEP 2: MINT ITEMS */}
                <div className="mb-8">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-xl font-bold">Step 2: Mint Assets</h2>
                        {activeCollection && (
                            <button
                                onClick={() => mintAll(activeTab)}
                                disabled={isprocessing}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold"
                            >
                                Mint ALL (Batch)
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.keys(activeUris).length === 0 ? (
                            <div className="col-span-4 text-center p-12 border-2 border-dashed border-gray-700 rounded-lg">
                                <p className="text-gray-400 mb-4">No {activeTab.toLowerCase()} found to mint.</p>
                                <a
                                    href={activeTab === 'MONSTERS' ? '/admin/monsters' : activeTab === 'BACKGROUNDS' ? '/admin/backgrounds' : '#'}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white inline-block"
                                >
                                    Go to {activeTab === 'MONSTERS' ? 'Monster' : 'Background'} Generator
                                </a>
                            </div>
                        ) : (
                            Object.keys(activeUris).map(id => {
                                const monsterData = activeTab === 'MONSTERS' ? getMonsterData(Number(id)) : null;

                                return (
                                    <div key={id} className="bg-black/30 p-4 rounded border border-gray-700 flex flex-col items-center">
                                        <div className="scale-0.5 origin-center mb-[-20px] mt-[-20px] w-full flex justify-center">
                                            {activeTab === 'SKINS' ? (
                                                <Device skin={id} hideLogo>
                                                    <div className="w-full h-full bg-black/20" />
                                                </Device>
                                            ) : activeTab === 'BACKGROUNDS' ? (
                                                <div className="w-96 h-64 relative border-4 border-black overflow-hidden scale-50">
                                                    <LcdBackground id={id} />
                                                </div>
                                            ) : (
                                                <div className="w-64 h-64 relative bg-gray-800 border-4 border-black/50 overflow-hidden flex items-center justify-center">
                                                    <div className="scale-150">
                                                        <Sprite id={Number(id)} spriteSheet={monsterData?.spriteSheet} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-bold text-sm mb-2 mt-4">{id}</div>
                                        {mintedItems[id] ? (
                                            <div className="text-xs text-green-400 break-all text-center">
                                                Minted
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => mintItem(id, activeTab)}
                                                disabled={isprocessing || !activeCollection}
                                                className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                                            >
                                                Mint
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* LOGS */}
                <div className="bg-black p-4 rounded h-64 overflow-y-auto font-mono text-xs border border-gray-800">
                    {logs.map((l, i) => (
                        <div key={i} className="mb-1 border-b border-gray-900 pb-1">{l}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
