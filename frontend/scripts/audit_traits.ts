import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(__dirname, '../assets/nft-launch-final');

function audit() {
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));
    let missingCount = 0;

    for (const file of files) {
        const jsonPath = path.join(OUTPUT_DIR, file);
        const metadata = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const hasWeapon = metadata.attributes.some((a: any) => a.trait_type === 'Weapon');

        if (!hasWeapon) {
            console.log(`Missing Weapon: ${file}`);
            missingCount++;
        }
    }

    console.log(`Total items checked: ${files.length}`);
    console.log(`Missing weapon trait: ${missingCount}`);
}

audit();
