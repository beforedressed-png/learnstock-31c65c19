// Google Gemini API client (BYOK — runs in browser)
// Docs: https://ai.google.dev/gemini-api/docs

export type GeminiModel =
  | "gemini-3.1-flash-lite-preview"
  | "gemini-3-flash-preview"
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite"
  | "gemini-2.0-flash";

export const GEMINI_MODELS: { id: GeminiModel; label: string; note: string }[] = [
  { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite", note: "Fastest & cheapest (preview)" },
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash (Latest)", note: "Latest preview, balanced" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", note: "Stable, strong vision" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", note: "Cheap, stable" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", note: "Legacy stable" },
];

export interface StockMetadata {
  title: string;
  keywords: string[];
  category: number;
  categoryLabel: string;
}

// Adobe Stock categories (1-21, official)
export const ADOBE_CATEGORIES: { id: number; label: string }[] = [
  { id: 1, label: "Animals" },
  { id: 2, label: "Buildings and Architecture" },
  { id: 3, label: "Business" },
  { id: 4, label: "Drinks" },
  { id: 5, label: "The Environment" },
  { id: 6, label: "States of Mind" },
  { id: 7, label: "Food" },
  { id: 8, label: "Graphic Resources" },
  { id: 9, label: "Hobbies and Leisure" },
  { id: 10, label: "Industry" },
  { id: 11, label: "Landscapes" },
  { id: 12, label: "Lifestyle" },
  { id: 13, label: "People" },
  { id: 14, label: "Plants and Flowers" },
  { id: 15, label: "Culture and Religion" },
  { id: 16, label: "Science" },
  { id: 17, label: "Social Issues" },
  { id: 18, label: "Sports" },
  { id: 19, label: "Technology" },
  { id: 20, label: "Transport" },
  { id: 21, label: "Travel" },
];

const SYSTEM_PROMPT = `You are an expert Adobe Stock metadata generator.
For the given image, produce SEO-optimized metadata that follows Adobe Stock contributor rules:

TITLE RULES:
- 70-200 characters
- Descriptive, natural English sentence (no keyword stuffing)
- No trademarks, brand names, or copyrighted terms
- No special characters except commas and periods
- Describe subject, action, setting, mood

KEYWORDS RULES:
- Exactly 25-49 single keywords (aim for 40-49)
- Most relevant keywords FIRST (Adobe ranks top 10 highest)
- Single words or short 2-word phrases
- Lowercase, no punctuation, no duplicates
- Mix: subject, concept, color, mood, style, composition, demographic
- No trademarks or brand names

CATEGORY: Pick the single best id from this list:
1 Animals, 2 Buildings and Architecture, 3 Business, 4 Drinks, 5 The Environment,
6 States of Mind, 7 Food, 8 Graphic Resources, 9 Hobbies and Leisure, 10 Industry,
11 Landscapes, 12 Lifestyle, 13 People, 14 Plants and Flowers, 15 Culture and Religion,
16 Science, 17 Social Issues, 18 Sports, 19 Technology, 20 Transport, 21 Travel.

Respond ONLY with valid JSON: {"title": string, "keywords": string[], "category": number}`;

async function fileToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return { data: btoa(binary), mimeType: file.type || "image/jpeg" };
}

export async function generateMetadata(
  file: File,
  apiKey: string,
  model: GeminiModel,
): Promise<StockMetadata> {
  const { data, mimeType } = await fileToBase64(file);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: SYSTEM_PROMPT },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = `Gemini API error (${res.status})`;
    try {
      const j = JSON.parse(errText);
      msg = j?.error?.message || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const json = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") ?? "";
  let parsed: { title?: string; keywords?: string[]; category?: number };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Model returned invalid JSON");
  }

  const title = String(parsed.title ?? "").trim().slice(0, 200);
  const keywords = Array.isArray(parsed.keywords)
    ? Array.from(
        new Set(
          parsed.keywords
            .map((k) => String(k).toLowerCase().trim())
            .filter((k) => k.length > 0 && k.length < 40),
        ),
      ).slice(0, 49)
    : [];
  const categoryId = Math.max(1, Math.min(21, Number(parsed.category) || 8));
  const categoryLabel = ADOBE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? "";

  if (!title) throw new Error("Model returned empty title");
  if (keywords.length < 5) throw new Error("Model returned too few keywords");

  return { title, keywords, category: categoryId, categoryLabel };
}

export async function verifyApiKey(apiKey: string): Promise<boolean> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  return res.ok;
}
