import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { generateMonsterSprite } from '../utils/generatorV9';

const INPUT_DIR = path.join(__dirname, '../assets/nft-launch');
const OUTPUT_DIR = path.join(__dirname, '../assets/nft-launch-final');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function salvage() {
    const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'));
    console.log(`Starting salvage of ${files.length} items...`);

    const WEAPONS = ['longsword', 'rapier', 'katana', 'waraxe', 'warhammer', 'bow', 'staff', 'scimitar', 'mace'];
    const CONCURRENCY = 4;
    const items = files.map((file, index) => ({ file, index }));

    async function worker() {
        while (items.length > 0) {
            const item = items.shift();
            if (!item) break;

            const { file, index } = item;
            const idStr = file.replace('.json', '');
            const id = parseInt(idStr);

            const jsonPath = path.join(INPUT_DIR, file);
            const metadata: any = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

            try {
                const sRandom = (offset: number) => {
                    const x = Math.sin(id + offset) * 10000;
                    return x - Math.floor(x);
                };
                const weapon = WEAPONS[Math.floor(sRandom(99) * WEAPONS.length)];

                console.log(`[${index + 1}/${files.length}] Generating ${metadata.name} (Weapon: ${weapon})...`);

                // 1. Generate Full High-Quality Sheet (V9 Engine — Custom Procedural)
                const speciesAttr = metadata.attributes.find((a: any) => a.trait_type === 'Species');
                const typeAttr = metadata.attributes.find((a: any) => a.trait_type === 'Type');
                const species = speciesAttr ? speciesAttr.value : 'Void Walker';
                const elType = typeAttr ? typeAttr.value : 'MAGIC';
                const { buffer } = generateMonsterSprite(id, {
                    bodyType: elType,
                    theme: species.toLowerCase(),
                    weapon: weapon
                });

                // 2. Extract Hero Shot (128x128 Idle Frame at 0,0)
                const fullSheet = PNG.sync.read(buffer);
                const hero = new PNG({ width: 128, height: 128 });
                PNG.bitblt(fullSheet, hero, 0, 0, 128, 128, 0, 0);

                // 3. Save Files
                const heroPath = path.join(OUTPUT_DIR, `${id}.png`);
                const sheetPath = path.join(OUTPUT_DIR, `${id}_sheet.png`);

                fs.writeFileSync(heroPath, PNG.sync.write(hero));
                fs.writeFileSync(sheetPath, buffer);

                // 4. Update Metadata (add Weapon attribute)
                metadata.image = `${id}.png`;

                // Add Weapon attribute if not present
                const existingWeapon = metadata.attributes.find((a: any) => a.trait_type === 'Weapon');
                if (!existingWeapon) {
                    metadata.attributes.push({ trait_type: 'Weapon', value: weapon.charAt(0).toUpperCase() + weapon.slice(1) });
                }

                if (!metadata.properties) metadata.properties = {};
                metadata.properties.files = [
                    { uri: `${id}.png`, type: "image/png", description: "Hero Shot" },
                    { uri: `${id}_sheet.png`, type: "image/png", description: "Sprite Sheet" }
                ];
                metadata.properties.assets = {
                    spritesheet_uri: `${id}_sheet.png`
                };

                fs.writeFileSync(path.join(OUTPUT_DIR, `${id}.json`), JSON.stringify(metadata, null, 2));

            } catch (err: any) {
                console.error(`Failed to generate ID ${id}:`, err);
            }
        }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }).map(() => worker()));

    console.log("SALVAGE COMPLETE! Final assets in assets/nft-launch-final");
}

salvage().catch(console.error);
