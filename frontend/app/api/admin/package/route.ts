import { NextRequest, NextResponse } from 'next/server';
import { PNG } from 'pngjs';

import { generateLMNFTPackage } from '@/utils/lmnftGen';
import { generateMonsterSprite } from '@/utils/generatorV8';

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("x-admin-password");

    if (authHeader !== "shagrat1qaZ") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { seed } = await req.json();
        const id = parseInt(seed) || Math.floor(Math.random() * 999999);

        // 1. Generate Metadata
        const pkg = generateLMNFTPackage(id);

        // 2. Generate Base Sprite for Preview
        const result = generateMonsterSprite(id, {
            bodyType: pkg.assets.character,
            weapon: pkg.assets.weapon
        });
        const buffer = result.buffer;

        const base64 = buffer.toString('base64');
        pkg.image = `data:image/png;base64,${base64}`;

        // 3. Extract specific frames for Feeding and Training
        const fullSheet = PNG.sync.read(buffer);
        const extractFrame = (row: number) => {
            const frame = new PNG({ width: 128, height: 128 });
            PNG.bitblt(fullSheet, frame, 0, row * 128, 128, 128, 0, 0);
            return `data:image/png;base64,${PNG.sync.write(frame).toString('base64')}`;
        };

        (pkg.assets as any).feeding_art = extractFrame(6);
        (pkg.assets as any).training_art = extractFrame(7);

        // 4. Generate Fallback Device and Background (NO NETWORK NEEDED)
        const generatePixelArt = (width: number, height: number, type: 'device' | 'bg') => {
            const png = new PNG({ width, height });
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (width * y + x) << 2;
                    if (type === 'bg') {
                        if (y < height * 0.45) {
                            png.data[idx] = 100; png.data[idx + 1] = 181; png.data[idx + 2] = 246; // Sky
                        } else {
                            png.data[idx] = 76; png.data[idx + 1] = 175; png.data[idx + 2] = 80; // Grass
                        }
                    } else {
                        png.data[idx] = 126; png.data[idx + 1] = 87; png.data[idx + 2] = 194; // Translucent Purple
                        if (x > 50 && x < width - 50 && y > 40 && y < height - 40) {
                            png.data[idx + 3] = 0; // Screen Hole
                        }
                    }
                    if (type === 'bg' || png.data[idx + 3] !== 0) png.data[idx + 3] = 255;
                }
            }
            return `data:image/png;base64,${PNG.sync.write(png).toString('base64')}`;
        };

        (pkg.assets as any).fallback_device_data = generatePixelArt(384, 256, 'device');
        (pkg.assets as any).fallback_bg_data = generatePixelArt(384, 256, 'bg');

        return NextResponse.json({ success: true, package: pkg });

    } catch (error: any) {
        console.error("Package Generation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
