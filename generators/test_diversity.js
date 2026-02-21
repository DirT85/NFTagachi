const { buildSpritesheet } = require('./build_spritesheets.js');
const fs = require('fs');
const path = require('path');

async function testBatch(count = 10) {
    console.log(`Running diversity test for first ${count} IDs...`);
    const outDir = path.join(__dirname, 'test_output_batch');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    // Mock metadata info
    const speciesList = ['Void Walker', 'Chaos Engine', 'Bully Alien', 'Lich King', 'Obsidian Golem'];
    const types = ['FIRE', 'ICE', 'ELECTRIC', 'POISON', 'DARK'];

    const files = fs.readdirSync(path.join(__dirname, 'ai_base_chars')).filter(f => f.endsWith('.png')).sort();

    for (let i = 0; i < count; i++) {
        const id = i;
        const species = speciesList[i % speciesList.length];
        const type = types[i % types.length];
        const variant = 'NORMAL';

        const baseIndex = id % files.length;
        const dynamicBase = files[baseIndex].replace('.png', '');

        console.log(`  Processing #${id}: Base=${dynamicBase}, Species=${species} (${type})`);
        try {
            const { sheet, hero } = await buildSpritesheet(id, species, type, variant, dynamicBase);
            fs.writeFileSync(path.join(outDir, `${id}_sheet.png`), sheet);
            fs.writeFileSync(path.join(outDir, `${id}_hero.png`), hero);
        } catch (err) {
            console.error(`  Error on #${id}: ${err.message}`);
        }
    }
    console.log(`Batch test complete. Check ${outDir}`);
}

const count = parseInt(process.argv[2]) || 10;
testBatch(count);
