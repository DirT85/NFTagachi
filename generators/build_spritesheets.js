/**
 * NFTagachi Spritesheet Builder
 * Takes AI-generated character base images and produces 1024x1024 spritesheets
 * with 8 rows of animation (8 frames each, 128px per frame).
 * 
 * Rows: 0=Walk South, 1=Walk East, 2=Walk North, 3=Walk West,
 *        4=Attack, 5=Death, 6=Feed, 7=Train
 * 
 * Usage: node build_spritesheets.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const FRAME = 128;        // px per frame
const COLS = 8;            // frames per row
const ROWS = 8;            // animation rows
const SHEET_SIZE = 1024;   // output sheet size

// NFT metadata from existing salvage_launch.ts
const SPECIES_LIST = [
    'Void Walker', 'Chaos Engine', 'Bully Alien', 'Lich King',
    'Obsidian Golem', 'Phoenix', 'Shadow Drake', 'Abyssal Kraken',
    'Mino Dragon X', 'Neon Phantom', 'Celestial Arbiter'
];
const TYPES = ['FIRE', 'ICE', 'ELECTRIC', 'POISON', 'DARK', 'LIGHT', 'VOID', 'CHAOS'];
const VARIANTS = ['NORMAL', 'SHADOW', 'GOLD', 'SPECTRAL'];
const WEAPONS = ['longsword', 'rapier', 'katana', 'waraxe', 'warhammer', 'bow', 'staff', 'scimitar', 'mace'];

// Map species to base image categories (Default mappings)
const SPECIES_TO_BASE_DEFAULTS = {
    'Void Walker': 'void_walker',
    'Chaos Engine': 'chaos_engine',
    'Bully Alien': 'bully_alien',
    'Lich King': 'shadow_knight',
    'Obsidian Golem': 'chaos_engine',
    'Phoenix': 'fire_dragon_winged',
    'Shadow Drake': 'fire_dragon',
    'Abyssal Kraken': 'bully_alien',
    'Mino Dragon X': 'fire_dragon',
    'Neon Phantom': 'void_walker',
    'Celestial Arbiter': 'ice_wizard',
};

// Color tints per type (hue rotation in degrees)
const TYPE_HUE_SHIFT = {
    'FIRE': 0, 'ICE': 200, 'ELECTRIC': 60, 'POISON': 120,
    'DARK': 280, 'LIGHT': 40, 'VOID': 300, 'CHAOS': 330
};

// Variant effects
const VARIANT_EFFECTS = {
    'NORMAL': { brightness: 1.0, saturation: 1.0 },
    'SHADOW': { brightness: 0.5, saturation: 0.8 },
    'GOLD': { brightness: 1.3, saturation: 1.5 },
    'SPECTRAL': { brightness: 1.2, saturation: 0.3 },
};

const BASE_DIR = path.join(__dirname, 'ai_base_chars');
const OUTPUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'nft_sheets');
const HERO_DIR = path.join(__dirname, '..', 'frontend', 'public', 'nft_heroes');

/**
 * Create animation frames from a single base image
 * Returns 8 sharp buffers, each 128x128
 */
async function createAnimationFrames(baseBuffer, action, frameCount = 8) {
    const frames = [];

    for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount; // normalized time 0..1
        let frame;

        switch (action) {
            case 'walk_south':
            case 'walk_north':
                // Gentle bob up and down
                {
                    const bob = Math.round(Math.sin(t * Math.PI * 2) * 3);
                    frame = await sharp(baseBuffer)
                        .resize(FRAME, FRAME, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .extend({
                            top: Math.max(0, bob),
                            bottom: Math.max(0, -bob),
                            left: 0, right: 0,
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .resize(FRAME, FRAME, { fit: 'cover', position: 'bottom' })
                        .png()
                        .toBuffer();
                }
                break;

            case 'walk_east':
                // Bob + slight lean right
                {
                    const bob = Math.round(Math.sin(t * Math.PI * 2) * 2);
                    const lean = Math.round(Math.sin(t * Math.PI * 2) * 2) + 2;
                    frame = await sharp(baseBuffer)
                        .resize(FRAME, FRAME, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .extend({
                            top: Math.max(0, bob),
                            bottom: Math.max(0, -bob),
                            left: Math.max(0, lean),
                            right: Math.max(0, -lean),
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .resize(FRAME, FRAME, { fit: 'cover', position: 'bottom' })
                        .png()
                        .toBuffer();
                }
                break;

            case 'walk_west':
                // Mirror of walk_east
                {
                    const bob = Math.round(Math.sin(t * Math.PI * 2) * 2);
                    const lean = Math.round(Math.sin(t * Math.PI * 2) * 2) + 2;
                    frame = await sharp(baseBuffer)
                        .flop() // horizontal flip
                        .resize(FRAME, FRAME, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .extend({
                            top: Math.max(0, bob),
                            bottom: Math.max(0, -bob),
                            left: Math.max(0, -lean),
                            right: Math.max(0, lean),
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .resize(FRAME, FRAME, { fit: 'cover', position: 'bottom' })
                        .png()
                        .toBuffer();
                }
                break;

            case 'attack':
                // Lean forward + intensify brightness for impact frames
                {
                    const intensity = Math.sin(t * Math.PI); // peaks at frame 4
                    const leanPx = Math.round(intensity * 6);
                    frame = await sharp(baseBuffer)
                        .resize(FRAME, FRAME, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .modulate({ brightness: 1 + intensity * 0.3 })
                        .extend({
                            top: 0, bottom: leanPx,
                            left: leanPx, right: 0,
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .resize(FRAME, FRAME, { fit: 'cover', position: 'bottom' })
                        .png()
                        .toBuffer();
                }
                break;

            case 'death':
                // Gradually tilt and fade
                {
                    const deathProgress = t;
                    // For death: reduce size and shift down as character "falls"
                    const scale = Math.max(0.3, 1 - deathProgress * 0.7);
                    const newSize = Math.round(FRAME * scale);
                    const yShift = Math.round(deathProgress * 40);
                    frame = await sharp(baseBuffer)
                        .resize(newSize, newSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .extend({
                            top: yShift,
                            bottom: Math.max(0, FRAME - newSize - yShift),
                            left: Math.round((FRAME - newSize) / 2),
                            right: Math.max(0, FRAME - newSize - Math.round((FRAME - newSize) / 2)),
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .resize(FRAME, FRAME, { fit: 'cover', position: 'bottom' })
                        .png()
                        .toBuffer();
                }
                break;

            case 'feed':
                // Gentle bounce (happy eating motion)
                {
                    const bounce = Math.abs(Math.sin(t * Math.PI * 3)) * 4;
                    frame = await sharp(baseBuffer)
                        .resize(FRAME, FRAME, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .extend({
                            top: 0, bottom: Math.round(bounce),
                            left: 0, right: 0,
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .resize(FRAME, FRAME, { fit: 'cover', position: 'bottom' })
                        .png()
                        .toBuffer();
                }
                break;

            case 'train':
                // Up-down pumping motion (lifting weights)
                {
                    const pump = Math.sin(t * Math.PI * 2);
                    const squish = pump > 0 ? 1 - pump * 0.05 : 1 + Math.abs(pump) * 0.03;
                    const yOff = Math.round(pump * 4);
                    frame = await sharp(baseBuffer)
                        .resize(FRAME, Math.round(FRAME * squish), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .resize(FRAME, FRAME, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, position: 'bottom' })
                        .png()
                        .toBuffer();
                }
                break;

            default:
                frame = await sharp(baseBuffer)
                    .resize(FRAME, FRAME, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .png()
                    .toBuffer();
        }

        // Ensure frame is exactly 128x128
        frame = await sharp(frame)
            .resize(FRAME, FRAME, { fit: 'cover', position: 'centre' })
            .png()
            .toBuffer();

        frames.push(frame);
    }

    return frames;
}

/**
 * Apply type color tint and variant effect to a base image
 */
async function applyColorVariant(baseBuffer, type, variant, id) {
    const hueShift = TYPE_HUE_SHIFT[type] || 0;
    const variantFx = VARIANT_EFFECTS[variant] || VARIANT_EFFECTS['NORMAL'];

    // Use the NFT id to add slight unique hue offset (±15 degrees)
    let numericId = parseInt(id);
    if (isNaN(numericId)) {
        // Simple hash if id is not a number
        numericId = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    }
    const uniqueOffset = ((numericId * 37) % 30) - 15;

    let img = sharp(baseBuffer);

    // Apply color transformations
    img = img.modulate({
        brightness: variantFx.brightness,
        saturation: variantFx.saturation,
        hue: hueShift + uniqueOffset
    });

    return img.png().toBuffer();
}

/**
 * Build a complete 1024x1024 spritesheet for one NFT
 */
async function buildSpritesheet(id, species, type, variant, forcedBase = null) {
    // Use the forced base if provided (used for mass diversity cycling), otherwise fall back to species
    let baseName = forcedBase;

    if (!baseName) {
        const speciesFileName = species.toLowerCase().replace(/\s+/g, '_');
        baseName = speciesFileName;

        const files = fs.readdirSync(BASE_DIR).filter(f => f.endsWith('.png'));

        if (!fs.existsSync(path.join(BASE_DIR, `${baseName}.png`))) {
            // Fall back to the default mapping if direct match fails
            baseName = SPECIES_TO_BASE_DEFAULTS[species];

            if (!baseName || !fs.existsSync(path.join(BASE_DIR, `${baseName}.png`))) {
                // Ultimate fallback: cycle through the entire pool of extracted grid characters
                const pool = files.filter(f => f.startsWith('grid'));
                if (pool.length > 0) {
                    // Use a stable index based on ID to ensure the same NFT always gets the same character
                    let numericId = parseInt(id);
                    if (isNaN(numericId)) {
                        numericId = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    }
                    const poolIndex = numericId % pool.length;
                    baseName = pool[poolIndex].replace('.png', '');
                } else {
                    baseName = 'human_knight';
                }
            }
        }
    }

    let basePath = path.join(BASE_DIR, `${baseName}.png`);

    if (!fs.existsSync(basePath)) {
        console.warn(`  Missing base for species "${species}": ${basePath}, using human_knight`);
        baseName = 'human_knight';
        basePath = path.join(BASE_DIR, `${baseName}.png`);
    }

    // Load and color-shift the base image
    const rawBase = fs.readFileSync(basePath);
    const coloredBase = await applyColorVariant(rawBase, type, variant, id);

    const actions = ['walk_south', 'walk_east', 'walk_north', 'walk_west', 'attack', 'death', 'feed', 'train'];

    // Generate all animation frames
    const allFrames = [];
    for (const action of actions) {
        const frames = await createAnimationFrames(coloredBase, action, COLS);
        allFrames.push(frames);
    }

    // Composite all frames into the 1024x1024 sheet
    const compositeInputs = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            compositeInputs.push({
                input: allFrames[row][col],
                left: col * FRAME,
                top: row * FRAME
            });
        }
    }

    const sheet = await sharp({
        create: {
            width: SHEET_SIZE,
            height: SHEET_SIZE,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
        .composite(compositeInputs)
        .png()
        .toBuffer();

    // Extract hero shot (frame 0,0 = idle front facing)
    const hero = allFrames[0][0]; // walk south frame 0

    return { sheet, hero };
}

/**
 * Load existing metadata and generate spritesheets for all NFTs
 */
async function main() {
    // Create output directories
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.mkdirSync(HERO_DIR, { recursive: true });

    // Load metadata to know what to generate
    const metaDir = path.join(__dirname, '..', 'frontend', 'assets', 'nft-launch-final');
    const metaFiles = fs.readdirSync(metaDir).filter(f => f.endsWith('.json'));
    const manifestPath = path.join(__dirname, 'monster_names_manifest.json');
    const nameManifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) : {};

    console.log(`Found ${metaFiles.length} NFT metadata files`);
    console.log(`Base images available: ${fs.readdirSync(BASE_DIR).filter(f => f.endsWith('.png')).length}`);

    const allBases = fs.readdirSync(BASE_DIR).filter(f => f.endsWith('.png')).sort();
    let generated = 0;
    let errors = 0;

    for (const file of metaFiles) {
        const id = parseInt(file.replace('.json', ''));
        if (isNaN(id)) continue;

        try {
            const metaPath = path.join(metaDir, file);
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

            // --- Dynamic Variety Selection ---
            const baseIndex = id % allBases.length;
            const assetFile = allBases[baseIndex];
            const dynamicBase = assetFile.replace('.png', '');

            // --- Thematic Naming and Typing ---
            const info = nameManifest[assetFile] || {};
            const name = info.name || `Monster #${id}`;
            const type = info.type || TYPES[id % TYPES.length];
            const prefix = info.prefix || "Rare";
            const species = type || "Monster";
            const variant = "NORMAL";

            const outSheet = path.join(OUTPUT_DIR, `${id}.png`);
            const outHero = path.join(HERO_DIR, `${id}.png`);

            // Use the dynamic base for the build
            if (id <= 5 || id % 100 === 0) {
                console.log(`  [NFT #${id}] Name: ${name}, Base: ${dynamicBase}, Type: ${type}`);
            }

            const { sheet, hero } = await buildSpritesheet(id, species, type, variant, dynamicBase);

            fs.writeFileSync(outSheet, sheet);
            fs.writeFileSync(outHero, hero);

            // --- Update Metadata ---
            const spriteConfig = {
                src: `/nft_sheets/${id}.png`,
                frameSize: 128,
                framesPerRow: 8,
                rows: {
                    WALK_SOUTH: { row: 0, frames: 8 },
                    WALK_EAST: { row: 1, frames: 8 },
                    WALK_NORTH: { row: 2, frames: 8 },
                    WALK_WEST: { row: 3, frames: 8 },
                    ATTACK: { row: 4, frames: 8 },
                    DEATH: { row: 5, frames: 8 },
                    FEED: { row: 6, frames: 8 },
                    TRAIN: { row: 7, frames: 8 },
                    IDLE: { row: 0, frames: 1 }
                }
            };

            meta.name = name;
            meta.image = `/nft_heroes/${id}.png`;
            meta.attributes = [
                { trait_type: "Type", value: type },
                { trait_type: "Style", value: prefix },
                { trait_type: "ID", value: id.toString() }
            ];

            if (!meta.properties) meta.properties = {};
            meta.properties.assets = {
                spritesheet_uri: `/nft_sheets/${id}.png`,
                hero_uri: `/nft_heroes/${id}.png`,
                spriteConfig: spriteConfig
            };

            meta.spriteSheet = spriteConfig;

            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

            generated++;
            if (generated % 50 === 0 || generated <= 5) {
                console.log(`  Processed ${generated}/${metaFiles.length}: #${id} ${species} (${type}/${variant})`);
            }
        } catch (err) {
            console.error(`  Error on #${id}: ${err.message}`);
            errors++;
        }
    }

    console.log(`\nDone! Generated ${generated} sheets, ${errors} errors`);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    buildSpritesheet,
    createAnimationFrames,
    SPECIES_TO_BASE_DEFAULTS
};
