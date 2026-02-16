
import { PublicKey } from "@solana/web3.js";

// =========================================================================
//  WALLET & CHAIN CONFIGURATION
// =========================================================================

// 1. GAMA TOKEN MINT
// Update this with your SPL Token Mint address created in the Devnet Admin Panel.
// Example: "HgZ3fK1jsiG1G...YOUR_COLLECTION"
export const GAMA_MINT_ADDRESS = "95VUqw2CHaNwERWbkXrQQVeMtn9Zui6YJawXNd81Ksxy";

// 2. GAME TREASURY WALLET
export const TREASURY_ADDRESS = "AdoB3NjE4QuPqDhjigYm5rmyoUCMpYLNvUcXJRTx57Tj";

// 3. ON-CHAIN COLLECTIONS (Metaplex Core)
// Update these after creating your Master Collections in the Admin Panel
export const MONSTER_COLLECTION = "YOUR_MONSTER_COLLECTION_ADDRESS";
export const DEVICE_COLLECTION = "YOUR_DEVICE_COLLECTION_ADDRESS";
export const BACKGROUND_COLLECTION = "YOUR_BG_COLLECTION_ADDRESS";

// 4. GAME SETTINGS
export const INITIAL_GAME_BALANCE = 0; // Starting GAMA for new users (Default: 0 to prevent exploits)
export const WITHDRAWAL_FEE_PERCENT = 5; // 5% fee on withdrawals (Simulated)
