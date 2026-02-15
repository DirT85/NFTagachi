
import { PublicKey } from "@solana/web3.js";

// =========================================================================
//  WALLET & CHAIN CONFIGURATION
// =========================================================================

// 1. GAMA TOKEN MINT
// Replace this with your actual SPL Token Mint Address.
// If not set, the game will try to fetch it from the on-chain program state (which might fail in Mock Mode).
export const GAMA_MINT_ADDRESS = "YOUR_GAMA_MINT_ADDRESS_HERE";

// 2. GAME TREASURY WALLET
// This is the wallet that receives deposits from users.
// It should be a wallet you control (e.g., the Game Admin wallet).
export const TREASURY_ADDRESS = "YOUR_TREASURY_WALLET_ADDRESS_HERE";

// 3. GAME SETTINGS
export const INITIAL_GAME_BALANCE = 0; // Starting GAMA for new users (Default: 0 to prevent exploits)
export const WITHDRAWAL_FEE_PERCENT = 5; // 5% fee on withdrawals (Simulated)
