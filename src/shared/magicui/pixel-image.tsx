// src/shared/magicui/pixel-image.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/lib/utils";

type Grid = { rows: number; cols: number };

const DEFAULT_GRIDS: Record<string, Grid> = {
  "6x4": { rows: 4, cols: 6 },
  "8x8": { rows: 8, cols: 8 },
  "8x3": { rows: 3, cols: 8 },
  "4x6": { rows: 6, cols: 4 },
  "3x8": { rows: 8, cols: 3 },
};
type PredefinedGridKey = keyof typeof DEFAULT_GRIDS;

interface PixelImageProps {
  src: string;
  grid?: PredefinedGridKey;
  customGrid?: Grid;
  grayscaleAnimation?: boolean;
  pixelFadeInDuration?: number; // ms
  maxAnimationDelay?: number; // ms
  colorRevealDelay?: number; // ms
  className?: string; // ✅ 사이즈/레이아웃 커스터마이즈
}

export const PixelImage = ({
  src,
  grid = "8x8",
  grayscaleAnimation = true,
  pixelFadeInDuration = 1000,
  maxAnimationDelay = 1200,
  colorRevealDelay = 1300,
  customGrid,
  className = "",
}: PixelImageProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showColor, setShowColor] = useState(false);

  const MIN_GRID = 1;
  const MAX_GRID = 16;

  const { rows, cols } = useMemo(() => {
    const isValidGrid = (g?: Grid) =>
      !!g &&
      Number.isInteger(g.rows) &&
      Number.isInteger(g.cols) &&
      g.rows >= MIN_GRID &&
      g.cols >= MIN_GRID &&
      g.rows <= MAX_GRID &&
      g.cols <= MAX_GRID;

    return isValidGrid(customGrid) ? (customGrid as Grid) : DEFAULT_GRIDS[grid];
  }, [customGrid, grid]);

  useEffect(() => {
    setIsVisible(true);
    const colorTimeout = window.setTimeout(
      () => setShowColor(true),
      colorRevealDelay
    );
    return () => window.clearTimeout(colorTimeout);
  }, [colorRevealDelay]);

  const pieces = useMemo(() => {
    const total = rows * cols;
    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const clipPath = `polygon(
        ${col * (100 / cols)}% ${row * (100 / rows)}%,
        ${(col + 1) * (100 / cols)}% ${row * (100 / rows)}%,
        ${(col + 1) * (100 / cols)}% ${(row + 1) * (100 / rows)}%,
        ${col * (100 / cols)}% ${(row + 1) * (100 / rows)}%
      )`;

      const delay = Math.random() * maxAnimationDelay;
      return { clipPath, delay };
    });
  }, [rows, cols, maxAnimationDelay]);

  return (
    <div
      className={cn(
        // 기본 사이즈(적당히 큼) + 둥근 모서리 변수
        "relative select-none h-80 w-80 md:h-[26rem] md:w-[26rem] [--pi-br:2rem]",
        className
      )}
    >
      {pieces.map((piece, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute inset-0 transition-opacity ease-out will-change-transform",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          style={{
            clipPath: piece.clipPath,
            transitionDelay: `${piece.delay}ms`,
            transitionDuration: `${pixelFadeInDuration}ms`,
          }}
        >
          <img
            src={src}
            alt={`pixel piece ${idx + 1}`}
            draggable={false}
            className={cn(
              "h-full w-full object-cover rounded-[var(--pi-br)]",
              "will-change-transform [backface-visibility:hidden]",
              grayscaleAnimation
                ? showColor
                  ? "grayscale-0"
                  : "grayscale"
                : ""
            )}
            style={{
              transition: grayscaleAnimation
                ? `filter ${pixelFadeInDuration}ms cubic-bezier(0.4,0,0.2,1)`
                : "none",
            }}
          />
        </div>
      ))}
    </div>
  );
};
