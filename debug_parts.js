import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

const BASE_PATH = path.join(process.cwd(), 'generators', 'lpc_assets', 'spritesheets', 'dragon');
const OUTPUT_PATH = path.join(process.cwd(), 'debug_parts.png');

async function main() {
    const folders = ['heads', 'bodies', 'legs', 'tails', 'wings'];
    const sheet = new PNG({ width: 10 * 64, height: folders.length * 64 });
    for (let i = 0; i < sheet.data.length; i += 4) sheet.data[i + 3] = 0;

    for (let r = 0; r < folders.length; r++) {
        const folder = folders[r];
        const dir = path.join(BASE_PATH, folder);
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).slice(0, 10);
        for (let c = 0; c < files.length; c++) {
            const data = fs.readFileSync(path.join(dir, files[c]));
            const png = PNG.sync.read(data);

            // Draw into sheet
            for (let y = 0; y < 64; y++) {
                for (let x = 0; x < 64; x++) {
                    const si = (y * png.width + x) << 2;
                    const di = ((r * 64 + y) * sheet.width + (c * 64 + x)) << 2;
                    sheet.data[di] = png.data[si];
                    sheet.data[di + 1] = png.data[si + 1];
                    sheet.data[di + 2] = png.data[si + 2];
                    sheet.data[di + 3] = png.data[si + 3];
                }
            }
        }
    }

    fs.writeFileSync(OUTPUT_PATH, PNG.sync.write(sheet));
    console.log('Saved debug_parts.png');
}

main();
