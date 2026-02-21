import { PNG } from 'pngjs';

// ============================================================
// GENERATORV9 — Custom Procedural Pixel Art Sprite Generator
// No external assets. Every pixel drawn in code.
// Output: 1024x1024 (8x8 grid of 128px frames)
// ============================================================

const FRAME = 128;
const COLS = 8;
const ROWS = 8;
const SHEET_W = FRAME * COLS;  // 1024
const SHEET_H = FRAME * ROWS;  // 1024

// ============ TYPES ============
type RGBA = [number, number, number, number];
type Palette = { outline: RGBA; shadow: RGBA; base: RGBA; light: RGBA; glow?: RGBA };

interface BodyPose {
    headX: number; headY: number;
    bodyX: number; bodyY: number;
    lArmX: number; lArmY: number; lArmAngle: number;
    rArmX: number; rArmY: number; rArmAngle: number;
    lLegX: number; lLegY: number;
    rLegX: number; rLegY: number;
    weaponX: number; weaponY: number; weaponAngle: number;
    extraOffsetY?: number;
}

// ============ DRAWING PRIMITIVES ============
function setPixel(png: PNG, x: number, y: number, c: RGBA) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || ix >= png.width || iy < 0 || iy >= png.height) return;
    const idx = (png.width * iy + ix) << 2;
    const a1 = c[3] / 255;
    if (a1 <= 0) return;
    const a2 = png.data[idx + 3] / 255;
    const aOut = a1 + a2 * (1 - a1);
    if (aOut > 0) {
        png.data[idx] = Math.round((c[0] * a1 + png.data[idx] * a2 * (1 - a1)) / aOut);
        png.data[idx + 1] = Math.round((c[1] * a1 + png.data[idx + 1] * a2 * (1 - a1)) / aOut);
        png.data[idx + 2] = Math.round((c[2] * a1 + png.data[idx + 2] * a2 * (1 - a1)) / aOut);
        png.data[idx + 3] = Math.round(aOut * 255);
    }
}

function fillRect(png: PNG, x: number, y: number, w: number, h: number, c: RGBA) {
    for (let dy = 0; dy < h; dy++)
        for (let dx = 0; dx < w; dx++)
            setPixel(png, x + dx, y + dy, c);
}

function fillCircle(png: PNG, cx: number, cy: number, r: number, c: RGBA) {
    const r2 = r * r;
    for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++)
            if (dx * dx + dy * dy <= r2) setPixel(png, cx + dx, cy + dy, c);
}

function outlineCircle(png: PNG, cx: number, cy: number, r: number, c: RGBA, thick: number = 1) {
    const outer = r * r;
    const inner = (r - thick) * (r - thick);
    for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
            const d = dx * dx + dy * dy;
            if (d <= outer && d >= inner) setPixel(png, cx + dx, cy + dy, c);
        }
}

function fillEllipse(png: PNG, cx: number, cy: number, rx: number, ry: number, c: RGBA) {
    for (let dy = -ry; dy <= ry; dy++)
        for (let dx = -rx; dx <= rx; dx++)
            if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1)
                setPixel(png, cx + dx, cy + dy, c);
}

function drawLine(png: PNG, x0: number, y0: number, x1: number, y1: number, c: RGBA, thick: number = 1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let cx = x0, cy = y0;
    while (true) {
        if (thick <= 1) setPixel(png, cx, cy, c);
        else fillCircle(png, cx, cy, Math.floor(thick / 2), c);
        if (cx === x1 && cy === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; cx += sx; }
        if (e2 < dx) { err += dx; cy += sy; }
    }
}

function fillTriangle(png: PNG, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, c: RGBA) {
    const minX = Math.min(x1, x2, x3);
    const maxX = Math.max(x1, x2, x3);
    const minY = Math.min(y1, y2, y3);
    const maxY = Math.max(y1, y2, y3);
    for (let y = minY; y <= maxY; y++)
        for (let x = minX; x <= maxX; x++) {
            const d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
            const d2 = (x - x3) * (y2 - y3) - (x2 - x3) * (y - y3);
            const d3 = (x - x1) * (y3 - y1) - (x3 - x1) * (y - y1);
            const neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
            const pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
            if (!(neg && pos)) setPixel(png, x, y, c);
        }
}

function fillRoundRect(png: PNG, x: number, y: number, w: number, h: number, r: number, c: RGBA) {
    fillRect(png, x + r, y, w - 2 * r, h, c);
    fillRect(png, x, y + r, w, h - 2 * r, c);
    fillCircle(png, x + r, y + r, r, c);
    fillCircle(png, x + w - r - 1, y + r, r, c);
    fillCircle(png, x + r, y + h - r - 1, r, c);
    fillCircle(png, x + w - r - 1, y + h - r - 1, r, c);
}

function addGlow(png: PNG, cx: number, cy: number, r: number, c: RGBA, intensity: number = 0.5) {
    for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= r) {
                const alpha = Math.round(c[3] * intensity * (1 - dist / r));
                if (alpha > 0) setPixel(png, cx + dx, cy + dy, [c[0], c[1], c[2], alpha]);
            }
        }
}

// Seeded RNG
function sRng(seed: number, offset: number): number {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
}

// ============ COLOR PALETTES ============
function speciesPalette(species: string, elType: string): { body: Palette; accent: Palette; detail: Palette } {
    const palettes: Record<string, { body: Palette; accent: Palette; detail: Palette }> = {
        'void walker': {
            body: { outline: [20, 10, 30, 255], shadow: [40, 20, 60, 255], base: [60, 30, 90, 255], light: [90, 50, 130, 255], glow: [160, 80, 255, 180] },
            accent: { outline: [10, 5, 15, 255], shadow: [25, 15, 35, 255], base: [35, 20, 55, 255], light: [55, 35, 80, 255] },
            detail: { outline: [80, 0, 160, 255], shadow: [120, 40, 200, 255], base: [160, 80, 255, 255], light: [200, 140, 255, 255], glow: [180, 100, 255, 150] },
        },
        'chaos engine': {
            body: { outline: [40, 25, 10, 255], shadow: [80, 50, 20, 255], base: [140, 100, 40, 255], light: [180, 140, 60, 255] },
            accent: { outline: [50, 50, 55, 255], shadow: [80, 80, 85, 255], base: [110, 110, 115, 255], light: [150, 150, 155, 255] },
            detail: { outline: [150, 20, 0, 255], shadow: [200, 50, 10, 255], base: [255, 80, 20, 255], light: [255, 150, 60, 255], glow: [255, 100, 30, 150] },
        },
        'bully alien': {
            body: { outline: [10, 40, 15, 255], shadow: [20, 80, 30, 255], base: [40, 140, 50, 255], light: [70, 180, 80, 255] },
            accent: { outline: [30, 20, 40, 255], shadow: [60, 40, 70, 255], base: [90, 60, 100, 255], light: [120, 90, 130, 255] },
            detail: { outline: [120, 100, 20, 255], shadow: [180, 150, 40, 255], base: [220, 200, 60, 255], light: [255, 230, 100, 255] },
        },
        'abyssal kraken': {
            body: { outline: [5, 20, 35, 255], shadow: [10, 40, 70, 255], base: [20, 70, 110, 255], light: [40, 100, 150, 255] },
            accent: { outline: [0, 40, 40, 255], shadow: [0, 70, 70, 255], base: [0, 110, 110, 255], light: [0, 150, 150, 255] },
            detail: { outline: [0, 100, 120, 255], shadow: [0, 160, 180, 255], base: [0, 220, 240, 255], light: [100, 240, 255, 255], glow: [0, 200, 255, 140] },
        },
        'obsidian golem': {
            body: { outline: [15, 10, 10, 255], shadow: [30, 25, 25, 255], base: [50, 40, 40, 255], light: [70, 60, 60, 255] },
            accent: { outline: [40, 15, 0, 255], shadow: [80, 30, 0, 255], base: [130, 50, 0, 255], light: [180, 80, 10, 255] },
            detail: { outline: [150, 60, 0, 255], shadow: [200, 100, 10, 255], base: [255, 150, 30, 255], light: [255, 200, 80, 255], glow: [255, 130, 20, 130] },
        },
        'lich king': {
            body: { outline: [20, 20, 15, 255], shadow: [50, 45, 35, 255], base: [80, 75, 60, 255], light: [120, 110, 90, 255] },
            accent: { outline: [15, 10, 30, 255], shadow: [30, 20, 60, 255], base: [50, 30, 90, 255], light: [80, 50, 130, 255] },
            detail: { outline: [0, 100, 50, 255], shadow: [0, 160, 80, 255], base: [0, 220, 100, 255], light: [80, 255, 150, 255], glow: [0, 255, 100, 140] },
        },
        'spectral hydra': {
            body: { outline: [10, 30, 20, 255], shadow: [20, 60, 40, 255], base: [30, 100, 60, 255], light: [50, 140, 80, 255] },
            accent: { outline: [20, 20, 40, 255], shadow: [40, 40, 80, 255], base: [60, 60, 120, 200], light: [90, 90, 160, 180] },
            detail: { outline: [0, 80, 50, 255], shadow: [0, 140, 80, 255], base: [0, 200, 120, 255], light: [80, 255, 180, 255], glow: [0, 230, 140, 120] },
        },
        'phoenix': {
            body: { outline: [80, 20, 0, 255], shadow: [140, 40, 0, 255], base: [200, 80, 10, 255], light: [240, 140, 30, 255] },
            accent: { outline: [100, 60, 0, 255], shadow: [160, 100, 0, 255], base: [220, 160, 20, 255], light: [255, 210, 60, 255] },
            detail: { outline: [180, 50, 0, 255], shadow: [230, 100, 0, 255], base: [255, 160, 40, 255], light: [255, 220, 100, 255], glow: [255, 180, 50, 150] },
        },
        'mino dragon x': {
            body: { outline: [30, 15, 10, 255], shadow: [60, 30, 20, 255], base: [100, 50, 30, 255], light: [140, 80, 50, 255] },
            accent: { outline: [40, 10, 10, 255], shadow: [80, 20, 20, 255], base: [130, 40, 30, 255], light: [170, 70, 50, 255] },
            detail: { outline: [100, 40, 0, 255], shadow: [160, 70, 10, 255], base: [210, 110, 30, 255], light: [240, 160, 60, 255], glow: [255, 120, 30, 130] },
        },
        'copper cupid': {
            body: { outline: [60, 30, 15, 255], shadow: [120, 70, 40, 255], base: [180, 120, 70, 255], light: [220, 170, 120, 255] },
            accent: { outline: [80, 40, 20, 255], shadow: [140, 80, 40, 255], base: [190, 130, 70, 255], light: [230, 180, 110, 255] },
            detail: { outline: [150, 80, 30, 255], shadow: [200, 130, 60, 255], base: [230, 170, 90, 255], light: [255, 210, 140, 255], glow: [255, 200, 120, 140] },
        },
        'cosmic dragon': {
            body: { outline: [10, 5, 30, 255], shadow: [25, 15, 60, 255], base: [40, 25, 100, 255], light: [60, 40, 140, 255] },
            accent: { outline: [20, 0, 40, 255], shadow: [50, 10, 80, 255], base: [80, 20, 130, 255], light: [120, 50, 180, 255] },
            detail: { outline: [80, 50, 200, 255], shadow: [120, 80, 230, 255], base: [160, 120, 255, 255], light: [200, 180, 255, 255], glow: [150, 100, 255, 140] },
        },
    };
    return palettes[species.toLowerCase()] || palettes['void walker'];
}

// ============ WEAPON DRAWING ============
function drawWeapon(png: PNG, weapon: string, x: number, y: number, dir: number, frame: number, attacking: boolean) {
    const angle = attacking ? Math.sin(frame * 0.8) * 40 : 0;
    switch (weapon.toLowerCase()) {
        case 'longsword': drawSword(png, x, y, dir, angle, [180, 180, 200, 255], [140, 140, 160, 255], 36, 4); break;
        case 'rapier': drawSword(png, x, y, dir, angle, [200, 200, 220, 255], [160, 160, 180, 255], 34, 2); break;
        case 'katana': drawKatana(png, x, y, dir, angle); break;
        case 'waraxe': drawAxe(png, x, y, dir, angle); break;
        case 'warhammer': drawHammer(png, x, y, dir, angle); break;
        case 'bow': drawBow(png, x, y, dir, frame, attacking); break;
        case 'staff': drawStaff(png, x, y, dir, frame); break;
        case 'scimitar': drawScimitar(png, x, y, dir, angle); break;
        case 'mace': drawMace(png, x, y, dir, angle); break;
    }
}

function drawSword(png: PNG, x: number, y: number, dir: number, angle: number, blade: RGBA, guard: RGBA, len: number, width: number) {
    const ox = dir === 1 ? 6 : dir === 3 ? -6 : 0;
    const bx = x + ox;
    // Guard
    fillRect(png, bx - 4, y, 9, 3, guard);
    // Blade
    fillRect(png, bx - Math.floor(width / 2), y - len, width, len, blade);
    fillRect(png, bx - Math.floor(width / 2) + 1, y - len, 1, len, [220, 220, 240, 200]); // highlight
    // Outline
    drawLine(png, bx - Math.floor(width / 2) - 1, y - len, bx - Math.floor(width / 2) - 1, y, [60, 60, 80, 255]);
    drawLine(png, bx + Math.ceil(width / 2), y - len, bx + Math.ceil(width / 2), y, [60, 60, 80, 255]);
    // Handle
    fillRect(png, bx - 1, y + 1, 3, 8, [80, 50, 30, 255]);
    // Pommel
    fillCircle(png, bx, y + 10, 2, [160, 140, 40, 255]);
}

function drawKatana(png: PNG, x: number, y: number, dir: number, angle: number) {
    const ox = dir === 1 ? 6 : dir === 3 ? -6 : 0;
    const bx = x + ox;
    // Curved blade
    for (let i = 0; i < 38; i++) {
        const curve = Math.floor(Math.sin(i * 0.08) * 3);
        fillRect(png, bx + curve - 1, y - i, 3, 1, [200, 200, 210, 255]);
        setPixel(png, bx + curve, y - i, [230, 230, 245, 200]); // edge highlight
    }
    // Guard (tsuba)
    fillEllipse(png, bx, y + 1, 5, 2, [100, 80, 40, 255]);
    // Handle (tsuka)
    for (let i = 0; i < 12; i++) {
        const wrap = i % 3 === 0 ? [60, 30, 20, 255] as RGBA : [40, 20, 15, 255] as RGBA;
        fillRect(png, bx - 1, y + 2 + i, 3, 1, wrap);
    }
}

function drawAxe(png: PNG, x: number, y: number, dir: number, angle: number) {
    const ox = dir === 1 ? 6 : dir === 3 ? -6 : 0;
    const bx = x + ox;
    // Handle
    fillRect(png, bx - 1, y - 10, 3, 40, [80, 55, 30, 255]);
    // Axe head
    fillTriangle(png, bx - 12, y - 16, bx + 2, y - 22, bx + 2, y - 8, [160, 160, 170, 255]);
    fillTriangle(png, bx - 10, y - 15, bx + 1, y - 20, bx + 1, y - 10, [190, 190, 200, 255]);
    // Edge highlight
    drawLine(png, bx - 12, y - 16, bx + 1, y - 22, [220, 220, 235, 255]);
}

function drawHammer(png: PNG, x: number, y: number, dir: number, angle: number) {
    const ox = dir === 1 ? 6 : dir === 3 ? -6 : 0;
    const bx = x + ox;
    // Handle
    fillRect(png, bx - 1, y - 8, 3, 38, [90, 60, 35, 255]);
    // Hammer head
    fillRoundRect(png, bx - 10, y - 20, 21, 14, 2, [120, 120, 130, 255]);
    fillRoundRect(png, bx - 9, y - 19, 19, 12, 2, [150, 150, 160, 255]);
    // Metal highlight
    fillRect(png, bx - 8, y - 18, 3, 10, [180, 180, 200, 200]);
}

function drawBow(png: PNG, x: number, y: number, dir: number, frame: number, attacking: boolean) {
    const ox = dir === 1 ? 8 : dir === 3 ? -8 : 0;
    const bx = x + ox;
    // Bow arc
    for (let i = -18; i <= 18; i++) {
        const curve = Math.floor(Math.sqrt(Math.max(0, 324 - i * i)) * 0.3);
        setPixel(png, bx - curve, y + i, [100, 60, 30, 255]);
        setPixel(png, bx - curve + 1, y + i, [120, 80, 40, 255]);
    }
    // String
    const pull = attacking ? Math.sin(frame * 0.6) * 6 : 0;
    drawLine(png, bx, y - 18, bx + Math.floor(pull), y, [200, 200, 190, 255]);
    drawLine(png, bx, y + 18, bx + Math.floor(pull), y, [200, 200, 190, 255]);
    // Arrow
    if (attacking && frame < 5) {
        drawLine(png, bx + Math.floor(pull) - 2, y, bx + Math.floor(pull) + 20, y, [140, 120, 80, 255]);
        fillTriangle(png, bx + Math.floor(pull) + 20, y - 2, bx + Math.floor(pull) + 20, y + 2,
            bx + Math.floor(pull) + 25, y, [160, 160, 170, 255]);
    }
}

function drawStaff(png: PNG, x: number, y: number, dir: number, frame: number) {
    const ox = dir === 1 ? 6 : dir === 3 ? -6 : 0;
    const bx = x + ox;
    // Shaft
    fillRect(png, bx - 1, y - 30, 3, 55, [70, 45, 25, 255]);
    fillRect(png, bx, y - 30, 1, 55, [90, 60, 35, 255]);
    // Orb
    const pulse = Math.sin(frame * 0.5) * 2;
    fillCircle(png, bx, y - 34, 6 + Math.floor(pulse), [60, 120, 200, 200]);
    fillCircle(png, bx, y - 34, 4, [100, 180, 255, 230]);
    fillCircle(png, bx - 1, y - 36, 2, [180, 220, 255, 255]); // highlight
    addGlow(png, bx, y - 34, 10, [80, 160, 255, 100], 0.3);
    // Ornament
    fillCircle(png, bx - 4, y - 30, 2, [140, 100, 40, 255]);
    fillCircle(png, bx + 4, y - 30, 2, [140, 100, 40, 255]);
}

function drawScimitar(png: PNG, x: number, y: number, dir: number, angle: number) {
    const ox = dir === 1 ? 6 : dir === 3 ? -6 : 0;
    const bx = x + ox;
    // Curved wide blade
    for (let i = 0; i < 32; i++) {
        const curve = Math.floor(Math.sin(i * 0.1) * 5);
        const w = Math.max(2, Math.floor(4 - i * 0.08));
        fillRect(png, bx + curve - w, y - i, w * 2 + 1, 1, [190, 190, 200, 255]);
        setPixel(png, bx + curve + w, y - i, [220, 220, 240, 200]);
    }
    // Guard
    fillEllipse(png, bx, y + 1, 5, 2, [160, 130, 40, 255]);
    // Handle
    fillRect(png, bx - 1, y + 3, 3, 10, [80, 50, 25, 255]);
}

function drawMace(png: PNG, x: number, y: number, dir: number, angle: number) {
    const ox = dir === 1 ? 6 : dir === 3 ? -6 : 0;
    const bx = x + ox;
    // Handle
    fillRect(png, bx - 1, y - 5, 3, 30, [80, 55, 30, 255]);
    // Spiked head
    fillCircle(png, bx, y - 10, 7, [140, 140, 150, 255]);
    fillCircle(png, bx, y - 10, 5, [170, 170, 180, 255]);
    // Spikes
    const spikes = [[0, -7], [5, -5], [7, 0], [5, 5], [0, 7], [-5, 5], [-7, 0], [-5, -5]];
    spikes.forEach(([sx, sy]) => {
        fillTriangle(png, bx + sx, y - 10 + sy, bx + sx * 1.6, y - 10 + sy * 1.6,
            bx + sx + (sy > 0 ? 1 : -1), y - 10 + sy + (sx > 0 ? -1 : 1), [160, 160, 175, 255]);
    });
    fillCircle(png, bx - 2, y - 12, 2, [200, 200, 215, 200]); // highlight
}

// ============ SPECIES DRAWING ============

// === HUMANOID SPECIES (Void Walker, Lich King, Bully Alien) ===
function drawHumanoid(png: PNG, ox: number, oy: number, pal: ReturnType<typeof speciesPalette>,
    species: string, dir: number, frame: number, action: string) {
    const bob = (action.startsWith('walk')) ? Math.sin(frame * Math.PI / 4) * 2 : 0;
    const by = oy + Math.floor(bob);
    const legPhase = Math.sin(frame * Math.PI / 4);
    const armSwing = Math.sin(frame * Math.PI / 4) * 4;
    const sp = species.toLowerCase();

    // Shadow on ground
    fillEllipse(png, ox, oy + 52, 14, 4, [0, 0, 0, 60]);

    // Legs
    const lLegOff = (action.startsWith('walk')) ? Math.floor(legPhase * 6) : 0;
    const rLegOff = (action.startsWith('walk')) ? Math.floor(-legPhase * 6) : 0;
    fillRect(png, ox - 8, by + 30, 6, 22 - Math.abs(lLegOff), pal.body.shadow);
    fillRect(png, ox + 2, by + 30, 6, 22 - Math.abs(rLegOff), pal.body.shadow);
    // Boots
    fillRect(png, ox - 10 + lLegOff, by + 48, 9, 5, pal.accent.base);
    fillRect(png, ox + 1 + rLegOff, by + 48, 9, 5, pal.accent.base);

    // Body/Torso
    if (sp === 'void walker') {
        // Hooded cloak body
        fillTriangle(png, ox, by - 20, ox - 18, by + 32, ox + 18, by + 32, pal.body.base);
        fillTriangle(png, ox, by - 18, ox - 15, by + 30, ox + 15, by + 30, pal.body.shadow);
        // Inner darkness
        fillEllipse(png, ox, by + 10, 8, 12, pal.body.outline);
    } else if (sp === 'lich king') {
        // Robed body with crown
        fillRoundRect(png, ox - 14, by - 5, 28, 38, 3, pal.accent.base);
        fillRoundRect(png, ox - 12, by - 3, 24, 34, 2, pal.accent.shadow);
        // Rib detail
        for (let i = 0; i < 5; i++) {
            drawLine(png, ox - 6, by + 5 + i * 5, ox + 6, by + 5 + i * 5, pal.body.light);
        }
    } else {
        // Bully Alien - muscular torso
        fillEllipse(png, ox, by + 10, 16, 22, pal.body.base);
        fillEllipse(png, ox, by + 8, 14, 18, pal.body.light);
        // Muscle lines
        drawLine(png, ox, by - 2, ox, by + 20, pal.body.shadow);
        drawLine(png, ox - 6, by + 2, ox - 3, by + 15, pal.body.shadow);
        drawLine(png, ox + 6, by + 2, ox + 3, by + 15, pal.body.shadow);
        // Spiked pauldrons
        fillTriangle(png, ox - 18, by - 5, ox - 12, by - 12, ox - 8, by + 2, pal.accent.base);
        fillTriangle(png, ox + 18, by - 5, ox + 12, by - 12, ox + 8, by + 2, pal.accent.base);
    }

    // Arms
    const aSwing = (action === 'attack') ? Math.sin(frame * 0.8) * 12 : Math.floor(armSwing);
    // Left arm
    fillRect(png, ox - 18 + Math.floor(aSwing * 0.3), by - 2, 6, 20, pal.body.base);
    drawLine(png, ox - 18, by - 2, ox - 18 + Math.floor(aSwing), by + 16, pal.body.outline, 2);
    // Right arm
    fillRect(png, ox + 12 - Math.floor(aSwing * 0.3), by - 2, 6, 20, pal.body.base);

    // Head
    if (sp === 'void walker') {
        // Hood with glowing eyes
        fillTriangle(png, ox, by - 32, ox - 14, by - 8, ox + 14, by - 8, pal.body.base);
        fillTriangle(png, ox, by - 28, ox - 10, by - 10, ox + 10, by - 10, pal.body.shadow);
        // Glowing eyes
        if (dir !== 2) {
            setPixel(png, ox - 4, by - 18, pal.detail.glow || pal.detail.base);
            setPixel(png, ox - 3, by - 18, pal.detail.base);
            setPixel(png, ox + 3, by - 18, pal.detail.glow || pal.detail.base);
            setPixel(png, ox + 4, by - 18, pal.detail.base);
            addGlow(png, ox - 3, by - 18, 4, pal.detail.glow || pal.detail.base, 0.3);
            addGlow(png, ox + 3, by - 18, 4, pal.detail.glow || pal.detail.base, 0.3);
        }
    } else if (sp === 'lich king') {
        // Skull head with crown
        fillCircle(png, ox, by - 16, 10, pal.body.light);
        fillCircle(png, ox, by - 16, 8, pal.body.base);
        // Eye sockets
        fillCircle(png, ox - 4, by - 17, 3, pal.body.outline);
        fillCircle(png, ox + 4, by - 17, 3, pal.body.outline);
        // Glowing eyes
        setPixel(png, ox - 4, by - 17, pal.detail.base);
        setPixel(png, ox + 4, by - 17, pal.detail.base);
        addGlow(png, ox - 4, by - 17, 4, pal.detail.glow || pal.detail.base, 0.4);
        addGlow(png, ox + 4, by - 17, 4, pal.detail.glow || pal.detail.base, 0.4);
        // Crown
        fillRect(png, ox - 10, by - 28, 20, 4, [200, 170, 40, 255]);
        for (let i = 0; i < 5; i++) {
            fillTriangle(png, ox - 10 + i * 5, by - 28, ox - 8 + i * 5, by - 34 + (i % 2) * 3,
                ox - 6 + i * 5, by - 28, [220, 190, 50, 255]);
        }
        // Jewels
        fillCircle(png, ox, by - 30, 2, [200, 30, 30, 255]);
    } else {
        // Bully Alien head
        fillEllipse(png, ox, by - 18, 12, 14, pal.body.base);
        fillEllipse(png, ox, by - 16, 10, 12, pal.body.light);
        // Angry eyes
        fillRect(png, ox - 6, by - 20, 5, 3, [255, 50, 50, 255]);
        fillRect(png, ox + 1, by - 20, 5, 3, [255, 50, 50, 255]);
        setPixel(png, ox - 4, by - 19, [0, 0, 0, 255]);
        setPixel(png, ox + 3, by - 19, [0, 0, 0, 255]);
        // Antenna
        drawLine(png, ox - 3, by - 32, ox - 6, by - 42, pal.body.shadow, 2);
        drawLine(png, ox + 3, by - 32, ox + 6, by - 42, pal.body.shadow, 2);
        fillCircle(png, ox - 6, by - 43, 3, pal.detail.base);
        fillCircle(png, ox + 6, by - 43, 3, pal.detail.base);
        addGlow(png, ox - 6, by - 43, 5, pal.detail.base, 0.3);
        addGlow(png, ox + 6, by - 43, 5, pal.detail.base, 0.3);
    }

    // Outline everything
    outlineCircle(png, ox, sp === 'bully alien' ? by - 18 : by - 16,
        sp === 'bully alien' ? 14 : 11, pal.body.outline);
}

// === CONSTRUCT SPECIES (Chaos Engine, Obsidian Golem, Abyssal Kraken) ===
function drawConstruct(png: PNG, ox: number, oy: number, pal: ReturnType<typeof speciesPalette>,
    species: string, dir: number, frame: number, action: string) {
    const bob = (action.startsWith('walk')) ? Math.sin(frame * Math.PI / 4) * 1.5 : 0;
    const by = oy + Math.floor(bob);
    const sp = species.toLowerCase();

    fillEllipse(png, ox, oy + 52, 18, 5, [0, 0, 0, 50]);

    if (sp === 'chaos engine') {
        // Mechanical body - boxy with rounded edges
        fillRoundRect(png, ox - 16, by - 5, 32, 40, 4, pal.body.base);
        fillRoundRect(png, ox - 14, by - 3, 28, 36, 3, pal.body.light);
        // Gear details
        outlineCircle(png, ox - 6, by + 10, 6, pal.accent.base, 2);
        outlineCircle(png, ox + 8, by + 15, 5, pal.accent.base, 2);
        outlineCircle(png, ox - 6, by + 10, 3, pal.accent.shadow);
        // Glowing core
        fillCircle(png, ox, by + 6, 5, pal.detail.base);
        fillCircle(png, ox, by + 6, 3, pal.detail.light);
        addGlow(png, ox, by + 6, 10, pal.detail.glow || pal.detail.base, 0.4);
        // Steam vents
        if (frame % 3 === 0) {
            for (let i = 0; i < 4; i++) {
                setPixel(png, ox + 14 + i, by - 5 - i * 2, [200, 200, 200, 120 - i * 25]);
                setPixel(png, ox - 14 - i, by - 5 - i * 2, [200, 200, 200, 120 - i * 25]);
            }
        }
        // Head - dome
        fillCircle(png, ox, by - 14, 12, pal.accent.base);
        fillCircle(png, ox, by - 14, 10, pal.accent.light);
        // Eye slit
        fillRect(png, ox - 8, by - 16, 16, 3, pal.body.outline);
        fillRect(png, ox - 6, by - 15, 4, 1, pal.detail.base);
        fillRect(png, ox + 2, by - 15, 4, 1, pal.detail.base);
        // Legs - pistons
        fillRect(png, ox - 10, by + 32, 8, 18, pal.accent.shadow);
        fillRect(png, ox + 2, by + 32, 8, 18, pal.accent.shadow);
        fillRect(png, ox - 9, by + 38, 6, 4, pal.accent.light);
        fillRect(png, ox + 3, by + 38, 6, 4, pal.accent.light);
        // Feet
        fillRect(png, ox - 12, by + 48, 11, 5, pal.body.shadow);
        fillRect(png, ox + 1, by + 48, 11, 5, pal.body.shadow);
        // Arms - hydraulic
        fillRect(png, ox - 22, by, 8, 24, pal.accent.base);
        fillRect(png, ox + 14, by, 8, 24, pal.accent.base);
        fillCircle(png, ox - 18, by + 24, 4, pal.body.base);
        fillCircle(png, ox + 18, by + 24, 4, pal.body.base);
    } else if (sp === 'obsidian golem') {
        // Massive rocky body
        fillRoundRect(png, ox - 20, by - 8, 40, 48, 5, pal.body.base);
        // Lava cracks
        drawLine(png, ox - 10, by, ox - 5, by + 20, pal.detail.base, 2);
        drawLine(png, ox + 5, by + 5, ox + 12, by + 25, pal.detail.base, 2);
        drawLine(png, ox - 8, by + 10, ox + 3, by + 15, pal.detail.shadow);
        addGlow(png, ox - 7, by + 10, 5, pal.detail.glow || pal.detail.base, 0.3);
        addGlow(png, ox + 8, by + 15, 5, pal.detail.glow || pal.detail.base, 0.3);
        // Shoulder rocks
        fillCircle(png, ox - 18, by - 5, 8, pal.body.shadow);
        fillCircle(png, ox + 18, by - 5, 8, pal.body.shadow);
        fillCircle(png, ox - 17, by - 6, 6, pal.body.light);
        fillCircle(png, ox + 17, by - 6, 6, pal.body.light);
        // Head - angular
        fillRoundRect(png, ox - 12, by - 24, 24, 18, 3, pal.body.shadow);
        fillRoundRect(png, ox - 10, by - 22, 20, 14, 2, pal.body.base);
        // Glowing eyes  
        fillRect(png, ox - 7, by - 18, 5, 3, pal.detail.base);
        fillRect(png, ox + 2, by - 18, 5, 3, pal.detail.base);
        addGlow(png, ox - 5, by - 17, 5, pal.detail.glow || pal.detail.base, 0.4);
        addGlow(png, ox + 5, by - 17, 5, pal.detail.glow || pal.detail.base, 0.4);
        // Massive arms
        fillRect(png, ox - 28, by - 2, 12, 30, pal.body.base);
        fillRect(png, ox + 16, by - 2, 12, 30, pal.body.base);
        // Fists
        fillCircle(png, ox - 24, by + 30, 7, pal.body.shadow);
        fillCircle(png, ox + 22, by + 30, 7, pal.body.shadow);
        // Legs - thick pillars
        fillRect(png, ox - 14, by + 36, 12, 16, pal.body.shadow);
        fillRect(png, ox + 2, by + 36, 12, 16, pal.body.shadow);
        fillRect(png, ox - 16, by + 48, 14, 6, pal.body.outline);
        fillRect(png, ox + 1, by + 48, 14, 6, pal.body.outline);
    } else {
        // Abyssal Kraken - tentacle creature
        // Main body dome
        fillEllipse(png, ox, by - 5, 18, 24, pal.body.base);
        fillEllipse(png, ox, by - 8, 15, 18, pal.body.light);
        // Bioluminescent spots
        const spots = [[-8, -10], [6, -5], [-4, 5], [10, 0], [-10, 8], [4, 12]];
        spots.forEach(([sx, sy]) => {
            fillCircle(png, ox + sx, by + sy, 2, pal.detail.base);
            addGlow(png, ox + sx, by + sy, 4, pal.detail.glow || pal.detail.base, 0.25);
        });
        // Eyes - large and eerie
        fillCircle(png, ox - 6, by - 14, 5, [200, 220, 230, 255]);
        fillCircle(png, ox + 6, by - 14, 5, [200, 220, 230, 255]);
        fillCircle(png, ox - 6, by - 14, 3, pal.accent.base);
        fillCircle(png, ox + 6, by - 14, 3, pal.accent.base);
        fillCircle(png, ox - 5, by - 15, 1, [255, 255, 255, 255]);
        fillCircle(png, ox + 7, by - 15, 1, [255, 255, 255, 255]);
        // Tentacles
        const tentPhase = frame * 0.4;
        for (let t = 0; t < 6; t++) {
            const angle = (t / 6) * Math.PI - Math.PI / 2;
            const wave = Math.sin(tentPhase + t * 1.2) * 5;
            const tx = ox + Math.floor(Math.cos(angle) * 16);
            const ty = by + 18;
            const ex = tx + Math.floor(wave);
            const ey = ty + 25 + Math.floor(Math.sin(tentPhase + t) * 3);
            drawLine(png, tx, ty, ex, ey, pal.body.base, 3);
            drawLine(png, tx, ty, ex, ey, pal.body.light, 1);
            // Suction cups
            fillCircle(png, Math.floor((tx + ex) / 2 + wave * 0.5), Math.floor((ty + ey) / 2), 2, pal.accent.base);
        }
    }
}

// === WINGED SPECIES (Phoenix, Copper Cupid, Cosmic Dragon) ===
function drawWinged(png: PNG, ox: number, oy: number, pal: ReturnType<typeof speciesPalette>,
    species: string, dir: number, frame: number, action: string) {
    const bob = Math.sin(frame * Math.PI / 4) * 3;
    const by = oy + Math.floor(bob) - 5;
    const wingFlap = Math.sin(frame * Math.PI / 3) * 12;
    const sp = species.toLowerCase();

    fillEllipse(png, ox, oy + 52, 12, 3, [0, 0, 0, 40]);

    if (sp === 'phoenix') {
        // Wings (behind body)
        const wSpread = 20 + Math.floor(Math.abs(wingFlap));
        // Left wing
        fillTriangle(png, ox - 5, by, ox - wSpread - 10, by - 15 + Math.floor(wingFlap),
            ox - wSpread, by + 10, pal.accent.base);
        fillTriangle(png, ox - 5, by + 2, ox - wSpread - 5, by - 10 + Math.floor(wingFlap),
            ox - wSpread + 5, by + 8, pal.accent.light);
        // Right wing
        fillTriangle(png, ox + 5, by, ox + wSpread + 10, by - 15 + Math.floor(wingFlap),
            ox + wSpread, by + 10, pal.accent.base);
        fillTriangle(png, ox + 5, by + 2, ox + wSpread + 5, by - 10 + Math.floor(wingFlap),
            ox + wSpread - 5, by + 8, pal.accent.light);
        // Flame tips
        for (let i = 0; i < 3; i++) {
            const fx = ox - wSpread - 8 + i * 4;
            const fy = by - 12 + Math.floor(wingFlap) + i * 3;
            addGlow(png, fx, fy, 4, pal.detail.glow || pal.detail.base, 0.5);
        }
        // Body
        fillEllipse(png, ox, by + 5, 10, 16, pal.body.base);
        fillEllipse(png, ox + 1, by + 3, 8, 12, pal.body.light);
        // Head
        fillCircle(png, ox, by - 14, 9, pal.body.base);
        fillCircle(png, ox, by - 15, 7, pal.body.light);
        // Beak
        fillTriangle(png, ox - 2, by - 12, ox + 2, by - 12, ox, by - 8, [200, 160, 40, 255]);
        // Crest
        for (let i = 0; i < 4; i++) {
            drawLine(png, ox - 2 + i * 2, by - 22, ox - 4 + i * 3, by - 30 - i, pal.detail.base, 2);
            addGlow(png, ox - 4 + i * 3, by - 31 - i, 3, pal.detail.glow || pal.detail.base, 0.4);
        }
        // Eyes
        fillCircle(png, ox - 4, by - 16, 2, [255, 200, 50, 255]);
        fillCircle(png, ox + 4, by - 16, 2, [255, 200, 50, 255]);
        setPixel(png, ox - 4, by - 16, [0, 0, 0, 255]);
        setPixel(png, ox + 4, by - 16, [0, 0, 0, 255]);
        // Tail feathers
        for (let i = 0; i < 3; i++) {
            const tailWave = Math.sin(frame * 0.3 + i) * 4;
            drawLine(png, ox, by + 20, ox + Math.floor(tailWave) - 5 + i * 5, by + 40 + i * 3,
                pal.body.base, 2);
            addGlow(png, ox + Math.floor(tailWave) - 5 + i * 5, by + 42 + i * 3, 3,
                pal.detail.glow || pal.detail.base, 0.3);
        }
        // Fire aura
        if (frame % 2 === 0) {
            for (let i = 0; i < 5; i++) {
                const px = ox + Math.floor(sRng(frame * 10 + i, 1) * 30) - 15;
                const py = by + Math.floor(sRng(frame * 10 + i, 2) * 40) - 10;
                addGlow(png, px, py, 3, [255, 150, 30, 80], 0.3);
            }
        }
    } else if (sp === 'copper cupid') {
        // Small wings
        fillEllipse(png, ox - 16, by - 5 + Math.floor(wingFlap * 0.5), 10, 14, pal.accent.base);
        fillEllipse(png, ox + 16, by - 5 + Math.floor(wingFlap * 0.5), 10, 14, pal.accent.base);
        fillEllipse(png, ox - 15, by - 6 + Math.floor(wingFlap * 0.5), 8, 11, pal.accent.light);
        fillEllipse(png, ox + 15, by - 6 + Math.floor(wingFlap * 0.5), 8, 11, pal.accent.light);
        // Body - cherubic
        fillEllipse(png, ox, by + 8, 12, 18, pal.body.base);
        fillEllipse(png, ox + 1, by + 6, 10, 15, pal.body.light);
        // Copper armor plates
        fillRoundRect(png, ox - 10, by - 2, 20, 14, 2, pal.accent.base);
        fillRoundRect(png, ox - 8, by, 16, 10, 2, pal.accent.light);
        // Head
        fillCircle(png, ox, by - 14, 10, pal.body.base);
        fillCircle(png, ox, by - 15, 8, pal.body.light);
        // Curly hair
        for (let i = 0; i < 5; i++) {
            const hx = ox - 8 + i * 4;
            fillCircle(png, hx, by - 24, 3, pal.detail.base);
        }
        // Cute eyes
        fillCircle(png, ox - 4, by - 15, 3, [255, 255, 255, 255]);
        fillCircle(png, ox + 4, by - 15, 3, [255, 255, 255, 255]);
        fillCircle(png, ox - 4, by - 15, 1, [80, 60, 40, 255]);
        fillCircle(png, ox + 4, by - 15, 1, [80, 60, 40, 255]);
        // Legs
        fillRect(png, ox - 6, by + 24, 5, 16, pal.body.shadow);
        fillRect(png, ox + 1, by + 24, 5, 16, pal.body.shadow);
        // Sandals
        fillRect(png, ox - 8, by + 38, 7, 4, pal.accent.shadow);
        fillRect(png, ox, by + 38, 7, 4, pal.accent.shadow);
        // Metallic sheen
        addGlow(png, ox - 5, by + 2, 3, pal.detail.glow || pal.detail.light, 0.3);
    } else {
        // Cosmic Dragon
        // Nebula wings
        const wSpread = 22 + Math.floor(Math.abs(wingFlap));
        fillTriangle(png, ox - 5, by, ox - wSpread - 8, by - 18 + Math.floor(wingFlap),
            ox - wSpread + 5, by + 15, pal.body.base);
        fillTriangle(png, ox + 5, by, ox + wSpread + 8, by - 18 + Math.floor(wingFlap),
            ox + wSpread - 5, by + 15, pal.body.base);
        // Star particles on wings
        for (let i = 0; i < 6; i++) {
            const sx = ox + Math.floor(sRng(i, 7) * wSpread * 2) - wSpread;
            const sy = by - 10 + Math.floor(sRng(i, 8) * 20);
            setPixel(png, sx, sy, [255, 255, 255, 200]);
            if (i % 2 === 0) addGlow(png, sx, sy, 2, [200, 200, 255, 100], 0.3);
        }
        // Serpentine body
        fillEllipse(png, ox, by + 5, 12, 20, pal.body.base);
        fillEllipse(png, ox, by + 3, 10, 16, pal.body.light);
        // Scale pattern
        for (let sy = -8; sy < 16; sy += 5) {
            for (let sx = -6; sx < 6; sx += 6) {
                fillEllipse(png, ox + sx, by + sy, 2, 2, pal.accent.base);
            }
        }
        // Head - dragon
        fillEllipse(png, ox, by - 16, 10, 12, pal.body.base);
        fillEllipse(png, ox, by - 17, 8, 10, pal.body.light);
        // Horns
        drawLine(png, ox - 6, by - 26, ox - 10, by - 38, pal.accent.base, 2);
        drawLine(png, ox + 6, by - 26, ox + 10, by - 38, pal.accent.base, 2);
        // Dragon eyes
        fillEllipse(png, ox - 4, by - 18, 3, 2, pal.detail.base);
        fillEllipse(png, ox + 4, by - 18, 3, 2, pal.detail.base);
        setPixel(png, ox - 4, by - 18, [0, 0, 0, 255]);
        setPixel(png, ox + 4, by - 18, [0, 0, 0, 255]);
        addGlow(png, ox - 4, by - 18, 4, pal.detail.glow || pal.detail.base, 0.3);
        addGlow(png, ox + 4, by - 18, 4, pal.detail.glow || pal.detail.base, 0.3);
        // Snout
        fillEllipse(png, ox, by - 10, 5, 3, pal.body.shadow);
        setPixel(png, ox - 2, by - 10, [0, 0, 0, 255]);
        setPixel(png, ox + 2, by - 10, [0, 0, 0, 255]);
        // Tail
        const tailWave = Math.sin(frame * 0.3) * 6;
        for (let i = 0; i < 20; i++) {
            const tw = Math.max(1, 4 - Math.floor(i / 5));
            const tx = ox + Math.floor(Math.sin(i * 0.3 + tailWave * 0.1) * 5);
            fillCircle(png, tx, by + 22 + i * 2, tw, pal.body.base);
        }
        // Cosmic aura
        for (let i = 0; i < 4; i++) {
            const ax = ox + Math.floor(sRng(frame + i, 20) * 40) - 20;
            const ay = by + Math.floor(sRng(frame + i, 21) * 50) - 15;
            setPixel(png, ax, ay, [200, 180, 255, 100]);
        }
        // Legs
        fillRect(png, ox - 8, by + 20, 6, 20, pal.body.shadow);
        fillRect(png, ox + 2, by + 20, 6, 20, pal.body.shadow);
        // Claws
        fillTriangle(png, ox - 10, by + 38, ox - 4, by + 38, ox - 7, by + 44, pal.accent.base);
        fillTriangle(png, ox + 4, by + 38, ox + 10, by + 38, ox + 7, by + 44, pal.accent.base);
    }
}

// === BEAST SPECIES (Spectral Hydra, Mino Dragon X) ===
function drawBeast(png: PNG, ox: number, oy: number, pal: ReturnType<typeof speciesPalette>,
    species: string, dir: number, frame: number, action: string) {
    const bob = (action.startsWith('walk')) ? Math.sin(frame * Math.PI / 4) * 2 : 0;
    const by = oy + Math.floor(bob);
    const sp = species.toLowerCase();

    fillEllipse(png, ox, oy + 52, 16, 5, [0, 0, 0, 50]);

    if (sp === 'spectral hydra') {
        // Multiple heads on serpent body
        // Main body (serpentine bulk)
        fillEllipse(png, ox, by + 10, 16, 22, pal.body.base);
        fillEllipse(png, ox, by + 8, 14, 18, pal.body.light);
        // Translucent effect
        fillEllipse(png, ox, by + 10, 12, 16, [pal.body.light[0], pal.body.light[1], pal.body.light[2], 180]);
        // Scale rows
        for (let sy = -5; sy < 20; sy += 4) {
            drawLine(png, ox - 10, by + sy, ox + 10, by + sy, pal.accent.base);
        }
        // Three heads (center + two sides wavering)
        const headPositions = [
            { x: ox, y: by - 28, size: 8 },
            { x: ox - 12 + Math.floor(Math.sin(frame * 0.5) * 3), y: by - 22, size: 6 },
            { x: ox + 12 + Math.floor(Math.cos(frame * 0.5) * 3), y: by - 22, size: 6 },
        ];
        headPositions.forEach((hp, idx) => {
            // Neck
            drawLine(png, ox + (idx === 1 ? -5 : idx === 2 ? 5 : 0), by - 5,
                hp.x, hp.y + hp.size, pal.body.base, 3);
            // Head
            fillCircle(png, hp.x, hp.y, hp.size, pal.body.base);
            fillCircle(png, hp.x, hp.y - 1, hp.size - 2, pal.body.light);
            // Eyes
            fillCircle(png, hp.x - 3, hp.y - 1, 2, pal.detail.base);
            fillCircle(png, hp.x + 3, hp.y - 1, 2, pal.detail.base);
            addGlow(png, hp.x - 3, hp.y - 1, 3, pal.detail.glow || pal.detail.base, 0.3);
            addGlow(png, hp.x + 3, hp.y - 1, 3, pal.detail.glow || pal.detail.base, 0.3);
            // Fangs
            setPixel(png, hp.x - 2, hp.y + hp.size - 1, [255, 255, 255, 255]);
            setPixel(png, hp.x + 2, hp.y + hp.size - 1, [255, 255, 255, 255]);
        });
        // Tail coils
        for (let i = 0; i < 15; i++) {
            const tw = Math.max(1, 5 - Math.floor(i / 3));
            const wave = Math.sin(frame * 0.3 + i * 0.4) * 6;
            fillCircle(png, ox + Math.floor(wave), by + 28 + i * 2, tw, pal.body.base);
        }
    } else {
        // Mino Dragon X - dragon-minotaur hybrid
        // Legs
        const lLeg = (action.startsWith('walk')) ? Math.sin(frame * Math.PI / 4) * 5 : 0;
        fillRect(png, ox - 10 + Math.floor(lLeg), by + 28, 8, 22, pal.body.base);
        fillRect(png, ox + 2 - Math.floor(lLeg), by + 28, 8, 22, pal.body.base);
        // Hooves
        fillRect(png, ox - 12 + Math.floor(lLeg), by + 48, 10, 5, pal.body.outline);
        fillRect(png, ox + 1 - Math.floor(lLeg), by + 48, 10, 5, pal.body.outline);
        // Muscular torso
        fillEllipse(png, ox, by + 8, 18, 24, pal.body.base);
        fillEllipse(png, ox + 1, by + 5, 15, 20, pal.body.light);
        // Muscle definition
        drawLine(png, ox, by - 5, ox, by + 18, pal.body.shadow);
        drawLine(png, ox - 8, by, ox - 4, by + 14, pal.body.shadow);
        drawLine(png, ox + 8, by, ox + 4, by + 14, pal.body.shadow);
        // Small wings
        const wFlap = Math.sin(frame * Math.PI / 3) * 8;
        fillTriangle(png, ox - 8, by - 5, ox - 26, by - 12 + Math.floor(wFlap),
            ox - 20, by + 5, pal.accent.base);
        fillTriangle(png, ox + 8, by - 5, ox + 26, by - 12 + Math.floor(wFlap),
            ox + 20, by + 5, pal.accent.base);
        // Arms
        fillRect(png, ox - 24, by - 2, 8, 22, pal.body.base);
        fillRect(png, ox + 16, by - 2, 8, 22, pal.body.base);
        fillCircle(png, ox - 22, by + 22, 5, pal.body.shadow); // fist
        fillCircle(png, ox + 22, by + 22, 5, pal.body.shadow); // fist
        // Head - bull/dragon
        fillEllipse(png, ox, by - 16, 12, 14, pal.body.base);
        fillEllipse(png, ox, by - 17, 10, 12, pal.body.light);
        // Horns (big curved)
        drawLine(png, ox - 8, by - 26, ox - 16, by - 38, pal.detail.base, 3);
        drawLine(png, ox + 8, by - 26, ox + 16, by - 38, pal.detail.base, 3);
        drawLine(png, ox - 15, by - 37, ox - 18, by - 32, pal.detail.base, 2);
        drawLine(png, ox + 15, by - 37, ox + 18, by - 32, pal.detail.base, 2);
        // Snout
        fillEllipse(png, ox, by - 10, 7, 4, pal.body.shadow);
        setPixel(png, ox - 3, by - 10, [0, 0, 0, 255]);
        setPixel(png, ox + 3, by - 10, [0, 0, 0, 255]);
        // Fierce eyes
        fillRect(png, ox - 7, by - 20, 5, 3, [255, 80, 30, 255]);
        fillRect(png, ox + 2, by - 20, 5, 3, [255, 80, 30, 255]);
        setPixel(png, ox - 5, by - 19, [0, 0, 0, 255]);
        setPixel(png, ox + 4, by - 19, [0, 0, 0, 255]);
        addGlow(png, ox - 5, by - 19, 3, [255, 80, 30, 100], 0.3);
        addGlow(png, ox + 4, by - 19, 3, [255, 80, 30, 100], 0.3);
        // Tail
        for (let i = 0; i < 12; i++) {
            const tw = Math.max(1, 4 - Math.floor(i / 3));
            const wave = Math.sin(frame * 0.3 + i * 0.3) * 4;
            fillCircle(png, ox + Math.floor(wave), by + 28 + i * 2, tw, pal.body.base);
        }
        // Tail flame
        addGlow(png, ox + Math.floor(Math.sin(frame * 0.3 + 3.6) * 4), by + 52, 4,
            pal.detail.glow || pal.detail.base, 0.4);
    }
}

// ============ SPECIES DISPATCHER ============
function drawSpecies(png: PNG, ox: number, oy: number, species: string, elType: string,
    dir: number, frame: number, action: string) {
    const pal = speciesPalette(species, elType);
    const sp = species.toLowerCase();

    if (['void walker', 'lich king', 'bully alien'].includes(sp)) {
        drawHumanoid(png, ox, oy, pal, species, dir, frame, action);
    } else if (['chaos engine', 'obsidian golem', 'abyssal kraken'].includes(sp)) {
        drawConstruct(png, ox, oy, pal, species, dir, frame, action);
    } else if (['phoenix', 'copper cupid', 'cosmic dragon'].includes(sp)) {
        drawWinged(png, ox, oy, pal, species, dir, frame, action);
    } else if (['spectral hydra', 'mino dragon x'].includes(sp)) {
        drawBeast(png, ox, oy, pal, species, dir, frame, action);
    } else {
        drawHumanoid(png, ox, oy, pal, species, dir, frame, action);
    }
}

// ============ MAIN EXPORT ============
interface GeneratorOptions {
    bodyType?: string;
    theme?: string;
    weapon?: string;
    head?: string;
    hair?: string;
}

export function generateMonsterSprite(id: number, options?: GeneratorOptions): { buffer: Buffer, logs: string[] } {
    const logs: string[] = [];
    const output = new PNG({ width: SHEET_W, height: SHEET_H });
    output.data.fill(0); // transparent background

    const species = options?.theme || 'void walker';
    const weapon = options?.weapon || 'longsword';
    const elType = options?.bodyType || 'MAGIC';

    logs.push(`V9 Generating: species=${species}, weapon=${weapon}`);

    // Row layout: 0=WalkS, 1=WalkE, 2=WalkN, 3=WalkW, 4=Attack, 5=Death, 6=Feed, 7=Train
    const actions = ['walk_south', 'walk_east', 'walk_north', 'walk_west', 'attack', 'death', 'feed', 'train'];
    const dirs = [0, 1, 2, 3, 0, 0, 0, 0];

    for (let row = 0; row < ROWS; row++) {
        const action = actions[row];
        const dir = dirs[row];
        const maxFrames = (row === 5) ? 6 : 8; // death = 6 frames

        for (let col = 0; col < maxFrames; col++) {
            // Create a temp frame PNG to draw on
            const framePng = new PNG({ width: FRAME, height: FRAME });
            framePng.data.fill(0);

            const cx = FRAME / 2; // center x = 64
            const cy = FRAME / 2 + 5; // slightly below center for feet room

            // Draw species
            drawSpecies(framePng, cx, cy, species, elType, dir, col, action);

            // Draw weapon (except for death after frame 3)
            if (!(action === 'death' && col > 3)) {
                const weaponX = cx + (dir === 1 ? 12 : dir === 3 ? -12 : 6);
                const weaponY = cy - 5;
                const isAttacking = action === 'attack' || action === 'train';
                drawWeapon(framePng, weapon, weaponX, weaponY, dir, col, isAttacking);
            }

            // Blit frame to output sheet
            const destX = col * FRAME;
            const destY = row * FRAME;
            for (let y = 0; y < FRAME; y++) {
                for (let x = 0; x < FRAME; x++) {
                    const srcIdx = (framePng.width * y + x) << 2;
                    const a = framePng.data[srcIdx + 3];
                    if (a > 0) {
                        const dstIdx = (output.width * (destY + y) + (destX + x)) << 2;
                        output.data[dstIdx] = framePng.data[srcIdx];
                        output.data[dstIdx + 1] = framePng.data[srcIdx + 1];
                        output.data[dstIdx + 2] = framePng.data[srcIdx + 2];
                        output.data[dstIdx + 3] = framePng.data[srcIdx + 3];
                    }
                }
            }
        }
    }

    return { buffer: PNG.sync.write(output), logs };
}
