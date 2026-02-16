const fs = require('fs');
const path = require('path');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { irysUploader } = require('@metaplex-foundation/umi-uploader-irys');
const { keypairIdentity, createGenericFile } = require('@metaplex-foundation/umi');

// CONFIG
const ENDPOINT = 'https://api.devnet.solana.com';
const ASSETS_DIR = path.join(__dirname, '../assets/nft-launch-final');
const MANIFEST_PATH = path.join(__dirname, '../assets/upload_manifest.json');

async function run() {
    // 1. Check for Wallet
    // The user should provide a secret key array or path to id.json
    // For this script, we'll try to read from a local 'wallet.json' if it exists
    let secretKey;
    try {
        const walletData = JSON.parse(fs.readFileSync(path.join(__dirname, '../wallet.json'), 'utf-8'));
        secretKey = Uint8Array.from(walletData);
    } catch (e) {
        console.error("❌ No wallet.json found in frontend directory. Please create one with your private key array.");
        process.exit(1);
    }

    const umi = createUmi(ENDPOINT)
        .use(irysUploader({ address: 'https://devnet.irys.xyz' }));

    const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
    umi.use(keypairIdentity(keypair));

    console.log(`🚀 Starting upload using wallet: ${keypair.publicKey}`);

    const manifest = {};
    if (fs.existsSync(MANIFEST_PATH)) {
        Object.assign(manifest, JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')));
    }

    const files = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} items to process.`);

    for (let i = 0; i < files.length; i++) {
        const id = files[i].replace('.json', '');

        if (manifest[id] && manifest[id].jsonUri) {
            console.log(`⏭️ Skipping ${id} (ALREADY UPLOADED)`);
            continue;
        }

        try {
            console.log(`📦 Processing #${id} [${i + 1}/${files.length}]...`);

            // 1. Upload Hero PNG
            const heroPath = path.join(ASSETS_DIR, `${id}.png`);
            const heroBuffer = fs.readFileSync(heroPath);
            const [heroUri] = await umi.uploader.upload([
                createGenericFile(heroBuffer, `${id}.png`, { contentType: 'image/png' })
            ]);

            // 2. Upload Sheet PNG
            const sheetPath = path.join(ASSETS_DIR, `${id}_sheet.png`);
            const sheetBuffer = fs.readFileSync(sheetPath);
            const [sheetUri] = await umi.uploader.upload([
                createGenericFile(sheetBuffer, `${id}_sheet.png`, { contentType: 'image/png' })
            ]);

            // 3. Update JSON
            const jsonPath = path.join(ASSETS_DIR, `${id}.json`);
            const metadata = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

            metadata.image = heroUri;
            metadata.properties.files[0].uri = heroUri;
            metadata.properties.files[1].uri = sheetUri;
            metadata.properties.assets = {
                spritesheet_uri: sheetUri
            };

            // 4. Upload JSON
            const [jsonUri] = await umi.uploader.uploadJson(metadata);

            // 5. Save to Manifest
            manifest[id] = {
                heroUri,
                sheetUri,
                jsonUri,
                name: metadata.name
            };

            // Periodic save
            if (i % 10 === 0) {
                fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
            }

            console.log(`✅ Success for #${id}: ${jsonUri}`);

        } catch (err) {
            console.error(`❌ Failed for #${id}:`, err.message);
            // Wait and retry logic could follow here
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`🏁 FINISHED! Manifest saved to ${MANIFEST_PATH}`);
}

run().catch(console.error);
