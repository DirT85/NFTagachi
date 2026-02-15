const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Ensure directory
const outputDir = path.join('d:', 'NFTagachi', 'generators', 'lpc_assets', 'items');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create 64x64 PNG
const png = new PNG({ width: 64, height: 64 });

// Fill with red color (simple porkchop)
for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;
        // Draw a circle roughly
        const dx = x - 32;
        const dy = y - 32;
        if (dx * dx + dy * dy < 400) { // Radius 20
            png.data[idx] = 200; // R
            png.data[idx + 1] = 50;  // G
            png.data[idx + 2] = 50;  // B
            png.data[idx + 3] = 255; // A
        } else {
            png.data[idx + 3] = 0; // Transparent
        }
    }
}

// Save
const outputPath = path.join(outputDir, 'porkchop.png');
fs.writeFileSync(outputPath, PNG.sync.write(png));
console.log('Created placeholder porkchop at', outputPath);
