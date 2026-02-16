import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import { GAMA_MINT_ADDRESS, TREASURY_ADDRESS } from '@/utils/constants';

const ENDPOINT = 'https://api.devnet.solana.com';

export async function POST(req: NextRequest) {
    try {
        const { userWallet, amount } = await req.json();

        if (!userWallet || !amount) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // 1. Secret Key from Env
        const secretKeyString = process.env.TREASURY_SECRET_KEY;
        if (!secretKeyString) {
            return NextResponse.json({ error: "Treasury Secret Key not configured on server." }, { status: 500 });
        }

        const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
        const treasuryKeypair = Keypair.fromSecretKey(secretKey);

        if (treasuryKeypair.publicKey.toString() !== TREASURY_ADDRESS) {
            return NextResponse.json({ error: "Configured Secret Key does not match TREASURY_ADDRESS" }, { status: 500 });
        }

        const connection = new Connection(ENDPOINT, 'confirmed');
        const mintPubkey = new PublicKey(GAMA_MINT_ADDRESS);
        const userPubkey = new PublicKey(userWallet);
        const treasuryPubkey = treasuryKeypair.publicKey;

        // 2. Resolve ATAs
        const sourceATA = await getAssociatedTokenAddress(mintPubkey, treasuryPubkey);
        const destATA = await getAssociatedTokenAddress(mintPubkey, userPubkey);

        const transaction = new Transaction();

        // 3. Create Dest ATA if it doesn't exist
        try {
            await getAccount(connection, destATA);
        } catch (e) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    treasuryPubkey,
                    destATA,
                    userPubkey,
                    mintPubkey
                )
            );
        }

        // 4. Add Transfer Instruction
        const rawAmount = Math.round(parseFloat(amount) * 1_000_000_000); // 9 decimals
        transaction.add(
            createTransferInstruction(
                sourceATA,
                destATA,
                treasuryPubkey,
                rawAmount
            )
        );

        // 5. Sign and Send
        const signature = await sendAndConfirmTransaction(connection, transaction, [treasuryKeypair]);

        return NextResponse.json({ success: true, signature });

    } catch (error: any) {
        console.error("Withdrawal Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
