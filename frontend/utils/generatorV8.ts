import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

// LPC Constants (Source)
const SRC_FRAME_WIDTH = 64;
const SRC_FRAME_HEIGHT = 64;

// Hero Standard (Destination)
const TARGET_FRAME_SIZE = 128;
const SCALE = 2.0;

// Asset Paths
let ROOT_LPC_PATH = path.join(process.cwd(), 'generators', 'lpc_assets');
// Ensure we have the REAL one (with spritesheets)
if (!fs.existsSync(path.join(ROOT_LPC_PATH, 'spritesheets'))) {
    ROOT_LPC_PATH = path.join(process.cwd(), '..', 'generators', 'lpc_assets');
}

const BASE_PATH = path.join(ROOT_LPC_PATH, 'spritesheets');
const ITEMS_PATH = path.join(ROOT_LPC_PATH, 'items');

const PATH_BODIES = path.join(BASE_PATH, 'body', 'bodies');
const PATH_HEADS = path.join(BASE_PATH, 'head', 'heads');
const PATH_LEGS = path.join(BASE_PATH, 'legs');
const PATH_TORSO = path.join(BASE_PATH, 'torso');
const PATH_WEAPONS = path.join(BASE_PATH, 'weapon');

// --- HIGH-QUALITY PROPS ---
let DRUMSTICK_PNG: PNG | null = null;
let BARBELL_PNG: PNG | null = null;

try {
    const p1 = path.join(ITEMS_PATH, 'porkchop.png');
    if (fs.existsSync(p1)) DRUMSTICK_PNG = PNG.sync.read(fs.readFileSync(p1));
    const p2 = path.join(ITEMS_PATH, 'barbell.png');
    if (fs.existsSync(p2)) BARBELL_PNG = PNG.sync.read(fs.readFileSync(p2));
} catch (e) {
    console.warn("Failed to load high-quality props:", e);
}


// --- CACHE ---
let CACHED_FILES: Record<string, string[]> = {};

// Helpers
function getFiles(dir: string, logs: string[]): string[] {
    if (CACHED_FILES[dir]) return CACHED_FILES[dir];

    let results: string[] = [];
    if (!fs.existsSync(dir)) return [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(getFiles(filePath, logs));
            } else if (file.endsWith('.png')) {
                results.push(filePath);
            }
        });
    } catch (e) { }

    CACHED_FILES[dir] = results;
    return results;
}

// Alpha Blending Composite with Scaling
function compositeFrame(
    src: PNG,
    dest: PNG,
    srcX: number,
    srcY: number,
    destX: number,
    destY: number,
    scale: number = 2.0
) {
    if (!src || !dest) return;
    const scaledSize = Math.floor(SRC_FRAME_WIDTH * scale);

    for (let y = 0; y < scaledSize; y++) {
        for (let x = 0; x < scaledSize; x++) {
            const sx = srcX + Math.floor(x / scale);
            const sy = srcY + Math.floor(y / scale);

            if (sx >= 0 && sx < src.width && sy >= 0 && sy < src.height) {
                const idxSrc = (src.width * sy + sx) << 2;
                const a1 = src.data[idxSrc + 3] / 255;
                if (a1 > 0) {
                    const r1 = src.data[idxSrc];
                    const g1 = src.data[idxSrc + 1];
                    const b1 = src.data[idxSrc + 2];

                    const dx = destX + x;
                    const dy = destY + y;
                    if (dx >= 0 && dx < dest.width && dy >= 0 && dy < dest.height) {
                        const idxDest = (dest.width * dy + dx) << 2;
                        const r2 = dest.data[idxDest];
                        const g2 = dest.data[idxDest + 1];
                        const b2 = dest.data[idxDest + 2];
                        const a2 = dest.data[idxDest + 3] / 255;

                        const aOut = a1 + a2 * (1 - a1);
                        if (aOut > 0) {
                            const rOut = (r1 * a1 + r2 * a2 * (1 - a1)) / aOut;
                            const gOut = (g1 * a1 + g2 * a2 * (1 - a1)) / aOut;
                            const bOut = (b1 * a1 + b2 * a2 * (1 - a1)) / aOut;
                            dest.data[idxDest] = Math.round(rOut);
                            dest.data[idxDest + 1] = Math.round(gOut);
                            dest.data[idxDest + 2] = Math.round(bOut);
                            dest.data[idxDest + 3] = Math.round(aOut * 255);
                        }
                    }
                }
            }
        }
    }
}

interface GeneratorOptions {
    bodyType?: string;
    theme?: string;
    weapon?: string;
    head?: string;
    hair?: string;
}

export function generateMonsterSprite(id: number, options?: GeneratorOptions): { buffer: Buffer, logs: string[] } {
    const logs: string[] = [];
    const sRandom = (offset: number) => {
        const x = Math.sin(id + offset) * 10000;
        return x - Math.floor(x);
    };

    // 1. Selection logic
    const allBodies = getFiles(PATH_BODIES, logs);
    const allHeads = getFiles(PATH_HEADS, logs);
    const allLegs = getFiles(PATH_LEGS, logs);
    const allTorsos = getFiles(PATH_TORSO, logs);
    const allWeaponFiles = getFiles(PATH_WEAPONS, []).filter(f => f.endsWith('.png'));

    // Body Selection
    const bodyTypeLower = (options?.bodyType || "").toLowerCase();
    let finalBodyPath = allBodies[Math.floor(sRandom(1) * allBodies.length)];
    let bodyColor = "light";

    if (bodyTypeLower.includes('human') || bodyTypeLower.includes('male') || bodyTypeLower.includes('female')) {
        const gender = bodyTypeLower.includes('female') ? 'female' : 'male';
        const bodyRoot = path.join(BASE_PATH, 'body', 'bodies', gender);
        let bodyFiles = getFiles(bodyRoot, []).filter(f => f.endsWith('.png'));

        if (bodyTypeLower.includes('human')) {
            const allowed = ['light', 'dark', 'brown', 'tanned', 'pale', 'olive', 'taupe'];
            bodyFiles = bodyFiles.filter(f => {
                const n = path.basename(f).toLowerCase();
                return allowed.some(a => n.includes(a)) && !n.includes('orc') && !n.includes('goblin');
            });
        }

        if (bodyFiles.length > 0) {
            finalBodyPath = bodyFiles[Math.floor(sRandom(8) * bodyFiles.length)];
            bodyColor = path.basename(finalBodyPath, '.png');
        }
    }

    const layers: { png: PNG, type: string, z: number }[] = [];
    layers.push({ png: PNG.sync.read(fs.readFileSync(finalBodyPath)), type: 'body', z: 10 });

    // Clothing
    if (allLegs.length > 0 && sRandom(3) > 0.1) layers.push({ png: PNG.sync.read(fs.readFileSync(allLegs[Math.floor(sRandom(3) * allLegs.length)])), type: 'legs', z: 20 });
    if (allTorsos.length > 0 && sRandom(4) > 0.1) layers.push({ png: PNG.sync.read(fs.readFileSync(allTorsos[Math.floor(sRandom(4) * allTorsos.length)])), type: 'torso', z: 30 });

    // Hair
    const hairRoot = path.join(BASE_PATH, 'hair');
    if (fs.existsSync(hairRoot)) {
        const hFiles = getFiles(hairRoot, []);
        if (hFiles.length > 0) layers.push({ png: PNG.sync.read(fs.readFileSync(hFiles[Math.floor(sRandom(7) * hFiles.length)])), type: 'hair', z: 50 });
    }

    // Weapons
    let selectedWeaponName = "";
    let weaponFiles: string[] = [];
    if (options?.weapon && options.weapon !== 'none') {
        const q = options.weapon.toLowerCase();
        let matches = allWeaponFiles.filter(f => f.toLowerCase().includes(q));

        // Axe Fix (Map 'axe' to 'waraxe' or 'great_axe' if direct match fails)
        if (matches.length === 0 && q.includes('axe')) {
            matches = allWeaponFiles.filter(f => f.toLowerCase().includes('waraxe') || f.toLowerCase().includes('great_axe'));
        }

        if (matches.length > 0) {
            weaponFiles = matches;
            selectedWeaponName = q;
        }
    }

    const weaponActionSheets: Record<string, PNG> = {};
    const weaponActionSheetsBehind: Record<string, PNG> = {};
    if (weaponFiles.length > 0) {
        const actions = ['walk', 'slash', 'thrust', 'spellcast', 'shoot'];
        weaponFiles.forEach(f => {
            const lower = f.toLowerCase();
            const png = PNG.sync.read(fs.readFileSync(f));
            const isBehind = lower.includes('behind');
            const targetMap = isBehind ? weaponActionSheetsBehind : weaponActionSheets;
            const isUniversal = !actions.some(a => lower.includes(a)) || lower.includes('universal');

            if (isUniversal) {
                actions.forEach(a => {
                    if (!targetMap[a]) {
                        targetMap[a] = new PNG({ width: png.width, height: png.height });
                        targetMap[a].data.fill(0);
                    }
                    for (let i = 0; i < png.data.length; i++) targetMap[a].data[i] = png.data[i];
                });
            }
            actions.forEach(a => {
                if (lower.includes(a)) {
                    if (!targetMap[a]) {
                        targetMap[a] = new PNG({ width: png.width, height: png.height });
                        targetMap[a].data.fill(0);
                    }
                    for (let i = 0; i < png.data.length; i++) targetMap[a].data[i] = png.data[i];
                }
            });
        });
        layers.push({ png: new PNG({ width: 1, height: 1 }), type: 'weapon_behind', z: 5 });
        layers.push({ png: new PNG({ width: 1, height: 1 }), type: 'weapon_front', z: 60 });
    }

    // STRICT HUMAN HEAD
    let finalHeadPath = allHeads[Math.floor(sRandom(2) * allHeads.length)];
    const gender = bodyTypeLower.includes('female') ? 'female' : 'male';
    if (bodyTypeLower.includes('human') || (options as any)?.theme?.toLowerCase().includes('human')) {
        const headRoot = path.join(BASE_PATH, 'head', 'heads', 'human', gender);
        const targetHead = path.join(headRoot, `${bodyColor}.png`);
        if (fs.existsSync(targetHead)) {
            finalHeadPath = targetHead;
        } else if (fs.existsSync(headRoot)) {
            const backup = getFiles(headRoot, []).filter(h => h.endsWith('.png'));
            if (backup.length > 0) finalHeadPath = backup[Math.floor(sRandom(6) * backup.length)];
        }
    }
    layers.push({ png: PNG.sync.read(fs.readFileSync(finalHeadPath)), type: 'head', z: 40 });

    layers.sort((a, b) => a.z - b.z);

    // 4. Composite (8 Cols x 8 Rows = 1024 x 1024)
    const output = new PNG({ width: 1024, height: 1024 });

    // Determine Attack Mapping
    let attackRowLPC = 14;
    const w = selectedWeaponName.toLowerCase();
    if (w.includes('spear') || w.includes('staff') || w.includes('halberd')) attackRowLPC = 6;
    if (w.includes('bow')) attackRowLPC = 18;

    const renderAnim = (srcRow: number, destRow: number, frames: number = 8) => {
        for (let f = 0; f < frames; f++) {
            const sX = f * SRC_FRAME_WIDTH;
            const sY = srcRow * SRC_FRAME_HEIGHT;
            const dX = f * TARGET_FRAME_SIZE;
            const dY = destRow * TARGET_FRAME_SIZE;

            for (const layer of layers) {
                let drawPng = layer.png;
                let activeSrcX = sX;
                let activeSrcY = sY;

                if (layer.type.startsWith('weapon') && selectedWeaponName) {
                    let action = 'walk';
                    if (destRow === 4) action = 'slash';
                    if (destRow === 4 && attackRowLPC === 6) action = 'thrust';
                    if (destRow === 4 && attackRowLPC === 18) action = 'shoot';

                    if (destRow === 6) action = 'spellcast'; // Feeding
                    if (destRow === 7) action = 'slash';     // Training
                    if (destRow === 7 && (w.includes('spear') || w.includes('staff'))) action = 'thrust';

                    const map = layer.type === 'weapon_behind' ? weaponActionSheetsBehind : weaponActionSheets;
                    if (map[action]) {
                        drawPng = map[action];
                        const numRowsInSheet = Math.floor(drawPng.height / SRC_FRAME_HEIGHT);
                        let rowToSample = (numRowsInSheet < 21 && numRowsInSheet > 0) ? (srcRow % numRowsInSheet) : srcRow;

                        const cX = sX;
                        const cY = rowToSample * SRC_FRAME_HEIGHT;

                        if (cX + SRC_FRAME_WIDTH <= drawPng.width && cY + SRC_FRAME_HEIGHT <= drawPng.height) {
                            compositeFrame(drawPng, output, cX, cY, dX, dY, SCALE);
                        }
                    } else if (activeSrcY + SRC_FRAME_HEIGHT <= drawPng.height) {
                        compositeFrame(drawPng, output, activeSrcX, activeSrcY, dX, dY, SCALE);
                    }
                } else if (activeSrcY + SRC_FRAME_HEIGHT <= drawPng.height) {
                    compositeFrame(drawPng, output, activeSrcX, activeSrcY, dX, dY, SCALE);
                }
            }

            // Bake Props (High-Quality Roasted Drumstick / Barbell)
            if (destRow === 6 && f >= 1 && f <= 6 && DRUMSTICK_PNG) {
                // Feeding Prop Lifting
                let foodOffY = 0;
                if (f === 3 || f === 4) foodOffY = -8; // Scaled lift
                compositeFrame(DRUMSTICK_PNG, output, 0, 0, dX, dY + foodOffY, SCALE);
            }
            if (destRow === 7 && f >= 1 && f <= 6 && BARBELL_PNG) {
                // Training Prop Lifting
                let liftY = 0;
                if (f === 3 || f === 4) liftY = -12;
                compositeFrame(BARBELL_PNG, output, 0, 0, dX, dY + liftY, SCALE);
            }
        }
    };

    // Hero Mapping: S, E, N, W, Attack, Death, Feed, Train
    renderAnim(10, 0, 8); // South (Walk Row 10)
    renderAnim(11, 1, 8); // East (Walk Row 11)
    renderAnim(8, 2, 8);  // North (Walk Row 8)
    renderAnim(9, 3, 8);  // West (Walk Row 9)
    renderAnim(attackRowLPC, 4, 8); // Attack (Slash Row 14 or Thrust Row 6)
    renderAnim(20, 5, 6); // Death (Hurt Row 20)
    renderAnim(2, 6, 8);  // Feeding (Spellcast South Row 2)
    renderAnim(14, 7, 8); // Training (Slash South Row 14)

    return { buffer: PNG.sync.write(output), logs };


}
