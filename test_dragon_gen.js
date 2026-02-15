
const { generateDragonSprite } = require('./frontend/utils/generatorDragon');
const fs = require('fs');
const path = require('path');

async function test() {
    const debugDir = path.join(__dirname, 'debug_dragons');
    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir);

    const types = ['fire', 'ice', 'storm', 'cyber'];

    for (const type of types) {
        console.log(`Generating ${type} dragon...`);
        const { buffer, logs } = generateDragonSprite(Math.random() * 1000, { dragonType: type });
        if (logs) logs.forEach(l => console.log(`  [Log] ${l}`));
        const filePath = path.join(debugDir, `${type}_dragon.png`);
        fs.writeFileSync(filePath, buffer);
        console.log(`  Saved to ${filePath} (Size: ${buffer.length} bytes)`);
    }
}

test().catch(console.error);
