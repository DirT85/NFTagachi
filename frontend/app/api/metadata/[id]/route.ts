
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const monsterId = parseInt(id);
    const baseUrl = process.env.RENDER_EXTERNAL_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const searchParams = request.nextUrl.searchParams;
    const skin = searchParams.get('skin') || 'DEFAULT';
    const bg = searchParams.get('bg') || '0';
    const level = searchParams.get('level') || '1';
    const tier = searchParams.get('tier') || 'COMMON';
    const type = searchParams.get('type') || 'NEUTRAL';
    const hp = searchParams.get('hp') || '100';
    const atk = searchParams.get('atk') || '10';

    // Mock Metadata
    let name = `NFTagachi #${id}`;
    if (monsterId === 42) name = "Cyber Dragon";

    const description = "A living, breathing digital pet on Solana. Baked with custom state.";

    const metadata = {
        name,
        description,
        image: `${baseUrl}/api/image/${id}?${searchParams.toString()}`, // Pass through all params for the "baked" image
        external_url: `${baseUrl}/pet/${id}`,
        attributes: [
            { trait_type: "Tier", value: tier },
            { trait_type: "Type", value: type },
            { trait_type: "Level", value: parseInt(level) },
            { trait_type: "HP", value: parseInt(hp) },
            { trait_type: "Attack", value: parseInt(atk) },
            { trait_type: "Device Skin", value: skin === 'DEFAULT' ? 'Default White' : skin },
            { trait_type: "Background", value: bg === '0' || bg === 'DEFAULT' ? 'Classic LCD' : bg },
            { trait_type: "Generation", value: "Gen 0" }
        ]
    };

    return NextResponse.json(metadata);
}
