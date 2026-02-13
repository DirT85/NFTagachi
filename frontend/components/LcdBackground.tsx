import React from 'react';

interface LcdBackgroundProps {
    id: string | number;
    active?: boolean;
}

export const LcdBackground = ({ id, active }: LcdBackgroundProps) => {
    // Helper for pixel patterns
    const getBackgroundStyle = () => {
        // Default / LCD Green
        if (!id || id === 0) return {
            background: `
                linear-gradient(to bottom, #9bbc0f 0%, #9bbc0f 65%, #8bac0f 65%, #8bac0f 100%)
            `
        };

        const bgName = typeof id === 'string' ? id : 'DEFAULT';

        // SPACE
        if (bgName === 'SPACE') return {
            background: 'radial-gradient(circle at 50% 30%, #2a2a4e 0%, #000 100%)',
            boxShadow: 'inset 0 0 20px black'
        };

        // NOSTALGIC FOREST (Hard line, simple grass)
        if (bgName === 'FOREST') return {
            background: `
                linear-gradient(to bottom, #87CEEB 0%, #87CEEB 60%, #228B22 60%, #228B22 100%)
            `,
            backgroundSize: '100% 100%'
        };

        // BEDROOM (Wall/Floor + Window)
        if (bgName === 'BEDROOM') return {
            background: `
                linear-gradient(to bottom, #F0E68C 0%, #F0E68C 70%, #8B4513 70%, #8B4513 100%)
            `
        };

        // BACKYARD (Sky/Fence/Grass)
        if (bgName === 'BACKYARD') return {
            background: `
                linear-gradient(to bottom, #87CEEB 0%, #87CEEB 55%, #8B4513 55%, #8B4513 60%, #32CD32 60%, #32CD32 100%)
            `
        };

        // ARENA (Battle-themed Home Screen)
        if (bgName === 'ARENA') return {
            background: `
                linear-gradient(to bottom, 
                    #9bbc0f 0%, 
                    #9bbc0f 65%, 
                    #8bac0f 65%, 
                    #8bac0f 100%
                ),
                repeating-linear-gradient(90deg, 
                    rgba(0,0,0,0.02) 0, 
                    rgba(0,0,0,0.02) 1px, 
                    transparent 1px, 
                    transparent 30px
                )
            `,
            backgroundColor: '#9bbc0f'
        };

        // DUEL_ARENA (Specific shared background for combat)
        if (bgName === 'DUEL_ARENA') return {
            background: `
                radial-gradient(ellipse at 50% 65%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 40%, transparent 40.5%),
                linear-gradient(to bottom, #9bbc0f 0%, #9bbc0f 65%, #8bac0f 65%, #8bac0f 100%)
            `,
            backgroundSize: '100% 100%'
        };

        // Fallback or RETRO
        if (bgName === 'RETRO') return {
            background: `repeating-linear-gradient(0deg, transparent, transparent 19px, #000 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px)`,
            backgroundColor: '#9ea792',
            opacity: 0.5
        };

        if (bgName === 'MINECRAFT_WORLD') return {
            background: `
                linear-gradient(to bottom, #87CEEB 0%, #87CEEB 60%, #5f9e35 60%, #5f9e35 100%)
            `,
            backgroundSize: '100% 100%'
        };

        if (bgName === 'CYBER_CITY') return {
            background: `
                linear-gradient(to bottom, #000033 0%, #2a0033 70%, #ff00ff 70%, #000 100%)
            `,
            boxShadow: 'inset 0 0 50px #ff00ff'
        };

        if (bgName === 'DESERT_DUNES') return {
            background: `linear-gradient(to bottom, #87CEEB 0%, #f4a460 50%, #d2691e 50%, #8b4513 100%)`
        };

        if (bgName === 'UNDERWATER') return {
            background: `linear-gradient(to bottom, #00ffff 0%, #00008b 100%)`
        };

        if (bgName === 'CANDY_LAND') return {
            background: `linear-gradient(to bottom, #ffc0cb 0%, #ff69b4 50%, #98fb98 50%, #00ff7f 100%)`
        };

        if (bgName === 'VOLCANO') return {
            background: `linear-gradient(to bottom, #2f2f2f 0%, #000000 60%, #ff4500 60%, #8b0000 100%)`
        };

        if (bgName === 'SNOW_PEAK') return {
            background: `linear-gradient(to bottom, #87CEEB 0%, #e0ffff 30%, #fffafa 30%, #fff 100%)`
        };

        if (bgName === 'RAINY_WINDOW') return {
            background: `linear-gradient(to bottom, #708090 0%, #2f4f4f 100%)`
        };

        if (bgName === 'SUNSET_BLVD') return {
            background: `linear-gradient(to bottom, #ff4500 0%, #800080 100%)`
        };

        if (bgName === 'TOXIC_WASTE') return {
            background: `linear-gradient(to bottom, #2e8b57 0%, #000 80%, #32cd32 80%, #adff2f 100%)`
        };

        if (bgName === 'BLUE_SCREEN') return {
            background: '#0000AA',
            color: 'white'
        };

        if (bgName === 'PAPER_NOTEBOOK') return {
            background: `repeating-linear-gradient(180deg, #fff, #fff 19px, #afeeee 20px)`
        };

        if (bgName === 'CIRCUIT_BOARD') return {
            background: '#006400'
        };

        if (bgName === 'STARRY_NIGHT') return {
            background: 'radial-gradient(circle, #ffeb3b 2px, transparent 2.5px), radial-gradient(circle, #fff 1px, transparent 1.5px), #191970',
            backgroundSize: '50px 50px, 30px 30px'
        };

        if (bgName === 'HOSPITAL_CLEAN') return {
            background: `linear-gradient(to bottom, #fff 0%, #e0ffff 100%)`
        };

        return { background: '#9bbc0f' };
    };

    // Overlay patterns (Trees, Furniture) via CSS pseudo-elements simulation (simplified for React)
    const renderDecor = () => {
        const bgName = typeof id === 'string' ? id : 'DEFAULT';

        if (bgName === 'FOREST') return (
            <>
                {/* Trees */}
                <div className="absolute top-[45%] left-[10%] text-2xl opacity-80 pointer-events-none select-none">🌲</div>
                <div className="absolute top-[50%] right-[15%] text-2xl opacity-80 pointer-events-none select-none">🌲</div>
                <div className="absolute top-[55%] left-[30%] text-xl opacity-60 pointer-events-none select-none">🌲</div>
            </>
        );

        if (bgName === 'BEDROOM') return (
            <>
                {/* Window */}
                <div className="absolute top-[20%] left-[20%] w-16 h-16 bg-blue-300 border-4 border-white opacity-80 grid grid-cols-2 grid-rows-2 gap-[2px] pointer-events-none">
                    <div className="bg-white/20"></div><div className="bg-white/20"></div>
                    <div className="bg-white/20"></div><div className="bg-white/20"></div>
                </div>
                {/* Rug */}
                <div className="absolute bottom-[5%] right-[20%] w-20 h-10 bg-red-400 rounded-full opacity-70 transform skew-x-12 border-2 border-red-600 pointer-events-none"></div>
            </>
        );

        if (bgName === 'BACKYARD') return (
            <>
                {/* Fence simulated by border in bg, adding Clouds */}
                <div className="absolute top-[10%] left-[10%] text-2xl opacity-80 animate-pulse pointer-events-none select-none">☁️</div>
                <div className="absolute top-[20%] right-[20%] text-2xl opacity-80 animate-pulse delay-700 pointer-events-none select-none">☁️</div>
                {/* Playset hint */}
                <div className="absolute bottom-[20%] right-[5%] text-4xl pointer-events-none select-none">🎪</div>
            </>
        );

        if (bgName === 'DUEL_ARENA') return (
            <>
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-80 mix-blend-multiply"
                    style={{ backgroundImage: 'url(/duel_arena.png)' }}
                />
            </>
        );



        return null;
    };

    return (
        <div
            className={`absolute inset-0 z-0 overflow-hidden ${active ? 'animate-pulse' : ''}`}
            style={{
                ...getBackgroundStyle(),
                imageRendering: 'pixelated'
            }}
        >
            <div className="w-full h-full opacity-50 contrast-125 saturate-50 mix-blend-multiply pointer-events-none">
                {/* Scanlines - Reduced density (size increased to 6px) */}
                <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_6px]"></div>
            </div>
            {renderDecor()}
        </div>
    );
};
