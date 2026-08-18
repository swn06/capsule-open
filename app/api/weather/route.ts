import { NextResponse } from "next/server";
import { fetchCurrentWeather } from "@/lib/kma";

function parseCoord(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoord(searchParams.get("lat"));
  const lng = parseCoord(searchParams.get("lng"));

  try {
    const weather = await fetchCurrentWeather({ lat, lng });
    if (!weather) {
      return NextResponse.json({ error: "weather-unavailable" }, { status: 502 });
    }
    return NextResponse.json(weather);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "weather-unavailable" }, { status: 502 });
  }
}
