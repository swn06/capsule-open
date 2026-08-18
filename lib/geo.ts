type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  borough?: string;
  city_district?: string;
  suburb?: string;
  quarter?: string;
  neighbourhood?: string;
  state?: string;
  province?: string;
  region?: string;
};

type NominatimResponse = {
  address?: NominatimAddress;
  name?: string;
  display_name?: string;
};

function shortenRegion(value: string) {
  return value
    .replace(/특별자치시$/, "")
    .replace(/특별자치도$/, "")
    .replace(/광역시$/, "")
    .replace(/특별시$/, "")
    .replace(/자치시$/, "")
    .trim();
}

function uniqueParts(parts: Array<string | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const value = part?.trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }
  return result;
}

export function formatPlaceName(address: NominatimAddress | undefined, fallback?: string) {
  if (!address) {
    return fallback ?? "";
  }

  const region = shortenRegion(
    address.state || address.province || address.region || address.city || "",
  );
  const city = shortenRegion(
    address.city || address.municipality || address.county || address.town || "",
  );
  const district =
    address.borough ||
    address.city_district ||
    address.suburb ||
    address.quarter ||
    address.town ||
    address.village ||
    address.neighbourhood ||
    "";

  const parts = uniqueParts([
    region,
    city === region ? undefined : city,
    district === city || district === region ? undefined : district,
  ]);

  return parts.slice(0, 2).join(" ") || fallback || "";
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "ko");
    url.searchParams.set("zoom", "14");

    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "capsule-open/1.0 (weather snapshot)",
      },
    });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as NominatimResponse;
    const name = formatPlaceName(payload.address, payload.name);
    return name || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
