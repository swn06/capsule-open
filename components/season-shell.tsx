"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { WeatherBackdrop } from "@/components/weather-backdrop";
import {
  FALLBACK_THEME,
  resolveSeasonTheme,
  seasonCssVars,
  type SeasonTheme,
} from "@/lib/season-theme";
import { LiveWeatherProvider, useLiveWeather } from "@/lib/use-live-weather";

type SeasonContextValue = {
  theme: SeasonTheme;
};

const SeasonThemeContext = createContext<SeasonContextValue>({
  theme: FALLBACK_THEME,
});

export function useSeasonTheme() {
  return useContext(SeasonThemeContext).theme;
}

export function SeasonShell({ children }: { children: ReactNode }) {
  return (
    <LiveWeatherProvider>
      <SeasonCanvas>{children}</SeasonCanvas>
    </LiveWeatherProvider>
  );
}

function SeasonCanvas({ children }: { children: ReactNode }) {
  const { weather } = useLiveWeather();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const theme = useMemo(
    () => resolveSeasonTheme(new Date(now), weather),
    [now, weather],
  );

  return (
    <SeasonThemeContext.Provider value={{ theme }}>
      <div
        className="relative flex min-h-full flex-1 flex-col transition-colors duration-700"
        data-season={theme.id}
        style={seasonCssVars(theme)}
        suppressHydrationWarning
      >
        <WeatherBackdrop weather={weather} theme={theme} />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
      </div>
    </SeasonThemeContext.Provider>
  );
}
