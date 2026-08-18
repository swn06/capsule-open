import { reverseGeocode } from "@/lib/geo";
import {
  DEFAULT_WEATHER_COORDS,
  precipitationLabel,
  skyLabel,
  weatherCondition,
  type CapsuleWeather,
} from "@/lib/weather";

const NCST_ENDPOINT =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
const FCST_ENDPOINT =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";

type KstParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

type KmaItem = {
  category: string;
  obsrValue?: string;
  fcstValue?: string;
  fcstDate?: string;
  fcstTime?: string;
  baseDate: string;
  baseTime: string;
};

type KmaResponse = {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      items?: {
        item?: KmaItem | KmaItem[];
      };
    };
  };
};

function getServiceKey() {
  const raw = process.env.KMA_SERVICE_KEY?.trim();
  if (!raw) {
    return "";
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function getKstParts(date = new Date()): KstParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
  };
}

function shiftHour(parts: KstParts, delta: number): KstParts {
  const shifted = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour + delta, parts.minute),
  );
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

function formatBaseDate(parts: KstParts) {
  return `${parts.year}${String(parts.month).padStart(2, "0")}${String(parts.day).padStart(2, "0")}`;
}

function formatHourTime(hour: number, minute = 0) {
  return `${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}`;
}

function latLngToGrid(lat: number, lng: number) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;
  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) {
    theta -= 2.0 * Math.PI;
  }
  if (theta < -Math.PI) {
    theta += 2.0 * Math.PI;
  }
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}

function resolveGrid(lat: number | null, lng: number | null) {
  const safeLat = lat ?? DEFAULT_WEATHER_COORDS.lat;
  const safeLng = lng ?? DEFAULT_WEATHER_COORDS.lng;
  const grid = latLngToGrid(safeLat, safeLng);
  if (grid.nx < 1 || grid.nx > 149 || grid.ny < 1 || grid.ny > 253) {
    return latLngToGrid(DEFAULT_WEATHER_COORDS.lat, DEFAULT_WEATHER_COORDS.lng);
  }
  return grid;
}

function asItems(item: KmaItem | KmaItem[] | undefined): KmaItem[] {
  if (!item) {
    return [];
  }
  return Array.isArray(item) ? item : [item];
}

function valuesFromNcst(items: KmaItem[]) {
  const values: Record<string, string> = {};
  for (const item of items) {
    if (item.category && item.obsrValue !== undefined) {
      values[item.category] = item.obsrValue;
    }
  }
  return values;
}

function nearestFcstValues(items: KmaItem[], hour: number) {
  const wanted = formatHourTime(hour, 0);
  const byTime = new Map<string, Record<string, string>>();

  for (const item of items) {
    if (!item.fcstTime || item.fcstValue === undefined) {
      continue;
    }
    const bucket = byTime.get(item.fcstTime) ?? {};
    bucket[item.category] = item.fcstValue;
    byTime.set(item.fcstTime, bucket);
  }

  return byTime.get(wanted) ?? [...byTime.values()][0] ?? {};
}

async function callKma(
  endpoint: string,
  params: Record<string, string>,
): Promise<KmaItem[]> {
  const serviceKey = getServiceKey();
  if (!serviceKey) {
    throw new Error("missing-kma-service-key");
  }

  const search = new URLSearchParams({
    ...params,
    pageNo: "1",
    dataType: "JSON",
  });
  const url = `${endpoint}?serviceKey=${encodeURIComponent(serviceKey)}&${search.toString()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`kma-http-${response.status}`);
  }

  const payload = (await response.json()) as KmaResponse;
  const resultCode = payload.response?.header?.resultCode;
  if (resultCode !== "00") {
    throw new Error(payload.response?.header?.resultMsg ?? "kma-error");
  }

  return asItems(payload.response?.body?.items?.item);
}

async function fetchNcst(nx: number, ny: number, now: KstParts) {
  let base = now.minute < 10 ? shiftHour(now, -1) : now;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const items = await callKma(NCST_ENDPOINT, {
        numOfRows: "20",
        base_date: formatBaseDate(base),
        base_time: formatHourTime(base.hour, 0),
        nx: String(nx),
        ny: String(ny),
      });
      if (items.length > 0) {
        return { items, base };
      }
    } catch {
      // Try an earlier hour; 실황은 정시 직후 비어 있을 수 있음
    }
    base = shiftHour(base, -1);
  }

  return { items: [] as KmaItem[], base: now };
}

async function fetchFcst(nx: number, ny: number, now: KstParts) {
  let base = now.minute < 45 ? shiftHour(now, -1) : now;

  try {
    const items = await callKma(FCST_ENDPOINT, {
      numOfRows: "60",
      base_date: formatBaseDate(base),
      base_time: formatHourTime(base.hour, 30),
      nx: String(nx),
      ny: String(ny),
    });
    return items;
  } catch {
    return [] as KmaItem[];
  }
}

function parseNumber(value: string | undefined) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function fetchCurrentWeather(input: {
  lat: number | null;
  lng: number | null;
}): Promise<CapsuleWeather | null> {
  if (!getServiceKey()) {
    return null;
  }

  const lat = input.lat;
  const lng = input.lng;
  const hasCoords = lat !== null && lng !== null;
  const { nx, ny } = resolveGrid(lat, lng);
  const now = getKstParts();

  const [{ items: ncstItems, base }, fcstItems, location] = await Promise.all([
    fetchNcst(nx, ny, now),
    fetchFcst(nx, ny, now),
    reverseGeocode(
      lat ?? DEFAULT_WEATHER_COORDS.lat,
      lng ?? DEFAULT_WEATHER_COORDS.lng,
    ),
  ]);

  const observed = valuesFromNcst(ncstItems);
  const forecast = nearestFcstValues(fcstItems, now.hour);

  const temperature = parseNumber(observed.T1H) ?? parseNumber(forecast.T1H);
  const humidity = parseNumber(observed.REH) ?? parseNumber(forecast.REH);
  if (temperature === null || humidity === null) {
    return null;
  }

  const pty = observed.PTY ?? forecast.PTY ?? "0";
  const sky = forecast.SKY ?? "";
  const observedAt = `${formatBaseDate(base)}${observed.T1H ? formatHourTime(base.hour, 0) : formatHourTime(now.hour, 0)}`;

  return {
    condition: weatherCondition(pty, sky),
    temperature,
    humidity,
    precipitation: precipitationLabel(pty),
    sky: skyLabel(sky),
    windSpeed: parseNumber(observed.WSD) ?? parseNumber(forecast.WSD),
    observedAt,
    location: location || (hasCoords ? undefined : "서울"),
  };
}
