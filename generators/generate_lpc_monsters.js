const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

/**
 * High-Detail LPC Monster Generator (V13 - Precision Alignment)
 * Composites 832x1344 sprite sheets.
 * Fixes weapon alignment for oversized assets (192x192, 128x128).
 * Includes all available weapon types.
 */

// --- CONFIG ---
const BASE_PATH = path.join(__dirname, 'lpc_assets');
const SPRITESHEETS_PATH = path.join(BASE_PATH, 'spritesheets');
const DEFINITIONS_PATH = path.join(BASE_PATH, 'sheet_definitions');
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/collection_v8');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const BODIES = ["body.json", "body_skeleton.json", "body_zombie.json"];

const HEADS = [
    "heads_human_male.json", "heads_human_female.json",
    "heads_human_male_gaunt.json", "heads_human_male_plump.json",
    "heads_human_female_elderly.json", "heads_human_female_small.json",
    "heads_orc_male.json", "heads_orc_female.json",
    "heads_alien.json", "heads_goblin.json",
    "heads_lizard_male.json", "heads_lizard_female.json",
    "heads_minotaur.json", "heads_minotaur_female.json",
    "heads_troll.json", "heads_skeleton.json", "heads_wolf_male.json", "heads_wolf_female.json"
];

const HAIR = [
    "hair_topknot_long.json", "hair_topknot_short.json", "hair_braid.json", "hair_braid2.json",
    "hair_unkempt.json", "hair_wavy.json", "hair_ponytail.json", "hair_curtains.json", "hair_loose.json",
    "hair_messy1.json", "hair_mohawk.json", "hair_pixie.json", "hair_spiked.json"
];

const EXTRAS = [
    "wings_bat.json", "wings_dragonfly.json", "wings_feathered.json", "wings_lizard.json",
    "tail_dragon.json", "tail_cat.json", "tail_wolf.json", "tail_lizard.json",
    "hat_accessory_horns_short.json", "hat_accessory_horns_upward.json", "hat_accessory_wings.json"
];

const CLOTHES = [
    "torso_armour_plate.json", "torso_armour_leather.json", "torso_clothes_tunic.json",
    "legs_pants.json", "legs_fur.json", "belt_leather.json", "torso_jacket_tabard.json"
];

// FULL WEAPON LIBRARY
const WEAPONS = [
    "weapon_sword_arming.json", "weapon_sword_dagger.json", "weapon_sword_glowsword.json",
    "weapon_sword_katana.json", "weapon_sword_longsword.json", "weapon_sword_longsword_alt.json",
    "weapon_sword_rapier.json", "weapon_sword_saber.json", "weapon_sword_scimitar.json",
    "weapon_blunt_mace.json", "weapon_blunt_club.json", "weapon_blunt_flail.json",
    "weapon_ranged_bow_normal.json", "weapon_ranged_bow_great.json", "weapon_ranged_bow_recurve.json",
    "weapon_ranged_crossbow.json", "weapon_ranged_slingshot.json",
    "weapon_polearm_spear.json", "weapon_magic_simple.json"
];

const SHIELDS = [
    "shield_heater_revised_wood.json", "shield_heater_revised_trim.json",
    "shield_kite.json", "shield_spartan.json", "shield_scutum.json"
];

/**
 * Creates a pixel-art roasted drumstick (16x16 approx) inside a 64x64 PNG.
 */
function createFoodPNG() {
    const png = new PNG({ width: 64, height: 64 });
    // More substantial drumstick leg
    const pixels = [
        // Bone tip (centered more)
        [32, 26, 230, 210, 180, 255],
        [31, 25, 230, 210, 180, 255],
        [33, 25, 230, 210, 180, 255],
        // Bone shaft
        [32, 27, 230, 210, 180, 255],
        [32, 28, 230, 210, 180, 255],
        // Meat (Main body - roasted brown)
        [32, 29, 160, 82, 45, 255], [31, 29, 160, 82, 45, 255], [33, 29, 160, 82, 45, 255],
        [32, 30, 139, 69, 19, 255], [31, 30, 139, 69, 19, 255], [33, 30, 139, 69, 19, 255], [30, 30, 139, 69, 19, 255], [34, 30, 139, 69, 19, 255],
        [32, 31, 139, 69, 19, 255], [31, 31, 139, 69, 19, 255], [33, 31, 139, 69, 19, 255], [30, 31, 139, 69, 19, 255], [34, 31, 139, 69, 19, 255],
        [32, 32, 160, 82, 45, 255], [31, 32, 160, 82, 45, 255], [33, 32, 160, 82, 45, 255], [30, 32, 160, 82, 45, 255], [34, 32, 160, 82, 45, 255],
    ];

    for (const [px, py, r, g, b, a] of pixels) {
        // Draw 2x2 blocks for pixel art feel
        for (let dx = 0; dx < 2; dx++) {
            for (let dy = 0; dy < 2; dy++) {
                const x = px + dx - 1; // Slight adjustment
                const y = py + dy - 1;
                if (x >= 0 && x < 64 && y >= 0 && y < 64) {
                    const idx = (y * 64 + x) << 2;
                    png.data[idx] = r;
                    png.data[idx + 1] = g;
                    png.data[idx + 2] = b;
                    png.data[idx + 3] = a;
                }
            }
        }
    }
    return png;
}

const DRUMSTICK_PNG = createFoodPNG();

function loadDef(filename) {
    const p = path.join(DEFINITIONS_PATH, filename);
    if (!fs.existsSync(p)) return null;
    try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
        return null;
    }
}

function getLayerPath(layerDef, sex, variant) {
    if (!layerDef) return null;
    const pathPrefix = layerDef[sex] || layerDef.male || layerDef.female || Object.values(layerDef).find(v => typeof v === 'string');
    if (!pathPrefix) return null;
    let p = path.join(SPRITESHEETS_PATH, pathPrefix, `${variant}.png`);
    if (!fs.existsSync(p)) {
        // Broad color fallbacks
        const colors = ["white", "brown", "black", "iron", "steel", "gold", "light", "medium"];
        for (const c of colors) {
            const fb = path.join(SPRITESHEETS_PATH, pathPrefix, `${c}.png`);
            if (fs.existsSync(fb)) return fb;
        }
    }
    return p;
}

function bitblt(src, srcX, srcY, width, height, dst, dstX, dstY) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sx = srcX + x;
            const sy = srcY + y;
            const dx = dstX + x;
            const dy = dstY + y;

            if (sx < 0 || sx >= src.width || sy < 0 || sy >= src.height) continue;
            if (dx < 0 || dx >= dst.width || dy < 0 || dy >= dst.height) continue;

            const srcIdx = (sy * src.width + sx) << 2;
            const dstIdx = (dy * dst.width + dx) << 2;

            const sa = src.data[srcIdx + 3] / 255;
            if (sa === 0) continue;

            if (sa === 1) {
                dst.data[dstIdx] = src.data[srcIdx];
                dst.data[dstIdx + 1] = src.data[srcIdx + 1];
                dst.data[dstIdx + 2] = src.data[srcIdx + 2];
                dst.data[dstIdx + 3] = 255;
            } else {
                const da = dst.data[dstIdx + 3] / 255;
                dst.data[dstIdx] = Math.round(src.data[srcIdx] * sa + dst.data[dstIdx] * (1 - sa));
                dst.data[dstIdx + 1] = Math.round(src.data[srcIdx + 1] * sa + dst.data[dstIdx + 1] * (1 - sa));
                dst.data[dstIdx + 2] = Math.round(src.data[srcIdx + 2] * sa + dst.data[dstIdx + 2] * (1 - sa));
                dst.data[dstIdx + 3] = Math.round((sa + da * (1 - sa)) * 255);
            }
        }
    }
}

async function generateMonster(id) {
    try {
        let seed = id;
        function rand() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }
        function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

        const sex = rand() > 0.5 ? "male" : "female";
        const selectedHeadFile = pick(HEADS);
        const comps = [pick(BODIES), selectedHeadFile];

        const isCustom = (id === 100 || id === 42 || (id >= 200 && id <= 207));
        const isElite = (id >= 101 && id <= 110) || (id >= 120 && id <= 129) || (id === 42) || (id >= 200 && id <= 207);
        const weaponProb = 1.0; // Every monster gets a weapon for battle!
        const shieldProb = isElite ? 0.6 : 0.15;

        let customSrc = null;
        let customFrames = 13;
        if (id === 100 || id === 42) { customSrc = 'cyber_dragon_sheet.png'; customFrames = 10; }
        else if (id === 200) { customSrc = 'alien.png'; customFrames = 13; }
        else if (id === 201) { customSrc = 'badbaby.png'; customFrames = 18; }
        else if (id === 202) { customSrc = 'blackbeast.png'; customFrames = 18; }
        else if (id === 203) { customSrc = 'coppercupid.png'; customFrames = 18; }
        else if (id === 204) { customSrc = 'frankenstein.png'; customFrames = 18; }
        else if (id === 205) { customSrc = 'greenstrongalien.png'; customFrames = 13; }
        else if (id === 206) { customSrc = 'minodragon1.png'; customFrames = 13; }
        else if (id === 207) { customSrc = 'minodragon2.png'; customFrames = 13; }

        const equipment = [];
        if (!isCustom) {
            if (selectedHeadFile.startsWith("heads_human") && rand() > 0.3) {
                comps.push(pick(HAIR));
            }

            if (rand() > 0.5) comps.push(pick(EXTRAS));
            if (rand() > 0.7) comps.push(pick(EXTRAS));
            if (rand() > 0.4) comps.push(pick(CLOTHES));
            if (rand() > 0.6) comps.push(pick(CLOTHES));

            if (rand() < weaponProb) equipment.push(pick(WEAPONS));
            if (rand() < shieldProb) equipment.push(pick(SHIELDS));
        }


        const layers = [];
        if (isCustom && customSrc) {
            const p = path.join(__dirname, '../frontend/public/', customSrc);
            if (fs.existsSync(p)) {
                layers.push({
                    z: -1, // Ensure it's the base
                    png: PNG.sync.read(fs.readFileSync(p)),
                    isEquip: false,
                    animType: "normal"
                });
            }
        }

        // Load layers for non-custom components (body, head, hair, extras, clothes)
        for (const compFile of comps) {
            const def = loadDef(compFile);
            if (!def) continue;
            const variant = pick(def.variants);

            for (let i = 1; i <= 5; i++) {
                const layerKey = `layer_${i}`;
                const layerDef = def[layerKey];
                if (layerDef) {
                    const p = getLayerPath(layerDef, sex, variant);
                    if (p && fs.existsSync(p)) {
                        try {
                            layers.push({
                                z: layerDef.zPos || 0,
                                png: PNG.sync.read(fs.readFileSync(p)),
                                isEquip: false,
                                animType: layerDef.custom_animation || "normal"
                            });
                        } catch (e) { }
                    }
                }
            }
        }

        // Load layers for equipment
        for (const equipFile of equipment) {
            const def = loadDef(equipFile);
            if (!def) continue;
            const variant = pick(def.variants);

            for (let i = 1; i <= 5; i++) {
                const layerKey = `layer_${i}`;
                const layerDef = def[layerKey];
                if (layerDef) {
                    const p = getLayerPath(layerDef, sex, variant);
                    if (p && fs.existsSync(p)) {
                        try {
                            layers.push({
                                z: layerDef.zPos || 0,
                                png: PNG.sync.read(fs.readFileSync(p)),
                                isEquip: true,
                                animType: layerDef.custom_animation || "normal"
                            });
                        } catch (e) { }
                    }
                }
            }
        }

        layers.sort((a, b) => a.z - b.z);
        const maxFrames = isCustom ? customFrames : 13;
        const master = new PNG({ width: maxFrames * 64, height: 1344 });

        for (let r = 0; r < 21; r++) {
            // Combat rows: Thrust (4-7), Slash (12-15), Shoot (16-19)
            // Hiding weapons on Spellcast (0-3) used for Pet Actions (Eat/Clean)
            const isCombatRow = (r >= 4 && r <= 7) || (r >= 12 && r <= 19);
            const isFeedRow = (r === 2); // Spellcast South

            for (let c = 0; c < maxFrames; c++) {
                // Determine if we need to draw the food prop for this frame
                // In Row 2, frames 2-5 are when the hand is near the mouth
                // In Row 2 (Spellcast South), frames 1-6 cover the full arm movement
                const shouldDrawFood = isFeedRow && (c >= 1 && c <= 6);

                for (const layer of layers) {
                    if (layer.isEquip && !isCombatRow) continue;

                    let tileSize = 64;
                    let offsetX = 0;
                    let offsetY = 0;

                    if (layer.animType === "slash_oversize") {
                        tileSize = 192;
                        offsetX = 64;
                        offsetY = 64;
                    } else if (layer.animType.includes("128")) {
                        tileSize = 128;
                        offsetX = 32;
                        offsetY = 32;
                    }

                    let srcY = r * tileSize + offsetY;
                    let srcX = c * tileSize + offsetX;

                    // Bounds Check & Fallback
                    if (srcY + 64 > layer.png.height || srcX + 64 > layer.png.width) {
                        srcY = 10 * tileSize + offsetY;
                        srcX = 0 * tileSize + offsetX;
                    }

                    bitblt(layer.png, srcX, srcY, 64, 64, master, c * 64, r * 64);
                }

                // Inject Food Prop (Roasted Drumstick)
                if (shouldDrawFood) {
                    // Y-Offset for "lifting to mouth": frames 3-4 are the peak
                    let foodOffY = 0;
                    if (c === 3 || c === 4) foodOffY = -4;
                    bitblt(DRUMSTICK_PNG, 0, 0, 64, 64, master, c * 64, r * 64 + foodOffY);
                }

                // Add Blinking (Frame 12 of Row 10)
                // We'll use a simple "Eyes Closed" overlay for frame 12
                if (r === 10 && c === 12) {
                    // Draw a semi-transparent gray line over eyes area
                    // (Assuming eyes are around y=24 to y=28)
                    for (let x = 28; x < 36; x++) {
                        const idx = ((r * 64 + 26) * 832 + (c * 64 + x)) << 2;
                        master.data[idx] = 40; master.data[idx + 1] = 40; master.data[idx + 2] = 40; master.data[idx + 3] = 255;
                    }
                }
            }
        }

        fs.writeFileSync(path.join(OUTPUT_DIR, `sheet_${id}.png`), PNG.sync.write(master));
        if (id % 50 === 0) console.log(`Generated ${id}/300 (V13)`);
    } catch (err) {
        console.error(`Error generating ${id}:`, err);
    }
}

async function run() {
    console.log("Generating V23 Monsters (Including Custom Species + Food Baking)...");
    const ids = [];
    for (let i = 0; i < 300; i++) ids.push(i);
    // Ensure custom IDs are processed
    [100, 42, 200, 201, 202, 203, 204, 205, 206, 207].forEach(id => {
        if (!ids.includes(id)) ids.push(id);
    });

    for (const id of ids) {
        await generateMonster(id);
        if (id % 50 === 0) console.log(`Processed ID ${id} (V23)`);
    }
    console.log('Done!');
}

run().catch(console.error);
