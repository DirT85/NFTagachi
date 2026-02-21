
import { NextRequest, NextResponse } from 'next/server';
import { generateSingleFrameSvg } from '../../../../utils/SpriteGenerator';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const monsterId = parseInt(id);

    const searchParams = request.nextUrl.searchParams;
    const skin = searchParams.get('skin') || 'DEFAULT';
    const bg = searchParams.get('bg') || '0';
    const mood = parseInt(searchParams.get('hp') || '100') < 30 ? 'DIE' : 'IDLE';

    // 1. Render the Dragon (first frame)
    const monsterSvg = generateSingleFrameSvg(mood);

    // 2. Map Background Colors
    const bgColors: Record<string, string> = {
        'FOREST': '#87CEEB',
        'SPACE': '#1a1a2e',
        'BEDROOM': '#F0E68C',
        'BACKYARD': '#87CEEB',
        'ARENA': '#9bbc0f',
        'MINECRAFT_WORLD': '#87CEEB',
        'CYBER_CITY': '#000033',
        'DEFAULT': '#9ea792'
    };
    const bgColor = bgColors[bg] || bgColors['DEFAULT'];

    // 3. Map Skin Colors (Simplified for NFT)
    const skinColors: Record<string, string> = {
        'FIRE_RED': '#b91c1c',
        'ELECTRIC_BLUE': '#1d4ed8',
        'GOLD_PLATED': '#fbbf24',
        'CARBON_FIBER': '#171717',
        'CLEAR_PURPLE': '#7e22ce',
        'DEFAULT': '#ffffff'
    };
    const skinColor = skinColors[skin] || skinColors['DEFAULT'];

    // 4. Composite SVG
    // 256x256 image
    // Frame: skinColor
    // Screen: bgColor + monsterSvg
    const compositeSvg = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <!-- Device Case -->
        <rect x="10" y="10" width="236" height="236" rx="20" fill="${skinColor}" stroke="rgba(0,0,0,0.2)" stroke-width="4" />
        
        <!-- Screen Area -->
        <rect x="40" y="40" width="176" height="176" rx="2" fill="${bgColor}" />
        <rect x="40" y="40" width="176" height="176" rx="2" fill="rgba(0,0,0,0.05)" /> <!-- LCD Tint -->

        <!-- Monster (Scaled and Centered) -->
        <g transform="translate(68, 68) scale(1.8)">
            ${monsterSvg.replace('<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
        </g>
        
        <!-- Stats Hint -->
        <text x="50" y="210" font-family="monospace" font-size="10" fill="rgba(0,0,0,0.4)" font-weight="bold">LV.${searchParams.get('level') || 1} HP.${searchParams.get('hp') || 100}</text>
    </svg>`.trim();

    return new NextResponse(compositeSvg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
