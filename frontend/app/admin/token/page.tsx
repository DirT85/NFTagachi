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
import { createFungible, mintV1, mplTokenMetadata, TokenStandard, updateV1, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { createGenericFile, publicKey } from "@metaplex-foundation/umi";
import { transferV1 } from "@metaplex-foundation/mpl-token-metadata";
import { Save, UserPlus, Calculator, Rocket, Info, Copy, Trash2, Shield, Coins, ExternalLink } from "lucide-react";
import { GAMA_MINT_ADDRESS, TREASURY_ADDRESS } from "../../../utils/constants";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { ConnectionContext, useConnection } from "@solana/wallet-adapter-react";
import { useContext } from "react";

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

        // Load Pinned Helpers
        const saved = localStorage.getItem("nftagachi_helpers");
        if (saved) {
            try {
                const list = JSON.parse(saved);
                if (Array.isArray(list)) setAirdropList(list.join("\n"));
            } catch (e) { }
        }
    }, [umi]);

    const saveHelpers = () => {
        const list = airdropList.split("\n").map(a => a.trim()).filter(a => a.length > 32);
        localStorage.setItem("nftagachi_helpers", JSON.stringify(list));
        log("💾 Helpers Pinned to LocalStorage");
    };

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
            const supply = BigInt("1000000000") * BigInt("1000000000"); // 1B tokens * 9 decimals
            await mintV1(umi, {
                mint: mintSigner.publicKey,
                authority: umi.identity,
                amount: supply,
                tokenOwner: umi.identity.publicKey,
                tokenStandard: TokenStandard.Fungible
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
        if (!umi || !wallet.publicKey || !mintAddress) return log("❌ Forge Token & Connect Wallet First");

        const rawRecipients = airdropList.split("\n").map(a => a.trim()).filter(a => a.length > 32);
        if (rawRecipients.length === 0) return log("❌ No valid recipients found");

        const amount = parseInt(airdropAmount);
        if (isNaN(amount) || amount <= 0) return log("❌ Invalid Amount");

        setIsProcessing(true);
        log(`🚀 Starting Airdrop to ${rawRecipients.length} recipients...`);

        try {
            for (const addr of rawRecipients) {
                try {
                    log(`📤 Sending ${amount.toLocaleString()} to ${addr.slice(0, 4)}...${addr.slice(-4)}`);

                    await transferV1(umi, {
                        mint: publicKey(mintAddress),
                        authority: umi.identity,
                        tokenOwner: umi.identity.publicKey,
                        destinationOwner: publicKey(addr),
                        amount: amount * 1_000_000_000,
                        tokenStandard: 2, // Fungible
                    }).sendAndConfirm(umi);

                    log(`✅ Sent to ${addr.slice(0, 4)}...`);
                } catch (err: any) {
                    log(`⚠️ Failed for ${addr}: ${err.message}`);
                }
            }
            log("🎉 Airdrop Complete!");
        } catch (e: any) {
            log(`❌ Global Airdrop Error: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateMetadata = async () => {
        if (!umi || !wallet.publicKey) return log("❌ Connect Wallet First");
        const targetMint = mintAddress || "";
        if (!targetMint || targetMint.length < 32) return log("❌ Valid Mint Address Required to Update");

        setIsProcessing(true);
        log(`🔄 Updating Metadata for ${targetMint.slice(0, 8)}...`);

        try {
            // 1. Fetch Existing
            const mintPublicKey = publicKey(targetMint);
            const asset = await fetchDigitalAsset(umi, mintPublicKey);
            log(`Found Token: ${asset.metadata.name}`);

            // 2. Upload Image if new one provided
            let newImageUri = "";
            if (tokenImage) {
                log("📤 Uploading New Logo...");
                const buffer = await tokenImage.arrayBuffer();
                const file = createGenericFile(new Uint8Array(buffer), tokenImage.name, { contentType: tokenImage.type });
                const [uri] = await umi.uploader.upload([file]);
                newImageUri = uri;
                log(`✅ New Image: ${newImageUri}`);
            }

            // 3. Prepare Metadata JSON
            const updateData = {
                name: tokenName || asset.metadata.name,
                symbol: tokenSymbol || asset.metadata.symbol,
                description: tokenDescription || "",
                image: newImageUri || asset.metadata.uri,
            };

            const metadataUri = await umi.uploader.uploadJson(updateData);
            log(`✅ New Metadata JSON: ${metadataUri}`);

            // 4. On-Chain Update
            await updateV1(umi, {
                mint: mintPublicKey,
                authority: umi.identity,
                data: {
                    ...asset.metadata,
                    name: updateData.name,
                    symbol: updateData.symbol,
                    uri: metadataUri,
                }
            }).sendAndConfirm(umi);

            log("🎉 Metadata Updated Successfully!");

        } catch (e: any) {
            console.error(e);
            log(`❌ Update Error: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
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
                                <label className="block text-xs text-gray-400 mb-1">GAMA Mint Address (Paste to Update Existing)</label>
                                <input
                                    className="w-full bg-gray-900 border border-cyan-500/50 rounded p-2 text-xs font-mono text-cyan-400"
                                    value={mintAddress || ""}
                                    onChange={e => setMintAddress(e.target.value)}
                                    placeholder="Paste Mint Address..."
                                />
                            </div>
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

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className={`w-full py-3 rounded font-bold text-lg shadow-lg transition-all ${isProcessing ? 'bg-gray-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-[1.02]'}`}
                                    onClick={createGamaToken}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Forging..." : "🔥 Forge GAMA"}
                                </button>
                                <button
                                    className={`w-full py-3 rounded font-bold text-lg shadow-lg transition-all border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 ${isProcessing ? 'opacity-50' : ''}`}
                                    onClick={handleUpdateMetadata}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Updating..." : "🔄 Update Metadata"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AIRDROP TOOL */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserPlus size={20} className="text-purple-400" /> Step 2: Distribution (Airdrop)
                            </h2>
                            <button
                                onClick={saveHelpers}
                                className="text-[10px] bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded flex items-center gap-1 uppercase tracking-tighter"
                            >
                                <Save size={12} /> Pin Helpers
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Recipients (Wallet Addresses, one per line)</label>
                                <textarea
                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-xs h-24 font-mono focus:border-purple-500 outline-none"
                                    placeholder="Addr1...&#10;Addr2..."
                                    value={airdropList}
                                    onChange={e => setAirdropList(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-400 mb-1">Amount per User (GAMA)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm focus:border-purple-500 outline-none"
                                        value={airdropAmount}
                                        onChange={e => setAirdropAmount(e.target.value)}
                                    />
                                </div>
                                <button
                                    className={`self-end px-8 py-2 rounded font-bold transition-all ${isProcessing ? 'bg-gray-700' : 'bg-purple-600 hover:bg-purple-500 hover:scale-105'}`}
                                    onClick={handleAirdrop}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Sending..." : "🚀 Blast"}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500">* Real SPL Transfers. Will confirm each transaction. Keep SOL for fees.</p>
                        </div>
                    </div>

                    {/* TREASURY MANAGEMENT */}
                    <TreasuryControls log={log} />
                </div>

                {/* RIGHT COLUMN: Logs & Guide */}
                <div className="space-y-8">
                    {/* LIQUIDITY GUIDE */}
                    <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500/30 text-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Rocket size={80} />
                        </div>
                        <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                            <Calculator size={20} /> Step 3: LP Forge (10 SOL Strategy)
                        </h2>
                        <div className="space-y-3 text-gray-300 relative z-10">
                            <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-lg space-y-2">
                                <div className="flex justify-between text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                                    <span>Pool Configuration (Raydium CPMM)</span>
                                    <span className="bg-cyan-500 text-black px-2 rounded">Optimal</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-black/40 p-2 rounded">
                                        <p className="text-gray-500">Base SOL</p>
                                        <p className="text-white font-bold text-lg">10 SOL</p>
                                    </div>
                                    <div className="bg-black/40 p-2 rounded">
                                        <p className="text-gray-500">Base GAMA</p>
                                        <p className="text-white font-bold text-lg">800,000,000</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText("800000000");
                                        log("📋 Copied GAMA amount for 10 SOL LP");
                                    }}
                                    className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 rounded text-cyan-400 font-bold text-[10px] uppercase flex items-center justify-center gap-2"
                                >
                                    <Copy size={12} /> Copy GAMA Amount
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 bg-gray-900/50 p-3 rounded border border-gray-700">
                                <Info size={14} className="inline mr-1 text-cyan-400" />
                                Using **Raydium CPMM** saves you ~3.5 SOL compared to OpenBook. Set Fee to **0.25%**.
                            </p>

                            <a
                                href="https://raydium.io/liquidity/create/"
                                target="_blank"
                                className="block w-full text-center py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg"
                            >
                                Open Raydium Pool Creator
                            </a>
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

function TreasuryControls({ log }: { log: (m: string) => void }) {
    const { connection } = useConnection();
    const [stats, setStats] = useState({ balance: 0, initial: 100_000_000 });
    const [rewards, setRewards] = useState({ battle: 100, clean: 5 });

    useEffect(() => {
        // Load settings
        const saved = localStorage.getItem("nftagachi_reward_settings");
        if (saved) {
            try { setRewards(JSON.parse(saved)); } catch (e) { }
        }
        fetchBalance();
    }, [connection]);

    const fetchBalance = async () => {
        if (!connection || TREASURY_ADDRESS === "YOUR_TREASURY_WALLET_ADDRESS_HERE") return;
        try {
            const mintPK = new PublicKey(GAMA_MINT_ADDRESS);
            const treasuryPK = new PublicKey(TREASURY_ADDRESS);
            const ata = await getAssociatedTokenAddress(mintPK, treasuryPK);
            const res = await connection.getTokenAccountBalance(ata);
            setStats(s => ({ ...s, balance: res.value.uiAmount || 0 }));
        } catch (e) {
            console.error("Treasury Balance Error:", e);
        }
    };

    const saveSettings = () => {
        localStorage.setItem("nftagachi_reward_settings", JSON.stringify(rewards));
        log("✅ Reward Settings Saved to OS");
    };

    const totalPaid = Math.max(0, stats.initial - stats.balance);

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-green-400" /> Step 4: Treasury Management & Rewards
            </h2>

            <div className="bg-green-950/20 border border-green-500/30 p-4 rounded-lg space-y-2">
                <p className="text-xs text-green-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Rocket size={14} /> Treasury Funding Required
                </p>
                <p className="text-xs text-gray-400">
                    To automate in-game rewards, you must fund the Treasury Wallet with GAMA tokens from your main wallet.
                </p>
                <div className="flex gap-2 items-center">
                    <code className="flex-1 bg-black p-2 rounded text-[10px] text-gray-300 border border-gray-800 break-all">
                        {TREASURY_ADDRESS}
                    </code>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(TREASURY_ADDRESS);
                            log("📋 Treasury Address Copied");
                        }}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sky-400"
                        title="Copy Address"
                    >
                        <Copy size={14} />
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                    * Send 10% - 20% of your supply (e.g. 100M GAMA) to this address to start.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Treasury Balance</p>
                    <p className="text-xl font-bold text-green-400 font-mono">{stats.balance.toLocaleString()} G</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Paid Out</p>
                    <p className="text-xl font-bold text-yellow-400 font-mono">{totalPaid.toLocaleString()} G</p>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Coins size={14} /> Reward Settings
                </h3>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-2 uppercase">Battle Victory</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range" min="50" max="1000" step="50"
                                className="flex-1 accent-cyan-500"
                                value={rewards.battle}
                                onChange={e => setRewards(r => ({ ...r, battle: parseInt(e.target.value) }))}
                            />
                            <span className="text-sm font-bold text-white w-12">{rewards.battle}G</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-2 uppercase">Cleaning Reward</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range" min="1" max="50" step="1"
                                className="flex-1 accent-purple-500"
                                value={rewards.clean}
                                onChange={e => setRewards(r => ({ ...r, clean: parseInt(e.target.value) }))}
                            />
                            <span className="text-sm font-bold text-white w-12">{rewards.clean}G</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={saveSettings}
                        className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 rounded font-bold text-xs uppercase transition-all"
                    >
                        Save Settings
                    </button>
                    <a
                        href={`https://phantom.app/ul/v1/transfer?recipient=${TREASURY_ADDRESS}&token=${GAMA_MINT_ADDRESS}`}
                        target="_blank"
                        className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all border border-white/10"
                    >
                        Top-up Treasury <ExternalLink size={12} />
                    </a>
                </div>

                <p className="text-[9px] text-gray-500 italic">
                    * Payouts are made from the Game Treasury wallet. Ensure it is funded with GAMA.
                </p>
            </div>
        </div>
    );
}
