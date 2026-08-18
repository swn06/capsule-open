export type CapsuleWeather = {
  condition: string;
  temperature: number;
  humidity: number;
  precipitation: string;
  sky: string;
  windSpeed: number | null;
  observedAt: string;
  location?: string;
};

export const DEFAULT_WEATHER_COORDS = {
  lat: 37.5665,
  lng: 126.978,
};

const PTY_LABELS: Record<string, string> = {
  "0": "없음",
  "1": "비",
  "2": "비/눈",
  "3": "눈",
  "5": "빗방울",
  "6": "빗방울/눈날림",
  "7": "눈날림",
};

const SKY_LABELS: Record<string, string> = {
  "1": "맑음",
  "3": "구름많음",
  "4": "흐림",
};

export function precipitationLabel(code: string | undefined) {
  if (!code) {
    return "없음";
  }
  return PTY_LABELS[code] ?? "없음";
}

export function skyLabel(code: string | undefined) {
  if (!code) {
    return "";
  }
  return SKY_LABELS[code] ?? "";
}

export function weatherCondition(pty: string | undefined, sky: string | undefined) {
  const precipitation = precipitationLabel(pty);
  if (precipitation !== "없음") {
    return precipitation;
  }
  return skyLabel(sky) || "맑음";
}

export function weatherEmoji(condition: string | undefined) {
  if (!condition) {
    return "🌤️";
  }
  if (condition.includes("눈")) {
    return "❄️";
  }
  if (condition.includes("비")) {
    return "🌧️";
  }
  if (condition === "흐림") {
    return "☁️";
  }
  if (condition === "구름많음") {
    return "⛅";
  }
  return "☀️";
}

export function formatTemperature(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

export function formatWeatherSummary(weather: CapsuleWeather | null | undefined) {
  if (!weather) {
    return "";
  }
  const place = weather.location ? ` · ${weather.location}` : "";
  return `${weather.condition} · ${formatTemperature(weather.temperature)}°C · 습도 ${weather.humidity}%${place}`;
}

export function formatWindSpeed(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "";
  }
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  return `${rounded}m/s`;
}

export function formatObservedAt(value: string | undefined) {
  if (!value || value.length < 10) {
    return "";
  }
  const hour = Number(value.slice(8, 10));
  if (!Number.isFinite(hour)) {
    return "";
  }
  return `${hour}시 하늘`;
}

export function getBrowserCoords(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), 5000);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timer);
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        window.clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 4500 },
    );
  });
}

export async function fetchWeatherSnapshot(
  coords: { lat: number; lng: number } | null,
): Promise<CapsuleWeather | null> {
  try {
    const params = new URLSearchParams();
    if (coords) {
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
    }
    const query = params.toString();
    const response = await fetch(query ? `/api/weather?${query}` : "/api/weather");
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as CapsuleWeather;
  } catch (error) {
    console.error(error);
    return null;
  }
}
