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

// Fill with grey barbell
for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;

        // Bar (horizontal line)
        // Center roughly at y=32, width from x=10 to x=54
        if (y >= 30 && y <= 34 && x >= 10 && x <= 54) {
            png.data[idx] = 50;  // R
            png.data[idx + 1] = 50; // G
            png.data[idx + 2] = 50; // B
            png.data[idx + 3] = 255; // A
            continue;
        }

        // Weights (Rectangles at ends)
        // Left: x=10-16, y=20-44
        // Right: x=48-54, y=20-44
        if ((x >= 8 && x <= 14 && y >= 20 && y <= 44) ||
            (x >= 50 && x <= 56 && y >= 20 && y <= 44)) {
            png.data[idx] = 80;  // R
            png.data[idx + 1] = 80; // G
            png.data[idx + 2] = 80; // B
            png.data[idx + 3] = 255; // A
            continue;
        }

        // Transparent
        png.data[idx + 3] = 0;
    }
}

// Save
const outputPath = path.join(outputDir, 'barbell.png');
fs.writeFileSync(outputPath, PNG.sync.write(png));
console.log('Created placeholder barbell at', outputPath);
