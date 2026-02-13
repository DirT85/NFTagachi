"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useMetaplex } from "../../../hooks/useMetaplex";
import { generateSigner, percentAmount, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi";
import { createFungible, mintV1, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

export default function AdminTokenPage() {
    const wallet = useWallet();
    const umi = useMetaplex();
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // States
    const [mintAddress, setMintAddress] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        if (umi) {
            // Register Token Metadata Plugin just in case it's not global
            try {
                umi.use(mplTokenMetadata());
            } catch (e) {
                // Ignore if already registered
            }
        }
    }, [umi]);

    const log = (msg: string) => setLogs(p => [msg, ...p]);

    if (!mounted) return <div className="p-8 bg-gray-900 text-white font-mono">Loading Token Forge...</div>;

    // 1. Create Token Mint
    const createGamaToken = async () => {
        if (!umi || !wallet.publicKey) return log("❌ Connect Wallet");
        setIsProcessing(true);
        try {
            log("🏗️ Initializing GAMA Launch...");

            // Generate Mint Keypair
            const mintSigner = generateSigner(umi);

            log(`🔑 Generated Mint: ${mintSigner.publicKey}`);

            // Create Fungible Asset (SPL Token + Metadata)
            // This instruction creates the Mint Account AND the Metadata Account
            log("📝 Creating Fungible Asset...");
            await createFungible(umi, {
                mint: mintSigner,
                name: "GAMA (NFTagachi)",
                symbol: "GAMA",
                uri: "https://arweave.net/GAMA_METADATA_PLACEHOLDER", // Todo: Upload generic json
                sellerFeeBasisPoints: percentAmount(0),
                decimals: 9, // Standard SOL decimals
            }).sendAndConfirm(umi);

            log(`✅ Token Created! Address: ${mintSigner.publicKey}`);
            setMintAddress(mintSigner.publicKey.toString());

            // Mint Supply to Self
            log("💰 Minting Supply (1,000,000,000 GAMA)...");
            await mintV1(umi, {
                mint: mintSigner.publicKey,
                authority: umi.identity,
                amount: 1_000_000_000 * 1_000_000_000, // 1 Billion * Decimals
                tokenOwner: umi.identity.publicKey,
                tokenStandard: 2 // Fungible
            }).sendAndConfirm(umi);

            log("🎉 Supply Minted to your Wallet!");

        } catch (e: any) {
            console.error(e);
            log(`❌ Error: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-cyan-400">GAMA Token Forge</h1>
                    <WalletMultiButton />
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
                    <p className="mb-4 text-gray-300">
                        This tool will mint the <strong>$GAMA</strong> token on Devnet using Metaplex Umi.
                        <br />
                        Supply: <strong>1,000,000,000</strong>
                    </p>

                    {mintAddress ? (
                        <div className="text-green-400 p-4 bg-black/50 rounded border border-green-500">
                            ✅ <strong>Mint Created!</strong><br />
                            Address: <span className="select-all bg-white/10 px-1">{mintAddress}</span>
                            <br /><br />
                            Check your Phantom Wallet (Devnet)!
                        </div>
                    ) : (
                        <button
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded disabled:opacity-50"
                            onClick={createGamaToken}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Forging..." : "🔥 Forge GAMA Token"}
                        </button>
                    )}
                </div>

                <div className="bg-black p-4 rounded h-64 overflow-y-auto font-mono text-xs border border-gray-800">
                    {logs.map((l, i) => <div key={i} className="mb-1 border-b border-gray-900 pb-1">{l}</div>)}
                </div>
            </div>
        </div>
    );
}
