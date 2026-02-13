"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ArrowRight, ArrowLeft, X, CreditCard, Download } from "lucide-react";

interface GameWalletProps {
    isOpen: boolean;
    onClose: () => void;
    gameBalance: number;
    tokenBalance: number; // Simulated "Wallet" Balance for now
    onDeposit: (amount: number) => void;
    onWithdraw: (amount: number) => void;
}

export const GameWallet = ({ isOpen, onClose, gameBalance, tokenBalance, onDeposit, onWithdraw }: GameWalletProps) => {
    const [mode, setMode] = useState<'MENU' | 'DEPOSIT' | 'WITHDRAW'>('MENU');
    const [amount, setAmount] = useState('');

    const handleAction = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        if (mode === 'DEPOSIT') {
            onDeposit(val); // In SOL
        } else {
            onWithdraw(val); // In GAMA
        }
        setAmount('');
        setMode('MENU');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-sm bg-[#e8e8e8] rounded-xl border-4 border-gray-400 shadow-[8px_8px_0_rgba(0,0,0,0.5)] overflow-hidden font-mono"
                    >
                        {/* Header - Retro Style */}
                        <div className="bg-gray-700 text-white p-2 flex justify-between items-center border-b-4 border-gray-400">
                            <span className="font-bold tracking-widest text-xs flex items-center gap-2">
                                <Wallet size={14} /> GAME WALLET
                            </span>
                            <button onClick={onClose} className="hover:text-red-400 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Screen Area */}
                        <div className="p-4 bg-[#8bac0f] min-h-[300px] relative shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] flex flex-col">
                            {/* Scanlines */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10 opacity-20"></div>

                            {/* Balance Display */}
                            <div className="bg-[#9bbc0f] border-2 border-[#306230] p-3 mb-6 shadow-[2px_2px_0_#306230]">
                                <p className="text-[#0f380f] text-[10px] font-bold mb-1">CURRENT FUNDS</p>
                                <div className="flex justify-between items-baseline border-b border-[#306230]/50 pb-1 mb-1">
                                    <span className="text-xl font-black tracking-tighter text-[#0f380f]">{gameBalance.toLocaleString()}</span>
                                    <span className="text-xs font-bold text-[#0f380f]">G</span>
                                </div>
                                <div className="flex justify-between items-center opacity-70">
                                    <span className="text-[8px] font-bold text-[#0f380f]">WALLET:</span>
                                    <span className="text-[8px] font-bold text-[#0f380f]">{tokenBalance.toLocaleString()} TKN</span>
                                </div>
                            </div>

                            {mode === 'MENU' ? (
                                <div className="space-y-3 z-20 mt-auto">
                                    <button
                                        onClick={() => setMode('DEPOSIT')}
                                        className="w-full bg-[#306230] text-[#9bbc0f] p-3 rounded border-2 border-[#0f380f] shadow-[2px_2px_0_#0f380f] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-between group"
                                    >
                                        <span className="font-bold text-xs uppercase group-hover:underline decoration-2 underline-offset-4">DEPOSIT (SOL)</span>
                                        <ArrowRight size={14} />
                                    </button>
                                    <button
                                        onClick={() => setMode('WITHDRAW')}
                                        className="w-full bg-[#306230] text-[#9bbc0f] p-3 rounded border-2 border-[#0f380f] shadow-[2px_2px_0_#0f380f] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-between group"
                                    >
                                        <span className="font-bold text-xs uppercase group-hover:underline decoration-2 underline-offset-4">WITHDRAW (GAMA)</span>
                                        <Download size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col z-20">
                                    <div className="flex items-center gap-2 mb-4 text-[#0f380f]">
                                        <button onClick={() => setMode('MENU')} className="p-1 hover:bg-[#306230]/20 rounded">
                                            <ArrowLeft size={16} />
                                        </button>
                                        <span className="font-bold text-xs uppercase">{mode} FUNDS</span>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        <label className="text-[10px] font-bold text-[#0f380f] mb-2 block uppercase">
                                            ENTER AMOUNT ({mode === 'DEPOSIT' ? 'SOL' : 'GAMA'}):
                                        </label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-[#9bbc0f] border-2 border-[#0f380f] p-2 text-right font-black text-[#0f380f] focus:outline-none focus:bg-[#8bac0f] placeholder-[#306230]/50"
                                            autoFocus
                                        />
                                        <p className="text-[8px] text-[#0f380f]/70 mt-2 text-right">
                                            {mode === 'DEPOSIT' ? 'RATE: 1 SOL = 10,000 GAMA' : 'FEE: 5%'}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleAction}
                                        className="w-full mt-6 bg-[#0f380f] text-[#9bbc0f] p-3 rounded border-2 border-[#306230] shadow-[2px_2px_0_#306230] hover:bg-[#1f541f] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all font-bold text-sm uppercase"
                                    >
                                        CONFIRM {mode}
                                    </button>
                                </div>
                            )}

                            {/* Branding */}
                            <div className="absolute bottom-1 right-2 text-[8px] font-black text-[#0f380f]/20 uppercase pointer-events-none">
                                POCKET_LINK v1.0
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
