"use client";

import { useState, useEffect } from "react";
import { useMetaplex } from "../../../hooks/useMetaplex";
import { createGenericFile } from "@metaplex-foundation/umi";
import { LcdBackground } from "../../../components/LcdBackground";
import { BACKGROUND_IDS } from "../../../utils/BackgroundMetadata";
import { toBlob } from "html-to-image";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Wallet } from "lucide-react";

const WalletMultiButton = dynamic(
    () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
    { ssr: false }
);

export default function AdminBackgroundUploadPage() {
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

    const openInPhantom = () => {
        try {
            const url = window.location.href.replace('https://', '').replace('http://', '');
            const phantomUrl = `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(window.location.host)}`;
            window.location.href = phantomUrl;
        } catch (e) {
            console.error(e);
            alert("Please open in Phantom browser on mobile!");
        }
    };

    if (!mounted) return <div className="p-8 bg-gray-900 text-white font-mono">Loading Background Tools...</div>;

    const uploadSingleBackground = async (bgId: string) => {
        const element = document.getElementById(`bg-preview-${bgId}`);
        if (!element) throw new Error(`Element for ${bgId} not found`);

        log(`📸 Capturing ${bgId}...`);

        let blob;
        try {
            blob = await toBlob(element, {
                pixelRatio: 1,
                backgroundColor: 'transparent',
                skipFonts: true,
                width: 384, // Explicitly set dimensions (w-96)
                height: 256 // Explicitly set dimensions (h-64)
            });
        } catch (captureErr: any) {
            throw new Error(`Capture Failed: ${captureErr.message}`);
        }

        if (!blob) throw new Error("Failed to generate blob");

        const buffer = await blob.arrayBuffer();
        const file = createGenericFile(new Uint8Array(buffer), `${bgId}.png`, {
            contentType: 'image/png'
        });

        if (!wallet.connected || !umi.identity.publicKey) throw new Error("Wallet not connected!");

        const [imageUri] = await umi.uploader.upload([file]);
        log(`✅ Image: ${imageUri}`);

        log(`📝 Uploading Metadata...`);
        const metadata = {
            name: `NFTagachi Background: ${bgId.replace('_', ' ')}`,
            description: `A scenic ${bgId} background for your NFTagachi habitat.`,
            image: imageUri,
            attributes: [
                { trait_type: 'Type', value: 'Background' },
                { trait_type: 'Variant', value: bgId },
                { trait_type: 'Rarity', value: 'Rare' }
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
            for (let i = 0; i < BACKGROUND_IDS.length; i++) {
                const bg = BACKGROUND_IDS[i];
                log(`[${i + 1}/${BACKGROUND_IDS.length}] Processing ${bg}...`);
                setProgress(((i + 1) / BACKGROUND_IDS.length) * 100);

                try {
                    const timeout = new Promise<string>((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout (60s)")), 60000)
                    );

                    const uri = await Promise.race([
                        uploadSingleBackground(bg),
                        timeout
                    ]);

                    setUris(prev => ({ ...prev, [bg]: uri }));
                    log(`✅ Uploaded ${bg}: ${uri}`);
                } catch (e: any) {
                    console.error(e);
                    log(`❌ Failed ${bg}: ${e.message}`);
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
                        <h1 className="text-3xl font-bold text-green-400">Background Generator</h1>
                        <p className="text-gray-400 mt-2">Render CSS backgrounds to Arweave.</p>
                        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                            ⚠️ <strong>REMINDER:</strong> Ensure Wallet is on <strong>DEVNET</strong>.
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {
                            typeof window !== 'undefined' && window.innerWidth < 768 && !wallet.connected ? (
                                <button
                                    onClick={openInPhantom}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold flex items-center gap-2"
                                >
                                    <Wallet size={16} /> OPEN IN PHANTOM
                                </button>
                            ) : (
                                <WalletMultiButton />
                            )
                        }
                        <button
                            onClick={handleAutoGenerate}
                            disabled={isProcessing || !wallet.connected}
                            className={`px-6 py-3 rounded-lg font-bold ${isProcessing ? 'bg-gray-600' : 'bg-green-600 hover:scale-105'}`}
                        >
                            {isProcessing ? `Processing ${Math.floor(progress)}%...` : '✨ Generate & Upload'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {BACKGROUND_IDS.map(bg => (
                        <div key={bg} className="flex flex-col items-center">
                            {/* Capture Target: 384x256 (w-96 h-64 equivalent) */}
                            <div
                                id={`bg-preview-${bg}`}
                                className="w-96 h-64 relative overflow-hidden border-4 border-black/50 shadow-xl"
                            >
                                <LcdBackground id={bg} />
                            </div>
                            <div className="mt-2 text-xs text-gray-500">{bg}</div>
                            {uris[bg] && <div className="text-green-400 text-xs">● Uploaded</div>}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-black/50 p-4 rounded-lg h-96 overflow-y-auto font-mono text-xs">
                        {logs.map((l, i) => <div key={i} className="mb-1 border-b border-white/5 pb-1">{l}</div>)}
                    </div>
                    <div>
                        <textarea
                            className="w-full h-96 bg-gray-950 p-4 font-mono text-xs text-green-400 border border-gray-800 rounded"
                            readOnly
                            value={`export const BACKGROUND_URIS: Record<string, string> = ${JSON.stringify(uris, null, 4)};`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
