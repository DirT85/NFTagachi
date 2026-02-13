
const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../frontend/public');
const FILES = ['pet_water.png', 'pet_fire.png', 'pet_grass.png'];

async function cleanImage(filename) {
    const inputPath = path.join(INPUT_DIR, filename);
    const outputPath = path.join(INPUT_DIR, filename.replace('.png', '_clean.png'));

    if (!fs.existsSync(inputPath)) {
        console.error(`File not found: ${inputPath}`);
        return;
    }

    console.log(`Processing ${filename}...`);

    fs.createReadStream(inputPath)
        .pipe(new PNG({ filterType: 4 }))
        .on('parsed', function () {
            // Check corners to detect BG color
            const corners = [
                { r: this.data[0], g: this.data[1], b: this.data[2] }, // Top-Left
                { r: this.data[(this.width - 1) * 4], g: this.data[(this.width - 1) * 4 + 1], b: this.data[(this.width - 1) * 4 + 2] } // Top-Right
            ];

            // Use Top-Left as BG
            const bg = corners[0];
            console.log(`  Detected BG Color: R${bg.r} G${bg.g} B${bg.b}`);

            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const idx = (this.width * y + x) << 2;
                    const r = this.data[idx];
                    const g = this.data[idx + 1];
                    const b = this.data[idx + 2];

                    // Simple Eucledian distance check for similarity
                    const dist = Math.sqrt(Math.pow(r - bg.r, 2) + Math.pow(g - bg.g, 2) + Math.pow(b - bg.b, 2));

                    // Threshold for "close enough to BG"
                    if (dist < 50) {
                        this.data[idx + 3] = 0; // Set Alpha to 0
                    }
                }
            }

            this.pack().pipe(fs.createWriteStream(outputPath));
            console.log(`  Saved ${outputPath}`);
        });
}

FILES.forEach(cleanImage);
