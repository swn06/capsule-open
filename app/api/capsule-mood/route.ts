import { NextResponse } from "next/server";
import { generateCapsuleMood } from "@/lib/gemini";
import { normalizeMood, type CapsuleMood } from "@/lib/mood";
import type { CapsuleWeather } from "@/lib/weather";

type MoodRequest = {
  weather?: CapsuleWeather | null;
  letter?: string;
  to?: string;
};

export async function POST(request: Request) {
  let body: MoodRequest = {};
  try {
    body = (await request.json()) as MoodRequest;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  try {
    const mood: CapsuleMood = await generateCapsuleMood({
      weather: body.weather ?? null,
      letter: typeof body.letter === "string" ? body.letter : "",
      to: typeof body.to === "string" ? body.to : "",
    });
    return NextResponse.json(mood);
  } catch (error) {
    console.error(error);
    return NextResponse.json(normalizeMood(null, body.weather ?? null));
  }
}
