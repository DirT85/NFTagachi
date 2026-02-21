import { generateMonsterSprite } from '../utils/generatorV9';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const outDir = path.join(__dirname, '..', 'test_samples');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tests = [
    { id: 1, species: 'void walker', weapon: 'katana' },
    { id: 2, species: 'chaos engine', weapon: 'warhammer' },
    { id: 3, species: 'phoenix', weapon: 'staff' },
    { id: 4, species: 'mino dragon x', weapon: 'longsword' },
    { id: 5, species: 'abyssal kraken', weapon: 'scimitar' },
];

for (const t of tests) {
    console.log(`Generating ${t.species} with ${t.weapon}...`);
    const { buffer, logs } = generateMonsterSprite(t.id, {
        theme: t.species,
        weapon: t.weapon,
        bodyType: 'MAGIC'
    });

    const sheetName = t.species.replace(/ /g, '_');

    // Save full sheet
    fs.writeFileSync(path.join(outDir, `${sheetName}_sheet.png`), buffer);

    // Extract hero shot (128x128 from position 0,0)
    const sheet = PNG.sync.read(buffer);
    const hero = new PNG({ width: 128, height: 128 });
    PNG.bitblt(sheet, hero, 0, 0, 128, 128, 0, 0);
    fs.writeFileSync(path.join(outDir, `${sheetName}_hero.png`), PNG.sync.write(hero));

    console.log(`  Sheet: ${sheet.width}x${sheet.height}`);
    console.log(`  Logs: ${logs.join(', ')}`);
}

console.log(`\nDone! ${tests.length} samples generated in test_samples/`);
