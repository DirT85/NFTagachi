const fs = require('fs');
const { PNG } = require('pngjs');

const images = ['badbaby.png', 'alien.png', 'blackbeast.png', 'coppercupid.png', 'frankenstein.png', 'greenstrongalien.png', 'minodragon1.png', 'minodragon2.png'];

images.forEach(img => {
    try {
        const data = fs.readFileSync('frontend/public/' + img);
        const png = PNG.sync.read(data);
        console.log(`${img}: ${png.width}x${png.height} (${png.height / 64} rows, ${png.width / 64} frames)`);
    } catch (e) {
        console.log(`${img}: NOT FOUND or ERROR`);
    }
});
