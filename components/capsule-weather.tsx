"use client";

import {
  formatObservedAt,
  formatTemperature,
  formatWindSpeed,
  weatherEmoji,
  type CapsuleWeather,
} from "@/lib/weather";
import { useLiveWeather, type LiveWeather } from "@/lib/use-live-weather";

export function WeatherBadge({ weather }: { weather?: CapsuleWeather | null }) {
  if (!weather) {
    return null;
  }

  return (
    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs tracking-wide text-sky-800">
      {weatherEmoji(weather.condition)} {weather.condition} {formatTemperature(weather.temperature)}°
      {weather.location ? ` · ${weather.location}` : ""}
    </span>
  );
}

export function WeatherCard({ weather }: { weather?: CapsuleWeather | null }) {
  if (!weather) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-sky-100 bg-sky-50/70 px-6 py-6">
      <p className="text-xs tracking-[0.18em] text-sky-700/80">묻은 날의 하늘</p>
      <p className="mt-3 font-serif text-3xl tracking-tight text-stone-800">
        {weatherEmoji(weather.condition)} {weather.condition}
      </p>
      {weather.location ? (
        <p className="mt-2 text-sm tracking-wide text-sky-800/80">📍 {weather.location}</p>
      ) : null}
      <p className="mt-2 text-sm tracking-wide text-stone-600">
        {formatTemperature(weather.temperature)}°C · 습도 {weather.humidity}%
        {formatWindSpeed(weather.windSpeed) ? ` · 바람 ${formatWindSpeed(weather.windSpeed)}` : ""}
      </p>
    </section>
  );
}

export function LiveWeatherNow({
  compact = false,
  caption,
}: {
  compact?: boolean;
  caption?: string;
}) {
  const live = useLiveWeather();
  return <LiveWeatherPanel live={live} compact={compact} caption={caption} />;
}

export function LiveWeatherPanel({
  live,
  compact = false,
  caption,
}: {
  live: LiveWeather;
  compact?: boolean;
  caption?: string;
}) {
  const { weather, status, locating, usingFallback, refresh } = live;

  if (status === "loading" && !weather) {
    return (
      <section
        className={
          compact
            ? "h-28 animate-pulse rounded-3xl bg-sky-50/80"
            : "h-40 animate-pulse rounded-3xl bg-sky-50/80"
        }
        aria-hidden="true"
      />
    );
  }

  if (status === "error" && !weather) {
    return (
      <section className="rounded-3xl border border-dashed border-sky-200 bg-white/60 px-5 py-5 text-center">
        <p className="text-sm tracking-wide text-stone-500">지금 하늘을 아직 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-3 text-sm tracking-wide text-sky-700 underline-offset-4 hover:underline"
        >
          다시 불러오기
        </button>
      </section>
    );
  }

  if (!weather) {
    return null;
  }

  const place = locating
    ? "위치를 확인하는 중"
    : weather.location || (usingFallback ? "서울" : "현재 위치");
  const placeHint = locating
    ? "현재 위치를 찾고 있어요"
    : usingFallback
      ? "기본 위치 · 권한을 허용하면 지금 있는 곳 날씨를 보여 줘요"
      : "현재 위치";
  const details = [
    `습도 ${weather.humidity}%`,
    formatWindSpeed(weather.windSpeed) ? `바람 ${formatWindSpeed(weather.windSpeed)}` : "",
    weather.precipitation !== "없음" ? weather.precipitation : "",
  ].filter(Boolean);
  const observed = formatObservedAt(weather.observedAt);

  if (compact) {
    return (
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-amber-50/50 px-5 py-5">
        <p className="text-xs tracking-[0.18em] text-sky-700/80">
          {caption || "지금 이 순간의 하늘"}
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-serif text-3xl tracking-tight text-stone-800">
              {weatherEmoji(weather.condition)} {formatTemperature(weather.temperature)}°
            </p>
            <p className="mt-1 text-sm tracking-wide text-stone-600">{weather.condition}</p>
          </div>
          <div className="max-w-[55%] text-right">
            <p className="truncate text-sm tracking-wide text-sky-900">📍 {place}</p>
            <p className="mt-1 text-xs leading-relaxed tracking-wide text-stone-400">{placeHint}</p>
          </div>
        </div>
        <p className="mt-3 text-xs tracking-wide text-stone-500">
          {details.join(" · ")}
          {observed ? ` · ${observed}` : ""}
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-100/80 via-white to-amber-50/70 px-6 py-6 shadow-[0_18px_40px_-28px_rgba(56,117,160,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs tracking-[0.18em] text-sky-700/80">
          {caption || "지금 이 순간의 하늘"}
        </p>
        <p className="text-right text-xs tracking-wide text-sky-800/80">{placeHint}</p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-serif text-6xl leading-none tracking-tight text-stone-800">
            {formatTemperature(weather.temperature)}
            <span className="ml-1 text-3xl font-normal text-stone-500">°</span>
          </p>
          <p className="mt-3 text-lg tracking-wide text-stone-700">
            {weatherEmoji(weather.condition)} {weather.condition}
          </p>
        </div>
        <div className="max-w-[45%] text-right">
          <p className="text-sm tracking-wide text-sky-900">📍 {place}</p>
          {observed ? (
            <p className="mt-2 text-xs tracking-wide text-stone-400">{observed}</p>
          ) : null}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <WeatherStat label="습도" value={`${weather.humidity}%`} />
        {formatWindSpeed(weather.windSpeed) ? (
          <WeatherStat label="바람" value={formatWindSpeed(weather.windSpeed)} />
        ) : null}
        <WeatherStat
          label="강수"
          value={weather.precipitation === "없음" ? "없음" : weather.precipitation}
        />
      </dl>
    </section>
  );
}

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 px-3 py-2.5">
      <dt className="text-[11px] tracking-wide text-stone-400">{label}</dt>
      <dd className="mt-0.5 text-sm tracking-wide text-stone-700">{value}</dd>
    </div>
  );
}
