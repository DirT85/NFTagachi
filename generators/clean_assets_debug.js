
const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

// Hardcoded absolute path to avoid relative path issues in this environment
const INPUT_DIR = 'd:\\NFTagachi\\frontend\\public';
const FILES = ['pet_water.png', 'pet_fire.png', 'pet_grass.png'];

console.log(`Starting cleanup in: ${INPUT_DIR}`);

async function cleanImage(filename) {
    const inputPath = path.join(INPUT_DIR, filename);
    const outputPath = path.join(INPUT_DIR, filename.replace('.png', '_clean.png'));

    if (!fs.existsSync(inputPath)) {
        console.error(`ERROR: Input file not found: ${inputPath}`);
        return;
    }

    console.log(`Reading: ${inputPath}`);

    try {
        const data = fs.readFileSync(inputPath);
        const png = PNG.sync.read(data);

        // Check corners to detect BG color
        const corners = [
            { r: png.data[0], g: png.data[1], b: png.data[2] }, // Top-Left
        ];
        const bg = corners[0];
        console.log(`  BG Color: R${bg.r} G${bg.g} B${bg.b}`);

        let pixelsChanged = 0;
        for (let y = 0; y < png.height; y++) {
            for (let x = 0; x < png.width; x++) {
                const idx = (png.width * y + x) << 2;
                const r = png.data[idx];
                const g = png.data[idx + 1];
                const b = png.data[idx + 2];

                // Distance check
                const dist = Math.sqrt(Math.pow(r - bg.r, 2) + Math.pow(g - bg.g, 2) + Math.pow(b - bg.b, 2));

                // Also checking for white/near-white since the artifacts often have white backgrounds
                const isWhite = r > 240 && g > 240 && b > 240;

                if (dist < 50 || isWhite) {
                    png.data[idx + 3] = 0; // Transparent
                    pixelsChanged++;
                }
            }
        }

        console.log(`  Pixels made transparent: ${pixelsChanged}`);
        const buffer = PNG.sync.write(png);
        fs.writeFileSync(outputPath, buffer);
        console.log(`  Saved: ${outputPath}`);

    } catch (err) {
        console.error(`  Error processing ${filename}:`, err);
    }
}

// Sequential execution
async function run() {
    for (const file of FILES) {
        await cleanImage(file);
    }
    console.log('Done.');
}

run();
