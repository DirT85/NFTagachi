import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SpriteSheetConfig {
    src: string;
    frameSize: number;
    framesPerRow: number;
    yOffset?: number;
    removeBackground?: boolean;
    rows: {
        [state: string]: { row: number, frames: number }
    };
}

interface SpriteProps {
    id: number;
    spriteSheet?: SpriteSheetConfig;
    state?: string;
    className?: string;
    style?: React.CSSProperties;
    animate?: any;
    transition?: any;
    onAnimationComplete?: () => void;
    loopLimit?: number;
    variant?: string; // SHADOW, SPECTRAL, GOLD, etc.
    accessories?: { source: string, cut: [number, number, number, number], dest: [number, number] }[];
    originalSrc?: string; // For legacy non-sheet rendering
    isCapturing?: boolean;
}

export const Sprite: React.FC<SpriteProps> = ({
    id,
    spriteSheet,
    state = "IDLE",
    className = "",
    style = {},
    animate,
    transition,
    onAnimationComplete,
    loopLimit = Infinity,
    variant,
    accessories,
    originalSrc = "",
    isCapturing = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef(0);
    const requestRef = useRef<number>(null);
    const startTimeRef = useRef<number>(null);
    const loopsDone = useRef(0);
    const [sheetImg, setSheetImg] = useState<HTMLImageElement | null>(null);
    const [finalSrc, setFinalSrc] = useState<string | null>(null);
    const isBlinking = useRef(false);

    // 1. Load Sprite Sheet Image (or OriginalSrc as fallback sheet)
    useEffect(() => {
        const source = spriteSheet?.src || originalSrc;
        if (!source) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = source;
        img.onload = () => {
            setSheetImg(img);
            // AUTO-DETECTION: If image is unusually tall (e.g. 128x2688), it's a sheet
            if (!spriteSheet && img.height > img.width * 2) {
                console.log("Auto-Detected Sprite Sheet via Aspect Ratio:", source);
            }
        };
    }, [spriteSheet?.src, originalSrc]);

    // 2. Animation Loop (Canvas Path)
    useEffect(() => {
        if (!sheetImg || !canvasRef.current) return;

        // If no spriteSheet config provided, but it's clearly a sheet, use default 128px LPC layout
        const activeConfig: SpriteSheetConfig = spriteSheet || {
            src: sheetImg.src,
            frameSize: 128,
            framesPerRow: 8,
            rows: { IDLE: { row: 0, frames: 1 } }
        };

        const renderLoop = (time: number) => {
            if (isCapturing) {
                renderFrame(0);
                return;
            }

            if (!startTimeRef.current) startTimeRef.current = time;
            const elapsed = time - startTimeRef.current;

            if (elapsed > 100) {
                startTimeRef.current = time;
                const config = activeConfig.rows[state] || activeConfig.rows.IDLE || Object.values(activeConfig.rows)[0];
                const maxFrames = config.frames;

                frameRef.current++;
                if (frameRef.current >= maxFrames) {
                    frameRef.current = 0;
                    loopsDone.current++;
                    if (loopsDone.current >= loopLimit) {
                        if (onAnimationComplete) onAnimationComplete();
                        return;
                    }
                }
                renderFrame(frameRef.current);
            }
            requestRef.current = requestAnimationFrame(renderLoop);
        };

        const renderFrame = (frameNum: number) => {
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;

            const config = activeConfig.rows[state] || activeConfig.rows.IDLE || Object.values(activeConfig.rows)[0];
            const rowIdx = config.row;
            const displaySize = activeConfig.frameSize;

            ctx.clearRect(0, 0, displaySize, displaySize);
            let sx = frameNum * displaySize;
            let sy = (rowIdx * displaySize) + (activeConfig.yOffset || 0);

            // Safety check: Don't draw outside image bounds
            if (sx + displaySize <= sheetImg.width && sy + displaySize <= sheetImg.height) {
                ctx.drawImage(sheetImg, sx, sy, displaySize, displaySize, 0, 0, displaySize, displaySize);
            } else {
                // Fallback: draw whole image scaled down if it's NOT a sheet
                ctx.drawImage(sheetImg, 0, 0, sheetImg.width, sheetImg.height, 0, 0, displaySize, displaySize);
            }

            // Background Removal (Skipped if not explicitly a sheet or if height/width < frameSize)
            if (sheetImg.height < displaySize) return;

            const imageData = ctx.getImageData(0, 0, displaySize, displaySize);
            const data = imageData.data;
            const bgKeys: { r: number, g: number, b: number }[] = [];

            [0, (displaySize - 1), (displaySize - 1) * displaySize, (displaySize - 1) * displaySize + (displaySize - 1)].forEach(idx => {
                const px = idx * 4;
                const r = data[px], g = data[px + 1], b = data[px + 2], a = data[px + 3];
                if (a > 200) {
                    const exists = bgKeys.some(k => Math.abs(k.r - r) < 10 && Math.abs(k.g - g) < 10 && Math.abs(k.b - b) < 10);
                    if (!exists && bgKeys.length < 3) bgKeys.push({ r, g, b });
                }
            });

            if (bgKeys.length > 0 && activeConfig.removeBackground !== false) {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                    if (a !== 0) {
                        let isBg = false;
                        for (const key of bgKeys) {
                            if (Math.sqrt((r - key.r) ** 2 + (g - key.g) ** 2 + (b - key.b) ** 2) < 15) {
                                isBg = true;
                                break;
                            }
                        }
                        if (isBg) data[i + 3] = 0;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }
        };

        requestRef.current = requestAnimationFrame(renderLoop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [spriteSheet?.src, originalSrc, sheetImg, state, loopLimit, onAnimationComplete, isCapturing]);

    useEffect(() => {
        frameRef.current = 0;
        loopsDone.current = 0;
        isBlinking.current = false;
    }, [state]);

    // Legacy static composition (skipped if spriteSheet exists)
    useEffect(() => {
        if (spriteSheet) return;

        const loadImages = async () => {
            const baseImg = new Image();
            baseImg.crossOrigin = "anonymous";
            baseImg.src = originalSrc;
            await new Promise(r => baseImg.onload = r);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = 64;
            canvas.height = 64;
            ctx.clearRect(0, 0, 64, 64);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(baseImg, 0, 0, 64, 64);

            let imageData = ctx.getImageData(0, 0, 64, 64);
            let data = imageData.data;
            const bgR = data[0], bgG = data[1], bgB = data[2], bgA = data[3];

            if (bgA > 200) {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
                    if (dist < 50 || (r > 240 && g > 240 && b > 240)) {
                        data[i + 3] = 0;
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }

            if (accessories && accessories.length > 0) {
                for (const acc of accessories) {
                    const accImg = new Image();
                    accImg.crossOrigin = "anonymous";
                    accImg.src = acc.source;
                    await new Promise(r => accImg.onload = r);
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
    }, [originalSrc, accessories, spriteSheet, state]);

    const getVariantStyle = (v: string) => {
        switch (v) {
            case 'SHADOW': return 'brightness(0.3) grayscale(1) drop-shadow(0 0 5px rgba(0,0,0,0.8))';
            case 'SPECTRAL': return 'opacity(0.8) hue-rotate(180deg) saturate(200%) drop-shadow(0 0 5px cyan)';
            case 'GOLD': return 'sepia(1) saturate(300%) hue-rotate(20deg) brightness(1.2)';
            case 'UNDEAD': return 'grayscale(1) contrast(150%) brightness(0.8) hue-rotate(90deg)';
            case 'MAGMA': return 'contrast(150%) saturate(200%) hue-rotate(-20deg)';
            case 'TOXIC': return 'hue-rotate(60deg) saturate(150%) brightness(1.2)';
            case 'GHOST': return 'opacity(0.4) brightness(1.5) drop-shadow(0 0 10px rgba(255,255,255,0.4)) blur(0.5px)';
            default: return '';
        }
    };

    const baseDisplaySize = spriteSheet?.frameSize || 64;

    return (
        <motion.div
            className={`pixelated rendering-pixelated relative ${className}`}
            style={{ width: baseDisplaySize, height: baseDisplaySize, ...style }}
            animate={animate}
            transition={transition}
        >
            {(spriteSheet || (sheetImg && sheetImg.height > sheetImg.width)) ? (
                <canvas
                    ref={canvasRef}
                    width={baseDisplaySize}
                    height={baseDisplaySize}
                    className="w-full h-full object-contain"
                    style={{
                        imageRendering: 'pixelated',
                        filter: `${style?.filter || ''} ${getVariantStyle(variant || '')}`
                    }}
                />
            ) : finalSrc ? (
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
