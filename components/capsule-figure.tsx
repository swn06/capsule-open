"use client";

import { useId } from "react";
import type { CapsuleMood } from "@/lib/mood";

const SIZE = {
  xs: "h-14 w-9",
  sm: "h-[4.75rem] w-11",
  md: "h-32 w-[4.25rem]",
  lg: "h-44 w-24",
};

function mixHex(hex: string, fallback: string) {
  return /^#([0-9a-fA-F]{6})$/.test(hex) ? hex : fallback;
}

export function CapsuleFigure({
  mood,
  size = "md",
  sealed = false,
  dirty = 0,
}: {
  mood?: CapsuleMood | null;
  size?: "xs" | "sm" | "md" | "lg";
  sealed?: boolean;
  dirty?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const from = mixHex(mood?.colors.from ?? "#F9A8D4", "#F9A8D4");
  const to = mixHex(mood?.colors.to ?? "#F472B6", "#F472B6");
  const accent = mixHex(mood?.colors.accent ?? "#BE185D", "#BE185D");
  const paperId = `paper-${uid}`;
  const glassId = `glass-${uid}`;
  const bodyClip = `body-${uid}`;
  const dirt = Math.max(0, Math.min(1, dirty));
  const shred = dirt > 0.55 ? "#d946ef" : "#a3e635";

  return (
    <span className={`relative inline-flex shrink-0 items-end justify-center ${SIZE[size]}`}>
      <svg viewBox="0 0 100 160" className="relative h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={paperId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <linearGradient id={glassId} x1="12%" y1="0%" x2="88%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="38%" stopColor="#e0f2fe" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.22" />
          </linearGradient>
          <clipPath id={bodyClip}>
            <rect x="30" y="38" width="40" height="106" rx="10" />
          </clipPath>
        </defs>

        <ellipse cx="50" cy="150" rx="20" ry="4.5" fill="#5c4033" opacity="0.18" />

        <rect x="30" y="38" width="40" height="106" rx="10" fill="#f8fafc" fillOpacity="0.28" />
        <rect x="30" y="38" width="40" height="106" rx="10" fill={`url(#${glassId})`} />
        <rect
          x="30"
          y="38"
          width="40"
          height="106"
          rx="10"
          fill="none"
          stroke="#94a3b8"
          strokeOpacity="0.55"
          strokeWidth="1.4"
        />

        <g clipPath={`url(#${bodyClip})`}>
          <path d="M32 128 L38 144 L44 130 L50 146 L56 129 L64 144 L68 132 L70 146 L32 146 Z" fill={shred} opacity="0.9" />
          <path d="M34 134 L40 145 L46 136 L52 145 L60 133" fill={from} opacity="0.55" />
          <rect x="39" y="54" width="22" height="72" rx="8" fill={`url(#${paperId})`} />
          <rect x="41" y="56" width="6" height="68" rx="2" fill="#fff" opacity="0.22" />
          <ellipse cx="50" cy="54" rx="11" ry="6" fill={from} />
          <ellipse cx="50" cy="54" rx="7" ry="3.4" fill={to} opacity="0.7" />
          <path d="M39 92 H61" stroke="#1c1917" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M39 95 H61" stroke="#1c1917" strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
        </g>

        <rect x="30" y="38" width="40" height="106" rx="10" fill={`url(#${glassId})`} />
        <rect
          x="30"
          y="38"
          width="40"
          height="106"
          rx="10"
          fill="none"
          stroke="#64748b"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />

        <path
          d="M36 50 C37 76 37 108 36 132"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M64 62 C63 88 63 116 62 134"
          fill="none"
          stroke="#fff"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.2"
        />

        {dirt > 0.04 ? (
          <g clipPath={`url(#${bodyClip})`} opacity={0.28 + dirt * 0.55}>
            <ellipse cx="42" cy="124" rx="14" ry="11" fill="#6b4423" />
            <ellipse cx="58" cy="134" rx="12" ry="8" fill="#7c5a3b" />
            <path d="M32 104 C40 98 44 114 36 124 C30 130 28 110 32 104Z" fill="#5c4033" />
            <path d="M56 88 C64 84 68 100 60 108 C54 114 50 94 56 88Z" fill="#8b5e3c" opacity="0.85" />
            <circle cx="38" cy="114" r="2.1" fill="#3f2a1d" />
            <circle cx="62" cy="120" r="1.6" fill="#3f2a1d" />
            <circle cx="46" cy="138" r="1.8" fill="#4a3424" />
            {dirt > 0.45 ? (
              <>
                <path d="M34 74 C42 70 46 84 38 90 C32 94 30 78 34 74Z" fill="#6b4423" opacity="0.75" />
                <ellipse cx="64" cy="104" rx="6" ry="9" fill="#5c4033" opacity="0.7" />
              </>
            ) : null}
          </g>
        ) : null}

        <rect x="36" y="32" width="28" height="10" rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" />
        <path
          d="M34 38 C42 34 58 42 66 37 C58 44 42 36 34 38Z"
          fill="#c4a574"
          stroke="#9a7b4f"
          strokeWidth="0.7"
        />
        <path d="M36 39 C44 37 56 41 64 38" fill="none" stroke="#7c5c38" strokeWidth="0.6" opacity="0.7" />

        <path d="M64 39 C70 46 72 52 74 58" fill="none" stroke="#c4a574" strokeWidth="1.1" />
        <g transform="translate(68 54) rotate(8)">
          <rect x="0" y="0" width="26" height="38" rx="1.5" fill="#e8d5b5" stroke="#c4a574" strokeWidth="0.7" />
          <circle cx="13" cy="4" r="1.2" fill="#d6c09a" />
          <text x="3.5" y="12" fontSize="4" fill="#8a6a3e" fontFamily="ui-sans-serif, system-ui">
            NAME
          </text>
          <path d="M3.5 14.5 H22.5" stroke="#b45309" strokeWidth="0.45" strokeDasharray="1.1 0.8" />
          <text x="3.5" y="24" fontSize="4" fill="#8a6a3e" fontFamily="ui-sans-serif, system-ui">
            DATE
          </text>
          <path d="M3.5 26.5 H22.5" stroke="#b45309" strokeWidth="0.45" strokeDasharray="1.1 0.8" />
          {sealed ? (
            <circle cx="13" cy="32.5" r="2" fill={accent} opacity="0.85" />
          ) : (
            <path d="M10 32.5 L12.2 34.5 L17 29.5" fill="none" stroke={accent} strokeWidth="1.1" strokeLinecap="round" />
          )}
        </g>

        <ellipse cx="50" cy="14" rx="20" ry="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
        <rect x="30" y="14" width="40" height="20" rx="4" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="0.8" />
        <g stroke="#cbd5e1" strokeWidth="1.35">
          <path d="M32 19 H68" />
          <path d="M32 23.5 H68" />
          <path d="M32 28 H68" />
        </g>
        <ellipse cx="50" cy="14" rx="20" ry="6" fill="#ffffff" />
        <ellipse cx="44" cy="12.5" rx="8" ry="2.2" fill="#fff" opacity="0.7" />
      </svg>
    </span>
  );
}
