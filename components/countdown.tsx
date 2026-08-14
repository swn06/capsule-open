"use client";

import { formatDday, formatRemaining, isCapsuleOpen, toMillis } from "@/lib/capsule";
import type { Timestamp } from "firebase/firestore";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getCountdownParts(openAt: Timestamp | undefined, now: number) {
  const ms = toMillis(openAt);
  if (ms === null) {
    return null;
  }

  const remaining = Math.max(0, ms - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, remaining };
}

export function Countdown({
  openAt,
  now,
  size = "sm",
}: {
  openAt: Timestamp | undefined;
  now: number;
  size?: "sm" | "lg";
}) {
  const open = isCapsuleOpen(openAt, now);
  const parts = getCountdownParts(openAt, now);

  if (size === "lg" && parts && !open) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <CountdownUnit label="일" value={parts.days} />
          <CountdownUnit label="시" value={parts.hours} />
          <CountdownUnit label="분" value={parts.minutes} />
          <CountdownUnit label="초" value={parts.seconds} />
        </div>
        <p className="text-sm tracking-wide text-stone-500">
          {formatDday(openAt, now)} · {formatRemaining(openAt, now)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p
        className={
          open
            ? "text-sm tracking-wide text-emerald-700"
            : "font-mono text-sm tabular-nums tracking-wide text-stone-700"
        }
      >
        {open ? "지금 열 수 있어요" : formatRemaining(openAt, now)}
      </p>
      <p className="text-xs tracking-wide text-stone-400">{formatDday(openAt, now)}</p>
    </div>
  );
}

function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[3.5rem] flex-col items-center rounded-2xl border border-amber-100 bg-white/90 px-3 py-4 shadow-sm">
      <span className="font-mono text-2xl tabular-nums tracking-tight text-stone-800 sm:text-3xl">
        {pad(value)}
      </span>
      <span className="mt-1 text-xs tracking-wide text-stone-400">{label}</span>
    </div>
  );
}
