"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ShoppingCart, Sparkles } from "lucide-react";

interface NoAssetPopupProps {
    isOpen: boolean;
    onMintClick: () => void; // Redirect to LaunchMyNFT
    onMarketClick: () => void; // Redirect to Tensor/MagicEden
}

export const NoAssetPopup = ({ isOpen, onMintClick, onMarketClick }: NoAssetPopupProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="w-full max-w-md bg-gray-900 rounded-2xl border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden text-center"
                    >
                        {/* Header */}
                        <div className="bg-red-600/20 p-6 border-b border-red-500/20">
                            <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                <Sparkles size={32} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
                                No Signal Detected
                            </h2>
                            <p className="text-gray-400 text-sm font-mono">
                                We cannot find an NFTagachi in your wallet.
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-4">
                            <p className="text-gray-300 text-xs font-mono leading-relaxed mb-6">
                                To access the Nethervoid and claim your Starter Pack (1,000 GAMA), you must summon a monster.
                            </p>

                            <button
                                onClick={onMintClick}
                                className="w-full group relative bg-white text-black font-black py-4 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                                <span className="flex items-center justify-center gap-2 relative z-10 text-sm uppercase tracking-widest">
                                    <Sparkles size={16} /> Mint a Monster
                                </span>
                            </button>

                            <button
                                onClick={onMarketClick}
                                className="w-full bg-black border border-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                            >
                                <ShoppingCart size={14} /> Buy on Market
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="bg-black/50 p-4 border-t border-white/5">
                            <p className="text-[10px] text-gray-600 font-mono">
                                POCKET_LINK_OS v1.1.0 // ACCESS_DENIED
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
