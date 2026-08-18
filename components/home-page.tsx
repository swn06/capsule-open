"use client";

import Link from "next/link";
import { CapsuleDashboard } from "@/components/capsule-dashboard";
import { useSeasonTheme } from "@/components/season-shell";
import { useAuth } from "@/lib/use-auth";
import { useCapsuleCount } from "@/lib/use-capsule-count";
import { useLiveWeather } from "@/lib/use-live-weather";
import { formatTemperature, weatherEmoji } from "@/lib/weather";

export function HomePage() {
  const { user, ready } = useAuth();
  const capsuleCount = useCapsuleCount();
  const theme = useSeasonTheme();
  const { weather } = useLiveWeather();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs tracking-[0.22em] text-stone-500">
          {theme.emoji} {theme.label}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-stone-800 sm:text-5xl">
          기억의 나무
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed tracking-wide text-stone-600 sm:text-base">
          {theme.greeting}
        </p>
        {weather ? (
          <p className="mt-3 rounded-full bg-white/60 px-4 py-1.5 text-sm tracking-wide text-stone-600 backdrop-blur-sm">
            {weatherEmoji(weather.condition)} {weather.condition} {formatTemperature(weather.temperature)}°
            {weather.location ? ` · ${weather.location}` : ""}
          </p>
        ) : null}
        {ready && !user ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            {capsuleCount === null ? (
              <div className="h-10 w-40 animate-pulse rounded-full bg-white/50" />
            ) : (
              <p className="text-sm tracking-wide text-stone-500">
                {capsuleCount === 0
                  ? "아직 묻힌 캡슐이 없어요."
                  : `지금까지 ${capsuleCount.toLocaleString("ko-KR")}개의 기억이 이 나무 아래 있어요`}
              </p>
            )}
            <Link
              href="/new"
              className="season-cta inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm tracking-wide transition-colors"
            >
              나도 캡슐 묻기
            </Link>
          </div>
        ) : null}
      </div>
      <CapsuleDashboard />
    </div>
  );
}
