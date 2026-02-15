"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
const WalletMultiButton = dynamic(
    () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
    { ssr: false }
);
import { useMetaplex } from "../../../hooks/useMetaplex";
import { generateSigner, percentAmount, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { createFungible, mintV1, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createGenericFile } from "@metaplex-foundation/umi";

export default function AdminTokenPage() {
    const wallet = useWallet();
    const umi = useMetaplex();
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form States
    const [tokenName, setTokenName] = useState("GAMA (NFTagachi)");
    const [tokenSymbol, setTokenSymbol] = useState("GAMA");
    const [tokenDescription, setTokenDescription] = useState(" The official currency of the NFTagachi ecosystem.");
    const [tokenImage, setTokenImage] = useState<File | null>(null);
    const [mintAddress, setMintAddress] = useState<string | null>(null);

    // Airdrop States
    const [airdropList, setAirdropList] = useState("");
    const [airdropAmount, setAirdropAmount] = useState("30000000"); // 3% of 1B

    useEffect(() => {
        setMounted(true);
        if (umi) {
            try {
                umi.use(mplTokenMetadata());
            } catch (e) { /* Ignore */ }
        }
    }, [umi]);

    const log = (msg: string) => setLogs(p => [msg, ...p]);

    if (!mounted) return <div className="p-8 bg-gray-900 text-white font-mono">Loading Token Forge...</div>;

    // 1. Create Token Mint
    const createGamaToken = async () => {
        if (!umi || !wallet.publicKey) return log("❌ Connect Wallet");
        if (!tokenImage) return log("❌ Please select a Logo Image");

        setIsProcessing(true);
        try {
            log("🏗️ Allocating Resources...");

            // 1. Upload Image
            log("📤 Uploading Logo to Arweave...");
            const buffer = await tokenImage.arrayBuffer();
            const file = createGenericFile(new Uint8Array(buffer), tokenImage.name, { contentType: tokenImage.type });
            const [imageUri] = await umi.uploader.upload([file]);
            log(`✅ Image Uploaded: ${imageUri}`);

            // 2. Upload Metadata
            const metadata = {
                name: tokenName,
                symbol: tokenSymbol,
                description: tokenDescription,
                image: imageUri,
            };
            const metadataUri = await umi.uploader.uploadJson(metadata);
            log(`✅ Metadata Uploaded: ${metadataUri}`);

            // 3. Create Mint
            log("🔨 Forging Token Mint...");
            const mintSigner = generateSigner(umi);
            await createFungible(umi, {
                mint: mintSigner,
                name: tokenName,
                symbol: tokenSymbol,
                uri: metadataUri,
                sellerFeeBasisPoints: percentAmount(0),
                decimals: 9,
            }).sendAndConfirm(umi);

            setMintAddress(mintSigner.publicKey.toString());
            log(`✅ Token Created! Address: ${mintSigner.publicKey}`);

            // 4. Mint Supply
            log("💰 Minting Supply (1,000,000,000 GAMA)...");
            await mintV1(umi, {
                mint: mintSigner.publicKey,
                authority: umi.identity,
                amount: 1_000_000_000 * 1_000_000_000,
                tokenOwner: umi.identity.publicKey,
                tokenStandard: 2
            }).sendAndConfirm(umi);

            log("🎉 Supply Minted to your Wallet!");

        } catch (e: any) {
            console.error(e);
            log(`❌ Error: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Airdrop Function (Mockup for now, real SPL transfer logic is similar to deposit)
    const handleAirdrop = async () => {
        // This would ideally use a batch transaction
        alert("Airdrop Tool logic to be implemented with proper SPL Transfer instructions. For now, use Phantom 'Send' feature or standard bulk sender tools.");
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT COLUMN: Tools */}
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-cyan-400">GAMA Token Forge</h1>
                        <WalletMultiButton />
                    </div>

                    {/* MINTING FORM */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            Step 1: Mint Token
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Token Name</label>
                                <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" value={tokenName} onChange={e => setTokenName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Symbol</label>
                                    <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" value={tokenSymbol} onChange={e => setTokenSymbol(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Logo Image</label>
                                    <input type="file" className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-700 file:text-cyan-400 hover:file:bg-gray-600" onChange={e => setTokenImage(e.target.files?.[0] || null)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Description</label>
                                <textarea className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm h-20" value={tokenDescription} onChange={e => setTokenDescription(e.target.value)} />
                            </div>

                            <button
                                className={`w-full py-3 rounded font-bold text-lg shadow-lg transition-all ${isProcessing ? 'bg-gray-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-[1.02]'}`}
                                onClick={createGamaToken}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Forging..." : "🔥 Forge GAMA Token"}
                            </button>
                        </div>
                    </div>

                    {/* AIRDROP TOOL */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl opacity-70 hover:opacity-100 transition-opacity">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            Step 2: Distribution (Airdrop)
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Recipients (Wallet Addresses, one per line)</label>
                                <textarea
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-xs h-24 font-mono"
                                    placeholder="Addr1...&#10;Addr2..."
                                    value={airdropList}
                                    onChange={e => setAirdropList(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-400 mb-1">Amount per User</label>
                                    <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm" value={airdropAmount} onChange={e => setAirdropAmount(e.target.value)} />
                                </div>
                                <button className="self-end px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold" onClick={handleAirdrop}>
                                    Send
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500">* Manual distribution for now. Use Phantom for bulk if possible.</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Logs & Guide */}
                <div className="space-y-8">
                    {/* LIQUIDITY GUIDE */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-yellow-600/30 text-sm">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">
                            Step 3: Liquidity Strategy (Low Cost)
                        </h2>
                        <div className="space-y-3 text-gray-300">
                            <p>To launch with <strong className="text-white">&lt; 1 SOL</strong> setup cost + <strong>10 SOL</strong> liquidity:</p>
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>
                                    <strong>Do NOT use OpenBook Markets</strong> (Cost: ~3-4 SOL).
                                </li>
                                <li>
                                    Go to <a href="https://raydium.io/liquidity/create/" target="_blank" className="text-cyan-400 underline">Raydium &gt; Create Pool</a>.
                                </li>
                                <li>
                                    Select <strong>CPMM (Concentrated Liquidity / New Standard)</strong>.
                                    <ul className="list-disc pl-5 text-gray-400 mt-1">
                                        <li>Token A: <strong>SOL</strong></li>
                                        <li>Token B: <strong>GAMA</strong> (Paste Mint Address below)</li>
                                        <li>Fee Tier: <strong>0.25%</strong> (Standard)</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Input Amounts:</strong>
                                    <br /> - SOL: 10
                                    <br /> - GAMA: ~800,000,000 (Keep 20% for Airdrops/Team)
                                </li>
                                <li>
                                    <strong>Initialize:</strong> Requires ~0.15 SOL.
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* CONSOLE */}
                    <div className="bg-black p-4 rounded h-[400px] overflow-y-auto font-mono text-xs border border-gray-800">
                        <h3 className="text-gray-500 mb-2 sticky top-0 bg-black py-1 border-b border-gray-800">Mission Log</h3>
                        {mintAddress && (
                            <div className="mb-4 p-2 bg-green-500/20 border border-green-500 rounded text-green-400 break-all">
                                <strong>MINT ADDRESS:</strong><br />
                                {mintAddress}
                            </div>
                        )}
                        {logs.map((l, i) => <div key={i} className="mb-1 border-b border-gray-900 pb-1">{l}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
