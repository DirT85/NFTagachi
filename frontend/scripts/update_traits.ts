import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(__dirname, '../assets/nft-launch-final');

async function updateTraits() {
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));
    console.log(`Updating traits for ${files.length} items...`);

    const WEAPONS = ['longsword', 'rapier', 'katana', 'waraxe', 'warhammer', 'bow', 'staff', 'scimitar', 'mace'];

    for (const file of files) {
        const idStr = file.replace('.json', '');
        const id = parseInt(idStr);
        const jsonPath = path.join(OUTPUT_DIR, file);
        const metadata: any = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        const sRandom = (offset: number) => {
            const x = Math.sin(id + offset) * 10000;
            return x - Math.floor(x);
        };
        const weaponRaw = WEAPONS[Math.floor(sRandom(99) * WEAPONS.length)];
        const weaponFormatted = weaponRaw.charAt(0).toUpperCase() + weaponRaw.slice(1);

        // Add Weapon attribute if not present
        if (!metadata.attributes.find((a: any) => a.trait_type === 'Weapon')) {
            metadata.attributes.push({
                trait_type: 'Weapon',
                value: weaponFormatted
            });
        }

        fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
    }

    console.log("TRAIT UPDATE COMPLETE!");
}

updateTraits().catch(console.error);
