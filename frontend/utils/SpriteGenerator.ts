
// ---------------------------------------------------------
// 16x16 PIXEL ART GRIDS
// . = Transparent
// B = Body (Dark Blue)
// L = Highlight (Light Blue)
// R = Eye (Red)
// Y = Belly (Yellow)
// W = Wing (Purple/Silver)
// F = Fire (Orange)
// ---------------------------------------------------------

const IDLE_1 = [
    "................",
    "................",
    "....BBB.........",
    "...BRLBB........",
    "..BBBBBB...W....",
    "..BYBBBB..WW....",
    "..BBBBBBWWWW....",
    "...BBBBBBBWW....",
    "....BBBBBB......",
    ".....BBBB.......",
    ".....B..B.......",
    "....BB..BB......",
    "...BB....BB.....",
    "................",
    "................",
    "................"
];

const IDLE_2 = [
    "................",
    "................",
    "....BBB.........",
    "...BRLBB........",
    "..BBBBBB...W....",
    "..BYBBBB..WW....",
    "..BBBBBBWWWW....",
    "...BBBBBBBWW....",
    "....BBBBBB......",
    ".....BBBB.......",
    ".....B..B.......",
    "....BB..........", // Leg up
    "...BB....BB.....",
    "................",
    "................",
    "................"
];

const ATTACK_1 = [
    "................",
    "................",
    "....BBB.........",
    "...BRLBB........",
    "..BBBBBB...W....",
    "..BYBBBB..WW....",
    "..BBBBBBWWWW....",
    "...BBBBBBBWW....",
    "....BBBBBB......",
    ".....BBBB.......",
    ".....B..B.......",
    "....BB..BB......",
    "...BB....BB.....",
    "................",
    "................",
    "................"
];

const ATTACK_2 = [
    "................",
    "................",
    "....BB..........", // Head back
    "...BRLB.........",
    "..BBBBBB...W....",
    "..BYBBBB..WW....",
    "..BBBBBBWWWW....",
    "...BBBBBBBWW....",
    "....BBBBBB......",
    ".....BBBB.......",
    ".....B..B.......",
    "....BB..........",
    "...BB....BB.....",
    "................",
    "................",
    "................"
];

const ATTACK_3 = [
    "................",
    "................",
    "....BB..........",
    "...BRLB.FFF.....", // Fire!
    "..BBBBBBFFFF....",
    "..BYBBBB.FFF....",
    "..BBBBBBWWWW....",
    "...BBBBBBBWW....",
    "....BBBBBB......",
    ".....BBBB.......",
    ".....B..B.......",
    "....BB..BB......",
    "...BB....BB.....",
    "................",
    "................",
    "................"
];

// ---------------------------------------------------------
// COLOR MAPS
// ---------------------------------------------------------
const PALETTE: Record<string, Record<string, string>> = {
    IDLE: {
        'B': '#1e3a8a', 'L': '#3b82f6', 'R': '#ef4444', 'Y': '#fbbf24', 'W': '#94a3b8', 'F': '#f97316'
    },
    WALK: { // Green Variant
        'B': '#14532d', 'L': '#22c55e', 'R': '#ef4444', 'Y': '#fbbf24', 'W': '#94a3b8', 'F': '#f97316'
    },
    EAT: { // Yellow Variant
        'B': '#a16207', 'L': '#eab308', 'R': '#ef4444', 'Y': '#fef08a', 'W': '#94a3b8', 'F': '#f97316'
    },
    DIE: { // Gray/Glitch
        'B': '#1f2937', 'L': '#9ca3af', 'R': '#000000', 'Y': '#374151', 'W': '#d1d5db', 'F': '#ef4444'
    },
    ATK: { // Red Variant
        'B': '#991b1b', 'L': '#ef4444', 'R': '#fbbf24', 'Y': '#fee2e2', 'W': '#94a3b8', 'F': '#f59e0b'
    }
};

// ---------------------------------------------------------
// SVG GENERATOR
// ---------------------------------------------------------

function pixelToSvgRect(x: number, y: number, color: string, offsetX: number, offsetY: number) {
    const size = 4;
    return `<rect x="${(x * size) + offsetX}" y="${(y * size) + offsetY}" width="${size}" height="${size}" fill="${color}" />`;
}

function generateFrame(grid: string[], rowIdx: number, colIdx: number, palette: Record<string, string>) {
    let svgContent = "";
    const offsetX = colIdx * 64;
    const offsetY = rowIdx * 64;

    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const char = grid[y][x];
            if (char !== '.') {
                const color = palette[char] || 'black';
                svgContent += pixelToSvgRect(x, y, color, offsetX, offsetY);
            }
        }
    }
    return svgContent;
}

export const generateDragonSvg = (state: 'IDLE' | 'WALK' | 'EAT' | 'DIE' | 'ATK' = 'IDLE') => {
    let svgBody = "";
    const palette = PALETTE[state] || PALETTE.IDLE;

    // For single state view (e.g. metadata image), we might just render the first frame or a loop?
    // The sprite sheet logic renders ALL frames.
    // Let's keep the sprite sheet logic for consistency with the game engine.

    // Row 0: IDLE
    svgBody += generateFrame(IDLE_1, 0, 0, PALETTE.IDLE);
    svgBody += generateFrame(IDLE_2, 0, 1, PALETTE.IDLE);
    svgBody += generateFrame(IDLE_1, 0, 2, PALETTE.IDLE);
    svgBody += generateFrame(IDLE_2, 0, 3, PALETTE.IDLE);

    // Row 1: WALK
    svgBody += generateFrame(IDLE_1, 1, 0, PALETTE.WALK);
    svgBody += generateFrame(IDLE_2, 1, 1, PALETTE.WALK);
    svgBody += generateFrame(IDLE_1, 1, 2, PALETTE.WALK);
    svgBody += generateFrame(IDLE_2, 1, 3, PALETTE.WALK);

    // Row 2: EAT
    svgBody += generateFrame(ATTACK_1, 2, 0, PALETTE.EAT);
    svgBody += generateFrame(ATTACK_2, 2, 1, PALETTE.EAT);
    svgBody += generateFrame(ATTACK_3, 2, 2, PALETTE.EAT);
    svgBody += generateFrame(ATTACK_1, 2, 3, PALETTE.EAT);

    // Row 3: DIE/SAD
    svgBody += generateFrame(IDLE_1, 3, 0, PALETTE.DIE);
    svgBody += generateFrame(IDLE_2, 3, 1, PALETTE.DIE);
    svgBody += generateFrame(IDLE_1, 3, 2, PALETTE.DIE);
    svgBody += generateFrame(IDLE_2, 3, 3, PALETTE.DIE);

    // Row 4: ATTACK
    svgBody += generateFrame(ATTACK_1, 4, 0, PALETTE.ATK);
    svgBody += generateFrame(ATTACK_2, 4, 1, PALETTE.ATK);
    svgBody += generateFrame(ATTACK_3, 4, 2, PALETTE.ATK);
    svgBody += generateFrame(ATTACK_3, 4, 3, PALETTE.ATK);

    const fullSvg = `<svg width="256" height="320" xmlns="http://www.w3.org/2000/svg">
      ${svgBody}
    </svg>`;

    return fullSvg;
}

// Function to generate a SINGLE 64x64 SVG for a specific state (static image for wallets)
export const generateSingleFrameSvg = (state: 'IDLE' | 'WALK' | 'EAT' | 'DIE' | 'ATK' = 'IDLE') => {
    const palette = PALETTE[state] || PALETTE.IDLE;
    const grid = (state === 'ATK' || state === 'EAT') ? ATTACK_3 : IDLE_1;

    // Offset 0,0 since it's a single image
    const content = generateFrame(grid, 0, 0, palette);

    return `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      ${content}
    </svg>`;
}
