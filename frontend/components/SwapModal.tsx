"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Wallet, Zap, Coins, CheckCircle2 } from 'lucide-react';

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onSwap: (solAmount: number) => Promise<void>;
}

export const SwapModal = ({ isOpen, onClose, balance, onSwap }: SwapModalProps) => {
    const [solAmount, setSolAmount] = useState<string>('0.1');
    const [isSwapping, setIsSwapping] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // GAMA Rate: 1 SOL = 1,000,000 GAMA (Example)
    const GAMA_RATE = 1000000;
    const gamaAmount = (parseFloat(solAmount) || 0) * GAMA_RATE;

    const handleSwap = async () => {
        setIsSwapping(true);
        try {
            await onSwap(parseFloat(solAmount));
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSwapping(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] -z-10" />

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <Zap className="text-cyan-400" size={20} />
                                GAMA SWAP
                            </h2>
                            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Input SOL */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">You Pay</span>
                                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                                    <Wallet size={10} />
                                    MAX: 1.2 SOL
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input
                                    type="number"
                                    value={solAmount}
                                    onChange={(e) => setSolAmount(e.target.value)}
                                    className="bg-transparent text-2xl font-black text-white outline-none w-full"
                                    placeholder="0.0"
                                />
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/5">
                                    <div className="w-5 h-5 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full" />
                                    <span className="font-bold text-sm text-white">SOL</span>
                                </div>
                            </div>
                        </div>

                        {/* Arrow Divider */}
                        <div className="relative h-2 flex justify-center items-center z-10">
                            <div className="bg-zinc-800 border border-white/10 p-2 rounded-xl text-zinc-400">
                                <ArrowDown size={14} />
                            </div>
                        </div>

                        {/* Output GAMA */}
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mt-2 mb-6">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">You Receive</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-black text-white">
                                    {gamaAmount.toLocaleString()}
                                </span>
                                <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                                    <Coins className="text-yellow-500" size={16} />
                                    <span className="font-bold text-sm text-yellow-500">GAMA</span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-6 px-1">
                            <div className="flex justify-between text-[11px] font-medium">
                                <span className="text-zinc-500">Rate</span>
                                <span className="text-zinc-300">1 SOL = 1.0M GAMA</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-medium">
                                <span className="text-zinc-500">Slippage</span>
                                <span className="text-zinc-300">0.5%</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-medium">
                                <span className="text-zinc-500">Fee (Treasury)</span>
                                <span className="text-zinc-300">0.005 SOL</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSwap}
                            disabled={isSwapping || isSuccess}
                            className={`
                                w-full py-4 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all duration-300
                                ${isSuccess
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {isSwapping ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    SWAPPING...
                                </div>
                            ) : isSuccess ? (
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle2 size={18} />
                                    SUCCESS!
                                </div>
                            ) : (
                                'EXECUTE SWAP'
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
