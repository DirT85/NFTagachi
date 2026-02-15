const { generateMonsterSprite } = require('./utils/generatorV8');
const fs = require('fs');
const path = require('path');

async function test() {
    console.log("Testing V8 Generator...");
    const v8 = generateMonsterSprite(1234, { bodyType: 'male', theme: 'amber', weapon: 'axe' });
    const v8Path = path.join(process.cwd(), 'test_v8_axe.png');
    fs.writeFileSync(v8Path, v8.buffer);
    console.log(`V8 Output (with axe) saved to: ${v8Path}`);
}

test().catch(console.error);
