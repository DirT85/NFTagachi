
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Must be absolute in this environment to work reliably
const INPUT_DIR = 'd:\\NFTagachi\\frontend\\public';
// "pet_human.png" was a copy of "pet.svg" which might be invalid png format if it was just renamed.
// If pet_human.png is actually an SVG renamed to PNG, pngjs will fail.
const FILES = ['pet_water.png', 'pet_fire.png', 'pet_grass.png'];

console.log('--- START CLEAN ASSETS ---');

// Helper to clean a single file
function cleanFile(file) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(INPUT_DIR, file.replace('.png', '_clean.png'));

    console.log(`Processing: ${file}`);

    if (!fs.existsSync(inputPath)) {
        console.error(`  Error: File not found at ${inputPath}`);
        return;
    }

    try {
        const data = fs.readFileSync(inputPath);
        const png = PNG.sync.read(data); // This will throw if not a valid PNG

        let changed = 0;

        // 1. Detect Background (Top-Left Pixel)
        const bg = { r: png.data[0], g: png.data[1], b: png.data[2] };
        console.log(`  BG Color detected: ${bg.r}, ${bg.g}, ${bg.b}`);

        // 2. Iterate and Clean
        for (let y = 0; y < png.height; y++) {
            for (let x = 0; x < png.width; x++) {
                const idx = (png.width * y + x) << 2;
                const r = png.data[idx];
                const g = png.data[idx + 1];
                const b = png.data[idx + 2];

                // Euclidian distance to BG color
                const dist = Math.sqrt(
                    Math.pow(r - bg.r, 2) +
                    Math.pow(g - bg.g, 2) +
                    Math.pow(b - bg.b, 2)
                );

                // Threshold of 50 is generous for compression artifacts
                // Also check if pixel is near WHITE (r,g,b > 240)
                const isWhite = r > 240 && g > 240 && b > 240;

                if (dist < 50 || isWhite) {
                    png.data[idx + 3] = 0; // Alpha = 0
                    changed++;
                }
            }
        }

        console.log(`  Pixels cleaned: ${changed}`);

        // 3. Write Output
        const buffer = PNG.sync.write(png);
        fs.writeFileSync(outputPath, buffer);
        console.log(`  Saved verified PNG to: ${outputPath}`);

    } catch (e) {
        console.error(`  FAILED to process ${file}:`, e.message);
    }
}

// Ensure human asset is handled (SVG doesn't need cleaning, just needs to be accessible)
// We'll skip cleaning 'pet_human.png' if it's actually an SVG.
const text = fs.readFileSync(path.join(INPUT_DIR, 'pet.svg'), 'utf8');
// Check if pet.svg is actually an SVG (contains <svg)
if (text.includes('<svg')) {
    console.log('Human asset is SVG, using original file as is.');
    // We already have Sprite.tsx using pet.svg
} else {
    console.log('Warning: pet.svg is not an SVG?');
}

// Run for PNGs
FILES.forEach(cleanFile);

console.log('--- END CLEAN ASSETS ---');
