import type { CSSProperties } from "react";
import type { CapsuleWeather } from "@/lib/weather";

export type SeasonParticle =
  | "none"
  | "snow"
  | "rain"
  | "leaves"
  | "petals"
  | "lanterns"
  | "sparkles"
  | "heat";

export type SeasonMotif = "none" | "moon" | "glow" | "lantern" | "sun" | "blossom";

export type SeasonThemeId =
  | "christmas"
  | "newyear"
  | "seollal"
  | "valentine"
  | "cherry"
  | "childrens"
  | "buddha"
  | "monsoon"
  | "chuseok"
  | "halloween"
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "rain"
  | "snow"
  | "heat";

export type SeasonPalette = {
  from: string;
  via: string;
  to: string;
  header: string;
  headerBorder: string;
  card: string;
  border: string;
  button: string;
  buttonText: string;
  glow: string;
};

export type SeasonTheme = {
  id: SeasonThemeId;
  label: string;
  emoji: string;
  greeting: string;
  loginTitle: string;
  particle: SeasonParticle;
  motif: SeasonMotif;
  palette: SeasonPalette;
};

type SolarDate = { year: number; month: number; day: number };

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
};

const SEOLLAL: SolarDate[] = [
  { year: 2025, month: 1, day: 29 },
  { year: 2026, month: 2, day: 17 },
  { year: 2027, month: 2, day: 6 },
  { year: 2028, month: 1, day: 26 },
  { year: 2029, month: 2, day: 13 },
  { year: 2030, month: 2, day: 3 },
  { year: 2031, month: 1, day: 23 },
];

const CHUSEOK: SolarDate[] = [
  { year: 2025, month: 10, day: 6 },
  { year: 2026, month: 9, day: 25 },
  { year: 2027, month: 9, day: 15 },
  { year: 2028, month: 10, day: 3 },
  { year: 2029, month: 9, day: 22 },
  { year: 2030, month: 9, day: 12 },
  { year: 2031, month: 9, day: 1 },
];

const BUDDHA: SolarDate[] = [
  { year: 2025, month: 5, day: 5 },
  { year: 2026, month: 5, day: 24 },
  { year: 2027, month: 5, day: 13 },
  { year: 2028, month: 5, day: 2 },
  { year: 2029, month: 5, day: 20 },
  { year: 2030, month: 5, day: 9 },
  { year: 2031, month: 5, day: 28 },
];

const PALETTES = {
  christmas: {
    from: "#f6efe8",
    via: "#e7f1ea",
    to: "#f3e4dc",
    header: "rgba(255, 250, 246, 0.78)",
    headerBorder: "rgba(153, 27, 27, 0.14)",
    card: "rgba(255, 255, 255, 0.74)",
    border: "rgba(153, 27, 27, 0.12)",
    button: "#1f3d2b",
    buttonText: "#fef3c7",
    glow: "rgba(220, 38, 38, 0.16)",
  },
  newyear: {
    from: "#eef0fb",
    via: "#f8eeda",
    to: "#fde8ea",
    header: "rgba(255, 252, 248, 0.78)",
    headerBorder: "rgba(79, 70, 229, 0.14)",
    card: "rgba(255, 255, 255, 0.74)",
    border: "rgba(79, 70, 229, 0.12)",
    button: "#312e81",
    buttonText: "#fef3c7",
    glow: "rgba(251, 191, 36, 0.22)",
  },
  seollal: {
    from: "#fbeaea",
    via: "#f8efd8",
    to: "#f4e6d4",
    header: "rgba(255, 250, 246, 0.78)",
    headerBorder: "rgba(185, 28, 28, 0.14)",
    card: "rgba(255, 255, 255, 0.76)",
    border: "rgba(185, 28, 28, 0.12)",
    button: "#9f1239",
    buttonText: "#fff7ed",
    glow: "rgba(217, 119, 6, 0.18)",
  },
  valentine: {
    from: "#fde8ee",
    via: "#fff1f5",
    to: "#f8e7e0",
    header: "rgba(255, 250, 252, 0.8)",
    headerBorder: "rgba(190, 24, 93, 0.12)",
    card: "rgba(255, 255, 255, 0.76)",
    border: "rgba(190, 24, 93, 0.1)",
    button: "#9d174d",
    buttonText: "#fff1f2",
    glow: "rgba(244, 114, 182, 0.2)",
  },
  cherry: {
    from: "#fde8ef",
    via: "#fff7f8",
    to: "#f6efe6",
    header: "rgba(255, 252, 252, 0.78)",
    headerBorder: "rgba(244, 114, 182, 0.16)",
    card: "rgba(255, 255, 255, 0.74)",
    border: "rgba(244, 114, 182, 0.14)",
    button: "#9f1239",
    buttonText: "#fff7f9",
    glow: "rgba(251, 207, 232, 0.45)",
  },
  childrens: {
    from: "#e8f5ff",
    via: "#fff7d6",
    to: "#fde8ee",
    header: "rgba(255, 253, 248, 0.8)",
    headerBorder: "rgba(14, 165, 233, 0.14)",
    card: "rgba(255, 255, 255, 0.76)",
    border: "rgba(14, 165, 233, 0.12)",
    button: "#0369a1",
    buttonText: "#fefce8",
    glow: "rgba(250, 204, 21, 0.22)",
  },
  buddha: {
    from: "#f4efe4",
    via: "#f8e7c8",
    to: "#efe4d4",
    header: "rgba(255, 250, 240, 0.78)",
    headerBorder: "rgba(180, 83, 9, 0.14)",
    card: "rgba(255, 255, 255, 0.72)",
    border: "rgba(180, 83, 9, 0.12)",
    button: "#9a3412",
    buttonText: "#fff7ed",
    glow: "rgba(245, 158, 11, 0.28)",
  },
  monsoon: {
    from: "#dce7ef",
    via: "#e8eef4",
    to: "#d7e2ea",
    header: "rgba(248, 250, 252, 0.76)",
    headerBorder: "rgba(71, 85, 105, 0.14)",
    card: "rgba(255, 255, 255, 0.7)",
    border: "rgba(100, 116, 139, 0.14)",
    button: "#334155",
    buttonText: "#f8fafc",
    glow: "rgba(125, 211, 252, 0.18)",
  },
  chuseok: {
    from: "#f6ead2",
    via: "#f3d5a4",
    to: "#ead7b8",
    header: "rgba(255, 250, 240, 0.76)",
    headerBorder: "rgba(180, 83, 9, 0.16)",
    card: "rgba(255, 252, 245, 0.74)",
    border: "rgba(180, 83, 9, 0.14)",
    button: "#9a3412",
    buttonText: "#fff7ed",
    glow: "rgba(253, 224, 71, 0.35)",
  },
  halloween: {
    from: "#f6e6d4",
    via: "#efe4f5",
    to: "#ead9c8",
    header: "rgba(255, 250, 246, 0.78)",
    headerBorder: "rgba(124, 45, 18, 0.14)",
    card: "rgba(255, 255, 255, 0.72)",
    border: "rgba(124, 45, 18, 0.12)",
    button: "#7c2d12",
    buttonText: "#ffedd5",
    glow: "rgba(147, 51, 234, 0.14)",
  },
  spring: {
    from: "#eef8e9",
    via: "#f7f3e4",
    to: "#f3ead8",
    header: "rgba(255, 253, 248, 0.78)",
    headerBorder: "rgba(132, 204, 22, 0.14)",
    card: "rgba(255, 255, 255, 0.74)",
    border: "rgba(163, 163, 138, 0.16)",
    button: "#3f6212",
    buttonText: "#f7fee7",
    glow: "rgba(190, 242, 100, 0.18)",
  },
  summer: {
    from: "#e4f3fc",
    via: "#fff6e8",
    to: "#fdecc8",
    header: "rgba(255, 252, 247, 0.76)",
    headerBorder: "rgba(14, 165, 233, 0.14)",
    card: "rgba(255, 255, 255, 0.72)",
    border: "rgba(14, 165, 233, 0.12)",
    button: "#0f172a",
    buttonText: "#fef3c7",
    glow: "rgba(253, 224, 71, 0.22)",
  },
  autumn: {
    from: "#f6e6d2",
    via: "#f3d5b3",
    to: "#ebd3c0",
    header: "rgba(255, 250, 244, 0.76)",
    headerBorder: "rgba(194, 65, 12, 0.14)",
    card: "rgba(255, 252, 247, 0.74)",
    border: "rgba(194, 65, 12, 0.12)",
    button: "#9a3412",
    buttonText: "#fff7ed",
    glow: "rgba(234, 88, 12, 0.16)",
  },
  winter: {
    from: "#e7f0f7",
    via: "#f4f7fb",
    to: "#e4e9f0",
    header: "rgba(248, 250, 252, 0.78)",
    headerBorder: "rgba(14, 116, 144, 0.12)",
    card: "rgba(255, 255, 255, 0.74)",
    border: "rgba(125, 211, 252, 0.2)",
    button: "#164e63",
    buttonText: "#ecfeff",
    glow: "rgba(186, 230, 253, 0.35)",
  },
  rain: {
    from: "#d9e4ee",
    via: "#e7eef4",
    to: "#d5dee6",
    header: "rgba(248, 250, 252, 0.76)",
    headerBorder: "rgba(71, 85, 105, 0.14)",
    card: "rgba(255, 255, 255, 0.68)",
    border: "rgba(100, 116, 139, 0.14)",
    button: "#334155",
    buttonText: "#f8fafc",
    glow: "rgba(56, 189, 248, 0.14)",
  },
  snow: {
    from: "#eef6fb",
    via: "#f8fbfd",
    to: "#e6eef5",
    header: "rgba(255, 255, 255, 0.8)",
    headerBorder: "rgba(14, 116, 144, 0.12)",
    card: "rgba(255, 255, 255, 0.76)",
    border: "rgba(186, 230, 253, 0.4)",
    button: "#0e7490",
    buttonText: "#ecfeff",
    glow: "rgba(255, 255, 255, 0.5)",
  },
  heat: {
    from: "#fff1d6",
    via: "#ffe4c4",
    to: "#f8d0a8",
    header: "rgba(255, 251, 235, 0.76)",
    headerBorder: "rgba(234, 88, 12, 0.14)",
    card: "rgba(255, 255, 255, 0.7)",
    border: "rgba(234, 88, 12, 0.12)",
    button: "#9a3412",
    buttonText: "#fff7ed",
    glow: "rgba(251, 146, 60, 0.22)",
  },
} as const satisfies Record<SeasonThemeId, SeasonPalette>;

export const FALLBACK_THEME: SeasonTheme = {
  id: "summer",
  label: "오늘",
  emoji: "🌤️",
  greeting: "묻힌 캡슐과 열람까지 남은 시간을 한눈에 봐요",
  loginTitle: "로그인하고 묻기",
  particle: "none",
  motif: "none",
  palette: PALETTES.summer,
};

export function koreaDateParts(date = new Date()): DateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
  };
}

function toDayNumber(year: number, month: number, day: number) {
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

function inSolarWindow(
  parts: DateParts,
  month: number,
  day: number,
  before: number,
  after: number,
) {
  const today = toDayNumber(parts.year, parts.month, parts.day);
  const start = toDayNumber(parts.year, month, day) - before;
  let end = toDayNumber(parts.year, month, day) + after;
  if (month === 12 && day >= 29) {
    end = toDayNumber(parts.year + 1, 1, after);
  }
  return today >= start && today <= end;
}

function inLunarWindow(parts: DateParts, dates: SolarDate[], before: number, after: number) {
  return dates.some((date) => {
    const today = toDayNumber(parts.year, parts.month, parts.day);
    const center = toDayNumber(date.year, date.month, date.day);
    return today >= center - before && today <= center + after;
  });
}

function isRaining(weather: CapsuleWeather | null | undefined) {
  const condition = weather?.condition ?? "";
  return condition.includes("비");
}

function isSnowing(weather: CapsuleWeather | null | undefined) {
  const condition = weather?.condition ?? "";
  return condition.includes("눈");
}

function isHot(weather: CapsuleWeather | null | undefined) {
  return (weather?.temperature ?? 0) >= 28;
}

function weatherLead(weather: CapsuleWeather | null | undefined) {
  if (!weather) {
    return "";
  }
  if (isSnowing(weather)) {
    return "눈 내리는";
  }
  if (isRaining(weather)) {
    return "비 오는";
  }
  if (isHot(weather)) {
    return "햇살 뜨거운";
  }
  if (weather.condition === "흐림") {
    return "흐린";
  }
  if (weather.condition === "구름많음") {
    return "구름 많은";
  }
  if (weather.condition === "맑음") {
    return "맑은";
  }
  return "";
}

function withCopy(
  base: Omit<SeasonTheme, "greeting" | "loginTitle" | "particle"> & {
    greeting: string;
    loginTitle: string;
    particle: SeasonParticle;
  },
  weather: CapsuleWeather | null | undefined,
): SeasonTheme {
  const weatherDriven =
    base.id === "snow" ||
    base.id === "rain" ||
    base.id === "heat" ||
    base.id === "monsoon";
  const lead = weatherDriven ? "" : weatherLead(weather);
  const greeting = lead ? `${lead} ${base.greeting}` : base.greeting;
  let particle = base.particle;
  if (isSnowing(weather)) {
    particle = "snow";
  } else if (isRaining(weather)) {
    particle = "rain";
  } else if (isHot(weather) && particle === "none") {
    particle = "heat";
  }

  return { ...base, greeting, particle };
}

function holidayTheme(parts: DateParts): Omit<SeasonTheme, "greeting" | "loginTitle" | "particle"> & {
  greeting: string;
  loginTitle: string;
  particle: SeasonParticle;
} | null {
  if (inSolarWindow(parts, 12, 25, 10, 3)) {
    return {
      id: "christmas",
      label: "크리스마스",
      emoji: "🎄",
      greeting: "크리스마스예요. 따뜻한 불빛 아래 오늘의 마음을 묻어 보세요.",
      loginTitle: "크리스마스의 기억을 묻기",
      particle: "snow",
      motif: "glow",
      palette: PALETTES.christmas,
    };
  }

  if (inSolarWindow(parts, 1, 1, 3, 1) || inSolarWindow(parts, 12, 31, 2, 1)) {
    return {
      id: "newyear",
      label: "새해",
      emoji: "✨",
      greeting: "한 해가 바뀌는 밤이에요. 첫 기억을 캡슐에 담아 보세요.",
      loginTitle: "새해의 첫 기억을 묻기",
      particle: "sparkles",
      motif: "glow",
      palette: PALETTES.newyear,
    };
  }

  if (inLunarWindow(parts, SEOLLAL, 4, 3)) {
    return {
      id: "seollal",
      label: "설날",
      emoji: "🧧",
      greeting: "설이에요. 새해를 여는 마음을 캡슐에 남겨 보세요.",
      loginTitle: "설날의 인사를 묻기",
      particle: "sparkles",
      motif: "lantern",
      palette: PALETTES.seollal,
    };
  }

  if (inSolarWindow(parts, 2, 14, 1, 0)) {
    return {
      id: "valentine",
      label: "밸런타인",
      emoji: "💝",
      greeting: "마음을 전하는 날이에요. 달콤한 한마디를 묻어 보세요.",
      loginTitle: "마음을 묻기",
      particle: "petals",
      motif: "glow",
      palette: PALETTES.valentine,
    };
  }

  if (inSolarWindow(parts, 3, 28, 3, 15) || (parts.month === 4 && parts.day <= 12)) {
    return {
      id: "cherry",
      label: "벚꽃",
      emoji: "🌸",
      greeting: "벚꽃이 흩날리는 계절이에요. 잠시 머물다 가는 풍경을 담아 보세요.",
      loginTitle: "봄날의 기억을 묻기",
      particle: "petals",
      motif: "blossom",
      palette: PALETTES.cherry,
    };
  }

  if (inSolarWindow(parts, 5, 5, 1, 1)) {
    return {
      id: "childrens",
      label: "어린이날",
      emoji: "🎈",
      greeting: "어린이날이에요. 가벼운 마음으로 오늘의 기억을 묻어 보세요.",
      loginTitle: "오늘의 기억을 묻기",
      particle: "sparkles",
      motif: "sun",
      palette: PALETTES.childrens,
    };
  }

  if (inLunarWindow(parts, BUDDHA, 2, 2)) {
    return {
      id: "buddha",
      label: "연등",
      emoji: "🪷",
      greeting: "연등이 떠오르는 밤이에요. 고요한 마음을 캡슐에 담아 보세요.",
      loginTitle: "연등 아래 기억을 묻기",
      particle: "lanterns",
      motif: "lantern",
      palette: PALETTES.buddha,
    };
  }

  if (inLunarWindow(parts, CHUSEOK, 4, 3)) {
    return {
      id: "chuseok",
      label: "한가위",
      emoji: "🌕",
      greeting: "한가위예요. 보름달 아래 그리운 마음을 묻어 보세요.",
      loginTitle: "한가위의 마음을 묻기",
      particle: "leaves",
      motif: "moon",
      palette: PALETTES.chuseok,
    };
  }

  if (inSolarWindow(parts, 10, 31, 5, 0)) {
    return {
      id: "halloween",
      label: "할로윈",
      emoji: "🎃",
      greeting: "가을밤이 조금 장난스러워진 날이에요. 오늘의 공기를 담아 보세요.",
      loginTitle: "가을밤의 기억을 묻기",
      particle: "leaves",
      motif: "glow",
      palette: PALETTES.halloween,
    };
  }

  return null;
}

function seasonTheme(
  parts: DateParts,
  weather: CapsuleWeather | null | undefined,
): Omit<SeasonTheme, "greeting" | "loginTitle" | "particle"> & {
  greeting: string;
  loginTitle: string;
  particle: SeasonParticle;
} {
  const raining = isRaining(weather);
  const snowing = isSnowing(weather);
  const hot = isHot(weather);
  const monsoon =
    raining &&
    ((parts.month === 6 && parts.day >= 20) || parts.month === 7 || (parts.month === 8 && parts.day <= 10));

  if (snowing) {
    return {
      id: "snow",
      label: "눈 오는 날",
      emoji: "❄️",
      greeting: "세상이 하얗게 숨을 고르고 있어요. 이 정적을 캡슐에 남겨 보세요.",
      loginTitle: "눈 내리는 날의 기억을 묻기",
      particle: "snow",
      motif: "glow",
      palette: PALETTES.snow,
    };
  }

  if (monsoon) {
    return {
      id: "monsoon",
      label: "장마",
      emoji: "🌧️",
      greeting: "장마가 머무는 날이에요. 축축한 공기도 기억의 일부가 돼요.",
      loginTitle: "비 오는 날의 기억을 묻기",
      particle: "rain",
      motif: "none",
      palette: PALETTES.monsoon,
    };
  }

  if (raining) {
    return {
      id: "rain",
      label: "비 오는 날",
      emoji: "🌧️",
      greeting: "창문에 빗금이 그어지는 날이에요. 축축한 오늘의 공기를 담아 보세요.",
      loginTitle: "비 오는 날의 기억을 묻기",
      particle: "rain",
      motif: "none",
      palette: PALETTES.rain,
    };
  }

  if (hot && parts.month >= 6 && parts.month <= 8) {
    return {
      id: "heat",
      label: "한여름",
      emoji: "☀️",
      greeting: "공기가 달궈진 오후예요. 천천히 익어 가는 오늘을 묻어 보세요.",
      loginTitle: "한여름의 기억을 묻기",
      particle: "heat",
      motif: "sun",
      palette: PALETTES.heat,
    };
  }

  if (parts.month >= 3 && parts.month <= 5) {
    return {
      id: "spring",
      label: "봄",
      emoji: "🌿",
      greeting: "봄기운이 올라오는 날이에요. 새로 돋는 마음을 캡슐에 남겨 보세요.",
      loginTitle: "봄날의 기억을 묻기",
      particle: "none",
      motif: "blossom",
      palette: PALETTES.spring,
    };
  }

  if (parts.month >= 6 && parts.month <= 8) {
    return {
      id: "summer",
      label: "여름",
      emoji: "🌤️",
      greeting: "여름 햇살 아래, 오늘의 기억을 묻어 보세요.",
      loginTitle: "여름날의 기억을 묻기",
      particle: hot ? "heat" : "none",
      motif: "sun",
      palette: PALETTES.summer,
    };
  }

  if (parts.month >= 9 && parts.month <= 11) {
    return {
      id: "autumn",
      label: "가을",
      emoji: "🍂",
      greeting: "가을 빛이 낮아지는 날이에요. 익어 가는 마음을 담아 보세요.",
      loginTitle: "가을의 기억을 묻기",
      particle: "leaves",
      motif: "none",
      palette: PALETTES.autumn,
    };
  }

  return {
    id: "winter",
    label: "겨울",
    emoji: "🧣",
    greeting: "찬 공기 속에 온기가 오래 남는 날이에요. 오늘의 마음을 묻어 보세요.",
    loginTitle: "겨울날의 기억을 묻기",
    particle: "none",
    motif: "glow",
    palette: PALETTES.winter,
  };
}

export function resolveSeasonTheme(
  date: Date = new Date(),
  weather?: CapsuleWeather | null,
): SeasonTheme {
  const parts = koreaDateParts(date);
  const holiday = holidayTheme(parts);
  return withCopy(holiday ?? seasonTheme(parts, weather), weather);
}

export type TreeSeason = "spring" | "summer" | "autumn" | "winter";

export function treeSeason(theme: SeasonTheme): TreeSeason {
  if (
    theme.id === "winter" ||
    theme.id === "snow" ||
    theme.id === "christmas" ||
    theme.id === "newyear" ||
    theme.id === "seollal"
  ) {
    return "winter";
  }
  if (theme.id === "autumn" || theme.id === "chuseok" || theme.id === "halloween") {
    return "autumn";
  }
  if (
    theme.id === "spring" ||
    theme.id === "cherry" ||
    theme.id === "valentine" ||
    theme.id === "buddha"
  ) {
    return "spring";
  }
  return "summer";
}

export function weatherMotion(
  weather: CapsuleWeather | null | undefined,
): "sun" | "cloud" | "rain" | "snow" | "mist" | "heat" | "storm" {
  const condition = weather?.condition ?? "";
  if (condition.includes("눈")) {
    return "snow";
  }
  if (condition.includes("비") && (weather?.windSpeed ?? 0) >= 7) {
    return "storm";
  }
  if (condition.includes("비")) {
    return "rain";
  }
  if (condition === "흐림") {
    return "mist";
  }
  if (condition === "구름많음") {
    return "cloud";
  }
  if ((weather?.temperature ?? 0) >= 28) {
    return "heat";
  }
  return "sun";
}

export function seasonCssVars(theme: SeasonTheme): CSSProperties {
  const { palette } = theme;
  return {
    "--season-from": palette.from,
    "--season-via": palette.via,
    "--season-to": palette.to,
    "--season-header": palette.header,
    "--season-header-border": palette.headerBorder,
    "--season-card": palette.card,
    "--season-border": palette.border,
    "--season-button": palette.button,
    "--season-button-text": palette.buttonText,
    "--season-glow": palette.glow,
    background: `linear-gradient(180deg, ${palette.from} 0%, ${palette.via} 46%, ${palette.to} 100%)`,
  } as CSSProperties;
}
