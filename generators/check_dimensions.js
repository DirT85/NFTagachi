const fs = require('fs');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const files = [
    'd:/NFTagachi/generators/dragon_assets/organic_master.png',
    'd:/NFTagachi/generators/dragon_assets/cyber_master.png',
    'd:/NFTagachi/generators/dragon_assets/organic_variant.png'
];

files.forEach(file => {
    try {
        const data = fs.readFileSync(file);
        // Try PNG
        try {
            const png = PNG.sync.read(data);
            console.log(`${file}: PNG ${png.width}x${png.height}`);
            return;
        } catch (e) { }

        // Try JPEG
        try {
            const decoded = jpeg.decode(data);
            console.log(`${file}: JPEG ${decoded.width}x${decoded.height}`);
            return;
        } catch (e) { }

        console.log(`${file}: Unknown Format`);
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});
