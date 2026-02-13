import { NextRequest, NextResponse } from 'next/server';
import { generateMonsterSprite } from '@/utils/generatorV8';

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("x-admin-password");

    if (authHeader !== "shagrat1qaZ") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { seed } = await req.json();
        const id = parseInt(seed) || Math.floor(Math.random() * 9999);

        const buffer = generateMonsterSprite(id);
        const base64 = buffer.toString('base64');
        const dataUri = `data:image/png;base64,${base64}`;

        return NextResponse.json({ success: true, id, image: dataUri });
    } catch (error: any) {
        console.error("Geneartion Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
