"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchWeatherSnapshot, getBrowserCoords, type CapsuleWeather } from "@/lib/weather";

const REFRESH_MS = 10 * 60 * 1000;
const STALE_MS = 2 * 60 * 1000;

export type LiveWeather = {
  weather: CapsuleWeather | null;
  status: "loading" | "ready" | "error";
  locating: boolean;
  usingFallback: boolean;
  refresh: () => void;
};

const LiveWeatherContext = createContext<LiveWeather | null>(null);

function useLiveWeatherState(): LiveWeather {
  const [weather, setWeather] = useState<CapsuleWeather | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [locating, setLocating] = useState(true);
  const [usingFallback, setUsingFallback] = useState(true);
  const lastFetchedAt = useRef(0);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const weatherRef = useRef<CapsuleWeather | null>(null);
  const requestId = useRef(0);

  const loadWeather = useCallback(
    async (coords: { lat: number; lng: number } | null, fallback: boolean) => {
      const id = ++requestId.current;
      const snapshot = await fetchWeatherSnapshot(coords);
      if (id !== requestId.current) {
        return;
      }
      if (!snapshot) {
        setStatus((current) => (current === "ready" ? current : "error"));
        return;
      }
      weatherRef.current = snapshot;
      setWeather(snapshot);
      setUsingFallback(fallback);
      setStatus("ready");
      lastFetchedAt.current = Date.now();
    },
    [],
  );

  const refresh = useCallback(
    async (force = false) => {
      if (!force && Date.now() - lastFetchedAt.current < STALE_MS && weatherRef.current) {
        return;
      }

      const coords = coordsRef.current ?? (await getBrowserCoords());
      if (coords) {
        coordsRef.current = coords;
        setLocating(false);
        await loadWeather(coords, false);
        return;
      }

      setLocating(false);
      await loadWeather(null, true);
    },
    [loadWeather],
  );

  useEffect(() => {
    let cancelled = false;

    async function start() {
      void loadWeather(null, true);

      const coords = await getBrowserCoords();
      if (cancelled) {
        return;
      }
      if (!coords) {
        setLocating(false);
        return;
      }
      coordsRef.current = coords;
      await loadWeather(coords, false);
      if (!cancelled) {
        setLocating(false);
      }
    }

    void start();

    const timer = window.setInterval(() => {
      void refresh(true);
    }, REFRESH_MS);

    function onVisible() {
      if (document.visibilityState === "visible") {
        void refresh(false);
      }
    }

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadWeather, refresh]);

  return {
    weather,
    status,
    locating,
    usingFallback,
    refresh: () => {
      void refresh(true);
    },
  };
}

export function LiveWeatherProvider({ children }: { children: ReactNode }) {
  const value = useLiveWeatherState();
  return (
    <LiveWeatherContext.Provider value={value}>{children}</LiveWeatherContext.Provider>
  );
}

export function useLiveWeather(): LiveWeather {
  const fromContext = useContext(LiveWeatherContext);
  if (!fromContext) {
    throw new Error("useLiveWeather must be used within LiveWeatherProvider");
  }
  return fromContext;
}
