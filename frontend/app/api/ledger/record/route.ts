import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LEDGER_PATH = path.join(process.cwd(), 'data', 'ledger.json');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to read ledger
const readLedger = () => {
    if (!fs.existsSync(LEDGER_PATH)) return {};
    try {
        const data = fs.readFileSync(LEDGER_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
};

// Helper to write ledger
const writeLedger = (data: any) => {
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(data, null, 2));
};

export async function POST(req: NextRequest) {
    try {
        const { userWallet, action, amount, secret } = await req.json();

        // Simple protection against client-side spoofing
        // In a real app, this should be a robust auth check or signed by the game client
        if (secret !== process.env.LEDGER_SECRET_KEY && secret !== "shagrat1qaZ") {
            return NextResponse.json({ error: "Unauthorized Ledger Update" }, { status: 401 });
        }

        if (!userWallet || !amount) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const ledger = readLedger();
        const currentBalance = ledger[userWallet] || 0;

        // Update balance
        ledger[userWallet] = currentBalance + amount;

        writeLedger(ledger);

        console.log(`[LEDGER] Updated ${userWallet}: +${amount} GAMA (Total: ${ledger[userWallet]})`);

        return NextResponse.json({ success: true, balance: ledger[userWallet] });

    } catch (error: any) {
        console.error("Ledger Record Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
