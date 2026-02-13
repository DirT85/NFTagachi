
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Absolute path
const INPUT_DIR = 'd:\\NFTagachi\\frontend\\public';
const FILE = 'pet_water.png';

console.log('--- START DIAGNOSTIC ---');
const inputPath = path.join(INPUT_DIR, FILE);
const copyPath = path.join(INPUT_DIR, 'test_copy.png');
const cleanPath = path.join(INPUT_DIR, 'pet_water_clean.png');

console.log(`Target: ${inputPath}`);

// 1. Test Read/Write access
try {
    if (fs.existsSync(inputPath)) {
        console.log('File exists.');
        const data = fs.readFileSync(inputPath);
        console.log(`Read ${data.length} bytes.`);
        fs.writeFileSync(copyPath, data);
        console.log(`Copied to ${copyPath} successfully.`);
    } else {
        console.error('FILE DOES NOT EXIST');
        process.exit(1);
    }
} catch (e) {
    console.error('File Access Error:', e);
    process.exit(1);
}

// 2. Test PNG Parsing
try {
    console.log('Attempting PNG parse...');
    const data = fs.readFileSync(inputPath);
    const png = PNG.sync.read(data);
    console.log(`PNG Parsed! Width: ${png.width}, Height: ${png.height}`);

    // 3. Clean
    console.log('Cleaning...');
    const bg = { r: png.data[0], g: png.data[1], b: png.data[2] };
    console.log(`BG Color: ${bg.r}, ${bg.g}, ${bg.b}`);

    for (let i = 0; i < png.data.length; i += 4) {
        const r = png.data[i];
        const g = png.data[i + 1];
        const b = png.data[i + 2];

        if (Math.abs(r - bg.r) < 30 && Math.abs(g - bg.g) < 30 && Math.abs(b - bg.b) < 30) {
            png.data[i + 3] = 0;
        }
    }

    const buffer = PNG.sync.write(png);
    fs.writeFileSync(cleanPath, buffer);
    console.log(`Saved clean file to ${cleanPath}`);

} catch (e) {
    console.error('PNG Processing Error:', e);
}

console.log('--- END DIAGNOSTIC ---');
