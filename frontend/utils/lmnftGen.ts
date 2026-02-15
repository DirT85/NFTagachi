import { MONSTER_IDS, MONSTER_URIS } from './MonsterMetadata';
import { BACKGROUND_IDS, BACKGROUND_URIS } from './BackgroundMetadata';
import { DEVICE_URIS } from './DeviceMetadata';

export interface LMNFTPackage {
    seed: number;
    name: string;
    description: string;
    image: string; // Preview or URI
    attributes: { trait_type: string, value: string | number }[];
    stats: {
        hp: number;
        attack: number;
        defense: number;
        speed: number;
        level: number;
        xp: number;
    };
    assets: {
        character: string;
        device: string;
        background: string;
        feeding_art?: string;
        training_art?: string;
        weapon?: string;
    };

}

export function generateLMNFTPackage(seed: number): LMNFTPackage {
    const sRandom = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    // 1. Determine Rarity & Type
    const rarityRoll = sRandom(1);
    let rarity = "Common";
    let budget = 100;

    if (rarityRoll > 0.95) {
        rarity = "Mythic";
        budget = 250;
    } else if (rarityRoll > 0.85) {
        rarity = "Legendary";
        budget = 200;
    } else if (rarityRoll > 0.70) {
        rarity = "Rare";
        budget = 150;
    }

    // 2. Select Character
    const humanoids = ['Human Male', 'Human Female', 'Orc', 'Skeleton', 'Lizardman'];
    const characterName = humanoids[Math.floor(sRandom(4) * humanoids.length)];

    // 3. Select Device Skin & Background
    const deviceNames = Object.keys(DEVICE_URIS);
    const device = deviceNames[Math.floor(sRandom(5) * deviceNames.length)];

    // Filter backgrounds that have URIs
    const validBgs = Object.keys(BACKGROUND_URIS);
    const background = validBgs[Math.floor(sRandom(6) * validBgs.length)];

    // 3.5 Select Weapon
    const weapons = ['none', 'longsword', 'spear', 'mace', 'waraxe', 'bow'];
    const weapon = weapons[Math.floor(sRandom(6.5) * weapons.length)];

    // 4. Balanced Stats
    // Allocate budget across 4 stats
    const stats: any = { level: 1, xp: 0 };
    let remaining = budget;

    // HP (min 20)
    stats.hp = 20 + Math.floor(sRandom(7) * (remaining / 2));
    remaining -= (stats.hp - 20);

    // Attack
    stats.attack = 5 + Math.floor(sRandom(8) * (remaining / 2));
    remaining -= (stats.attack - 5);

    // Defense
    stats.defense = 5 + Math.floor(sRandom(9) * (remaining / 2));
    remaining -= (stats.defense - 5);

    // Speed (remaining)
    stats.speed = 5 + Math.max(0, remaining);

    // 5. Construct Metadata
    const attributes = [
        { trait_type: "Rarity", value: rarity },
        { trait_type: "Type", value: "Humanoid" },
        { trait_type: "Character", value: characterName },
        { trait_type: "Device", value: device },
        { trait_type: "Weapon", value: weapon === 'none' ? 'Bare Fists' : weapon.charAt(0).toUpperCase() + weapon.slice(1) },
        { trait_type: "Background", value: background },
        { trait_type: "HP", value: stats.hp },
        { trait_type: "Attack", value: stats.attack },
        { trait_type: "Defense", value: stats.defense },
        { trait_type: "Speed", value: stats.speed },
        { trait_type: "Level", value: 1 }
    ];

    return {
        seed,
        name: `NFTagachi #${seed.toString().slice(-4)}`,
        description: `A unique ${rarity} ${characterName} born on the Solana blockchain.`,
        image: "", // To be filled by API with a preview data URI
        attributes,
        stats,
        assets: {
            character: characterName,
            device: device,
            background: background,
            weapon: weapon
        }
    };
}
