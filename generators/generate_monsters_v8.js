const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

/**
 * Procedural Monster Generator V8 (PNG Version)
 * Generates 256x256 sprite sheets (4x4 frames of 64x64)
 */

const OUTPUT_DIR = path.join(__dirname, '../frontend/public/collection_v8');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const THEMES = [
    { name: 'Water', p: [99, 144, 240], s: [74, 108, 195], h: [157, 183, 245], b: [234, 214, 184], c: [255, 255, 255] },
    { name: 'Fire', p: [240, 128, 48], s: [192, 96, 32], h: [248, 160, 96], b: [248, 208, 48], c: [255, 255, 255] },
    { name: 'Grass', p: [128, 192, 112], s: [80, 144, 80], h: [160, 208, 144], b: [96, 144, 112], c: [255, 255, 255] },
    { name: 'Poison', p: [160, 64, 160], s: [112, 48, 112], h: [192, 96, 192], b: [224, 224, 224], c: [255, 255, 255] },
    { name: 'Shadow', p: [48, 48, 48], s: [16, 16, 16], h: [80, 80, 80], b: [160, 160, 160], c: [255, 0, 0] },
];

function setPixel(png, x, y, color) {
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
    const idx = (png.width * y + x) << 2;
    png.data[idx] = color[0];
    png.data[idx + 1] = color[1];
    png.data[idx + 2] = color[2];
    png.data[idx + 3] = color[3] !== undefined ? color[3] : 255;
}

function drawRect(png, x_off, y_off, x, y, w, h, color) {
    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            setPixel(png, x_off + x + dx, y_off + y + dy, color);
        }
    }
}

function drawCircle(png, x_off, y_off, cx, cy, r, color) {
    for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
            if ((x - cx) ** 2 + (y - cy) ** 2 <= r ** 2) {
                setPixel(png, x_off + x, y_off + y, color);
            }
        }
    }
}

function drawHumanoid(png, x_off, y_off, frame, theme, subtype, anim) {
    let bob = 0;
    let l_leg_off = 0, r_leg_off = 0;

    if (anim === 'IDLE') bob = frame % 2 === 0 ? 1 : 0;
    if (anim === 'WALK') {
        bob = Math.abs(frame - 1);
        l_leg_off = frame === 0 ? -2 : 2;
        r_leg_off = frame === 0 ? 2 : -2;
    }

    const cPrimary = theme.p;
    const cSecondary = theme.s;
    const cAccent = theme.c;

    // Legs
    drawRect(png, x_off, y_off, 24, 40 + bob + l_leg_off, 6, 18, cSecondary);
    drawRect(png, x_off, y_off, 34, 40 + bob + r_leg_off, 6, 18, cSecondary);

    // Torso
    drawRect(png, x_off, y_off, 18, 22 + bob, 28, 22, cPrimary);

    // Head
    drawRect(png, x_off, y_off, 22, 10 + bob, 20, 18, cPrimary);

    // Eyes
    drawRect(png, x_off, y_off, 26, 16 + bob, 4, 4, [255, 255, 255]);
    drawRect(png, x_off, y_off, 34, 16 + bob, 4, 4, [255, 255, 255]);
    drawRect(png, x_off, y_off, 28, 17 + bob, 2, 2, [0, 0, 0]);
    drawRect(png, x_off, y_off, 34, 17 + bob, 2, 2, [0, 0, 0]);
}

function drawSnake(png, x_off, y_off, frame, theme, anim) {
    let sway = anim === 'IDLE' ? (frame % 2 === 0 ? 2 : -2) : (frame - 1.5) * 4;
    const cPrimary = theme.p;
    const cBelly = theme.s;

    for (let i = 0; i < 5; i++) {
        let s = sway * (i % 2 === 0 ? 1 : -1);
        drawCircle(png, x_off, y_off, 32 + (s | 0), 56 - i * 6, 10 - i, cPrimary);
        drawCircle(png, x_off, y_off, 32 + (s | 0), 56 - i * 6, 6 - i, cBelly);
    }

    // Head
    drawCircle(png, x_off, y_off, 32 + (sway | 0), 26, 12, cPrimary);
    drawRect(png, x_off, y_off, 32 + (sway | 0) - 6, 24, 4, 4, [255, 255, 255]);
    drawRect(png, x_off, y_off, 32 + (sway | 0) + 2, 24, 4, 4, [255, 255, 255]);
}

function drawBeast(png, x_off, y_off, frame, theme, anim) {
    let bob = frame % 2 === 0 ? 1 : 0;
    const cPrimary = theme.p;
    const cShell = theme.s;

    drawCircle(png, x_off, y_off, 32, 40 + bob, 18, cShell);
    drawRect(png, x_off, y_off, 18, 50 + bob, 8, 10, cPrimary);
    drawRect(png, x_off, y_off, 38, 50 + bob, 8, 10, cPrimary);
    drawRect(png, x_off, y_off, 26, 28 + bob, 12, 10, cPrimary);
}

function drawAlien(png, x_off, y_off, frame, theme, anim) {
    let floatY = (Math.sin(frame) * 4) | 0;
    const cPrimary = theme.p;
    const cGlow = theme.c;

    drawCircle(png, x_off, y_off, 32, 32 + floatY, 14, cPrimary);
    for (let i = 0; i < 4; i++) {
        let angle = frame * 0.5 + i * 1.57;
        let ox = (Math.cos(angle) * 20) | 0;
        let oy = (Math.sin(angle) * 10) | 0;
        drawCircle(png, x_off, y_off, 32 + ox, 32 + floatY + oy, 4, cGlow);
    }
    drawCircle(png, x_off, y_off, 32, 32 + floatY, 6, [255, 255, 255]);
    drawCircle(png, x_off, y_off, 32, 32 + floatY, 2, [0, 0, 0]);
}

function generateSheet(id) {
    const png = new PNG({ width: 256, height: 256, colorType: 6 });
    const seed = id;
    const archetype = seed % 10 < 4 ? 'HUMANOID' : (seed % 10 < 6 ? 'SNAKE' : (seed % 10 < 8 ? 'BEAST' : 'ALIEN'));
    const theme = THEMES[seed % THEMES.length];
    const anims = ['IDLE', 'WALK', 'EAT', 'ATTACK'];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const x_off = col * 64;
            const y_off = row * 64;
            const anim = anims[row];
            const frame = col;

            // Shadow
            for (let sy = 56; sy < 64; sy++) {
                for (let sx = 14; sx < 50; sx++) {
                    if ((sx - 32) ** 2 / 18 ** 2 + (sy - 60) ** 2 / 4 ** 2 <= 1) {
                        setPixel(png, x_off + sx, y_off + sy, [0, 0, 0, 75]);
                    }
                }
            }

            if (archetype === 'HUMANOID') drawHumanoid(png, x_off, y_off, frame, theme, 'GOLEM', anim);
            else if (archetype === 'SNAKE') drawSnake(png, x_off, y_off, frame, theme, anim);
            else if (archetype === 'BEAST') drawBeast(png, x_off, y_off, frame, theme, anim);
            else if (archetype === 'ALIEN') drawAlien(png, x_off, y_off, frame, theme, anim);
        }
    }

    const buffer = PNG.sync.write(png);
    fs.writeFileSync(path.join(OUTPUT_DIR, `sheet_${id}.png`), buffer);
}

console.log('Generating collection_v8...');
for (let i = 0; i < 300; i++) {
    generateSheet(i);
    if (i % 50 === 0) console.log(`Generated ${i} sheets...`);
}
console.log('Done!');
