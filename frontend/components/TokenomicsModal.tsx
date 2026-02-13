import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins } from 'lucide-react';
import { TokenomicsMap } from './TokenomicsMap';

interface TokenomicsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TokenomicsModal = ({ isOpen, onClose }: TokenomicsModalProps) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-4xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 text-white/50 hover:text-white bg-black/50 p-2 rounded-full border border-white/10 transition-colors z-50"
                    >
                        <X size={24} />
                    </button>

                    <TokenomicsMap />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
