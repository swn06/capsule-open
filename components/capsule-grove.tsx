"use client";

import Link from "next/link";
import { CapsuleFigure } from "@/components/capsule-figure";
import { CapsuleSignpost } from "@/components/capsule-signpost";
import { MemoryTree } from "@/components/memory-tree";
import {
  capsuleEmergence,
  capsuleTitle,
  formatDday,
  isCapsuleOpen,
  seedFromId,
  type CapsuleListItem,
} from "@/lib/capsule";
import type { TreeSeason } from "@/lib/season-theme";

const HEIGHT = {
  xs: 56,
  sm: 76,
  md: 128,
};

function groveSpot(capsule: CapsuleListItem, now: number, layout: "float" | "buried") {
  const seed = seedFromId(capsule.id);
  const emerge = capsuleEmergence(capsule.openAt, now);
  const open = isCapsuleOpen(capsule.openAt, now);
  const x = 10 + (seed % 800) / 10;
  const drift = ((seed >> 8) % 14) - 7;
  const left = Math.min(88, Math.max(10, x + drift * 0.25));
  const floatY = 22 + (seed % 52);
  const buriedY = 5 + (seed % 16);
  const size: keyof typeof HEIGHT =
    layout === "float" || open || emerge > 0.78 ? "md" : emerge > 0.38 ? "sm" : "xs";

  return {
    left: `${left}%`,
    bottom: `${layout === "float" ? Math.min(74, Math.max(20, floatY)) : Math.min(24, Math.max(5, buriedY))}%`,
    z: layout === "float" ? 12 + (seed % 8) : 8 + Math.round(emerge * 8),
    emerge,
    open,
    size,
    delay: `${(seed % 18) / 10}s`,
    duration: `${3.6 + (seed % 14) / 10}s`,
    side: left < 50 ? "right" : "left",
  };
}

export function CapsuleGrove({
  capsules,
  now,
  season,
  emptyMessage,
  layout = "float",
}: {
  capsules: CapsuleListItem[];
  now: number;
  season: TreeSeason;
  emptyMessage?: string;
  layout?: "float" | "buried";
}) {
  return (
    <div className="relative h-[min(78vh,840px)] overflow-hidden rounded-[2.2rem] border border-white/40 bg-white/10 shadow-[0_30px_80px_-40px_rgba(28,25,23,0.45)]">
      <div className="pointer-events-none absolute inset-x-[4%] bottom-0 top-[2%]">
        <MemoryTree season={season} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 bg-gradient-to-t from-amber-900/25 via-stone-700/10 to-transparent" />

      {capsules.length === 0 ? (
        <div className="absolute inset-0 flex items-end justify-center pb-24">
          <p className="rounded-full bg-white/70 px-5 py-2 text-sm tracking-wide text-stone-600 backdrop-blur-sm">
            {emptyMessage || "이 나무 아래에 첫 기억을 묻어 보세요."}
          </p>
        </div>
      ) : (
        capsules.map((capsule) => {
          const spot = groveSpot(capsule, now, layout);
          const fullHeight = HEIGHT[spot.size];
          const visible =
            layout === "float"
              ? fullHeight
              : Math.max(20, Math.round(fullHeight * (0.16 + spot.emerge * 0.84)));
          const dirt = layout === "float" ? 0.08 : Math.max(0.22, 0.92 - spot.emerge * 0.45);

          return (
            <Link
              key={capsule.id}
              href={`/capsule/${capsule.id}`}
              className={`group absolute ${layout === "float" ? "float-bob" : "-translate-x-1/2"}`}
              style={{
                left: spot.left,
                bottom: spot.bottom,
                zIndex: spot.z,
                animationDelay: spot.delay,
                animationDuration: spot.duration,
              }}
              aria-label={`${capsuleTitle(capsule)} ${formatDday(capsule.openAt, now)}`}
            >
              {layout === "buried" ? (
                <span
                  className={`absolute bottom-[70%] z-20 block ${
                    spot.side === "left" ? "right-[58%]" : "left-[58%]"
                  }`}
                >
                  <CapsuleSignpost capsule={capsule} />
                </span>
              ) : null}

              <span className="relative flex flex-col items-center">
                <span
                  className="relative overflow-hidden"
                  style={{
                    height: visible,
                    width: spot.size === "md" ? 68 : spot.size === "sm" ? 44 : 36,
                  }}
                >
                  <span className="absolute top-0 left-1/2 -translate-x-1/2">
                    <CapsuleFigure
                      mood={capsule.mood}
                      size={spot.size}
                      sealed={!spot.open}
                      dirty={dirt}
                    />
                  </span>
                </span>
                {layout === "buried" ? (
                  <>
                    {spot.emerge < 0.6 ? (
                      <span className="absolute bottom-7 h-5 w-16 rounded-[100%] bg-[#6b4423]/45 blur-[1px]" />
                    ) : null}
                    <span className="relative z-10 -mt-2 h-3 w-14 rounded-[100%] bg-[#6b4423]/70 blur-[0.4px]" />
                    <span className="relative z-10 -mt-2 h-2 w-9 rounded-[100%] bg-[#4a3424]/55" />
                  </>
                ) : null}
                <span className="mt-1 rounded-full bg-white/80 px-2 py-0.5 text-center text-[10px] tracking-wide text-stone-600 shadow-sm backdrop-blur-sm">
                  {formatDday(capsule.openAt, now)}
                </span>
              </span>
            </Link>
          );
        })
      )}
    </div>
  );
}
