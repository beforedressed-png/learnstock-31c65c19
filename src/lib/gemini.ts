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

export interface GenerateOptions {
  titleLength: number; // hard cap, 30..200
  keywordCount: number; // target, 10..49
  negativeTitleWords?: string; // comma/space separated words to avoid in title
  negativeKeywords?: string; // comma/space separated keywords to avoid
}

// Prompt follows Adobe Stock's official guidance:
// https://helpx.adobe.com/stock/contributor/help/titles-and-keyword.html
function buildPrompt(opts: GenerateOptions): string {
  const titleCap = Math.max(30, Math.min(200, Math.round(opts.titleLength)));
  const kwTarget = Math.max(10, Math.min(49, Math.round(opts.keywordCount)));
  const kwMin = Math.max(10, kwTarget - 5);
  const kwMax = Math.min(49, kwTarget);

  const negTitle = (opts.negativeTitleWords ?? "")
    .split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  const negKw = (opts.negativeKeywords ?? "")
    .split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);

  const negTitleLine = negTitle.length
    ? `\n- NEVER use these words in the title: ${negTitle.join(", ")}.`
    : "";
  const negKwLine = negKw.length
    ? `\n- NEVER include these keywords (or close synonyms): ${negKw.join(", ")}.`
    : "";

  return `You generate Adobe Stock metadata that strictly follows Adobe's official Title and Keyword guidelines. Analyze the image and return a title, an ordered keyword list, and a category id.

# TITLE
- Short, factual, descriptive English phrase (NOT a formal sentence, NOT a list of keywords).
- ${titleCap} CHARACTERS OR FEWER (hard limit). Adobe recommends 70 or fewer for best search visibility — stay under 70 when possible.
- Accurate, relevant, precise. Easy to read.
- Describe subject, action, and setting. Add location for travel/nature, species for animals, cuisine names for food, and "AI generated" if the image is clearly AI.
- Use caring, engaged language for people. Never demeaning, derogatory, or stereotyping.
- DO NOT include: company / brand / product names, artist names (including single-name artists), real known people, fictional character names, movie / franchise / comic / artwork names, or "in the style of / inspired by / influenced by" references.
- No quotes, no emojis, no hashtags. Plain text only.${negTitleLine}

Good title examples:
- "Young woman playing catch with Jack Russel Terrier at a beach in Portland, Oregon, USA"
- "Aerial view of Mount Bromo, Indonesia"
- "Senior woman flexing her muscles on beach"

# KEYWORDS
- Provide ${kwMin}-${kwMax} keywords (target: ${kwTarget}). Maximum 49.
- ORDER BY IMPORTANCE — the most important keywords come FIRST. Order is critical.
- The top 10 keywords MUST include the individual words and concepts from the title.
- Each keyword is a single concept. Separate descriptive elements: use "white", "fluffy", "young animal", "pup" as separate keywords — NOT "white fluffy pup".
- Real compound names stay together: "Arctic Fox", "Mount Bromo", "sign language", "aerial view", "one person", "lab coat".
- Mix general and specific levels: e.g. "animal", "mammal", "carnivora", "Arctic Fox".
- Locations: when a city / state / region is included, also include the country. Don't mix conflicting locations.
- Conceptual keywords for feelings / mood / trends (e.g. solitude, childhood, conservation). Concepts must match the image — "cold" for an ice cube, never "heat".
- Number of people: include "one person", "two people", "three people", "four people", or "nobody" when there are no people. Never include people's real names.
- Setting words when relevant: indoors, outdoors, day, night, sunny, cloudy, summer, winter.
- Viewpoint when relevant: "aerial view", "high-angle view", "directly above", "drone point of view", "side view", "close-up".
- Demographic info (ethnicity, race, heritage, age range, gender) ONLY when clearly visible and described with respectful, accurate language.
- Lowercase except proper nouns (place names, species names). No punctuation inside a keyword. No duplicates. No keyword longer than 3 words.
- DO NOT include: brand / company / product names, artist names, real known people, fictional character names, third-party IP, or trademarks.${negKwLine}

# CATEGORY
Pick the SINGLE best id (1-21):
1 Animals, 2 Buildings and Architecture, 3 Business, 4 Drinks, 5 The Environment, 6 States of Mind, 7 Food, 8 Graphic Resources, 9 Hobbies and Leisure, 10 Industry, 11 Landscapes, 12 Lifestyle, 13 People, 14 Plants and Flowers, 15 Culture and Religion, 16 Science, 17 Social Issues, 18 Sports, 19 Technology, 20 Transport, 21 Travel.

# OUTPUT
Respond with VALID JSON only, no commentary, matching this shape:
{"title": string, "keywords": string[], "category": number}`;
}

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
  opts: GenerateOptions,
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
          { text: buildPrompt(opts) },
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

  const titleCap = Math.max(30, Math.min(200, Math.round(opts.titleLength)));
  const kwMax = Math.max(10, Math.min(49, Math.round(opts.keywordCount)));

  const title = String(parsed.title ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, titleCap);
  const keywords = Array.isArray(parsed.keywords)
    ? Array.from(
        new Map(
          parsed.keywords
            .map((k) => String(k).replace(/[",;]/g, "").trim())
            .filter((k) => k.length > 0 && k.length < 40)
            .map((k) => [k.toLowerCase(), k]),
        ).values(),
      ).slice(0, kwMax)
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
