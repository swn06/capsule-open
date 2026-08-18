"use client";

import { koreaDateParts, weatherMotion, type SeasonTheme } from "@/lib/season-theme";
import type { CapsuleWeather } from "@/lib/weather";

export function WeatherBackdrop({
  weather,
  theme,
}: {
  weather: CapsuleWeather | null;
  theme: SeasonTheme;
}) {
  const motion = weatherMotion(weather);
  const hour = koreaDateParts().hour;
  const night = hour < 6 || hour >= 19;
  const particles = Array.from({ length: 16 }, (_, index) => index);
  const festiveSnow = theme.particle === "snow" && motion !== "snow";
  const showSun =
    (motion === "sun" || motion === "heat") &&
    theme.particle !== "snow" &&
    theme.motif !== "moon";

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: night
            ? `linear-gradient(180deg, #0f172a 0%, ${theme.palette.via} 58%, ${theme.palette.to} 100%)`
            : `linear-gradient(180deg, ${theme.palette.from} 0%, ${theme.palette.via} 48%, ${theme.palette.to} 100%)`,
        }}
      />

      {theme.motif === "moon" ? (
        <>
          <div
            className="absolute -top-[8%] right-[-6%] h-72 w-72 rounded-full"
            style={{ background: `radial-gradient(circle, ${theme.palette.glow}, transparent 68%)` }}
          />
          <div
            className="absolute top-[7%] right-[9%] h-[118px] w-[118px] rounded-full opacity-80"
            style={{
              background: "radial-gradient(circle at 34% 32%, #fffaf0, #f5d76e 62%, #e8b84a)",
              boxShadow: "0 0 60px 18px rgba(253, 224, 71, 0.28)",
            }}
          />
        </>
      ) : null}

      {theme.motif === "glow" || theme.motif === "lantern" || theme.motif === "blossom" ? (
        <div
          className="absolute -top-[18%] left-1/2 h-[42%] w-[90%] -translate-x-1/2"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.palette.glow}, transparent 70%)`,
          }}
        />
      ) : null}

      {showSun ? (
        <div
          className="absolute -top-24 right-[12%] h-72 w-72 rounded-full blur-2xl"
          style={{
            background: motion === "heat" ? "#fb923c" : "#fde68a",
            animation: "sun-breathe 6s ease-in-out infinite",
          }}
        />
      ) : null}

      {motion === "cloud" || motion === "mist" || motion === "storm" ? (
        <>
          <div
            className="absolute top-[8%] left-[-10%] h-28 w-[48%] rounded-[100%] bg-white/50 blur-2xl"
            style={{ animation: "cloud-drift 18s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute top-[16%] right-[-8%] h-24 w-[42%] rounded-[100%] bg-white/40 blur-2xl"
            style={{ animation: "cloud-drift 22s ease-in-out infinite alternate-reverse" }}
          />
        </>
      ) : null}

      {motion === "mist" ? (
        <div
          className="absolute bottom-[18%] left-[-10%] h-32 w-[120%] rounded-[100%] bg-slate-200/70 blur-3xl"
          style={{ animation: "mist-roll 10s ease-in-out infinite" }}
        />
      ) : null}

      {motion === "rain" ? <div className="weather-rain absolute inset-0 opacity-80" /> : null}
      {motion === "storm" ? <div className="weather-storm absolute inset-0 opacity-90" /> : null}
      {motion === "snow" || festiveSnow ? (
        <div className="weather-snow absolute inset-0 opacity-90" />
      ) : null}

      {motion === "heat"
        ? particles.map((index) => (
            <div
              key={index}
              className="absolute bottom-[20%] h-16 w-1 rounded-full bg-orange-300/40"
              style={{
                left: `${8 + index * 6.5}%`,
                animation: `heat-rise ${2.4 + (index % 4) * 0.4}s ease-in infinite`,
                animationDelay: `${index * 0.18}s`,
              }}
            />
          ))
        : null}

      {theme.particle === "petals"
        ? particles.map((index) => (
            <span
              key={`petal-${index}`}
              className="absolute top-[-10%] h-3 w-2 rounded-full bg-pink-300/80"
              style={{
                left: `${(index * 7.1) % 100}%`,
                animation: `petal-fall ${7 + (index % 5)}s linear infinite`,
                animationDelay: `${index * 0.4}s`,
              }}
            />
          ))
        : null}

      {theme.particle === "leaves"
        ? particles.slice(0, 12).map((index) => (
            <span
              key={`leaf-${index}`}
              className="absolute top-[-8%] h-3 w-2 rotate-12 rounded-sm"
              style={{
                left: `${(index * 9.3) % 100}%`,
                background: index % 3 === 0 ? "#ca8a04" : index % 3 === 1 ? "#c2410c" : "#d97706",
                animation: `leaf-fall ${8 + (index % 4)}s linear infinite`,
                animationDelay: `${index * 0.5}s`,
              }}
            />
          ))
        : null}

      {theme.particle === "lanterns"
        ? particles.slice(0, 10).map((index) => (
            <span
              key={`lantern-${index}`}
              className="absolute bottom-[-8%] h-3.5 w-2.5 rounded-sm"
              style={{
                left: `${(index * 11 + 6) % 100}%`,
                background: "linear-gradient(180deg, #fde68a, #d97706)",
                boxShadow: "0 0 10px rgba(251, 191, 36, 0.7)",
                animation: `lantern-rise ${10 + (index % 5)}s linear infinite`,
                animationDelay: `${index * 0.7}s`,
              }}
            />
          ))
        : null}

      {theme.particle === "sparkles"
        ? particles.map((index) => (
            <span
              key={`sparkle-${index}`}
              className="absolute h-1.5 w-1.5 rounded-full bg-amber-100"
              style={{
                left: `${(index * 13 + 4) % 100}%`,
                top: `${8 + ((index * 17) % 70)}%`,
                boxShadow: "0 0 8px rgba(253, 224, 71, 0.9)",
                animation: `sparkle-twinkle ${2.4 + (index % 4) * 0.4}s ease-in-out infinite`,
                animationDelay: `${index * 0.18}s`,
              }}
            />
          ))
        : null}

      {night ? <div className="absolute inset-0 bg-slate-950/25" /> : null}
    </div>
  );
}
