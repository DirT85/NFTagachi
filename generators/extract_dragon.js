const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const ASSETS_DIR = 'd:/NFTagachi/generators/dragon_assets';
const OUTPUT_BASE = 'd:/NFTagachi/generators/lpc_assets/spritesheets/dragon';

// Ensure output structure exists
const folders = ['heads', 'wings', 'tails', 'bodies', 'legs'];
folders.forEach(f => {
    const p = path.join(OUTPUT_BASE, f);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

function salvagePart(data, width, height, sx, sy, size = 64) {
    const output = new PNG({ width: size, height: size });

    // Sample background color (1,1)
    const bgIdx = (Math.min(sy + 1, height - 1) * width + Math.min(sx + 1, width - 1)) << 2;
    const bgr = data[bgIdx];
    const bgg = data[bgIdx + 1];
    const bgb = data[bgIdx + 2];

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const py = sy + y;
            const px = sx + x;
            if (px >= width || py >= height) continue;

            const idx = (py * width + px) << 2;
            const outIdx = (y * size + x) << 2;

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            let isTransparent = false;

            // 1. Grid lines (Dark/Black)
            const isGrid = (x % size === 0 || x % size === size - 1 || y % size === 0 || y % size === size - 1);
            if (isGrid && r < 50 && g < 50 && b < 50) isTransparent = true;

            // 2. Background color match
            const dist = Math.sqrt((r - bgr) ** 2 + (g - bgg) ** 2 + (b - bgb) ** 2);
            if (dist < 40) isTransparent = true;

            // 3. Absolute white/black safety
            if ((r > 245 && g > 245 && b > 245) || (r < 10 && g < 10 && b < 10)) isTransparent = true;

            if (isTransparent) {
                output.data[outIdx + 3] = 0;
            } else {
                output.data[outIdx] = r;
                output.data[outIdx + 1] = g;
                output.data[outIdx + 2] = b;
                output.data[outIdx + 3] = 255;
            }
        }
    }
    return output;
}

function processSheet(fileName, config, frameSize = 64, cols = 1) {
    console.log(`Processing ${fileName} (${frameSize}px grid)...`);
    const filePath = path.join(ASSETS_DIR, fileName);
    if (!fs.existsSync(filePath)) {
        console.error(`  Error: ${fileName} not found!`);
        return;
    }
    const raw = fs.readFileSync(filePath);
    const decoded = jpeg.decode(raw);
    const { width, height, data } = decoded;

    config.forEach(item => {
        const { row, col, type, name } = item;
        for (let c = 0; c < cols; c++) {
            const sx = (col + c) * frameSize;
            const sy = row * frameSize;
            if (sx + frameSize > width || sy + frameSize > height) {
                console.warn(`  Warning: Out of bounds for ${name} at col ${c}`);
                continue;
            }
            const outPng = salvagePart(data, width, height, sx, sy, frameSize);
            const suffix = c === 0 ? '' : `_frame_${c}`;
            const outPath = path.join(OUTPUT_BASE, type, name + suffix + '.png');
            fs.writeFileSync(outPath, PNG.sync.write(outPng));
        }
        console.log(`  Saved ${type}/${name} (${cols} frames)`);
    });
}

// 1. Organic Master (64px, single frames / variants)
const organicConfig = [
    { row: 0, col: 0, type: 'heads', name: 'org_blue' },
    { row: 0, col: 1, type: 'heads', name: 'org_green' },
    { row: 0, col: 2, type: 'heads', name: 'org_red' },
    { row: 0, col: 3, type: 'heads', name: 'org_teal' },
    { row: 0, col: 5, type: 'heads', name: 'org_ice' },
    { row: 0, col: 6, type: 'heads', name: 'org_fire' },

    { row: 1, col: 0, type: 'wings', name: 'org_wing_blue_open' },
    { row: 3, col: 0, type: 'wings', name: 'org_wing_green_open' },
    { row: 2, col: 2, type: 'wings', name: 'org_wing_red_open' },

    { row: 5, col: 0, type: 'legs', name: 'org_leg_blue' },
    { row: 5, col: 1, type: 'legs', name: 'org_leg_green' },
    { row: 5, col: 4, type: 'legs', name: 'org_leg_red' },

    { row: 7, col: 0, type: 'bodies', name: 'org_body_blue' },
    { row: 7, col: 1, type: 'bodies', name: 'org_body_green' },
    { row: 7, col: 4, type: 'bodies', name: 'org_body_red' },

    { row: 6, col: 0, type: 'tails', name: 'org_tail_blue' },
    { row: 6, col: 1, type: 'tails', name: 'org_tail_green' },
    { row: 6, col: 3, type: 'tails', name: 'org_tail_red' },
];

processSheet('organic_master.png', organicConfig, 64, 1);

// 2. Cyber Master (128px grid, Hero standard, 5 columns)
const cyberConfig = [
    { row: 0, col: 0, type: 'heads', name: 'cyber_full_blue' },
    { row: 1, col: 0, type: 'heads', name: 'cyber_full_red' },
    { row: 2, col: 0, type: 'bodies', name: 'cyber_body_tank_blue' },
    { row: 3, col: 0, type: 'bodies', name: 'cyber_body_tank_red' },
    { row: 4, col: 0, type: 'legs', name: 'cyber_legs_mech_blue' },
    { row: 5, col: 0, type: 'legs', name: 'cyber_legs_mech_red' },
    { row: 6, col: 0, type: 'tails', name: 'cyber_tail_long_blue' },
    { row: 7, col: 0, type: 'tails', name: 'cyber_tail_long_red' },
];

processSheet('cyber_master.png', cyberConfig, 128, 5);

// 3. Cyber Parts (64px grid, modular)
const cyberPartsConfig = [
    { row: 0, col: 0, type: 'heads', name: 'cyber_head_basic' },
    { row: 1, col: 2, type: 'bodies', name: 'cyber_body_power' },
    { row: 3, col: 0, type: 'wings', name: 'cyber_wing_metal' },
    { row: 5, col: 0, type: 'legs', name: 'cyber_leg_jointed' },
    { row: 7, col: 0, type: 'tails', name: 'cyber_tail_blade' },
];

processSheet('cyber_parts_master.png', cyberPartsConfig, 64, 1);
