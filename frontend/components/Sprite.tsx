"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MonsterData, SpriteSheet } from '../utils/GameLogic';

// Base Images - strictly the high quality ones
const BASES = [
    '/pet_water.png',
    '/pet_fire.png',
    '/pet_grass.png'
];

// Coordinate Constants for Parts (Source Rects [x, y, w, h])
const PARTS: Record<string, number[]> = {
    // 64x64 Sprite Sheet Assumptions
    'WING_dragon_L': [0, 20, 20, 20], // Example coords - tuning needed
    'WING_dragon_R': [44, 20, 20, 20],
    'SHELL_turtle': [20, 20, 24, 24],
    'FLAME_spirit': [20, 0, 24, 20],
    // Add more as needed
};

interface Accessory {
    type: string; // 'WING', 'SHELL', 'AURA'
    source: string; // Which image to cut from
    cut: number[];  // [x, y, w, h] from source
    dest: number[]; // [x, y] offset on destination
}

interface SpriteProps {
    id: number;
    baseIndex?: number;
    variant?: string;
    className?: string;
    style?: any;
    animate?: any;
    transition?: any;
    accessories?: any[];
    spriteSheet?: SpriteSheet;
    state?: string;
    loopLimit?: number; // New
    onAnimationComplete?: () => void; // New
}

export const Sprite = ({
    id, baseIndex, variant, className, style, animate, transition, accessories = [],
    spriteSheet, state = "IDLE", loopLimit, onAnimationComplete
}: SpriteProps) => {
    const [finalSrc, setFinalSrc] = useState<string | null>(null);
    // State Management for New Renderer
    const [sheetImg, setSheetImg] = useState<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);
    const frameRef = useRef(0);
    const lastFrameTime = useRef(0);
    const loopsDone = useRef(0);
    const isBlinking = useRef(false);
    const nextBlinkTime = useRef(Date.now() + Math.random() * 5000 + 2000);

    // Image Caching (Global)
    const imgCache = useRef<Record<string, HTMLImageElement>>({});

    // Legacy Logic (Base Images)
    // Prefer explicit baseIndex if provided, else modulo
    const index = baseIndex !== undefined ? baseIndex : (id % BASES.length);
    const originalSrc = BASES[index] || BASES[0];

    // Effect for Loading Sprite Sheet
    useEffect(() => {
        if (!spriteSheet) return;

        const src = spriteSheet.src;
        if (imgCache.current[src]) {
            setSheetImg(imgCache.current[src]);
            return;
        }

        const img = new Image();
        img.src = src;
        img.onload = () => {
            imgCache.current[src] = img;
            setSheetImg(img);
        };
    }, [spriteSheet?.src]);

    // Animation Loop (Continuous)
    useEffect(() => {
        if (!spriteSheet || !sheetImg) return;

        const renderLoop = (time: number) => {
            if (!canvasRef.current || !sheetImg) return;
            const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            if (time - lastFrameTime.current > 125) {
                lastFrameTime.current = time;

                // Determine Animation Data based on CURRENT state prop
                let animData = spriteSheet.rows.IDLE;
                if (state === 'FEEDING' || state === 'EATING') animData = spriteSheet.rows.EAT;
                else if (state === 'CLEAN' || state === 'CLEANING') animData = spriteSheet.rows.CLEAN;
                else if (state === 'TRAINING') animData = spriteSheet.rows.TRAIN;
                else if (state === 'ATTACKING' || state === 'FIGHTING' || state === 'ATTACK') animData = spriteSheet.rows.ATTACK;
                else if (state === 'READY') animData = typeof spriteSheet.rows.ATTACK === 'number' ? { row: spriteSheet.rows.ATTACK, frames: 1 } : { ...spriteSheet.rows.ATTACK, frames: 1 };
                else if (state === 'WALKING' || state === 'WALK') animData = spriteSheet.rows.WALK;

                else if (state === 'FAINTED' || state === 'DIE') animData = spriteSheet.rows.DIE;
                else if (state === 'BLOCK' || state === 'DEFEND') animData = spriteSheet.rows.IDLE; // Fallback to IDLE for blocking
                else if (state === 'HIT' || state === 'DAMAGED') animData = spriteSheet.rows.DIE; // Fallback to DIE frame for hit reaction

                if (!animData || !spriteSheet.frameSize) return;

                // @ts-ignore
                const rowIdx = typeof animData === 'number' ? animData : animData.row;
                // @ts-ignore
                const maxFrames = typeof animData === 'number' ? (spriteSheet.framesPerRow || 1) : (animData.frames || 1);

                // Update Frame
                const nextFrame = (frameRef.current + 1) % maxFrames;

                // Loop Counting
                if (nextFrame === 0 && frameRef.current !== 0) {
                    loopsDone.current += 1;
                    if (loopLimit && loopsDone.current >= loopLimit) {
                        if (onAnimationComplete) {
                            loopsDone.current = 0;
                            onAnimationComplete();
                            // Don't return here, let it draw the last frame or reset frame
                        }
                    }
                }
                frameRef.current = nextFrame;

                // --- BLINKING LOGIC (Only during IDLE) ---
                let drawFrame = frameRef.current;
                if (state === 'IDLE' && rowIdx === 10) {
                    const now = Date.now();
                    if (!isBlinking.current && now > nextBlinkTime.current) {
                        isBlinking.current = true;
                        drawFrame = 12; // Special blink frame
                    } else if (isBlinking.current) {
                        isBlinking.current = false;
                        nextBlinkTime.current = now + Math.random() * 5000 + 2000;
                        drawFrame = 0;
                    }
                }

                // Clear and Draw immediately (prevents black flash)
                ctx.clearRect(0, 0, 64, 64);
                let sx = drawFrame * spriteSheet.frameSize;
                let sy = (rowIdx * spriteSheet.frameSize) + (spriteSheet.yOffset || 0);

                ctx.drawImage(sheetImg, sx, sy, spriteSheet.frameSize, spriteSheet.frameSize, 0, 0, 64, 64);

                // Improved Background Removal Fallback (Corner Sampling)
                const imageData = ctx.getImageData(0, 0, 64, 64);
                const data = imageData.data;
                const bgKeys: { r: number, g: number, b: number }[] = [];

                // Sample 4 corners
                [0, 63, 63 * 64, 63 * 64 + 63].forEach(idx => {
                    const px = idx * 4;
                    const r = data[px], g = data[px + 1], b = data[px + 2], a = data[px + 3];
                    if (a > 200) { // Only sample if background isn't already transparent
                        const exists = bgKeys.some(k => Math.abs(k.r - r) < 10 && Math.abs(k.g - g) < 10 && Math.abs(k.b - b) < 10);
                        if (!exists && bgKeys.length < 3) bgKeys.push({ r, g, b });
                    }
                });

                if (bgKeys.length > 0 && spriteSheet.removeBackground !== false) {
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                        if (a === 0) continue;
                        let isBg = false;
                        for (const key of bgKeys) {
                            if (Math.sqrt((r - key.r) ** 2 + (g - key.g) ** 2 + (b - key.b) ** 2) < 15) {
                                isBg = true;
                                break;
                            }
                        }
                        if (isBg) data[i + 3] = 0;
                    }
                    ctx.putImageData(imageData, 0, 0);
                }
            }
            requestRef.current = requestAnimationFrame(renderLoop);
        };

        requestRef.current = requestAnimationFrame(renderLoop);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [spriteSheet?.src, sheetImg, state, loopLimit, onAnimationComplete]); // Loop ONLY depends on source image being ready

    // Separate Effect for Resetting Frames on State Change
    useEffect(() => {
        frameRef.current = 0;
        loopsDone.current = 0;
        isBlinking.current = false;
    }, [state]);

    // ---------------------------------------------------------
    // PATH B: LEGACY STATIC COMPOSITION
    // ---------------------------------------------------------
    useEffect(() => {
        if (spriteSheet) return; // Only run legacy path if no spriteSheet

        const loadImages = async () => {
            // 1. Load Base
            const baseImg = new Image();
            baseImg.src = originalSrc;
            await new Promise(r => baseImg.onload = r);

            // 2. Setup Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = 64;
            canvas.height = 64;

            // CLEAR CANVAS to prevent stacking/ghosting
            ctx.clearRect(0, 0, 64, 64);
            ctx.imageSmoothingEnabled = false;

            // 3. Draw Base
            ctx.drawImage(baseImg, 0, 0, 64, 64);

            // 4. Remove Background (Base)
            let imageData = ctx.getImageData(0, 0, 64, 64);
            let data = imageData.data;
            const bgR = data[0], bgG = data[1], bgB = data[2], bgA = data[3];

            // Only remove background if top-left pixel is opaque (assumes flat background)
            if (bgA > 200) {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

                    // Remove matched background OR pure white properties
                    if (dist < 50 || (r > 240 && g > 240 && b > 240)) {
                        data[i + 3] = 0;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }

            // 5. Draw Accessories
            if (accessories && accessories.length > 0) {
                for (const acc of accessories) {
                    const accImg = new Image();
                    accImg.src = acc.source;
                    await new Promise(r => accImg.onload = r);

                    // Draw part
                    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                    ctx.drawImage(
                        accImg,
                        acc.cut[0], acc.cut[1], acc.cut[2], acc.cut[3],
                        acc.dest[0], acc.dest[1], acc.cut[2], acc.cut[3]
                    );
                }
            }

            setFinalSrc(canvas.toDataURL());
        };

        loadImages();
    }, [originalSrc, accessories, spriteSheet, state]); // Updated dependencies

    // Visual Variant Logic (CSS Filters)
    const getVariantStyle = (v: string) => {
        switch (v) {
            case 'SHADOW': return 'brightness(0.3) grayscale(1) drop-shadow(0 0 5px rgba(0,0,0,0.8))';
            case 'SPECTRAL': return 'opacity(0.8) hue-rotate(180deg) saturate(200%) drop-shadow(0 0 5px cyan)';
            case 'GOLD': return 'sepia(1) saturate(300%) hue-rotate(20deg) brightness(1.2)';
            case 'UNDEAD': return 'grayscale(1) contrast(150%) brightness(0.8) hue-rotate(90deg)';
            case 'MAGMA': return 'contrast(150%) saturate(200%) hue-rotate(-20deg)';
            case 'TOXIC': return 'hue-rotate(60deg) saturate(150%) brightness(1.2)';
            case 'GHOST': return 'opacity(0.4) brightness(1.5) drop-shadow(0 0 10px rgba(255,255,255,0.4)) blur(0.5px)';
            default: return ''; // Normal
        }
    };

    return (
        <motion.div
            className={`pixelated rendering-pixelated relative ${className}`}
            style={{ width: 64, height: 64, ...style }}
            animate={animate}
            transition={transition}
        >
            {spriteSheet ? (
                /* New Canvas Renderer */
                <canvas
                    ref={canvasRef}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    style={{
                        imageRendering: 'pixelated',
                        filter: `${style?.filter || ''} ${getVariantStyle(variant || '')}`
                    }}
                />
            ) : finalSrc ? (
                /* Legacy Image Renderer */
                <motion.img
                    src={finalSrc}
                    alt="Monster"
                    className="w-full h-full object-contain"
                    animate={state === 'WALK' || state === 'WALKING' ? {
                        y: [0, -4, 0],
                        transition: { repeat: Infinity, duration: 0.4 }
                    } : {}}
                    style={{
                        imageRendering: 'pixelated',
                        filter: `${style?.filter || ''} ${getVariantStyle(variant || '')}`
                    }}
                />
            ) : (
                <div className="w-full h-full animate-pulse bg-white/10 rounded-full" />
            )}
        </motion.div>
    );
};
