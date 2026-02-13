const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(__dirname, 'lpc_assets');
const SPRITESHEETS_PATH = path.join(BASE_PATH, 'spritesheets');
const DEFINITIONS_PATH = path.join(BASE_PATH, 'sheet_definitions');

const BODIES = ["body.json", "body_skeleton.json", "body_zombie.json"];
const HEADS = [
    "heads_human_male.json", "heads_human_female.json",
    "heads_human_male_gaunt.json", "heads_human_male_plump.json",
    "heads_human_female_gaunt.json", "heads_human_female_elderly.json",
    "heads_orc_male.json", "heads_alien.json", "heads_goblin.json",
    "heads_lizard_male.json", "heads_minotaur.json", "heads_troll.json"
];
const HAIR = [
    "hair_topknot_long.json", "hair_topknot_short.json", "hair_braid_long.json",
    "hair_unkempt.json", "hair_wavy.json", "hair_ponytail.json", "hair_clump.json"
];
const EXTRAS = [
    "wings_bat.json", "wings_dragonfly.json", "wings_feathered.json", "wings_lizard.json",
    "tail_dragon.json", "tail_cat.json", "tail_wolf.json", "tail_lizard.json",
    "hat_accessory_horns_short.json", "hat_accessory_horns_upward.json"
];
const CLOTHES = [
    "torso_armour_plate.json", "torso_armour_leather.json", "torso_clothes_tunic.json",
    "legs_pants.json", "legs_fur.json", "belt_leather.json"
];
const WEAPONS = ["weapon_sword_arming.json"];
const SHIELDS = ["shield_heater_revised_wood.json"];

function loadDef(filename) {
    const p = path.join(DEFINITIONS_PATH, filename);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function getLayerPath(layerDef, sex, variant) {
    if (!layerDef) return null;
    const pathPrefix = layerDef[sex] || layerDef.male || layerDef.female || Object.values(layerDef).find(v => typeof v === 'string');
    if (!pathPrefix) return null;
    let p = path.join(SPRITESHEETS_PATH, pathPrefix, `${variant}.png`);
    if (!fs.existsSync(p)) {
        const colors = ["white", "brown", "black", "iron", "steel", "gold", "light", "medium"];
        for (const c of colors) {
            const fb = path.join(SPRITESHEETS_PATH, pathPrefix, `${c}.png`);
            if (fs.existsSync(fb)) return fb;
        }
    }
    return p;
}

function debugMonster(id) {
    let seed = id;
    function rand() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }
    function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

    const sex = rand() > 0.5 ? "male" : "female";
    const selectedHeadFile = pick(HEADS);
    const comps = [pick(BODIES), selectedHeadFile];

    if (selectedHeadFile.startsWith("heads_human") && rand() > 0.3) {
        comps.push(pick(HAIR));
    }

    if (rand() > 0.5) comps.push(pick(EXTRAS));
    if (rand() > 0.7) comps.push(pick(EXTRAS));
    if (rand() > 0.4) comps.push(pick(CLOTHES));
    if (rand() > 0.6) comps.push(pick(CLOTHES));

    const equipment = [];
    if (rand() < 0.5) equipment.push(pick(WEAPONS));
    if (rand() < 0.2) equipment.push(pick(SHIELDS));

    console.log(`Debug ID ${id}:`);
    console.log(`Sex: ${sex}`);
    console.log(`Components:`, comps);
    console.log(`Equipment:`, equipment);

    const allComps = [...comps.map(c => ({ file: c, isEquip: false })), ...equipment.map(e => ({ file: e, isEquip: true }))];

    for (const item of allComps) {
        const def = loadDef(item.file);
        if (!def) {
            console.log(`MISSING DEF: ${item.file}`);
            continue;
        }
        const variant = pick(def.variants);
        console.log(`Picked ${item.file} variant: ${variant}`);

        for (let i = 1; i <= 5; i++) {
            const layerKey = `layer_${i}`;
            const layerDef = def[layerKey];
            if (layerDef) {
                const p = getLayerPath(layerDef, sex, variant);
                if (p && fs.existsSync(p)) {
                    console.log(`  Layer ${i} path: ${p.replace(SPRITESHEETS_PATH, '')}`);
                } else {
                    console.log(`  Layer ${i} NOT FOUND: ${p ? p.replace(SPRITESHEETS_PATH, '') : 'null'}`);
                }
            }
        }
    }
}

debugMonster(75);
