export const BACKGROUND_IDS = [
    'DEFAULT',
    'SPACE', 'FOREST', 'BEDROOM', 'BACKYARD',
    'ARENA', 'DUEL_ARENA', 'RETRO',
    'MINECRAFT_WORLD', 'CYBER_CITY', 'DESERT_DUNES',
    'UNDERWATER', 'CANDY_LAND', 'VOLCANO', 'SNOW_PEAK',
    'RAINY_WINDOW', 'SUNSET_BLVD', 'TOXIC_WASTE',
    'BLUE_SCREEN', 'PAPER_NOTEBOOK', 'CIRCUIT_BOARD',
    'STARRY_NIGHT', 'HOSPITAL_CLEAN'
];

export const BACKGROUND_URIS: Record<string, string> = {
    "DEFAULT": "https://gateway.irys.xyz/Fuv85JFt9aoH2yRR5Bp91fWWU6mW5Yh4FhB1EDqDrrVg",
    "FOREST": "https://gateway.irys.xyz/HxwF25NwN7fSVKam1SbD6PopY6Q9671mZutfnW2Yh31H",
    "BEDROOM": "https://gateway.irys.xyz/9VvGUT8uJmRzENyuKbwn2af8eQTq8q7BP9PsfGBVzHd7",
    "RETRO": "https://gateway.irys.xyz/A76GtyGygSdhtwLvGC3suX9CM6rzYj512VRu64wwqags",
    "MINECRAFT_WORLD": "https://gateway.irys.xyz/HijnbPs2BkD1ggAQVuh9wiJKbsifJvLPKngmB4AYFy3m",
    "CYBER_CITY": "https://gateway.irys.xyz/HoBUiTkRGKZGSzmGnKi5s4wyDn8inM1xE6jVWjqM6Tmq",
    "DESERT_DUNES": "https://gateway.irys.xyz/EUrtdo46iQcWgx5igGPZcYVWxGRqSPF1gxY6B4xW7s1Y",
    "UNDERWATER": "https://gateway.irys.xyz/PLACEHOLDER_BG_UNDERWATER",
    "CANDY_LAND": "https://gateway.irys.xyz/PLACEHOLDER_BG_CANDY",
    "VOLCANO": "https://gateway.irys.xyz/PLACEHOLDER_BG_VOLCANO",
    "SNOW_PEAK": "https://gateway.irys.xyz/PLACEHOLDER_BG_SNOW",
    "RAINY_WINDOW": "https://gateway.irys.xyz/PLACEHOLDER_BG_RAINY",
    "SUNSET_BLVD": "https://gateway.irys.xyz/PLACEHOLDER_BG_SUNSET",
    "TOXIC_WASTE": "https://gateway.irys.xyz/PLACEHOLDER_BG_TOXIC",
    "BLUE_SCREEN": "https://gateway.irys.xyz/PLACEHOLDER_BG_BLUE",
};

export const isDarkBackground = (id: string | number) => {
    const darks = [
        'SPACE', 'CYBER_CITY', 'VOLCANO', 'RAINY_WINDOW',
        'SUNSET_BLVD', 'TOXIC_WASTE', 'BLUE_SCREEN',
        'STARRY_NIGHT', 'CIRCUIT_BOARD'
    ];
    return darks.includes(String(id));
};