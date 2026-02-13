const fs = require('fs');
const path = require('path');

const SPECIES = [
    { name: 'Cosmic Dragon', tier: 'MYTHIC', type: 'MAGIC', baseIndex: 1 },
    { name: 'Void Walker', tier: 'MYTHIC', type: 'MAGIC', baseIndex: 0 },
    { name: 'Chaos Engine', tier: 'MYTHIC', type: 'FIRE', baseIndex: 1 },
    { name: 'Phoenix', tier: 'RARE', type: 'FIRE', baseIndex: 1 },
    { name: 'Obsidian Golem', tier: 'RARE', type: 'EARTH', baseIndex: 2 },
    { name: 'Spectral Hydra', tier: 'RARE', type: 'WATER', baseIndex: 0 },
    { name: 'Lich King', tier: 'RARE', type: 'MAGIC', baseIndex: 0 },
    { name: 'Abyssal Kraken', tier: 'RARE', type: 'WATER', baseIndex: 0 },
    { name: 'Copper Cupid', tier: 'COMMON', type: 'MAGIC', baseIndex: 1 },
    { name: 'Bully Alien', tier: 'COMMON', type: 'EARTH', baseIndex: 2 },
    { name: 'Mino Dragon X', tier: 'COMMON', type: 'FIRE', baseIndex: 1 },
];

const VARIANTS = ['NORMAL', 'SHADOW', 'SPECTRAL', 'GOLD', 'UNDEAD', 'MAGMA', 'TOXIC'];
const OUTPUT_DIR = path.join(__dirname, '../assets/nft-launch');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function generateMetadata(id) {
    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const variant = Math.random() > 0.8 ? VARIANTS[Math.floor(Math.random() * VARIANTS.length)] : 'NORMAL';

    // Balanced Stats Logic
    let budget = 150;
    let stats = { hp: 50, atk: 5, def: 5, spd: 5 };

    const hpGain = Math.floor(Math.random() * budget * 0.4); budget -= hpGain;
    const atkGain = Math.floor(Math.random() * budget * 0.5); budget -= atkGain;
    const defGain = Math.floor(Math.random() * budget * 0.6); budget -= defGain;
    const spdGain = budget;

    stats.maxHp = 100 + hpGain;
    stats.atk += atkGain;
    stats.def += defGain;
    stats.spd += spdGain;

    const metadata = {
        name: `${species.name} #${id}`,
        symbol: "NFTG",
        description: `A unique ${species.tier} ${species.name} from the NFTagachi ecosystem.`,
        seller_fee_basis_points: 500,
        image: `${id}.png`,
        attributes: [
            { trait_type: "Species", value: species.name },
            { trait_type: "Tier", value: species.tier },
            { trait_type: "Type", value: species.type },
            { trait_type: "Variant", value: variant },
            { trait_type: "HP", value: stats.maxHp },
            { trait_type: "ATK", value: stats.atk },
            { trait_type: "DEF", value: stats.def },
            { trait_type: "SPD", value: stats.spd },
            { trait_type: "Weight", value: 15 + Math.floor(Math.random() * 10) },
        ],
        properties: {
            files: [{ uri: `${id}.png`, type: "image/png" }],
            category: "image",
            creators: [{ address: "YOUR_SOLANA_WALLET_HERE", share: 100 }]
        }
    };

    fs.writeFileSync(path.join(OUTPUT_DIR, `${id}.json`), JSON.stringify(metadata, null, 2));
}

console.log(`Generating 1000 metadata files in ${OUTPUT_DIR}...`);
for (let i = 0; i < 1000; i++) {
    generateMetadata(i);
}
console.log("Done!");
