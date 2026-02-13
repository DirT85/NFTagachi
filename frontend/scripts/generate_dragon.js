const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------
// COMPONENT GRIDS (16x16)
// Defines the SHAPE of each part.
// ---------------------------------------------------------

// --- BODIES ---
// Just the blue bits, no eyes, no wings, no belly color yet (or maybe belly is part of body base)
const BODY_BASE_IDLE = [
    "................",
    "................",
    "....BBB.........",
    "...B..BB........",
    "..BBBBBB........",
    "..B.BBBB........",
    "..BBBBBB........",
    "...BBBBBBB......",
    "....BBBBBB......",
    ".....BBBB.......",
    ".....B..B.......",
    "....BB..BB......",
    "...BB....BB.....",
    "................",
    "................",
    "................"
];

// --- EYES ---
const EYES_NORMAL = [
    "................",
    "................",
    "................",
    "....RL..........", // R=Pupil/Eye, L=Highlight (if applicable)
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
];

const EYES_CYCLOPS = [
    "................",
    "................",
    "................",
    "....R...........", // Single center pixel?
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
];

const EYES_VISOR = [
    "................",
    "................",
    "................",
    "....RRR.........",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
];


// --- WINGS ---
const WINGS_DRAGON = [
    "................",
    "................",
    "................",
    "................",
    "...........W....",
    "..........WW....",
    "........WWWW....",
    "..........WW....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
];

// --- BELLY/ACCENTS ---
const BELLY_SCALES = [
    "................",
    "................",
    "................",
    "................",
    "................",
    "....Y...........",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
];


// ---------------------------------------------------------
// GENERATOR UTILS
// ---------------------------------------------------------

const COLORS = {
    // Body Colors
    CYAN: '#00FFFF',
    BLUE: '#1e3a8a',
    GREEN: '#10b981',
    RED: '#ef4444',
    // Eye Colors
    RED_EYE: '#ef4444',
    YELLOW_EYE: '#fbbf24',
    GREEN_EYE: '#10b981',
    // Wing Colors
    PURPLE: '#a855f7',
    SILVER: '#94a3b8'
};

function pixelToSvgRect(x, y, color) {
    const size = 4; // 16x16 grid * 4 = 64x64 frame
    return `<rect x="${x * size}" y="${y * size}" width="${size}" height="${size}" fill="${color}" />`;
}

function generateLayerSVG(grid, paletteMap) {
    let svgContent = "";

    // We are generating a single 64x64 frame for simplicity in this prototype
    // ideally we'd generate the full sheet, but let's start with static parts for the "Builder"
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const char = grid[y][x];
            if (char !== '.' && paletteMap[char]) {
                svgContent += pixelToSvgRect(x, y, paletteMap[char]);
            }
        }
    }

    return `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
}

function saveSVG(name, content) {
    const dir = path.join(__dirname, '../public/layers');
    const filePath = path.join(dir, name + '.svg');
    fs.writeFileSync(filePath, content);
    console.log(`Saved ${name}.svg`);
}

// ---------------------------------------------------------
// EXECUTION
// ---------------------------------------------------------

// 1. BODIES
saveSVG('body_blue', generateLayerSVG(BODY_BASE_IDLE, { 'B': COLORS.BLUE }));
saveSVG('body_green', generateLayerSVG(BODY_BASE_IDLE, { 'B': COLORS.GREEN }));
saveSVG('body_red', generateLayerSVG(BODY_BASE_IDLE, { 'B': COLORS.RED }));

// 2. EYES
saveSVG('eyes_normal', generateLayerSVG(EYES_NORMAL, { 'R': COLORS.RED_EYE, 'L': '#fff' }));
saveSVG('eyes_cyclops', generateLayerSVG(EYES_CYCLOPS, { 'R': COLORS.YELLOW_EYE }));
saveSVG('eyes_visor', generateLayerSVG(EYES_VISOR, { 'R': COLORS.CYAN }));

// 3. WINGS
saveSVG('wings_purple', generateLayerSVG(WINGS_DRAGON, { 'W': COLORS.PURPLE }));
saveSVG('wings_silver', generateLayerSVG(WINGS_DRAGON, { 'W': COLORS.SILVER }));

// 4. BELLY
saveSVG('belly_yellow', generateLayerSVG(BELLY_SCALES, { 'Y': '#fbbf24' }));
