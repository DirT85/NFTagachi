import { useState, useEffect, useCallback } from 'react';

interface TradeData {
    mint: string;
    price: number;
    solAmount: number;
    tokenAmount: number;
    isBuy: boolean;
    timestamp: number;
    bondingCurveProgress: number; // Simulated or calculated
    marketCapSol: number;
}

interface PumpFunState {
    isConnected: boolean;
    lastTrade: TradeData | null;
    bondingCurveProgress: number; // 0 to 100
    marketCap: number; // in SOL
    kingsOfTheHill: any[]; // Placeholder for KOTH data
}

export const usePumpFun = (tokenMint?: string) => {
    const [state, setState] = useState<PumpFunState>({
        isConnected: false,
        lastTrade: null,
        bondingCurveProgress: 0,
        marketCap: 0,
        kingsOfTheHill: []
    });

    // WebSocket Connection
    useEffect(() => {
        if (!tokenMint) return;

        const ws = new WebSocket('wss://pumpportal.fun/api/data');

        ws.onopen = () => {
            console.log('Connected to PumpPortal WS');
            setState(prev => ({ ...prev, isConnected: true }));

            // Subscribe to trades for the specific token
            const payload = {
                method: "subscribeTokenTrade",
                keys: [tokenMint]
            };
            ws.send(JSON.stringify(payload));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Handle Trade Updates
                if (data.txType === 'buy' || data.txType === 'sell') {
                    // Calculate basic stats (Mock logic for now as PumpPortal raw data varies)
                    // Real implementation would parse 'vSolInBondingCurve' if available
                    // For now, we update price and simulate curve progress based on MCAP estimate

                    const solAmount = data.solAmount;
                    const tokenAmount = data.tokenAmount;
                    const price = solAmount / tokenAmount;

                    // Estimate MCAP (Simplified)
                    // limit: ~85 SOL for migration? or 600 SOL?
                    // Pump.fun migration is usually around $60k USD (~400-500 SOL)
                    // We'll trust the simulation for now or fetch initial state separately

                    setState(prev => ({
                        ...prev,
                        lastTrade: {
                            mint: data.mint,
                            price: price,
                            solAmount: solAmount,
                            tokenAmount: tokenAmount,
                            isBuy: data.txType === 'buy',
                            timestamp: Date.now(),
                            bondingCurveProgress: prev.bondingCurveProgress, // Keep prev until update
                            marketCapSol: data.marketCapSol || 0 // If provided
                        },
                        // We might need a separate API call to get the INITIAL curve state
                        // The WS gives deltas/trades. 
                    }));
                }
            } catch (e) {
                console.error("PumpFun WS Error:", e);
            }
        };

        ws.onclose = () => {
            console.log('PumpPortal WS Closed');
            setState(prev => ({ ...prev, isConnected: false }));
        };

        return () => {
            ws.close();
        };
    }, [tokenMint]);

    return state;
};
