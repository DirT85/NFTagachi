"use client";

import { useState, useEffect } from "react";
import { useMetaplex } from "../../../hooks/useMetaplex";
import { createGenericFile } from "@metaplex-foundation/umi";
import { Device } from "../../../components/Device";
import { toBlob } from "html-to-image";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Full List of Skins
const SKINS = [
    'CLASSIC', 'MATTE_BLACK', 'MATTE_WHITE', 'MATTE_MINT', 'MATTE_PINK',
    'CLEAR_WHITE', 'CLEAR_GREEN', 'CLEAR_PINK', 'CLEAR_PURPLE',
    'GLACIER_ICE', 'SMOKE_BLACK', 'JUNGLE_GREEN', 'ATOMIC_PURPLE',
    'METAL_SILVER', 'METAL_GOLD', 'METAL_BLUE',
    'WOOD_GRAIN', 'CARBON_FIBER', 'MINECRAFT_GRASS', 'WARNING_STRIPE',
    'GALAXY_SWIRL', 'GOLD_PLATED', 'CYBER', 'FIRE_RED', 'ELECTRIC_BLUE', 'PIKACHU_YELLOW'
];

export default function AdminUploadPage() {
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

    if (!mounted) return <div className="p-8 bg-gray-900 text-white font-mono">Loading Admin Tools...</div>;

    const uploadSingleSkin = async (skinId: string) => {
        const element = document.getElementById(`skin-preview-${skinId}`);
        if (!element) throw new Error(`Element for ${skinId} not found`);

        // 1. Capture High-Res Image (Scale 1x to keep size small & free)
        // 1. Capture High-Res Image (Scale 1x to keep size small & free)
        log(`📸 Capturing ${skinId}...`);

        let blob;
        try {
            blob = await toBlob(element, {
                pixelRatio: 1, // Reduced to 1 for free/fast upload on Devnet
                backgroundColor: 'transparent',
                skipFonts: true // Skip font loading to prevent hanging
            });
        } catch (captureErr: any) {
            throw new Error(`Capture Failed: ${captureErr.message}`);
        }

        if (!blob) throw new Error("Failed to generate blob");
        log(`🖼️ Blob generated (${blob.size} bytes)`);

        // 3. Create Umi File
        const buffer = await blob.arrayBuffer();
        const file = createGenericFile(new Uint8Array(buffer), `${skinId}.png`, {
            contentType: 'image/png'
        });
        log(`g File created`);



        // 4. Upload Image to Arweave
        if (!wallet.connected || !umi.identity.publicKey) throw new Error("Wallet not connected! Please connect.");

        const fileSizeKb = (buffer.byteLength / 1024).toFixed(1);
        log(`📤 Uploading Image (${fileSizeKb}kb)...`);

        // This should be instant for files < 100kb on Irys Devnet
        const [imageUri] = await umi.uploader.upload([file]);
        log(`✅ Image: ${imageUri}`);

        // 5. Upload Metadata
        log(`📝 Uploading JSON Metadata...`);
        const metadata = {
            name: `NFTagachi Skin: ${skinId.replace('_', ' ')}`,
            description: `A genuine ${skinId} casing for your NFTagachi. Applied via CSS code, backed by this NFT.`,
            image: imageUri,
            attributes: [
                { trait_type: 'Type', value: 'Device Skin' },
                { trait_type: 'Variant', value: skinId },
                { trait_type: 'Rarity', value: 'Rare' }
            ]
        };
        const metadataUri = await umi.uploader.uploadJson(metadata);

        return metadataUri;
    };

    const handleAutoGenerate = async () => {
        if (!wallet.connected) {
            alert("Please connect wallet first!");
            return;
        }
        setIsProcessing(true);
        setLogs([]);
        setUris({});

        try {
            const results: Record<string, string> = {};

            for (let i = 0; i < SKINS.length; i++) {
                const skin = SKINS[i];
                log(`[${i + 1}/${SKINS.length}] Processing ${skin}...`);
                setProgress(((i + 1) / SKINS.length) * 100);

                try {
                    // Wrap in 60s timeout to prevent hanging forever
                    const timeout = new Promise<string>((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout (60s)")), 60000)
                    );

                    const uri = await Promise.race([
                        uploadSingleSkin(skin),
                        timeout
                    ]);

                    results[skin] = uri;
                    setUris(prev => ({ ...prev, [skin]: uri }));
                    log(`✅ Uploaded ${skin}: ${uri}`);
                } catch (e: any) {
                    console.error(e);
                    log(`❌ Failed ${skin}: ${e.message}`);
                    // Don't crash the whole process, just log and continue
                }

                // Small delay to let the UI update and prevent rate-limiting
                await new Promise(r => setTimeout(r, 500));
            }
            log("🎉 ALL DONE! Copy the config below.");

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
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                            Skin Generator & Uploader
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Renders your CSS skins into PNGs and mints them to Arweave.
                        </p>
                        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                            ⚠️ <strong>IMPORTANT:</strong> Set your Phantom Wallet to <strong>DEVNET</strong>.
                            <br />(Settings &rarr; Developer Settings &rarr; Change Network &rarr; Devnet)
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <WalletMultiButton />
                        <button
                            onClick={handleAutoGenerate}
                            disabled={isProcessing || !wallet.connected}
                            className={`px-6 py-3 rounded-lg font-bold text-lg shadow-lg transition-all ${isProcessing || !wallet.connected
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 active:scale-95'
                                }`}
                        >
                            {isProcessing ? `Processing ${Math.floor(progress)}%...` : '✨ Generate & Upload All (v2)'}
                        </button>
                    </div>
                </div>

                {/* VISIBLE GRID FOR PREVIEW & CAPTURE */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                    {SKINS.map(skin => (
                        <div key={skin} className="flex flex-col items-center">
                            {/* The Capture Target */}
                            <div
                                id={`skin-preview-${skin}`}
                                className="transform scale-75 origin-top p-4 bg-transparent"
                            >
                                <Device skin={skin} hideLogo>
                                    <div className="w-full h-full bg-[#1a1a1a] rounded flex flex-col items-center justify-center border-4 border-black/20 shadow-inner">
                                        <div className="text-[8px] font-mono text-green-500 animate-pulse tracking-widest">
                                            NFTAGACHI
                                        </div>
                                        <div className="text-[6px] text-green-500/50 mt-1">
                                            v1.0
                                        </div>
                                    </div>
                                </Device>
                            </div>

                            <div className="text-xs text-gray-500 mt-[-40px] mb-2">{skin}</div>

                            {uris[skin] ? (
                                <span className="text-xs text-green-400">● Uploaded</span>
                            ) : (
                                <span className="text-xs text-gray-700">● Pending</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* LOGS & OUTPUT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-black/50 p-4 rounded-lg border border-gray-800 h-96 overflow-y-auto font-mono text-xs">
                        <h3 className="text-gray-400 mb-2 sticky top-0 bg-black/90 p-1">Logs</h3>
                        {logs.map((l, i) => (
                            <div key={i} className="mb-1 border-b border-white/5 pb-1">{l}</div>
                        ))}
                    </div>

                    <div>
                        <h3 className="text-gray-400 mb-2">Generated Configuration</h3>
                        <textarea
                            className="w-full h-96 bg-gray-950 p-4 font-mono text-xs text-green-400 border border-gray-800 rounded focus:outline-none focus:border-green-500"
                            readOnly
                            value={`export const SKIN_URIS: Record<string, string> = ${JSON.stringify(uris, null, 4)};`}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Copy this into <code>frontend/utils/SkinMetadata.ts</code> when done.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

