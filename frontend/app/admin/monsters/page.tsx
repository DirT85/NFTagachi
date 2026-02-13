"use client";

import { useState, useEffect } from "react";
import { useMetaplex } from "../../../hooks/useMetaplex";
import { createGenericFile } from "@metaplex-foundation/umi";
import { MONSTER_IDS } from "../../../utils/MonsterMetadata";
import { getMonsterData } from "../../../utils/GameLogic";
import { Sprite } from "../../../components/Sprite";
import { toBlob } from "html-to-image";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function AdminMonsterUploadPage() {
    const wallet = useWallet();
    const umi = useMetaplex();
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [uris, setUris] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    const log = (msg: string) => setLogs(p => [msg, ...p]);

    if (!mounted) return <div className="p-8 bg-gray-900 text-white font-mono">Loading Monster Tools...</div>;

    const uploadSingleMonster = async (id: number, name: string) => {
        const element = document.getElementById(`monster-preview-${id}`);
        if (!element) throw new Error(`Element for ${id} not found`);

        log(`📸 Capturing ${name}...`);

        let blob;
        try {
            blob = await toBlob(element, {
                pixelRatio: 2, // Higher quality for Monsters
                backgroundColor: 'transparent',
                skipFonts: true,
                width: 256,
                height: 256
            });
        } catch (captureErr: any) {
            throw new Error(`Capture Failed: ${captureErr.message}`);
        }

        if (!blob) throw new Error("Failed to generate blob");

        const buffer = await blob.arrayBuffer();
        const file = createGenericFile(new Uint8Array(buffer), `monster_${id}.png`, {
            contentType: 'image/png'
        });

        if (!wallet.connected || !umi.identity.publicKey) throw new Error("Wallet not connected!");

        const [imageUri] = await umi.uploader.upload([file]);
        log(`✅ Image: ${imageUri}`);

        log(`📝 Uploading Metadata...`);
        const data = getMonsterData(id);
        const metadata = {
            name: data?.name || name,
            description: `A generic ${data?.tier} ${data?.type} monster species.`,
            image: imageUri,
            attributes: [
                { trait_type: 'Type', value: 'Species' },
                { trait_type: 'Tier', value: data?.tier },
                { trait_type: 'Element', value: data?.type }
            ]
        };
        const metadataUri = await umi.uploader.uploadJson(metadata);
        return metadataUri;
    };

    const handleAutoGenerate = async () => {
        if (!wallet.connected) return alert("Connect Wallet!");
        setIsProcessing(true);
        setLogs([]);
        setUris({});

        try {
            for (let i = 0; i < MONSTER_IDS.length; i++) {
                const monster = MONSTER_IDS[i];
                log(`[${i + 1}/${MONSTER_IDS.length}] Processing ${monster.name}...`);
                setProgress(((i + 1) / MONSTER_IDS.length) * 100);

                try {
                    const timeout = new Promise<string>((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout (60s)")), 60000)
                    );

                    const uri = await Promise.race([
                        uploadSingleMonster(monster.id, monster.name),
                        timeout
                    ]);

                    setUris(prev => ({ ...prev, [monster.id]: uri }));
                    log(`✅ Uploaded ${monster.name}: ${uri}`);
                } catch (e: any) {
                    console.error(e);
                    log(`❌ Failed ${monster.name}: ${e.message}`);
                }
                await new Promise(r => setTimeout(r, 500));
            }
            log("🎉 ALL DONE!");
        } catch (e: any) {
            log(`FATAL ERROR: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-red-500">Monster Generator</h1>
                        <p className="text-gray-400 mt-2">Render Monster Blueprints to Arweave.</p>
                        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                            ⚠️ <strong>REMINDER:</strong> Ensure Wallet is on <strong>DEVNET</strong>.
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <WalletMultiButton />
                        <button
                            onClick={handleAutoGenerate}
                            disabled={isProcessing || !wallet.connected}
                            className={`px-6 py-3 rounded-lg font-bold ${isProcessing ? 'bg-gray-600' : 'bg-red-600 hover:scale-105'}`}
                        >
                            {isProcessing ? `Processing ${Math.floor(progress)}%...` : '✨ Generate & Upload'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {MONSTER_IDS.map(m => {
                        const data = getMonsterData(m.id);
                        return (
                            <div key={m.id} className="flex flex-col items-center">
                                {/* Capture Target */}
                                <div
                                    id={`monster-preview-${m.id}`}
                                    className="w-64 h-64 relative bg-gray-800 rounded-xl overflow-hidden shadow-xl border-4 border-black/50 flex items-center justify-center"
                                >
                                    {/* Simulated Card Background based on Type */}
                                    <div className={`absolute inset-0 opacity-20 ${data?.type === 'FIRE' ? 'bg-red-500' :
                                            data?.type === 'WATER' ? 'bg-blue-500' :
                                                data?.type === 'MAGIC' ? 'bg-purple-500' :
                                                    'bg-green-500'
                                        }`} />

                                    <div className="scale-150">
                                        <Sprite
                                            id={m.id}
                                            spriteSheet={data?.spriteSheet}
                                            variant={data?.variant}
                                            state="IDLE" // Capture Idle pose
                                        />
                                    </div>
                                    <div className="absolute bottom-2 font-bold text-xs uppercase tracking-widest opacity-50">
                                        {data?.tier}
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">{m.name}</div>
                                {uris[m.id] && <div className="text-green-400 text-xs">● Uploaded</div>}
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-black/50 p-4 rounded-lg h-96 overflow-y-auto font-mono text-xs">
                        {logs.map((l, i) => <div key={i} className="mb-1 border-b border-white/5 pb-1">{l}</div>)}
                    </div>
                    <div>
                        <textarea
                            className="w-full h-96 bg-gray-950 p-4 font-mono text-xs text-green-400 border border-gray-800 rounded"
                            readOnly
                            value={`export const MONSTER_URIS: Record<string, string> = ${JSON.stringify(uris, null, 4)};`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
