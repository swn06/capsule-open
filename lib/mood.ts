import type { CapsuleWeather } from "@/lib/weather";
import { formatWeatherSummary } from "@/lib/weather";

export const CAPSULE_SHAPES = [
  "sun",
  "cloud",
  "rain",
  "snow",
  "mist",
  "heat",
  "storm",
] as const;

export const CAPSULE_VESSELS = [
  "bottle",
  "orb",
  "acorn",
  "lantern",
  "seed",
  "bell",
] as const;

export const CAPSULE_ORNAMENTS = [
  "ribbon",
  "wax",
  "vine",
  "star",
  "dew",
  "frost",
] as const;

export type CapsuleShape = (typeof CAPSULE_SHAPES)[number];
export type CapsuleVessel = (typeof CAPSULE_VESSELS)[number];
export type CapsuleOrnament = (typeof CAPSULE_ORNAMENTS)[number];

export type CapsuleMood = {
  phrase: string;
  keywords: string[];
  shape: CapsuleShape;
  vessel: CapsuleVessel;
  ornament: CapsuleOrnament;
  colors: {
    from: string;
    to: string;
    accent: string;
  };
};

const HEX = /^#([0-9a-fA-F]{6})$/;

const WEATHER_LOOK: Record<
  string,
  {
    shape: CapsuleShape;
    vessel: CapsuleVessel;
    ornament: CapsuleOrnament;
    colors: CapsuleMood["colors"];
    phrase: string;
    keywords: string[];
  }
> = {
  맑음: {
    shape: "sun",
    vessel: "bottle",
    ornament: "star",
    colors: { from: "#FDE68A", to: "#F59E0B", accent: "#B45309" },
    phrase: "볕이 캡슐 속에 오래 머물렀던 날.",
    keywords: ["햇살", "따뜻함"],
  },
  구름많음: {
    shape: "cloud",
    vessel: "seed",
    ornament: "ribbon",
    colors: { from: "#E2E8F0", to: "#94A3B8", accent: "#475569" },
    phrase: "구름 사이로 마음이 잠시 걸음을 멈춘 날.",
    keywords: ["구름", "여백"],
  },
  흐림: {
    shape: "mist",
    vessel: "orb",
    ornament: "dew",
    colors: { from: "#CBD5E1", to: "#64748B", accent: "#334155" },
    phrase: "하늘이 낮게 내려앉아 목소리가 부드러워진 날.",
    keywords: ["흐림", "고요"],
  },
  비: {
    shape: "rain",
    vessel: "bottle",
    ornament: "dew",
    colors: { from: "#BFDBFE", to: "#2563EB", accent: "#1E3A8A" },
    phrase: "창문에 빗금이 그어지던, 축축한 기억.",
    keywords: ["비", "창가"],
  },
  빗방울: {
    shape: "rain",
    vessel: "seed",
    ornament: "dew",
    colors: { from: "#C7D2FE", to: "#4F46E5", accent: "#312E81" },
    phrase: "아직 내리진 않고, 곧 내릴 것 같던 공기.",
    keywords: ["이슬", "예감"],
  },
  눈: {
    shape: "snow",
    vessel: "orb",
    ornament: "frost",
    colors: { from: "#F8FAFC", to: "#7DD3FC", accent: "#0369A1" },
    phrase: "세상이 잠시 하얗게 숨을 고르던 날.",
    keywords: ["눈", "정적"],
  },
  "비/눈": {
    shape: "storm",
    vessel: "bell",
    ornament: "vine",
    colors: { from: "#E2E8F0", to: "#64748B", accent: "#0F172A" },
    phrase: "비와 눈이 섞여, 계절이 결정을 미룬 날.",
    keywords: ["환절기", "섞임"],
  },
};

function defaultLook(weather: CapsuleWeather | null | undefined): CapsuleMood {
  const condition = weather?.condition ?? "맑음";
  const hot = (weather?.temperature ?? 20) >= 28;
  const humid = (weather?.humidity ?? 50) >= 75;
  const base =
    WEATHER_LOOK[condition] ??
    (condition.includes("눈")
      ? WEATHER_LOOK.눈
      : condition.includes("비")
        ? WEATHER_LOOK.비
        : WEATHER_LOOK.맑음);

  if (hot && !condition.includes("비") && !condition.includes("눈")) {
    return {
      phrase: "공기가 달궈진 오후, 기억이 천천히 익던 날.",
      keywords: ["더위", "여름"],
      shape: "heat",
      vessel: "lantern",
      ornament: "star",
      colors: { from: "#FED7AA", to: "#EA580C", accent: "#9A3412" },
    };
  }

  if (humid && base.shape === "cloud") {
    return {
      ...base,
      shape: "mist",
      vessel: "orb",
      ornament: "dew",
      phrase: "습기가 옷깃에 붙듯, 마음도 조금 무거웠던 날.",
      keywords: ["습기", "나른함"],
    };
  }

  return {
    phrase: base.phrase,
    keywords: [...base.keywords],
    shape: base.shape,
    vessel: base.vessel,
    ornament: base.ornament,
    colors: { ...base.colors },
  };
}

function asShape(value: unknown): CapsuleShape | null {
  return typeof value === "string" && CAPSULE_SHAPES.includes(value as CapsuleShape)
    ? (value as CapsuleShape)
    : null;
}

function asHex(value: unknown, fallback: string) {
  return typeof value === "string" && HEX.test(value) ? value : fallback;
}

function cleanKeyword(value: string) {
  return value.replace(/^#+/, "").replace(/\s+/g, " ").trim().slice(0, 12);
}

function asVessel(value: unknown): CapsuleVessel | null {
  return typeof value === "string" && CAPSULE_VESSELS.includes(value as CapsuleVessel)
    ? (value as CapsuleVessel)
    : null;
}

function asOrnament(value: unknown): CapsuleOrnament | null {
  return typeof value === "string" && CAPSULE_ORNAMENTS.includes(value as CapsuleOrnament)
    ? (value as CapsuleOrnament)
    : null;
}

export function normalizeMood(
  raw: unknown,
  weather: CapsuleWeather | null | undefined,
): CapsuleMood {
  const fallback = defaultLook(weather);
  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const data = raw as Record<string, unknown>;
  const colors = (data.colors ?? {}) as Record<string, unknown>;
  const keywords = Array.isArray(data.keywords)
    ? data.keywords
        .filter((item): item is string => typeof item === "string")
        .map(cleanKeyword)
        .filter(Boolean)
        .slice(0, 4)
    : [];

  const phrase =
    typeof data.phrase === "string" ? data.phrase.trim().slice(0, 80) : "";

  return {
    phrase: phrase || fallback.phrase,
    keywords: keywords.length > 0 ? keywords : fallback.keywords,
    shape: asShape(data.shape) ?? fallback.shape,
    vessel: asVessel(data.vessel) ?? fallback.vessel,
    ornament: asOrnament(data.ornament) ?? fallback.ornament,
    colors: {
      from: asHex(colors.from, fallback.colors.from),
      to: asHex(colors.to, fallback.colors.to),
      accent: asHex(colors.accent, fallback.colors.accent),
    },
  };
}

export function weatherPromptLines(weather: CapsuleWeather | null | undefined) {
  if (!weather) {
    return "날씨 정보 없음";
  }
  return [
    formatWeatherSummary(weather),
    `하늘: ${weather.sky || weather.condition}`,
    `강수: ${weather.precipitation}`,
    weather.windSpeed !== null ? `풍속: ${weather.windSpeed} m/s` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function fetchCapsuleMood(input: {
  weather: CapsuleWeather | null;
  letter: string;
  to: string;
}): Promise<CapsuleMood | null> {
  try {
    const response = await fetch("/api/capsule-mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weather: input.weather,
        letter: input.letter,
        to: input.to,
      }),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as CapsuleMood;
  } catch (error) {
    console.error(error);
    return null;
  }
}
