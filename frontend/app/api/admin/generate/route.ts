import { NextRequest, NextResponse } from 'next/server';
import { generateMonsterSprite } from '@/utils/generatorV8';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("x-admin-password");

    if (authHeader !== "shagrat1qaZ") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { seed, bodyType, theme, weapon, head, hair } = await req.json();
        const id = parseInt(seed) || Math.floor(Math.random() * 9999);

        const result = generateMonsterSprite(id, { bodyType, theme, weapon, head, hair });
        const { buffer, logs } = result;

        // DEBUG: Save to public folder
        const debugPath = path.join(process.cwd(), 'public', 'debug.png');
        fs.writeFileSync(debugPath, buffer);

        const base64 = buffer.toString('base64');
        const dataUri = `data:image/png;base64,${base64}`;

        return NextResponse.json({ success: true, id, image: dataUri, logs });
    } catch (error: any) {
        console.error("Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
