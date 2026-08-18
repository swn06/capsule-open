"use client";

import Image from "next/image";
import type { TreeSeason } from "@/lib/season-theme";

const FILTERS: Record<TreeSeason, string> = {
  spring: "saturate(1.12) hue-rotate(-12deg) brightness(1.06)",
  summer: "saturate(1.05) brightness(1.02)",
  autumn: "hue-rotate(-78deg) saturate(1.4) brightness(1.02)",
  winter: "saturate(0.2) brightness(1.22) contrast(1.08)",
};

const SOIL = {
  spring: { mound: "#6b4423", dark: "#4a2f1a", light: "#8b5a33", speck: "#c4a574" },
  summer: { mound: "#5c3b22", dark: "#3f2816", light: "#7a4e2d", speck: "#b0894d" },
  autumn: { mound: "#7c3f12", dark: "#5c2e0c", light: "#a16207", speck: "#d6a35c" },
  winter: { mound: "#6b5a4d", dark: "#4b4038", light: "#a8a29e", speck: "#f8fafc" },
};

function SoilBed({ season, sprinkle = false }: { season: TreeSeason; sprinkle?: boolean }) {
  const { mound, dark, light, speck } = SOIL[season];
  const grains = [
    [18, 62, 3.2],
    [28, 48, 2.2],
    [38, 70, 2.8],
    [46, 54, 1.8],
    [58, 66, 3],
    [68, 50, 2.4],
    [78, 72, 2.6],
    [88, 58, 2],
    [12, 78, 2.3],
    [24, 84, 1.7],
    [34, 90, 2.5],
    [52, 86, 2.1],
    [64, 92, 2.8],
    [74, 80, 1.9],
    [84, 88, 2.4],
    [92, 74, 1.6],
    [42, 78, 1.5],
    [56, 48, 1.8],
    [16, 56, 1.4],
    [72, 44, 1.6],
    [48, 40, 1.3],
    [62, 38, 1.5],
  ] as const;

  if (sprinkle) {
    return (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-[8%] bottom-0 z-[1] h-[9%] w-[84%]"
        aria-hidden="true"
      >
        <path
          d="M8 78 C20 58 32 70 44 62 C54 72 66 56 78 68 C88 76 94 88 92 100 L8 100 Z"
          fill={mound}
          opacity="0.78"
        />
        {grains.slice(8).map(([x, y, r], index) => (
          <circle
            key={`front-${x}-${y}`}
            cx={x}
            cy={Math.min(96, y + 18)}
            r={r * 0.16}
            fill={index % 2 === 0 ? dark : speck}
            opacity="0.7"
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-[-4%] bottom-0 h-[22%] w-[108%]"
      aria-hidden="true"
    >
      <ellipse cx="50" cy="86" rx="46" ry="16" fill={dark} opacity="0.55" />
      <path
        d="M4 88 C12 64 22 58 34 62 C42 50 50 54 58 50 C68 46 78 58 88 66 C96 72 98 86 96 94 L4 96 Z"
        fill={mound}
      />
      <path
        d="M10 90 C20 72 30 68 40 74 C48 64 56 68 66 64 C76 70 86 78 92 88 C94 92 12 96 10 90 Z"
        fill={light}
        opacity="0.45"
      />
      <path
        d="M22 86 C32 76 44 78 52 74 C62 80 74 84 82 90"
        fill="none"
        stroke={dark}
        strokeWidth="1.2"
        opacity="0.35"
      />
      {grains.map(([x, y, r], index) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r * 0.18}
          fill={index % 3 === 0 ? speck : index % 3 === 1 ? dark : light}
          opacity={0.55 + (index % 4) * 0.1}
        />
      ))}
      {season === "winter"
        ? [
            [22, 68],
            [40, 60],
            [58, 58],
            [74, 66],
            [48, 72],
          ].map(([x, y]) => (
            <ellipse key={`frost-${x}`} cx={x} cy={y} rx="3.5" ry="1.4" fill="#f8fafc" opacity="0.55" />
          ))
        : null}
    </svg>
  );
}

export function MemoryTree({ season }: { season: TreeSeason }) {
  return (
    <div className="relative h-full w-full">
      <SoilBed season={season} />
      <Image
        src="/memory-tree.png?v=3"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1024px) 720px, 100vw"
        className="object-contain object-bottom"
        style={{ filter: FILTERS[season], background: "transparent" }}
      />
      <SoilBed season={season} sprinkle />
      {season === "spring" ? (
        <div className="pointer-events-none absolute inset-[8%_12%_38%] opacity-70">
          <span className="absolute left-[18%] top-[22%] h-2.5 w-2.5 rounded-full bg-pink-300/90" />
          <span className="absolute left-[38%] top-[8%] h-2 w-2 rounded-full bg-rose-200" />
          <span className="absolute right-[22%] top-[18%] h-2.5 w-2.5 rounded-full bg-pink-200" />
          <span className="absolute right-[34%] top-[4%] h-1.5 w-1.5 rounded-full bg-rose-300" />
          <span className="absolute left-[52%] top-[14%] h-2 w-2 rounded-full bg-pink-300/80" />
        </div>
      ) : null}
      {season === "winter" ? (
        <div className="pointer-events-none absolute inset-[10%_14%_40%] opacity-80">
          <span className="absolute left-[20%] top-[16%] h-3 w-8 rounded-full bg-white/70 blur-[1px]" />
          <span className="absolute right-[24%] top-[10%] h-2.5 w-10 rounded-full bg-white/60 blur-[1px]" />
          <span className="absolute left-[48%] top-[6%] h-2 w-7 rounded-full bg-white/75 blur-[1px]" />
        </div>
      ) : null}
    </div>
  );
}
