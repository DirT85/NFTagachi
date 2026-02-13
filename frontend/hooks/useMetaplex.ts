
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';

// Devnet Endpoint
const ENDPOINT = 'https://api.devnet.solana.com';

export const useMetaplex = () => {
    const wallet = useWallet();

    // Initialize Umi
    const umi = useMemo(() => {
        const u = createUmi(ENDPOINT)
            .use(mplCore()) // Register MPL Core Plugin
            .use(irysUploader({
                address: 'https://devnet.irys.xyz',
                providerUrl: ENDPOINT,  // Ensure Irys checks the same Devnet RPC
                timeout: 60000,         // Increase timeout for busy network
            })); // Register Irys Uploader

        // If wallet is connected, register it as the signer
        if (wallet.connected && wallet.publicKey) {
            u.use(walletAdapterIdentity(wallet));
        }

        return u;
    }, [wallet.connected, wallet.publicKey]); // Re-create if wallet changes

    return umi;
};
