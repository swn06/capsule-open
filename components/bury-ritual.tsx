"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CapsuleFigure } from "@/components/capsule-figure";
import { MemoryTree } from "@/components/memory-tree";
import type { CapsuleMood } from "@/lib/mood";
import type { TreeSeason } from "@/lib/season-theme";

type Phase = "paper" | "seal" | "fly" | "bury" | "rest";

export function BuryRitual({
  capsuleId,
  mood,
  season,
  letter,
  onAgain,
}: {
  capsuleId: string;
  mood?: CapsuleMood | null;
  season: TreeSeason;
  letter: string;
  onAgain: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("paper");

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase("seal"), 900),
      window.setTimeout(() => setPhase("fly"), 1700),
      window.setTimeout(() => setPhase("bury"), 2800),
      window.setTimeout(() => setPhase("rest"), 4000),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div className="relative flex min-h-[70vh] flex-1 flex-col overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute inset-x-[6%] bottom-0 top-8">
        <MemoryTree season={season} />
      </div>

      {phase === "paper" || phase === "seal" ? (
        <div className="relative z-10 mx-auto mt-10 w-full max-w-md">
          <div
            className="rounded-2xl border border-amber-100 bg-amber-50 px-6 py-8 shadow-lg"
            style={{
              animation: phase === "seal" ? "paper-fold 0.8s ease-in forwards" : undefined,
            }}
          >
            <p className="text-xs tracking-[0.18em] text-stone-400">편지</p>
            <p className="mt-3 max-h-40 overflow-hidden font-serif text-lg leading-relaxed text-stone-700">
              {letter.trim() || "오늘의 마음을 담았어요."}
            </p>
          </div>
        </div>
      ) : null}

      {phase === "seal" || phase === "fly" || phase === "bury" ? (
        <div
          className="absolute left-1/2 top-[38%] z-20"
          style={{
            animation:
              phase === "seal"
                ? "capsule-pop 0.6s ease-out both"
                : phase === "fly"
                  ? "bury-fly 1.1s ease-in forwards"
                  : "bury-sink 1.2s ease-in forwards",
          }}
        >
          <CapsuleFigure mood={mood} size="lg" sealed dirty={phase === "bury" ? 0.85 : 0.2} />
        </div>
      ) : null}

      {phase === "seal" ? (
        <div className="pointer-events-none absolute inset-0 z-30 bg-white" style={{ animation: "flash-pop 0.45s ease-out both" }} />
      ) : null}

      {phase === "bury" ? (
        <div
          className="absolute left-1/2 top-[72%] z-20 h-16 w-16 -translate-x-1/2 rounded-full bg-amber-800/40"
          style={{ animation: "dirt-burst 0.9s ease-out forwards" }}
        />
      ) : null}

      {phase === "rest" ? (
        <div className="relative z-20 mx-auto mt-8 w-full max-w-md rounded-3xl bg-white/80 px-8 py-10 text-center shadow-xl backdrop-blur-sm">
          <p className="text-sm tracking-wide text-stone-500">나무 아래에 묻었어요</p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-stone-800">
            기억이 뿌리 곁에 있어요
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            열람일이 가까워지면 흙을 밀고 유리병이 올라올 거예요.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full bg-stone-800 px-8 py-3.5 text-sm tracking-wide text-amber-50 hover:bg-stone-700"
            >
              나무 보러 가기
            </Link>
            <Link
              href={`/capsule/${capsuleId}`}
              className="text-sm text-stone-400 underline-offset-4 hover:underline"
            >
              이 캡슐 열기
            </Link>
            <button
              type="button"
              onClick={onAgain}
              className="text-sm text-stone-400 underline-offset-4 hover:underline"
            >
              다른 캡슐 묻기
            </button>
          </div>
        </div>
      ) : (
        <p className="relative z-10 mt-auto pb-6 text-center text-sm tracking-wide text-stone-600">
          {phase === "paper"
            ? "종이가 캡슐 안으로 접혀 들어가요"
            : phase === "seal"
              ? "뚜껑이 닫히고 봉인돼요"
              : phase === "fly"
                ? "나무 아래를 찾아 내려가요"
                : "흙이 기억을 덮어요"}
        </p>
      )}
    </div>
  );
}
