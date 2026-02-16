
import { PublicKey } from "@solana/web3.js";

// =========================================================================
//  WALLET & CHAIN CONFIGURATION
// =========================================================================

// 1. GAMA TOKEN MINT
// Update this with your SPL Token Mint address created in the Devnet Admin Panel.
// Example: "HgZ3fK1jsiG1G...YOUR_COLLECTION"
export const GAMA_MINT_ADDRESS = "YOUR_GAMA_MINT_ADDRESS_HERE";

// 2. GAME TREASURY WALLET
// This is where deposits are sent. Set it to your Admin or Game wallet.
export const TREASURY_ADDRESS = "YOUR_TREASURY_WALLET_ADDRESS_HERE";

// 3. GAME SETTINGS
export const INITIAL_GAME_BALANCE = 0; // Starting GAMA for new users (Default: 0 to prevent exploits)
export const WITHDRAWAL_FEE_PERCENT = 5; // 5% fee on withdrawals (Simulated)
