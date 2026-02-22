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
    "DEFAULT": "https://gateway.irys.xyz/CxsikGzgL6kVRAzD1v9o22X1by2gaKEyFzKeGt3SVn7d",
    "SPACE": "https://gateway.irys.xyz/HL4G9n1TmkmYjce1buSHTJzbG4bPJg4vgw2T1fUtokv7",
    "FOREST": "https://gateway.irys.xyz/965yX48iMmtZzwT5hUMMb72A6df9UhEkRGHH5W7L1CPS",
    "BEDROOM": "https://gateway.irys.xyz/3uMxwX9c7n9VmmN6dtZQvSvyhFyJim1vXtT9hZ8tabUT",
    "BACKYARD": "https://gateway.irys.xyz/CRCkHBDtkecAqQ7C1SoSuNqtdPpbF6s5r6FHPkXdn3dT",
    "ARENA": "https://gateway.irys.xyz/9CNUuGzqRSMm8uoat7HRdPCfkSiKqYXkpcQ5zvoLQin7",
    "DUEL_ARENA": "https://gateway.irys.xyz/AsPGjJhRw8QzbtHemxFogmDUctXJgGrjxUcxAAJJ7zEE",
    "RETRO": "https://gateway.irys.xyz/8ivSaEUTUgWKjj2VV52XTYaua9yrjCvU2Awz3iw86SEs",
    "MINECRAFT_WORLD": "https://gateway.irys.xyz/AsGRWwUqeCvdBLkGqtmMhdDrMdQcJaVLdtJk5svwbqXX",
    "CYBER_CITY": "https://gateway.irys.xyz/FgvRZkJSmzzuzHZ7GhUFDjVTV2vxP9eJKGQiYMGK73qo",
    "DESERT_DUNES": "https://gateway.irys.xyz/Aj1L3CjKV1VTZabcJQVW73wN2MbCK5diRWbgr6GqANkB",
    "UNDERWATER": "https://gateway.irys.xyz/4dZpxUTMA9TfEjAak1jSJLUCT6sKwaHGLeSUHni2rhhP",
    "CANDY_LAND": "https://gateway.irys.xyz/BymEJFr8dxTKSVE43G5M4R6ETuHJZ6gdjcQQmY3s4q1P",
    "VOLCANO": "https://gateway.irys.xyz/9EXBFSUKvdYihzTm3XWbyL8RpDqYCWcYLDSzd4J5eBmp",
    "SNOW_PEAK": "https://gateway.irys.xyz/3JtbtwgE9fGXqsh2j54riNLofj4U4pHxFyUoThpPNfG6",
    "RAINY_WINDOW": "https://gateway.irys.xyz/GaeXUkpRuADdnrVa4QHqCpgprwHbYKAYf4F43p8F46BQ",
    "SUNSET_BLVD": "https://gateway.irys.xyz/D1wo2einMh1oeb4GqMoqEkdAWDNQB8csmtXXgYaQzfBV",
    "TOXIC_WASTE": "https://gateway.irys.xyz/EtRV3tA9sTLGqmJqVpL3ygghRSoMYyftb12RuCww6F6w",
    "BLUE_SCREEN": "https://gateway.irys.xyz/45tT3DdYs5xGruy4iKEuXRSV2qqNLdhhJZScJzKsWotp",
    "PAPER_NOTEBOOK": "https://gateway.irys.xyz/BJAWb1kVHnMULEpnnJDWvjAWqoNpjqK8mQCErD2uyssf",
    "CIRCUIT_BOARD": "https://gateway.irys.xyz/EfEE75sL6uKmxjzrPjuNizP2G2Lr6y6GjX6qBPj4hkrA",
    "STARRY_NIGHT": "https://gateway.irys.xyz/E3GJM2srWfz2Bm2ec2FodeoRx5oS7EBLzphKdqtbQzij",
    "HOSPITAL_CLEAN": "https://gateway.irys.xyz/4YLWYwi73fcXCAi6eYw8tLx6Zz6AHyNX2rEXDk8SToGz"
};

export const isDarkBackground = (id: string | number) => {
    const darks = [
        'SPACE', 'CYBER_CITY', 'VOLCANO', 'RAINY_WINDOW',
        'SUNSET_BLVD', 'TOXIC_WASTE', 'BLUE_SCREEN',
        'STARRY_NIGHT', 'CIRCUIT_BOARD'
    ];
    return darks.includes(String(id));
};