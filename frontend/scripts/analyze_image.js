const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/cyber_dragon_sheet.png');

try {
    const buffer = fs.readFileSync(filePath);

    // Check Signature
    // 89 50 4E 47 0D 0A 1A 0A
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const fileSignature = buffer.slice(0, 8);

    if (fileSignature.equals(pngSignature)) {
        console.log("Valid PNG Signature detected.");
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        console.log(`Dimensions: ${width} x ${height}`);
    } else {
        console.log("INVALID PNG Signature:", fileSignature);
    }

} catch (e) {
    console.error("Error reading file:", e.message);
}
