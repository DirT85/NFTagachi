"use client";

import { useState, useEffect } from "react";
import { useMetaplex } from "../../../hooks/useMetaplex";
import { createGenericFile } from "@metaplex-foundation/umi";
import { Device } from "../../../components/Device";
import { toBlob } from "html-to-image";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Wallet } from "lucide-react";

const WalletMultiButton = dynamic(
    () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
    { ssr: false }
);

// Full List of Devices
const DEVICES = [
    'CLASSIC', 'MATTE_BLACK', 'MATTE_WHITE', 'MATTE_MINT', 'MATTE_PINK',
    'CLEAR_WHITE', 'CLEAR_GREEN', 'CLEAR_PINK', 'CLEAR_PURPLE',
    'GLACIER_ICE', 'SMOKE_BLACK', 'JUNGLE_GREEN', 'ATOMIC_PURPLE',
    'METAL_SILVER', 'METAL_GOLD', 'METAL_BLUE',
    'WOOD_GRAIN', 'CARBON_FIBER', 'MINECRAFT_GRASS', 'WARNING_STRIPE',
    'GALAXY_SWIRL', 'GOLD_PLATED', 'CYBER', 'FIRE_RED', 'ELECTRIC_BLUE', 'PIKACHU_YELLOW',
    'LAVA_FLOW', 'ICE_CRYSTAL', 'MATRIX_CORE', 'CHROME_PLATED', 'RUBY_RED',
    'SAPPHIRE_BLUE', 'EMERALD_GREEN', 'OBSIDIAN', 'NEON_STREAK', 'MARBLE_WHITE',
    'BRUSHED_STEEL', 'COPPER_PLATE', 'DIAMOND_CUT', 'COSMIC_DUST', 'VINTAGE_PLASTIC',
    'CAMO_URBAN', 'PEARL_GLOSS', 'STARDUST', 'VOID_WALKER', 'AURA_GOLD',
    'MAGMA', 'GLITCH_ART', 'HOLO_GRAPHIC'
];

export default function AdminUploadPage() {
    const wallet = useWallet();
    const umi = useMetaplex();
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [uris, setUris] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Load persisted URIs
        const savedUris = localStorage.getItem('nftagachi_skin_upload_uris');
        if (savedUris) {
            try {
                setUris(JSON.parse(savedUris));
            } catch (e) {
                console.error("Failed to parse saved device URIs", e);
            }
        }
    }, []);

    // Persist URIs on change
    useEffect(() => {
        if (Object.keys(uris).length > 0) {
            localStorage.setItem('nftagachi_skin_upload_uris', JSON.stringify(uris));
        }
    }, [uris]);

    const log = (msg: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p].slice(0, 50));

    const forceReset = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    useEffect(() => {
        const handleError = (e: ErrorEvent) => log(`🚨 ERROR: ${e.message}`);
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

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

    if (!mounted) return <div className="p-8 bg-gray-900 text-white font-mono">Loading Admin Tools...</div>;

    const uploadSingleDevice = async (deviceId: string) => {
        const element = document.getElementById(`device-preview-${deviceId}`);
        if (!element) throw new Error(`Element for ${deviceId} not found`);

        // 1. Capture High-Res Image (Scale 1x to keep size small & free)
        // 1. Capture High-Res Image (Scale 1x to keep size small & free)
        log(`📸 Capturing ${deviceId}...`);

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
        const file = createGenericFile(new Uint8Array(buffer), `${deviceId}.png`, {
            contentType: 'image/png'
        });
        log(`📂 File created`);



        // 4. Upload Image to Arweave
        if (!wallet.connected || !umi.identity.publicKey) throw new Error("Wallet not connected! Please connect.");

        const fileSizeKb = (buffer.byteLength / 1024).toFixed(1);
        log(`📤 Uploading Image (${fileSizeKb}kb)...`);

        // This should be instant for files < 100kb on Irys Devnet
        const [imageUri] = await umi.uploader.upload([file]);
        log(`☁️ Uploaded Image: ${imageUri}`);

        // 2. Upload Metadata
        log(`📝 Uploading JSON Metadata...`);
        const metadata = {
            name: `NFTagachi Device: ${deviceId}`,
            description: `A custom hardware device for the NFTagachi ecosystem.`,
            image: imageUri,
            attributes: [
                { trait_type: "Type", value: "Device" },
                { trait_type: "Model", value: deviceId }
            ]
        };
        const metadataUri = await umi.uploader.uploadJson(metadata);

        return metadataUri;
    };

    const uploadAllDevices = async () => {
        if (!wallet.connected) {
            alert("Please connect wallet first!");
            return;
        }
        setIsProcessing(true);
        setProgress(0);
        setLogs([]);
        setUris({});

        let count = 0;
        const total = DEVICES.length;
        const newUris: Record<string, string> = {};

        for (const device of DEVICES) {
            count++;
            log(`[${count}/${total}] Processing ${device}...`);
            setActiveDeviceId(device);
            setProgress(Math.floor((count / total) * 100));

            try {
                // Give React a moment to render the newly active device before capture
                await new Promise(r => setTimeout(r, 200));

                const timeout = new Promise<string>((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout (60s)")), 60000)
                );

                const uri = await Promise.race([
                    uploadSingleDevice(device),
                    timeout
                ]);

                newUris[device] = uri;
                setUris(prev => ({ ...prev, [device]: uri }));
                log(`✅ Uploaded ${device}: ${uri}`);
            } catch (e: any) {
                console.error(e);
                log(`❌ Failed ${device}: ${e.message}`);
            }

            await new Promise(r => setTimeout(r, 500));
        }
        setActiveDeviceId(null);
        log("🎉 ALL DONE! Copy the config below.");
        setIsProcessing(false);
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Device Asset Uploader</h1>
                        <p className="text-gray-400 mb-6">Captures 1x device composites and uploads to Arweave/Irys via Metaplex.</p>
                        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-sm">
                            ⚠️ <strong>IMPORTANT:</strong> Set your Phantom Wallet to <strong>DEVNET</strong>.
                            <br />(Settings &rarr; Developer Settings &rarr; Change Network &rarr; Devnet)
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <WalletMultiButton />
                        <button
                            onClick={forceReset}
                            className="px-4 py-2 bg-red-900/40 text-red-200 border border-red-500/50 rounded text-xs font-bold hover:bg-red-800 transition-all"
                        >
                            FORCE RESET WALLET
                        </button>
                        {wallet.connected ? (
                            <button
                                onClick={uploadAllDevices}
                                disabled={isProcessing}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold disabled:opacity-50 transition-all shadow-lg"
                            >
                                {isProcessing ? `Processing (${progress}%)...` : 'UPLOAD ALL DEVICES'}
                            </button>
                        ) : (
                            <div className="px-4 py-2 bg-gray-800 text-gray-400 rounded text-xs font-bold border border-white/5">
                                CONNECT WALLET TO UPLOAD
                            </div>
                        )}
                    </div>
                </div>

                {/* VISIBLE GRID FOR PREVIEW & CAPTURE */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
                    {DEVICES.map(device => {
                        const isActive = activeDeviceId === device;
                        const isUploaded = !!uris[device];

                        return (
                            <div
                                key={device}
                                onClick={() => setActiveDeviceId(device)}
                                className={`
                                    cursor-pointer p-4 rounded border transition-all flex flex-col items-center
                                    ${isActive ? 'bg-blue-600/20 border-blue-500 scale-105 shadow-xl' : 'bg-black/20 border-gray-700 hover:border-gray-500'}
                                    ${isUploaded ? 'opacity-50' : ''}
                                `}
                            >
                                <div id={`device-preview-${device}`} className="w-48 h-48 flex items-center justify-center p-4">
                                    {isActive ? (
                                        <Device device={device} hideLogo>
                                            <div className="w-full h-full bg-[#1a1a1a] rounded flex flex-col items-center justify-center border-4 border-black/20 shadow-inner">
                                                <div className="text-[8px] font-mono text-green-500 animate-pulse tracking-widest leading-tight">
                                                    NFTAGACHI
                                                </div>
                                            </div>
                                        </Device>
                                    ) : (
                                        <div className="w-32 h-24 bg-gray-800 rounded-lg flex items-center justify-center border border-white/10 shadow-inner">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase">{device.replace('_', ' ')}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-2 font-bold text-[10px] text-center w-full truncate">{device}</div>
                                {isUploaded ? (
                                    <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest mt-1">● Uploaded</span>
                                ) : (
                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">● Pending</span>
                                )}
                            </div>
                        );
                    })}
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

