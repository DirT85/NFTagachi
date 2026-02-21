"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface MintShopProps {
    onMint: (type: 'DEVICE' | 'BG', cost: number) => void;
    onBuyGama: () => void;
    balance: number;
    ownedDevices?: string[];
    ownedBackgrounds?: string[];
}

export const MintShop = ({ onMint, onBuyGama, balance, ownedDevices = [], ownedBackgrounds = [] }: MintShopProps) => {
    // const [gamaBalance, setGamaBalance] = useState(1000); // Using props now
    const [isMinting, setIsMinting] = useState(false);
    const [message, setMessage] = useState("");
    const [tab, setTab] = useState<'SHOP' | 'BUY'>('SHOP');

    const handleMint = (type: 'DEVICE' | 'BG', id: string, cost: number) => {
        if (balance < cost) {
            setMessage("Not enough GAMA!");
            return;
        }

        setIsMinting(true);
        setMessage("Routing DEX Swap...");

        setTimeout(() => {
            // setGamaBalance(prev => prev - cost); // Parent handles this via state update hopefully? 
            // Actually useNftagachi doesn't auto-update balance on mint yet, but for now we simulate visual success
            onMint(type, cost);
            setIsMinting(false);
            setMessage(`Successfully Minted! -${cost} GAMA`);
        }, 1500);
    };

    const handleBuy = () => {
        onBuyGama();
    }

    return (
        <div className={`
            w-full transition-all 
            ${isMinting ? 'animate-pulse pointer-events-none opacity-80' : ''}
        `}>
            <div className="bg-gray-900 border-2 border-green-500/30 p-4 rounded-2xl text-xs font-mono text-green-400 shadow-2xl">
                {/* Header & Balance */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-green-500/30">
                    <span className="font-bold flex items-center gap-2 text-sm text-white">
                        🛒 GAMA MARKET
                    </span>
                    <span className={`font-bold text-sm ${balance < 100 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                        {balance} G
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/40 p-1 rounded-lg mb-4">
                    <button
                        onClick={() => setTab('SHOP')}
                        className={`flex-1 py-1.5 rounded-md font-bold transition-all ${tab === 'SHOP' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        SHOP
                    </button>
                    <button
                        onClick={() => setTab('BUY')}
                        className={`flex-1 py-1.5 rounded-md font-bold transition-all ${tab === 'BUY' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        BUY GAMA
                    </button>
                </div>

                {/* Low Balance Warning */}
                {balance < 100 && tab === 'SHOP' && (
                    <div onClick={() => setTab('BUY')} className="mb-3 bg-red-500/20 border border-red-500/50 p-2 rounded text-center cursor-pointer hover:bg-red-500/30">
                        <p className="text-red-300 font-bold text-[10px]">⚠️ LOW BALANCE</p>
                        <p className="text-white text-[9px] underline">Click here to Buy More</p>
                    </div>
                )}

                {tab === 'SHOP' ? (
                    <div className="flex flex-col gap-3">
                        {/* Backgrounds */}
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1 flex justify-between">
                                <span>Backgrounds</span>
                                <span className="text-green-500/50">{ownedBackgrounds.length}/50</span>
                            </div>
                            <button
                                onClick={() => handleMint('BG', 'RANDOM', 1000)}
                                disabled={isMinting || ownedBackgrounds.length >= 50}
                                className={`w-full py-3 rounded flex flex-col items-center justify-center gap-1 transition-all shadow-lg ${ownedBackgrounds.length >= 50 ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-green-900 to-emerald-800 border border-green-500/50 hover:brightness-110 active:scale-95 text-green-300'}`}
                            >
                                <span className="font-bold text-xs">{ownedBackgrounds.length >= 50 ? 'ALL BACKGROUNDS OWNED' : 'MINT NEW BACKGROUND'}</span>
                                <span className="text-[9px] opacity-80 font-mono">{ownedBackgrounds.length >= 50 ? 'FULL SET' : '1000 GAMA + 0.01 SOL'}</span>
                            </button>
                        </div>

                        {/* Device Skins */}
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1 flex justify-between">
                                <span>Device Skins</span>
                                <span className="text-purple-500/50">{ownedDevices.length}/50</span>
                            </div>
                            <button
                                onClick={() => handleMint('DEVICE', 'RANDOM', 500)}
                                disabled={isMinting || ownedDevices.length >= 50}
                                className={`w-full px-2 py-3 rounded text-center font-bold shadow-lg transition-all ${ownedDevices.length >= 50 ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-500 hover:brightness-125 animate-pulse'}`}
                            >
                                <div className="flex flex-col items-center leading-tight">
                                    <span className="text-xs">{ownedDevices.length >= 50 ? 'ALL SKINS OWNED' : '🎁 MINT DEVICE SKIN'}</span>
                                    <span className="text-[9px] opacity-80 font-mono font-normal">1000 GAMA + 0.01 SOL</span>
                                </div>
                            </button>
                            <div className="text-[9px] text-center text-gray-500 italic mt-1">
                                {ownedDevices.length >= 50 ? 'You are a Master Collector!' : 'Win: Matte, Metal, Stardust, or Cyber!'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300 py-4">
                        <div className="text-[10px] text-blue-300 uppercase tracking-wider font-bold text-center">Swap SOL for GAMA</div>

                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center">
                            <p className="text-white text-[11px] mb-3">Exchange SOL directly for GAMA tokens to mint rare items.</p>
                            <button
                                onClick={handleBuy}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-xs tracking-widest uppercase"
                            >
                                Open Swap Portal
                            </button>
                        </div>

                        <div className="text-[9px] text-center text-gray-500 italic">
                            *Secure SOL-to-GAMA Treasury Swap
                        </div>
                    </div>
                )}

                {message && <div className="mt-2 text-yellow-400 text-[10px] bg-yellow-400/10 p-1 rounded text-center border border-yellow-400/20">{message}</div>}
            </div>
        </div>
    );
};

const ShopButton = ({ label, onClick, disabled }: any) => (
    <button
        disabled={disabled}
        onClick={onClick}
        className="flex-1 bg-green-900/50 border border-green-700 text-green-300 px-2 py-1 rounded hover:bg-green-800 disabled:opacity-50 transition-colors"
    >
        {label}
    </button>
);
