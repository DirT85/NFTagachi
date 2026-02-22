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
    const [activeBgId, setActiveBgId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const log = (msg: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p]);

    useEffect(() => {
        const handleError = (e: ErrorEvent) => log(`🚨 ERROR: ${e.message}`);
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    useEffect(() => {
        if (mounted) {
            const status = wallet.connected ? 'CONNECTED ✅' : wallet.connecting ? 'CONNECTING... 🔄' : 'DISCONNECTED ❌';
            log(`Wallet State: ${status}`);
            if (wallet.wallet) log(`Selected Adapter: ${wallet.wallet.adapter.name}`);
            if (wallet.publicKey) log(`Address: ${wallet.publicKey.toBase58()}`);
            if (typeof window !== 'undefined' && !(window as any).solana) {
                log("⚠️ WARNING: window.solana not found.");
            }
        }
    }, [wallet.connected, wallet.connecting, wallet.wallet, mounted]);

    const diagnoseConnection = async () => {
        log("🔍 Running Diagnostics...");
        if (!wallet.wallet) {
            log("❌ No wallet selected. Please click the 'Select Wallet' button.");
            return;
        }
        log(`🔄 Attempting to force connect to ${wallet.wallet.adapter.name}...`);
        try {
            await wallet.connect();
            log("✅ Connect call finished.");
        } catch (e: any) {
            log(`❌ Connect Error: ${e.message}`);
        }
    };

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
                setActiveBgId(bg);
                setProgress(((i + 1) / BACKGROUND_IDS.length) * 100);

                try {
                    await new Promise(r => setTimeout(r, 200));

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
            setActiveBgId(null);
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
                        <WalletMultiButton />
                        <button
                            onClick={diagnoseConnection}
                            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded border border-purple-500/30 text-xs font-bold hover:bg-purple-600/40 transition-all"
                        >
                            DIAGNOSE CONNECTION
                        </button>
                        {wallet.connected ? (
                            <button
                                onClick={handleAutoGenerate}
                                disabled={isProcessing}
                                className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${isProcessing ? 'bg-gray-600' : 'bg-green-600 hover:scale-105 hover:bg-green-500'}`}
                            >
                                {isProcessing ? `Processing ${Math.floor(progress)}%...` : '✨ Generate & Upload'}
                            </button>
                        ) : (
                            <div className="px-6 py-3 bg-gray-800 text-gray-400 rounded-lg text-sm font-bold border border-white/5">
                                CONNECT WALLET TO GENERATE
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {BACKGROUND_IDS.map(bg => {
                        const isActive = activeBgId === bg;
                        const isUploaded = !!uris[bg];

                        return (
                            <div
                                key={bg}
                                onClick={() => setActiveBgId(bg)}
                                className={`
                                    cursor-pointer p-2 rounded border transition-all flex flex-col items-center
                                    ${isActive ? 'bg-green-600/20 border-green-500 scale-105 shadow-xl' : 'bg-black/20 border-gray-700 hover:border-gray-500'}
                                    ${isUploaded ? 'opacity-50' : ''}
                                `}
                            >
                                {/* Capture Target: 384x256 (w-96 h-64 equivalent) */}
                                <div
                                    id={`bg-preview-${bg}`}
                                    className="w-full aspect-video relative overflow-hidden border-2 border-black/50 shadow-lg bg-gray-800"
                                >
                                    {isActive ? (
                                        <LcdBackground id={bg} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">{bg}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider">{bg}</div>
                                {isUploaded && <div className="text-green-400 text-[9px] font-bold uppercase">● Uploaded</div>}
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
                            value={`export const BACKGROUND_URIS: Record<string, string> = ${JSON.stringify(uris, null, 4)};`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
