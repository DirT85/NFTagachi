const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

(async () => {
    // Connect to Devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const publicKey = new PublicKey('7yAGam7Cjic6sjaM8wyq1ZK781CynXGPCk4QJZM49iFk');

    console.log(`Checking Balance for ${publicKey.toBase58()}...`);

    try {
        const balance = await connection.getBalance(publicKey);
        const sol = balance / LAMPORTS_PER_SOL;
        console.log(`💰 BALANCE: ${sol} SOL`);

        if (sol > 0.001) {
            console.log('✅ YOU ARE RICH! GO UPLOAD!');
        } else {
            console.log('❌ YOU ARE BROKE. USE THE FAUCET: https://faucet.quicknode.com/solana/testnet');
        }
    } catch (e) {
        console.error('CHECK FAILED:', e);
    }
})();
