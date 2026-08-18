import { GoogleGenAI } from "@google/genai";
import type { CapsuleWeather } from "@/lib/weather";
import { normalizeMood, weatherPromptLines, type CapsuleMood } from "@/lib/mood";

const MOOD_SCHEMA = {
  type: "object",
  properties: {
    phrase: {
      type: "string",
      description: "날씨에서 나온 그날의 한마디. 한 문장, 40자 이내, 한국어.",
    },
    keywords: {
      type: "array",
      items: { type: "string" },
      description: "편지 힌트 키워드 2~4개. 본문 인용 금지, 단어만.",
    },
    shape: {
      type: "string",
      enum: ["sun", "cloud", "rain", "snow", "mist", "heat", "storm"],
      description: "날씨에 맞는 분위기 코드",
    },
    vessel: {
      type: "string",
      enum: ["bottle", "orb", "acorn", "lantern", "seed", "bell"],
      description: "캡슐 그릇 형태. 같은 날씨라도 편지 분위기에 따라 다르게.",
    },
    ornament: {
      type: "string",
      enum: ["ribbon", "wax", "vine", "star", "dew", "frost"],
      description: "캡슐을 구분하는 장식",
    },
    colors: {
      type: "object",
      properties: {
        from: { type: "string", description: "그라데이션 시작 hex, 예: #FDE68A" },
        to: { type: "string", description: "그라데이션 끝 hex" },
        accent: { type: "string", description: "테두리/하이라이트 hex" },
      },
      required: ["from", "to", "accent"],
    },
  },
  required: ["phrase", "keywords", "shape", "vessel", "ornament", "colors"],
};

function getApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.NEEXT_PIBLIC_GEMINI_API_KEY?.trim() ||
    ""
  );
}

function parseJsonText(text: string | undefined) {
  if (!text) {
    return null;
  }
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenced?.[1]?.trim() ?? trimmed;
  try {
    return JSON.parse(payload) as unknown;
  } catch {
    return null;
  }
}

export async function generateCapsuleMood(input: {
  weather: CapsuleWeather | null;
  letter: string;
  to: string;
}): Promise<CapsuleMood> {
  const fallback = normalizeMood(null, input.weather);
  const apiKey = getApiKey();
  if (!apiKey) {
    return fallback;
  }

  const letter = input.letter.trim().slice(0, 800);
  const to = input.to.trim().slice(0, 40);
  const prompt = `타임캡슐을 묻는 날의 분위기를 JSON으로만 만들어 주세요.

[날씨]
${weatherPromptLines(input.weather)}

[받는 사람]
${to || "(없음)"}

[편지 일부]
${letter || "(없음)"}

규칙:
- phrase: 날씨·온도·습도에서 나온 그날의 한마디. 편지 내용을 직접 말하지 말 것.
- keywords: 편지를 열면 '아!' 할 수 있는 힌트 단어 2~4개. 문장 금지, 고유명사·직접 인용 금지.
- shape: 날씨 코드 sun|cloud|rain|snow|mist|heat|storm.
  맑고 더우면 heat, 맑으면 sun, 구름이면 cloud, 흐리고 습하면 mist, 비면 rain, 눈이면 snow, 거센 날이면 storm.
- vessel: 편지 분위기에 맞는 그릇. bottle(유리병), orb(구슬), acorn(도토리), lantern(등불), seed(씨앗), bell(방울). 매번 조금씩 다르게.
- ornament: ribbon|wax|vine|star|dew|frost 중 편지 감정에 맞는 장식.
- colors: 날씨+감정 느낌의 hex 3개. 형광색 금지. 다른 캡슐과 비슷해지지 않게.
- 한국어. JSON만.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: prompt,
      store: false,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: MOOD_SCHEMA,
      },
    });

    const parsed = parseJsonText(interaction.output_text);
    return normalizeMood(parsed, input.weather);
  } catch (error) {
    console.error(error);
    return fallback;
  }
}
