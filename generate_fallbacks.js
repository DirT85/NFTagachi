const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

const generatePolishedAsset = (width, height, type) => {
    const png = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;

            if (type === 'bg') {
                // Polished Pixel Art Background
                if (y < height * 0.45) {
                    // Sky with slight gradient
                    const skyBrightness = 200 + Math.floor((y / height) * 55);
                    png.data[idx] = 100; png.data[idx + 1] = 181; png.data[idx + 2] = skyBrightness;
                } else {
                    // Grass with slight noise
                    const noise = Math.random() * 20;
                    png.data[idx] = 76 + noise; png.data[idx + 1] = 175 + noise; png.data[idx + 2] = 80;
                }
                png.data[idx + 3] = 255;
            } else {
                // Polished Handheld Device Frame
                const isEdge = x < 5 || x > width - 5 || y < 5 || y > height - 5;
                const isScreenArea = x > 60 && x < width - 60 && y > 45 && y < height - 45;
                const isButtonA = Math.sqrt(Math.pow(x - 340, 2) + Math.pow(y - 100, 2)) < 15;
                const isButtonB = Math.sqrt(Math.pow(x - 340, 2) + Math.pow(y - 150, 2)) < 15;
                const isButtonC = Math.sqrt(Math.pow(x - 340, 2) + Math.pow(y - 200, 2)) < 15;

                if (isScreenArea) {
                    // Transparent Hole for the game character
                    png.data[idx + 3] = 0;
                } else if (isButtonA || isButtonB || isButtonC) {
                    // Buttons (Reddish)
                    png.data[idx] = 211; png.data[idx + 1] = 47; png.data[idx + 2] = 47;
                    png.data[idx + 3] = 255;
                } else {
                    // Device Body (Purple with shading)
                    let r = 126, g = 87, b = 194;
                    if (isEdge) { r -= 30; g -= 30; b -= 30; } // Border shadow
                    png.data[idx] = r; png.data[idx + 1] = g; png.data[idx + 2] = b;
                    png.data[idx + 3] = 255; // ENSURE FULL OPACITY
                }
            }
        }
    }
    return PNG.sync.write(png);
};

const publicDir = path.join(__dirname, 'frontend', 'public');
if (!fs.existsSync(publicDir)) {
    console.error('Public directory not found at:', publicDir);
    process.exit(1);
}

fs.writeFileSync(path.join(publicDir, 'fallback_device.png'), generatePolishedAsset(384, 256, 'device'));
fs.writeFileSync(path.join(publicDir, 'fallback_bg.png'), generatePolishedAsset(384, 256, 'bg'));
console.log('Polished fallback assets generated successfully in public/');
