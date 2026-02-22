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
  device?: string;
  actions?: {
    A?: DeviceAction;
    B?: DeviceAction;
    C?: DeviceAction;
  };
  hideLogo?: boolean;
  hideButtons?: boolean;
  isWhale?: boolean;
  isLobbyActive?: boolean;
  isCapturing?: boolean;
}

export const Device = ({
  children,
  color = "bg-purple-500",
  device = 'CLASSIC',
  actions,
  hideLogo,
  hideButtons,
  isWhale,
  isLobbyActive,
  isCapturing
}: DeviceProps) => {
  const getSkinData = () => {
    // 1. PREMIUM / CYBER (Glowing, High-Tech)
    if (device === 'PREMIUM' || device === 'CYBER') return {
      bg: 'bg-gradient-to-br from-gray-900 via-black to-gray-800',
      border: 'border-2 border-gray-700 ring-4 ring-black shadow-[0_0_20px_rgba(34,211,238,0.2)]',
      shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)]',
      overlay: <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.05)_50%,transparent_75%)] bg-[length:10px_10px]"></div>,
      screenBorder: 'border-gray-800 shadow-[inset_0_0_20px_rgba(0,0,0,1)] ring-1 ring-cyan-500/30',
      text: 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] font-mono',
      sheen: 'bg-gradient-to-tr from-transparent via-cyan-500/5 to-transparent'
    };

    // 2. MATTE SERIES (Soft, Rubberized look)
    if (device?.startsWith('MATTE_')) {
      const color = {
        'MATTE_BLACK': 'bg-[#202020]',
        'MATTE_WHITE': 'bg-[#f0f0f0]',
        'MATTE_MINT': 'bg-[#a3e635]', // Adjusted for better matte look
        'MATTE_PINK': 'bg-[#fb7185]'
      }[device] || 'bg-gray-200';

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
    if (device?.startsWith('METAL_')) {
      const gradient = {
        'METAL_SILVER': 'bg-gradient-to-br from-[#e0e0e0] via-[#c0c0c0] to-[#a0a0a0]',
        'METAL_GOLD': 'bg-gradient-to-br from-[#fcd34d] via-[#fbbf24] to-[#b45309]',
        'METAL_BLUE': 'bg-gradient-to-br from-[#93c5fd] via-[#60a5fa] to-[#2563eb]'
      }[device] || 'bg-gray-300';

      return {
        bg: gradient,
        border: 'border border-white/40 ring-1 ring-black/20',
        shadow: 'shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.2)]',
        overlay: isCapturing ? null : <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-40 mix-blend-multiply brightness-125"></div>,
        screenBorder: 'border-gray-400 shadow-[inset_0_2px_5px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.5)]', // Deep inset + highlight
        text: 'text-black/50 font-bold drop-shadow-sm',
        sheen: 'bg-gradient-to-tr from-transparent via-white/40 to-transparent' // Sharp metallic highlight
      };
    }

    // 4. CLEAR / ATOMIC / TRANSLUCENT SERIES (Gameboy Color Style + GLOW)
    if (device?.startsWith('CLEAR_') || ['GLACIER_ICE', 'SMOKE_BLACK', 'JUNGLE_GREEN', 'ATOMIC_PURPLE'].includes(device || '')) {
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
      const t = tints[device || ''] || tints['CLEAR_WHITE'];

      return {
        bg: `backdrop-blur-md ${t.bg}`,
        border: `border-2 ${t.border} ring-1 ring-white/20`,
        shadow: `${t.glow} drop-shadow-xl`,
        overlay: (
          <>
            {/* Circuit Board Pattern for "See-through" effect */}
            {!isCapturing && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30 mix-blend-overlay"></div>}
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
    if (device === 'WOOD_GRAIN') return {
      bg: 'bg-[#5D4037]',
      border: 'border-[#3E2723] ring-2 ring-[#281815]',
      shadow: 'shadow-[0_15px_30px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.1)]',
      overlay: isCapturing ? null : (
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

    // 5. TEXTURED & ATMOSPHERIC SERIES (Advanced Textures)
    if (device === 'LAVA_FLOW' || device === 'MAGMA') return {
      bg: 'bg-[#1a0505]',
      border: 'border-[#4a1010] ring-2 ring-orange-600/50',
      shadow: 'shadow-[0_0_30px_rgba(234,88,12,0.4)]',
      overlay: (
        <>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rocky-wall.png')] opacity-60 mix-blend-overlay"></div>
          {!isCapturing && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-red-900/10 to-transparent animate-pulse" />
              {/* Cracks effect using a radial gradient pattern */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(255,100,0,0.2)_100%)]"
                style={{ backgroundSize: '20px 20px' }} />
            </div>
          )}
        </>
      ),
      screenBorder: 'border-red-950 shadow-[inset_0_0_20px_black] bg-black/40',
      text: 'text-orange-500 font-black tracking-widest drop-shadow-[0_0_8px_#ea580c] uppercase',
      sheen: 'bg-gradient-to-tr from-transparent via-orange-500/10 to-transparent'
    };

    if (device === 'ICE_CRYSTAL') return {
      bg: 'bg-gradient-to-br from-cyan-100 via-blue-200 to-cyan-300',
      border: 'border-white/80 ring-2 ring-cyan-100',
      shadow: 'shadow-[0_10px_40px_rgba(103,232,249,0.3),inset_0_0_15px_rgba(255,255,255,0.8)]',
      overlay: (
        <>
          <div className="absolute inset-0 backdrop-blur-[2px] opacity-30"></div>
          {!isCapturing && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/ice-age.png')] opacity-40 mix-blend-overlay scale-150"></div>}
        </>
      ),
      screenBorder: 'border-white/40 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] bg-white/20',
      text: 'text-blue-600 font-bold tracking-widest text-shadow-sm',
      sheen: 'bg-gradient-to-tr from-transparent via-white/70 to-transparent'
    };

    if (device === 'CHROME_PLATED') return {
      bg: 'bg-gradient-to-br from-[#ffffff] via-[#a0a0a0] to-[#707070]',
      border: 'border-white/90 ring-1 ring-black/10',
      shadow: 'shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_3px_rgba(255,255,255,0.9)]',
      overlay: (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-black/20 mix-blend-overlay" />
      ),
      screenBorder: 'border-[#505050] shadow-[inset_0_0_15px_black] bg-black/10',
      text: 'text-gray-100 font-black tracking-widest italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
      sheen: 'bg-gradient-to-tr from-transparent via-white/80 to-transparent scale-150 rotate-12'
    };

    if (device === 'BRUSHED_STEEL') return {
      bg: 'bg-[#8d8d8d]',
      border: 'border-[#5a5a5a] ring-1 ring-black/20',
      shadow: 'shadow-[0_15px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]',
      overlay: (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-100 mix-blend-multiply" />
      ),
      screenBorder: 'border-[#424242] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] bg-gray-900/10',
      text: 'text-gray-300 font-bold tracking-widest drop-shadow-sm',
      sheen: 'bg-gradient-to-b from-white/10 to-transparent'
    };

    if (device === 'COPPER_PLATE') return {
      bg: 'bg-gradient-to-br from-[#b87333] via-[#8b4513] to-[#5d2e0a]',
      border: 'border-[#5d2e0a] ring-1 ring-[#b87333]/40',
      shadow: 'shadow-[0_15px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]',
      overlay: (
        <>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 via-transparent to-transparent opacity-40" title="Patina Effect" />
        </>
      ),
      screenBorder: 'border-[#3e1f07] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] bg-orange-950/20',
      text: 'text-[#ffcc80] font-serif font-black tracking-widest',
      sheen: 'bg-gradient-to-tr from-transparent via-orange-200/20 to-transparent'
    };

    if (device === 'MARBLE_WHITE') return {
      bg: 'bg-white',
      border: 'border-gray-200 ring-2 ring-gray-100',
      shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.05)]',
      overlay: (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-100 mix-blend-multiply" />
      ),
      screenBorder: 'border-gray-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] bg-gray-50',
      text: 'text-gray-400 font-serif font-black tracking-[0.2em]',
      sheen: 'bg-gradient-to-b from-white/20 to-transparent'
    };

    if (device === 'VINTAGE_PLASTIC') return {
      bg: 'bg-[#e3dcd2]',
      border: 'border-[#c5bcb0] ring-1 ring-[#f5efe6]',
      shadow: 'shadow-[0_10px_20px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.5)]',
      overlay: (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-20 mix-blend-multiply" />
      ),
      screenBorder: 'border-[#a59c8e] shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] bg-gray-900/20',
      text: 'text-[#857c6e] font-mono font-black tracking-tighter uppercase',
      sheen: ''
    };

    if (device === 'CAMO_URBAN') return {
      bg: 'bg-[#404040]',
      border: 'border-black ring-1 ring-gray-600',
      shadow: 'shadow-2xl shadow-black/40',
      overlay: (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dimension.png')] opacity-100 mix-blend-multiply" />
      ),
      screenBorder: 'border-black shadow-[inset_0_2px_5px_black] bg-black/20',
      text: 'text-gray-400 font-bold tracking-widest',
      sheen: ''
    };

    if (device === 'MATRIX_CORE') return {
      bg: 'bg-black',
      border: 'border-green-900 ring-1 ring-green-500/50',
      shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
      overlay: (
        <>
          {!isCapturing && (
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full opacity-10 font-mono text-[6px] text-green-500 leading-none whitespace-pre overflow-hidden">
              {Array(20).fill("01011010011000101011\n").join("")}
            </div>
          </div>
        </>
      ),
      screenBorder: 'border-green-900 shadow-[inset_0_0_10px_black] ring-1 ring-green-500/20',
      text: 'text-green-500 font-mono tracking-widest drop-shadow-[0_0_3px_#22c55e]',
      sheen: 'bg-gradient-to-b from-green-500/5 via-transparent to-transparent'
    };

    if (device === 'CARBON_FIBER') return {
      bg: 'bg-[#1a1a1a]',
      border: 'border-gray-800 ring-1 ring-black',
      shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]',
      overlay: isCapturing ? null : <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 contrast-150"></div>,
      screenBorder: 'border-black shadow-[inset_0_0_10px_black]',
      text: 'text-gray-400 font-mono tracking-widest',
      sheen: 'bg-gradient-to-tr from-transparent via-white/10 to-transparent'
    };

    // 6. MINECRAFT (Official Grass Block Look)
    if (device === 'MINECRAFT_GRASS') return {
      bg: 'bg-[#795548]', // Base Dirt Brown
      border: 'border-[#3E2723] ring-4 ring-black',
      shadow: 'shadow-[8px_8px_0_rgba(0,0,0,0.5)]', // Hard pixel shadow
      overlay: isCapturing ? null : (
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
    if (['FIRE_RED', 'ELECTRIC_BLUE', 'PIKACHU_YELLOW', 'HOT_PINK', 'OFF_WHITE'].includes(device || '')) {
      const colors: Record<string, any> = {
        'FIRE_RED': { bg: 'bg-red-600', border: 'border-red-700', text: 'text-red-100' },
        'ELECTRIC_BLUE': { bg: 'bg-blue-600', border: 'border-blue-700', text: 'text-blue-100' },
        'PIKACHU_YELLOW': { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-900' },
        'HOT_PINK': { bg: 'bg-pink-500', border: 'border-pink-600', text: 'text-pink-100' },
        'OFF_WHITE': { bg: 'bg-[#f0f0e0]', border: 'border-[#d4d4c8]', text: 'text-gray-500' }
      };
      const c = colors[device || 'FIRE_RED'];

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
    if (device === 'GALAXY_SWIRL' || device === 'COSMIC_DUST') return {
      bg: device === 'COSMIC_DUST' ? 'bg-[#000]' : 'bg-gradient-to-br from-[#1a0b2e] via-[#431c5d] to-[#1a0b2e]',
      border: 'border-purple-900 ring-2 ring-purple-500/50',
      shadow: 'shadow-[0_0_30px_rgba(107,33,168,0.5)]',
      overlay: (
        <>
          {!isCapturing && <div className={`absolute inset-0 ${device === 'COSMIC_DUST' ? "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" : "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"} opacity-60 mix-blend-screen animate-pulse`}></div>}
          <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-pink-500/20 ${isCapturing ? '' : 'mix-blend-overlay'}`}></div>
          {device === 'COSMIC_DUST' && <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_50%,rgba(100,50,255,0.2)_0%,transparent_100%)" />}
        </>
      ),
      screenBorder: 'border-purple-800 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]',
      text: 'text-purple-200 font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]',
      sheen: 'bg-gradient-to-t from-transparent via-white/10 to-transparent'
    };

    if (device === 'VOID_WALKER') return {
      bg: 'bg-black shadow-[inset_0_0_50px_rgba(100,0,255,0.2)]',
      border: 'border-gray-900 ring-1 ring-purple-950',
      shadow: 'shadow-[0_0_50px_black,0_0_20px_rgba(139,92,246,0.1)]',
      overlay: (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,1)_100%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        </>
      ),
      screenBorder: 'border-gray-900 shadow-[inset_0_0_30px_black] bg-black',
      text: 'text-gray-500 font-mono uppercase tracking-[0.5em] animate-pulse',
      sheen: ''
    };

    if (device === 'HOLO_GRAPHIC') return {
      bg: 'bg-[#e5e7eb]',
      border: 'border-white/60 ring-1 ring-white/20',
      shadow: 'shadow-2xl shadow-purple-500/10',
      overlay: (
        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-400/30 via-purple-400/30 to-yellow-400/30 ${isCapturing ? '' : 'animate-pulse'}`} style={{ mixBlendMode: 'color-dodge' }} />
      ),
      screenBorder: 'border-white/30 shadow-inner bg-white/10 backdrop-blur-sm',
      text: 'text-gray-600 font-bold tracking-widest drop-shadow-[0_1px_2px_rgba(255,255,255,1)]',
      sheen: 'bg-gradient-to-r from-transparent via-white/50 to-transparent rotate-45 scale-150'
    };

    if (device === 'GLITCH_ART') return {
      bg: 'bg-[#121212]',
      border: 'border-red-500/50 ring-2 ring-blue-500/50',
      shadow: 'shadow-[4px_4px_0_rgba(255,0,0,0.5),-4px_-4px_0_rgba(0,0,255,0.5)]',
      overlay: (
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_2px)] pointer-events-none" />
      ),
      screenBorder: 'border-gray-800 shadow-[inset_0_0_10px_red,inset_0_0_20px_blue] bg-black/40',
      text: 'text-white font-mono uppercase italic tracking-tighter drop-shadow-[2px_0_0_#ff0000]',
      sheen: ''
    };

    if (device === 'PEARL_GLOSS' || device === 'STARDUST') return {
      bg: device === 'STARDUST' ? 'bg-[#0f172a]' : 'bg-[#fff] shadow-[inset_0_0_20px_rgba(255,255,255,1)]',
      border: 'border-white/40 ring-1 ring-gray-200',
      shadow: 'shadow-xl',
      overlay: (
        <div className={`absolute inset-0 ${device === 'STARDUST' ? "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-100" : "bg-gradient-to-tr from-pink-100/30 via-transparent to-blue-100/30 opacity-60"}`} />
      ),
      screenBorder: 'border-gray-200 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] bg-white/40',
      text: 'text-gray-400 font-bold tracking-widest',
      sheen: 'bg-gradient-to-tr from-transparent via-white/80 to-transparent'
    };

    if (device === 'NEON_STREAK') return {
      bg: 'bg-[#0a0a0k]',
      border: 'border-pink-500 shadow-[0_0_10px_#ec4899] ring-1 ring-cyan-400',
      shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]',
      overlay: (
        <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(90deg,transparent_0%,rgba(6,182,212,0.1)_50%,transparent_100%)] rotate-12" />
      ),
      screenBorder: 'border-cyan-900 shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-black/40',
      text: 'text-pink-400 font-black tracking-widest drop-shadow-[0_0_5px_#ec4899]',
      sheen: ''
    };

    if (device === 'GOLD_PLATED' || device === 'AURA_GOLD') return {
      bg: device === 'AURA_GOLD' ? 'bg-[#FFD700]' : 'bg-gradient-to-br from-[#FDD835] via-[#FBC02D] to-[#F57F17]',
      border: device === 'AURA_GOLD' ? 'border-[#FFD700] ring-4 ring-yellow-400/50' : 'border-[#F9A825] ring-1 ring-yellow-200',
      shadow: device === 'AURA_GOLD' ? 'shadow-[0_0_50px_rgba(255,215,0,0.5)]' : 'shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.8)]',
      overlay: (
        <>
          {device === 'AURA_GOLD' && <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-transparent to-white/20 animate-pulse" />}
          {!isCapturing && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20 mix-blend-overlay"></div>}
        </>
      ),
      screenBorder: 'border-[#FBC02D] shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]',
      text: 'text-yellow-900 font-serif font-bold tracking-widest',
      sheen: 'bg-gradient-to-tr from-transparent via-white/60 to-transparent'
    };

    if (device === 'DIAMOND_CUT') return {
      bg: 'bg-white/80',
      border: 'border-white ring-4 ring-white/50',
      shadow: 'shadow-[0_0_30px_rgba(255,255,255,0.5)]',
      overlay: (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/triangles.png')] opacity-40 mix-blend-screen scale-150 rotate-45" />
      ),
      screenBorder: 'border-white/60 shadow-inner bg-white/20 backdrop-blur-md',
      text: 'text-gray-500 font-serif font-black tracking-widest italic',
      sheen: 'bg-gradient-to-tr from-transparent via-white/90 to-transparent'
    };

    if (device === 'WARNING_STRIPE') return {
      bg: 'bg-yellow-400',
      border: 'border-black ring-4 ring-yellow-400',
      shadow: 'shadow-[0_10px_0_rgba(0,0,0,1)]',
      overlay: isCapturing ? null : (
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #fbbf24 10px, #fbbf24 20px)',
          opacity: 0.8
        }}></div>
      ),
      screenBorder: 'border-black bg-black p-1 shadow-none',
      text: 'text-black bg-yellow-400 px-1 font-black uppercase tracking-tighter border border-black',
      sheen: '' // Matte
    };

    // 9. GEMSTONE SERIES (Translucent, faceted look)
    if (['RUBY_RED', 'SAPPHIRE_BLUE', 'EMERALD_GREEN', 'OBSIDIAN'].includes(device || '')) {
      const stones: Record<string, any> = {
        'RUBY_RED': { bg: 'bg-red-600/70', border: 'border-red-400/50', glow: 'shadow-[0_0_30px_rgba(220,38,38,0.5)]', text: 'text-red-100' },
        'SAPPHIRE_BLUE': { bg: 'bg-blue-700/70', border: 'border-blue-400/50', glow: 'shadow-[0_0_30px_rgba(29,78,216,0.5)]', text: 'text-blue-100' },
        'EMERALD_GREEN': { bg: 'bg-emerald-600/70', border: 'border-emerald-400/50', glow: 'shadow-[0_0_30px_rgba(5,150,105,0.5)]', text: 'text-emerald-100' },
        'OBSIDIAN': { bg: 'bg-black/90', border: 'border-purple-900/50', glow: 'shadow-[0_0_30px_rgba(88,28,135,0.4)]', text: 'text-purple-200' }
      };
      const s = stones[device || 'RUBY_RED'];

      return {
        bg: `backdrop-blur-xl ${s.bg}`,
        border: `border-2 ${s.border} ring-1 ring-white/30`,
        shadow: `${s.glow} shadow-2xl`,
        overlay: (
          <>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/20" />
            {!isCapturing && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 mix-blend-overlay"></div>}
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(255,255,255,0.1)]" />
          </>
        ),
        screenBorder: 'border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] bg-black/20',
        text: `${s.text} font-serif font-black tracking-widest drop-shadow-md`,
        sheen: 'bg-gradient-to-br from-white/40 via-transparent to-transparent'
      };
    }

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

  const deviceData = getSkinData();

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
        ${deviceData.bg} ${deviceData.border} ${deviceData.shadow}
        p-4 flex flex-row items-center justify-between px-8
        overflow-hidden transition-all duration-500 z-0
      `}>
        {deviceData.overlay}

        {/* Realistic Sheen / Reflection */}
        {deviceData.sheen && (
          <div className={`absolute inset-0 rounded-inherit z-20 pointer-events-none ${deviceData.sheen} opacity-60`} />
        )}

        {/* Dynamic Casing Color Overlay (for tinted devices) */}
        {!isCapturing && !device?.startsWith('CLEAR') && device !== 'STARDUST' && device !== 'PREMIUM' && device !== 'CYBER' && !device?.startsWith('MINECRAFT') && (
          <div className={`absolute inset-0 opacity-10 ${color} transition-colors duration-500 z-0 mix-blend-overlay`} />
        )}

        {/* Screen Area with Bevels */}
        <div className={`
          z-10 bg-[#9ea792] border-8 ${deviceData.screenBorder}
          w-64 h-48 rounded-sm order-2 relative overflow-hidden pixelated
          shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] 
        `}>
          {!isCapturing && <div className="absolute inset-0 pointer-events-none bg-[url('https://transparenttextures.com/patterns/pixel-weave.png')] opacity-10 mix-blend-multiply"></div>}
          {children}
        </div>

        {/* Controls */}
        {!hideButtons && (
          <div className={`z-10 flex flex-col gap-2 order-3`}>
            <DeviceButton label="A" device={device} action={actions?.A} isCapturing={isCapturing} />
            <DeviceButton label="B" device={device} action={actions?.B} isCapturing={isCapturing} />
            <DeviceButton label="C" device={device} action={actions?.C} isCapturing={isCapturing} />
          </div>
        )}

        {/* Digi Antenna */}
        <div className={`
          absolute -top-7 right-8 w-2.5 h-12 rounded-t-lg z-0 border-x border-t border-black/20 overflow-hidden
          ${device === 'PREMIUM' || device === 'CYBER' ? 'bg-gray-800' :
            device?.startsWith('METAL') ? 'bg-gray-400' :
              device?.startsWith('CLEAR') ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-500'}
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

const DeviceButton = ({ label, device, action, isCapturing }: { label: string, device?: string, action?: DeviceAction, isCapturing?: boolean }) => {
  // Button Styles
  let btnStyle = 'bg-gray-200 shadow-[0_4px_0_rgb(156,163,175)] text-gray-500 border-gray-300'; // Default

  // Clear / Atomic
  if (device?.startsWith('CLEAR') || ['GLACIER_ICE', 'SMOKE_BLACK', 'JUNGLE_GREEN', 'ATOMIC_PURPLE'].includes(device || '')) {
    const btnColor = {
      'CLEAR_WHITE': 'bg-white/20 border-white/40 text-white hover:bg-white/30',
      'CLEAR_GREEN': 'bg-emerald-400/20 border-emerald-400/40 text-emerald-100 hover:bg-emerald-400/30',
      'CLEAR_PINK': 'bg-pink-400/20 border-pink-400/40 text-pink-100 hover:bg-pink-400/30',
      'CLEAR_PURPLE': 'bg-purple-500/20 border-purple-500/40 text-purple-100 hover:bg-purple-500/30',
      'GLACIER_ICE': 'bg-cyan-300/20 border-cyan-200/40 text-cyan-100 hover:bg-cyan-300/30',
      'SMOKE_BLACK': 'bg-black/40 border-gray-600/40 text-gray-300 hover:bg-black/50',
      'JUNGLE_GREEN': 'bg-lime-500/20 border-lime-400/40 text-lime-100 hover:bg-lime-500/30',
      'ATOMIC_PURPLE': 'bg-violet-600/20 border-violet-400/40 text-violet-100 hover:bg-violet-600/30',
    }[device || ''] || 'bg-white/10 border-white/20 text-white';

    btnStyle = `${btnColor} ${isCapturing ? '' : 'backdrop-blur-sm'} shadow-[0_2px_10px_rgba(0,0,0,0.1)] border active:translate-y-[2px]`;
  }

  // Textured
  if (device === 'WOOD_GRAIN') {
    btnStyle = 'bg-[#3E2723] border-[#281815] text-[#D7CCC8] shadow-[0_3px_0_#281815] hover:bg-[#4E342E]';
  }
  if (device === 'CARBON_FIBER') {
    btnStyle = 'bg-[#2a2a2a] border-[#1a1a1a] text-gray-400 shadow-[0_3px_0_#000] ring-1 ring-white/10 hover:bg-[#333]';
  }
  if (device === 'MINECRAFT_GRASS') {
    btnStyle = 'bg-[#7d7d7d] border-[#585858] text-white shadow-[4px_4px_0_#3a3a3a] rounded-none hover:bg-[#8e8e8e] active:shadow-none active:translate-y-1 active:translate-x-1 font-mono tracking-tighter';
  }

  // Toy Series (Contrast Buttons)
  if (['FIRE_RED', 'ELECTRIC_BLUE', 'PIKACHU_YELLOW', 'HOT_PINK', 'OFF_WHITE'].includes(device || '')) {
    const toyStyle = {
      'FIRE_RED': 'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-[0_4px_0_#b45309]', // Pikachu buttons on Red
      'ELECTRIC_BLUE': 'bg-yellow-300 border-yellow-500 text-blue-900 shadow-[0_4px_0_#ca8a04]',
      'PIKACHU_YELLOW': 'bg-red-500 border-red-700 text-white shadow-[0_4px_0_#991b1b]', // Red cheeks
      'HOT_PINK': 'bg-cyan-300 border-cyan-500 text-cyan-900 shadow-[0_4px_0_#0891b2]',
      'OFF_WHITE': 'bg-[#c62828] border-[#8e0000] text-white shadow-[0_2px_0_#5f0000] rounded-sm' // NES Style
    }[device || ''] || btnStyle;
    btnStyle = `${toyStyle} font-black hover:brightness-110 active:translate-y-[2px] active:shadow-none`;
  }

  // Special Editions
  if (device === 'GALAXY_SWIRL') btnStyle = 'bg-[#3b0764] border-[#581c87] text-fuchsia-200 shadow-[0_0_10px_#a855f7] hover:shadow-[0_0_15px_#d8b4fe]';
  if (device === 'GOLD_PLATED') btnStyle = 'bg-gradient-to-br from-[#FFF59D] via-[#FBC02D] to-[#F57F17] border-[#F57F17] text-yellow-900 shadow-[0_3px_5px_rgba(0,0,0,0.3)] ring-1 ring-white/40 hover:brightness-110';
  if (device === 'WARNING_STRIPE') btnStyle = 'bg-black border-yellow-500 text-yellow-400 shadow-[0_4px_0_black] font-black hover:bg-gray-900';
  if (device === 'CYBER') btnStyle = 'bg-black border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_cyan] hover:shadow-[0_0_20px_cyan] font-mono';

  // Atmospheric / Material Series
  if (device === 'LAVA_FLOW' || device === 'MAGMA') btnStyle = 'bg-orange-600 border-orange-800 text-white shadow-[0_4px_0_#9a3412] hover:bg-orange-500 hover:shadow-[0_0_15px_#f97316]';
  if (device === 'ICE_CRYSTAL') btnStyle = 'bg-white/40 border-cyan-200 text-blue-600 shadow-[0_0_10px_rgba(255,255,255,0.5)] backdrop-blur-md hover:bg-white/60';
  if (device === 'MATRIX_CORE') btnStyle = 'bg-black border-green-900 text-green-500 shadow-[0_0_5px_#22c55e] font-mono hover:shadow-[0_0_15px_#22c55e]';
  if (device === 'CHROME_PLATED' || device === 'METAL_SILVER' || device === 'BRUSHED_STEEL') btnStyle = 'bg-gradient-to-br from-gray-100 to-gray-400 border-gray-500 text-gray-800 shadow-[0_3px_0_#4a4a4a] hover:brightness-110';
  if (device === 'COPPER_PLATE') btnStyle = 'bg-[#b87333] border-[#5d2e0a] text-orange-950 shadow-[0_3px_0_#3e1f07] hover:brightness-110';
  if (device === 'MARBLE_WHITE') btnStyle = 'bg-white border-gray-300 text-gray-400 shadow-[0_3px_0_#d1d5db] font-serif';
  if (device === 'VINTAGE_PLASTIC') btnStyle = 'bg-[#d3ccc2] border-[#a59c8e] text-[#655c4e] shadow-[0_3px_0_#857c6e] hover:bg-[#c3bcaf]';
  if (device === 'CAMO_URBAN') btnStyle = 'bg-[#333] border-black text-gray-400 shadow-[0_3px_0_#000] hover:bg-[#444]';

  // Gemstones
  if (device === 'RUBY_RED') btnStyle = 'bg-red-600/50 border-red-400 text-white shadow-[0_0_10px_#dc2626] backdrop-blur-md';
  if (device === 'SAPPHIRE_BLUE') btnStyle = 'bg-blue-600/50 border-blue-400 text-white shadow-[0_0_10px_#2563eb] backdrop-blur-md';
  if (device === 'EMERALD_GREEN') btnStyle = 'bg-emerald-600/50 border-emerald-400 text-white shadow-[0_0_10px_#059669] backdrop-blur-md';
  if (device === 'OBSIDIAN') btnStyle = 'bg-black/60 border-purple-900 text-purple-300 shadow-[0_0_10px_#581c87] backdrop-blur-md';

  // Styles & Specials
  if (device === 'HOLO_GRAPHIC') btnStyle = 'bg-white/30 border-white text-gray-600 shadow-lg backdrop-blur-md hover:bg-white/50';
  if (device === 'GLITCH_ART') btnStyle = 'bg-black border-red-500 text-white shadow-[3px_3px_0_#000,0_0_8px_#ff0000] italic font-black';
  if (device === 'PEARL_GLOSS' || device === 'STARDUST') btnStyle = `${device === 'STARDUST' ? 'bg-slate-900' : 'bg-white'} border-gray-200 text-gray-400 shadow-md hover:brightness-110`;
  if (device === 'NEON_STREAK') btnStyle = 'bg-black border-pink-500 text-pink-400 shadow-[0_0_10px_#ec4899] font-black hover:text-cyan-400 hover:border-cyan-400 shadow-[0_0_10px_cyan]';
  if (device === 'VOID_WALKER') btnStyle = 'bg-black border-gray-800 text-gray-600 shadow-[inset_0_0_5px_rgba(255,255,255,0.1)]';
  if (device === 'DIAMOND_CUT') btnStyle = 'bg-white/50 border-white text-gray-700 shadow-[0_0_10px_white] backdrop-blur-lg';

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
                    ${device === 'PREMIUM' || device === 'CYBER' ? 'text-cyan-500 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]' : 'text-gray-400/80 drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]'}
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
