"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DeviceAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  cost?: string;
  highlight?: boolean;
}

interface DeviceProps {
  children: ReactNode;
  color?: string;
  skin?: string;
  actions?: {
    A?: DeviceAction;
    B?: DeviceAction;
    C?: DeviceAction;
  };
  hideLogo?: boolean;
  hideButtons?: boolean;
  isWhale?: boolean;
  isLobbyActive?: boolean;
}

export const Device = ({
  children,
  color = "bg-purple-500",
  skin = 'CLASSIC',
  actions,
  hideLogo,
  hideButtons,
  isWhale,
  isLobbyActive
}: DeviceProps) => {
  const getSkinData = () => {
    // 1. PREMIUM / CYBER (Glowing, High-Tech)
    if (skin === 'PREMIUM' || skin === 'CYBER') return {
      bg: 'bg-gradient-to-br from-gray-900 via-black to-gray-800',
      border: 'border-2 border-gray-700 ring-4 ring-black shadow-[0_0_20px_rgba(34,211,238,0.2)]',
      shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)]',
      overlay: <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.05)_50%,transparent_75%)] bg-[length:10px_10px]"></div>,
      screenBorder: 'border-gray-800 shadow-[inset_0_0_20px_rgba(0,0,0,1)] ring-1 ring-cyan-500/30',
      text: 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] font-mono',
      sheen: 'bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent'
    };

    // 2. MATTE SERIES (Soft, Rubberized look)
    if (skin?.startsWith('MATTE_')) {
      const color = {
        'MATTE_BLACK': 'bg-[#202020]',
        'MATTE_WHITE': 'bg-[#f0f0f0]',
        'MATTE_MINT': 'bg-[#a3e635]', // Adjusted for better matte look
        'MATTE_PINK': 'bg-[#fb7185]'
      }[skin] || 'bg-gray-200';

      return {
        bg: color,
        border: 'border border-black/10',
        shadow: 'shadow-[0_15px_30px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-4px_6px_rgba(0,0,0,0.1)]', // Soft bevel
        overlay: null,
        screenBorder: 'border-black/5 shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)]',
        text: 'text-black/40 font-bold tracking-widest',
        sheen: 'bg-gradient-to-b from-white/5 to-transparent' // Very subtle sheen
      };
    }

    // 3. METAL SERIES (Brushed, Sharp reflections)
    if (skin?.startsWith('METAL_')) {
      const gradient = {
        'METAL_SILVER': 'bg-gradient-to-br from-[#e0e0e0] via-[#c0c0c0] to-[#a0a0a0]',
        'METAL_GOLD': 'bg-gradient-to-br from-[#fcd34d] via-[#fbbf24] to-[#b45309]',
        'METAL_BLUE': 'bg-gradient-to-br from-[#93c5fd] via-[#60a5fa] to-[#2563eb]'
      }[skin] || 'bg-gray-300';

      return {
        bg: gradient,
        border: 'border border-white/40 ring-1 ring-black/20',
        shadow: 'shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.2)]',
        overlay: <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-40 mix-blend-multiply brightness-125"></div>,
        screenBorder: 'border-gray-400 shadow-[inset_0_2px_5px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.5)]', // Deep inset + highlight
        text: 'text-black/50 font-bold drop-shadow-sm',
        sheen: 'bg-gradient-to-tr from-transparent via-white/40 to-transparent' // Sharp metallic highlight
      };
    }

    // 4. CLEAR / ATOMIC / TRANSLUCENT SERIES (Gameboy Color Style + GLOW)
    if (skin?.startsWith('CLEAR_') || ['GLACIER_ICE', 'SMOKE_BLACK', 'JUNGLE_GREEN', 'ATOMIC_PURPLE'].includes(skin || '')) {
      const tints: Record<string, any> = {
        'CLEAR_WHITE': { bg: 'bg-white/40', border: 'border-white/50', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.4)]' },
        'CLEAR_GREEN': { bg: 'bg-emerald-400/40', border: 'border-emerald-400/50', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.6)]' },
        'CLEAR_PINK': { bg: 'bg-pink-400/40', border: 'border-pink-400/50', glow: 'shadow-[0_0_20px_rgba(244,114,182,0.6)]' },
        'CLEAR_PURPLE': { bg: 'bg-purple-500/40', border: 'border-purple-500/50', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]' },

        // Rares
        'GLACIER_ICE': { bg: 'bg-cyan-300/50', border: 'border-cyan-200/60', glow: 'shadow-[0_0_30px_rgba(103,232,249,0.8),inset_0_0_20px_rgba(255,255,255,0.5)]' },
        'SMOKE_BLACK': { bg: 'bg-gray-900/60', border: 'border-gray-700/60', glow: 'shadow-[0_0_20px_rgba(0,0,0,0.8)]' },
        'JUNGLE_GREEN': { bg: 'bg-lime-500/50', border: 'border-lime-400/60', glow: 'shadow-[0_0_25px_rgba(132,204,22,0.8)]' },
        'ATOMIC_PURPLE': { bg: 'bg-violet-600/50', border: 'border-violet-400/60', glow: 'shadow-[0_0_30px_rgba(139,92,246,0.9)]' }
      };
      const t = tints[skin || ''] || tints['CLEAR_WHITE'];

      return {
        bg: `backdrop-blur-md ${t.bg}`,
        border: `border-2 ${t.border} ring-1 ring-white/20`,
        shadow: `${t.glow} drop-shadow-xl`,
        overlay: (
          <>
            {/* Circuit Board Pattern for "See-through" effect */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30 mix-blend-overlay"></div>
            {/* Internal edging highlight */}
            <div className="absolute inset-2 border border-white/20 rounded-lg pointer-events-none"></div>
          </>
        ),
        screenBorder: 'border-black/20 shadow-[inset_0_2px_5px_rgba(0,0,0,0.2)] bg-black/10 backdrop-blur-sm',
        text: 'text-white font-mono tracking-widest drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]',
        sheen: 'bg-gradient-to-tr from-transparent via-white/20 to-transparent'
      };
    }

    // 5. TEXTURED SERIES (Wood, Carbon, etc.)
    if (skin === 'WOOD_GRAIN') return {
      bg: 'bg-[#5D4037]',
      border: 'border-[#3E2723] ring-2 ring-[#281815]',
      shadow: 'shadow-[0_15px_30px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.1)]',
      overlay: (
        <div className="absolute inset-0" style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')`,
          backgroundBlendMode: 'multiply',
          opacity: 0.8
        }}></div>
      ),
      screenBorder: 'border-[#3E2723] border-8 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]', // Deep carved look
      text: 'text-[#D7CCC8] font-serif font-bold text-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
      sheen: 'bg-gradient-to-b from-white/5 to-transparent' // Matte varnish
    };

    // Carbon Fiber kept as is...
    if (skin === 'CARBON_FIBER') return {
      bg: 'bg-[#1a1a1a]',
      border: 'border-gray-800 ring-1 ring-black',
      shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]',
      overlay: <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 contrast-150"></div>,
      screenBorder: 'border-black shadow-[inset_0_0_10px_black]',
      text: 'text-gray-400 font-mono tracking-widest',
      sheen: 'bg-gradient-to-tr from-transparent via-white/10 to-transparent'
    };

    // 6. MINECRAFT (Official Grass Block Look)
    if (skin === 'MINECRAFT_GRASS') return {
      bg: 'bg-[#795548]', // Base Dirt Brown
      border: 'border-[#3E2723] ring-4 ring-black',
      shadow: 'shadow-[8px_8px_0_rgba(0,0,0,0.5)]', // Hard pixel shadow
      overlay: (
        <>
          {/* Dirt Texture Base */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dirt-texture.png')] opacity-100 mix-blend-multiply brightness-75"></div>

          {/* Grass Top Layer (Green) */}
          <div className="absolute top-0 inset-x-0 h-[40%] bg-[#5ba814] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-normal z-0"></div>

          {/* Pixelated Grass Edge Drips (CSS Gradient trick) */}
          <div className="absolute top-[40%] inset-x-0 h-4 z-0" style={{
            backgroundImage: `linear-gradient(90deg, 
                   #5ba814 0%, #5ba814 25%, transparent 25%, transparent 50%, 
                   #5ba814 50%, #5ba814 75%, transparent 75%, transparent 100%)`,
            backgroundSize: '16px 100%',
            imageRendering: 'pixelated'
          }}></div>

          {/* Random variation layer for top */}
          <div className="absolute top-[40%] inset-x-0 h-2 bg-[#5ba814] opacity-50"></div>
        </>
      ),
      screenBorder: 'border-[#2d2d2d] bg-[#1a1a1a] p-1 shadow-inner',
      text: 'font-mono text-white drop-shadow-[2px_2px_0_black]',
      sheen: '' // No sheen, purely matte/pixel
    };

    // 7. PLASTIC / TOY SERIES (Vibrant, Glossy)
    if (['FIRE_RED', 'ELECTRIC_BLUE', 'PIKACHU_YELLOW', 'HOT_PINK', 'OFF_WHITE'].includes(skin || '')) {
      const colors: Record<string, any> = {
        'FIRE_RED': { bg: 'bg-red-600', border: 'border-red-700', text: 'text-red-100' },
        'ELECTRIC_BLUE': { bg: 'bg-blue-600', border: 'border-blue-700', text: 'text-blue-100' },
        'PIKACHU_YELLOW': { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-900' },
        'HOT_PINK': { bg: 'bg-pink-500', border: 'border-pink-600', text: 'text-pink-100' },
        'OFF_WHITE': { bg: 'bg-[#f0f0e0]', border: 'border-[#d4d4c8]', text: 'text-gray-500' }
      };
      const c = colors[skin || 'FIRE_RED'];

      return {
        bg: c.bg,
        border: `${c.border}`,
        // CHUNKY BEVEL + GLOSS
        shadow: `
            shadow-[0_15px_30px_rgba(0,0,0,0.2),inset_0_2px_3px_rgba(255,255,255,0.4),inset_0_-5px_10px_rgba(0,0,0,0.2)]
            border-b-[6px] border-r-[6px] ${c.border}
        `,
        overlay: null,
        screenBorder: 'border-black/10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)] rounded-sm', // Softer screen border
        text: `${c.text} font-bold tracking-tight text-shadow-sm`,
        sheen: 'bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-lg' // High gloss
      };
    }

    // 8. SPECIAL EDITIONS (Galaxy, Gold, Warning)
    if (skin === 'GALAXY_SWIRL') return {
      bg: 'bg-gradient-to-br from-[#1a0b2e] via-[#431c5d] to-[#1a0b2e]',
      border: 'border-purple-900 ring-2 ring-purple-500/50',
      shadow: 'shadow-[0_0_30px_rgba(107,33,168,0.5)]',
      overlay: (
        <>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60 mix-blend-screen animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-pink-500/20 mix-blend-overlay"></div>
        </>
      ),
      screenBorder: 'border-purple-800 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]',
      text: 'text-purple-200 font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]',
      sheen: 'bg-gradient-to-t from-transparent via-white/10 to-transparent'
    };

    if (skin === 'GOLD_PLATED') return {
      bg: 'bg-gradient-to-br from-[#FDD835] via-[#FBC02D] to-[#F57F17]', // Richer Gold
      border: 'border-[#F9A825] ring-1 ring-yellow-200',
      shadow: 'shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.8)]',
      overlay: <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 mix-blend-overlay"></div>,
      screenBorder: 'border-[#FBC02D] shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]',
      text: 'text-yellow-900 font-serif font-bold tracking-widest',
      sheen: 'bg-gradient-to-tr from-transparent via-white/60 to-transparent' // High Gloss Shine
    };

    if (skin === 'WARNING_STRIPE') return {
      bg: 'bg-yellow-400',
      border: 'border-black ring-4 ring-yellow-400',
      shadow: 'shadow-[0_10px_0_rgba(0,0,0,1)]',
      overlay: (
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #fbbf24 10px, #fbbf24 20px)',
          opacity: 0.8
        }}></div>
      ),
      screenBorder: 'border-black bg-black p-1 shadow-none',
      text: 'text-black bg-yellow-400 px-1 font-black uppercase tracking-tighter border border-black',
      sheen: '' // Matte
    };

    // Default
    return {
      bg: 'bg-gray-200',
      border: 'border-gray-300',
      shadow: 'shadow-xl border-b-4 border-gray-400',
      overlay: null,
      screenBorder: 'border-gray-500 shadow-inner',
      text: 'text-gray-500 font-bold',
      sheen: 'bg-gradient-to-tr from-white/20 to-transparent'
    };
  };

  const skinData = getSkinData();

  return (
    <div className="relative group">
      {/* Whale Crown */}
      {isWhale && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl animate-bounce drop-shadow-[0_0_10px_gold] z-50 pointer-events-none">
          👑
        </div>
      )}

      <div className={`
        relative w-96 h-64 rounded-xl
        ${skinData.bg} ${skinData.border} ${skinData.shadow}
        p-4 flex flex-row items-center justify-between px-8
        overflow-hidden transition-all duration-500 z-0
      `}>
        {skinData.overlay}

        {/* Realistic Sheen / Reflection */}
        {skinData.sheen && (
          <div className={`absolute inset-0 rounded-inherit z-20 pointer-events-none ${skinData.sheen} opacity-60`} />
        )}

        {/* Dynamic Casing Color Overlay (for tinted skins) */}
        {!skin?.startsWith('CLEAR') && skin !== 'STARDUST' && skin !== 'PREMIUM' && skin !== 'CYBER' && !skin?.startsWith('MINECRAFT') && (
          <div className={`absolute inset-0 opacity-10 ${color} transition-colors duration-500 z-0 mix-blend-overlay`} />
        )}

        {/* Screen Area with Bevels */}
        <div className={`
          z-10 bg-[#9ea792] border-8 ${skinData.screenBorder}
          w-64 h-48 rounded-sm order-2 relative overflow-hidden pixelated
          shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] 
        `}>
          <div className="absolute inset-0 pointer-events-none bg-[url('https://transparenttextures.com/patterns/pixel-weave.png')] opacity-10 mix-blend-multiply"></div>
          {children}
        </div>

        {/* Controls */}
        {!hideButtons && (
          <div className={`z-10 flex flex-col gap-2 order-3`}>
            <DeviceButton label="A" skin={skin} action={actions?.A} />
            <DeviceButton label="B" skin={skin} action={actions?.B} />
            <DeviceButton label="C" skin={skin} action={actions?.C} />
          </div>
        )}

        {/* Digi Antenna */}
        <div className={`
          absolute -top-7 right-8 w-2.5 h-12 rounded-t-lg z-0 border-x border-t border-black/20 overflow-hidden
          ${skin === 'PREMIUM' || skin === 'CYBER' ? 'bg-gray-800' :
            skin?.startsWith('METAL') ? 'bg-gray-400' :
              skin?.startsWith('CLEAR') ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-500'}
        `}>
          {/* Internal Antenna Detail */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[1px] h-full bg-black/10" />

          {/* Glass Lens LED (No more 'burn spot') */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] flex items-center justify-center p-[2px] border border-black/10 backdrop-blur-[1px]">
            {/* The actual emissive light source */}
            <div className={`
              w-full h-full rounded-full transition-all duration-700
              ${isLobbyActive ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)] animate-pulse' : 'bg-transparent'}
            `} />
          </div>

          {/* Diffusion Halo (Light bleeding through the antenna plastic) */}
          {isLobbyActive && (
            <div className={`
              absolute inset-0 bg-green-400/20 blur-sm pointer-events-none transition-opacity duration-1000
            `} />
          )}
        </div>
      </div>
    </div>
  );
};

const DeviceButton = ({ label, skin, action }: { label: string, skin?: string, action?: DeviceAction }) => {
  // Button Styles
  let btnStyle = 'bg-gray-200 shadow-[0_4px_0_rgb(156,163,175)] text-gray-500 border-gray-300'; // Default

  // Clear / Atomic
  if (skin?.startsWith('CLEAR') || ['GLACIER_ICE', 'SMOKE_BLACK', 'JUNGLE_GREEN', 'ATOMIC_PURPLE'].includes(skin || '')) {
    const btnColor = {
      'CLEAR_WHITE': 'bg-white/20 border-white/40 text-white hover:bg-white/30',
      'CLEAR_GREEN': 'bg-emerald-400/20 border-emerald-400/40 text-emerald-100 hover:bg-emerald-400/30',
      'CLEAR_PINK': 'bg-pink-400/20 border-pink-400/40 text-pink-100 hover:bg-pink-400/30',
      'CLEAR_PURPLE': 'bg-purple-500/20 border-purple-500/40 text-purple-100 hover:bg-purple-500/30',
      'GLACIER_ICE': 'bg-cyan-300/20 border-cyan-200/40 text-cyan-100 hover:bg-cyan-300/30',
      'SMOKE_BLACK': 'bg-black/40 border-gray-600/40 text-gray-300 hover:bg-black/50',
      'JUNGLE_GREEN': 'bg-lime-500/20 border-lime-400/40 text-lime-100 hover:bg-lime-500/30',
      'ATOMIC_PURPLE': 'bg-violet-600/20 border-violet-400/40 text-violet-100 hover:bg-violet-600/30',
    }[skin || ''] || 'bg-white/10 border-white/20 text-white';

    btnStyle = `${btnColor} backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.1)] border active:translate-y-[2px]`;
  }

  // Textured
  if (skin === 'WOOD_GRAIN') {
    btnStyle = 'bg-[#3E2723] border-[#281815] text-[#D7CCC8] shadow-[0_3px_0_#281815] hover:bg-[#4E342E]';
  }
  if (skin === 'CARBON_FIBER') {
    btnStyle = 'bg-[#2a2a2a] border-[#1a1a1a] text-gray-400 shadow-[0_3px_0_#000] ring-1 ring-white/10 hover:bg-[#333]';
  }
  if (skin === 'MINECRAFT_GRASS') {
    btnStyle = 'bg-[#7d7d7d] border-[#585858] text-white shadow-[4px_4px_0_#3a3a3a] rounded-none hover:bg-[#8e8e8e] active:shadow-none active:translate-y-1 active:translate-x-1 font-mono tracking-tighter';
  }

  // Toy Series (Contrast Buttons)
  if (['FIRE_RED', 'ELECTRIC_BLUE', 'PIKACHU_YELLOW', 'HOT_PINK', 'OFF_WHITE'].includes(skin || '')) {
    const toyStyle = {
      'FIRE_RED': 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-[0_4px_0_#b45309]', // Pikachu buttons on Red
      'ELECTRIC_BLUE': 'bg-yellow-300 border-yellow-500 text-blue-900 shadow-[0_4px_0_#ca8a04]',
      'PIKACHU_YELLOW': 'bg-red-500 border-red-700 text-white shadow-[0_4px_0_#991b1b]', // Red cheeks
      'HOT_PINK': 'bg-cyan-300 border-cyan-500 text-cyan-900 shadow-[0_4px_0_#0891b2]',
      'OFF_WHITE': 'bg-[#c62828] border-[#8e0000] text-white shadow-[0_2px_0_#5f0000] rounded-sm' // NES Style
    }[skin || ''] || btnStyle;
    btnStyle = `${toyStyle} font-black hover:brightness-110 active:translate-y-[2px] active:shadow-none`;
  }

  // Special Editions
  if (skin === 'GALAXY_SWIRL') btnStyle = 'bg-[#3b0764] border-[#581c87] text-fuchsia-200 shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_15px_#d8b4fe]';
  if (skin === 'GOLD_PLATED') btnStyle = 'bg-gradient-to-br from-[#FFF59D] via-[#FBC02D] to-[#F57F17] border-[#F57F17] text-yellow-900 shadow-[0_3px_5px_rgba(0,0,0,0.3)] ring-1 ring-white/40 hover:brightness-110';
  if (skin === 'WARNING_STRIPE') btnStyle = 'bg-black border-yellow-500 text-yellow-400 shadow-[0_4px_0_black] font-black hover:bg-gray-900';
  if (skin === 'CYBER') btnStyle = 'bg-black border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_cyan] hover:shadow-[0_0_20px_cyan] font-mono';

  return (
    <div className="flex flex-col items-center gap-1.5 relative group">
      <motion.button
        whileTap={{ scale: 0.9, y: 1 }}
        onClick={() => {
          if (action && !action.disabled) action.onClick();
        }}
        disabled={action?.disabled}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 active:shadow-none active:translate-y-1 ${btnStyle} ${action?.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {label}
      </motion.button>

      {/* Label "Printed" on Device */}
      {action && (
        <div className="flex flex-col items-center select-none">
          <span
            className={`
                    text-[9px] font-black tracking-widest uppercase
                    ${skin === 'PREMIUM' || skin === 'CYBER' ? 'text-cyan-500 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]' : 'text-gray-400/80 drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]'}
                    ${action.highlight ? 'animate-pulse text-yellow-500/90' : ''}
                `}
            style={{ fontFamily: 'monospace' }}
          >
            {action.label}
          </span>
        </div>
      )}

      {/* Floating Cost Tooltip (Only on Hover/Highlight) */}
      {action?.cost && (
        <div className="absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[8px] px-1 rounded pointer-events-none whitespace-nowrap z-50">
          {action.cost}
        </div>
      )}
    </div>
  );
};
