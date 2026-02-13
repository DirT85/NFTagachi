const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function debugFrame() {
    const sheetPath = 'd:/NFTagachi/frontend/public/thug1.png';
    const img = await loadImage(sheetPath);
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');

    // Row 10 (Walk Down)
    // Offset 0
    ctx.drawImage(img, 0, 640, 64, 64, 0, 0, 64, 64);

    const out = fs.createWriteStream(__dirname + '/debug_frame_thug1_r10_f0.png');
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('Saved debug frame!'));
}

debugFrame();
