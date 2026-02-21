const { buildSpritesheet } = require('./build_spritesheets.js');
const fs = require('fs');
const path = require('path');

async function testSingleAsset(id, species, type, variant) {
    console.log(`Testing build for: ${species} (${type}/${variant})`);
    try {
        const { sheet, hero } = await buildSpritesheet(id, species, type, variant);

        const outDir = path.join(__dirname, 'test_output');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

        const sheetPath = path.join(outDir, `${id}_sheet.png`);
        const heroPath = path.join(outDir, `${id}_hero.png`);

        fs.writeFileSync(sheetPath, sheet);
        fs.writeFileSync(heroPath, hero);

        console.log(`Success!`);
        console.log(`Sheet: ${sheetPath}`);
        console.log(`Hero: ${heroPath}`);
    } catch (err) {
        console.error(`Failed: ${err.message}`);
    }
}

// Test with one of the new grid characters
// grid2_char_001.png is likely a red dragon
testSingleAsset('test_9999', 'grid2_char_001', 'FIRE', 'NORMAL');
