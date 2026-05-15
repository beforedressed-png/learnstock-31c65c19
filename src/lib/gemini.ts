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
  description?: string; // 150-char marketing description (only when includeDescription=true)
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
  customPrompt?: string; // user instruction injected into the system prompt
  requiredKeywords?: string; // keywords the model MUST include
  includeDescription?: boolean; // when true, also generate a 150-char description
}

const DESCRIPTION_CAP = 150;

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
  const reqKw = (opts.requiredKeywords ?? "")
    .split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  const customInstr = (opts.customPrompt ?? "").trim();

  const negTitleLine = negTitle.length
    ? `\n- NEVER use these words in the title: ${negTitle.join(", ")}.`
    : "";
  const negKwLine = negKw.length
    ? `\n- NEVER include these keywords (or close synonyms): ${negKw.join(", ")}.`
    : "";
  const reqKwLine = reqKw.length
    ? `\n- ALWAYS include these keywords (place them naturally, prefer top half): ${reqKw.join(", ")}.`
    : "";
  const customBlock = customInstr
    ? `\n\n# ADDITIONAL USER INSTRUCTIONS (highest priority, override defaults if conflicting except CATEGORY/JSON shape)\n${customInstr}`
    : "";

  return `You generate Adobe Stock metadata that strictly follows Adobe's official Title and Keyword guidelines. Analyze the image and return a title, an ordered keyword list, and a category id.

# TITLE
- Short, marketable English phrase. NOT a formal sentence. NOT a long descriptive caption.
- ${titleCap} CHARACTERS OR FEWER (hard limit). Adobe recommends 70 or fewer — stay well under 70 whenever possible.
- Preferred shape: "<Subject> <short qualifier>, <secondary phrase or synonyms>". Use a comma to add a second short clause instead of long "showing/with/of" sentences.
- Avoid weak filler verbs and constructions: "showing", "depicting", "featuring", "that shows", "which represents", "image of", "picture of", "illustration of", "a set of".
- Use natural buyer-search phrasing — words a designer would type into search (e.g. "icons set", "flat icons", "line icons", "vector illustration", "seamless pattern", "isolated on white", "concept", "background").
- Describe subject + key qualifier + style/use. Add location for travel/nature, species for animals, cuisine names for food, and "AI generated" only if clearly AI.
- Use caring, respectful language for people. Never demeaning, derogatory, or stereotyping.
- DO NOT include: brand / company / product names, artist names, real known people, fictional character names, franchise / IP / artwork names, or "in the style of / inspired by" references.
- No quotes, no emojis, no hashtags, no trailing period. Plain text only.${negTitleLine}

Good title examples (study the rhythm — subject, comma, short secondary clause):
- "Thumbs up and thumbs down icons set, like and dislike symbols"
- "Aerial view of Mount Bromo, Indonesia"
- "Young woman playing fetch with Jack Russell Terrier on a beach in Portland, Oregon"
- "Minimalist line icons set, business and finance symbols"
- "Senior woman flexing muscles on the beach, healthy lifestyle concept"
- "Seamless floral pattern, pastel watercolor flowers on white background"

Bad title examples (do NOT write like this):
- "Thumbs up and thumbs down icons showing positive and negative feedback"  → uses "showing"; rewrite as "icons set, like and dislike symbols"
- "An image of a sunset over mountains"  → starts with "image of"
- "Picture depicting a happy family at home"  → "picture depicting" filler

# KEYWORDS
- Provide ${kwMin}-${kwMax} keywords (target: ${kwTarget}). Maximum 49.
- STRICT RULE: EVERY keyword MUST be a SINGLE WORD. No spaces, no hyphens, no compound phrases. EVER.
- Split every multi-word concept into separate single-word keywords:
  - "comic book"     → "comic", "book"
  - "speech bubble"  → "speech", "bubble"
  - "vector illustration" → "vector", "illustration"
  - "pop art"        → "pop", "art"
  - "graphic design" → "graphic", "design"
  - "Arctic Fox"     → "arctic", "fox"
  - "Mount Bromo"    → "mount", "bromo"
  - "aerial view"    → "aerial", "view"
  - "one person"     → "one", "person"
  - "thumbs up"      → "thumbs", "up"
- ORDER BY IMPORTANCE — the most important single words come FIRST.
- The top 10 keywords MUST include the individual words from the title (already split).
- Mix general and specific levels: e.g. "animal", "mammal", "fox", "arctic".
- Conceptual single words for feelings / mood (solitude, childhood, freedom, joy). Concepts must match the image.
- People count as single words: "one", "two", "three", "four", "people", "nobody".
- Setting words when relevant: indoors, outdoors, day, night, summer, winter.
- All lowercase. No punctuation inside a keyword. No duplicates after lowercasing.
- DO NOT include: brand / company / product names, artist names, real known people, fictional character names, third-party IP, or trademarks.${negKwLine}${reqKwLine}

# CATEGORY
Pick the SINGLE best id (1-21):
1 Animals, 2 Buildings and Architecture, 3 Business, 4 Drinks, 5 The Environment, 6 States of Mind, 7 Food, 8 Graphic Resources, 9 Hobbies and Leisure, 10 Industry, 11 Landscapes, 12 Lifestyle, 13 People, 14 Plants and Flowers, 15 Culture and Religion, 16 Science, 17 Social Issues, 18 Sports, 19 Technology, 20 Transport, 21 Travel.${customBlock}

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
  // Enforce SINGLE-WORD keywords: split phrases on whitespace/hyphen/slash, lowercase, dedupe.
  const STOP = new Set(["a", "an", "the", "of", "and", "or", "to", "in", "on", "with", "for", "by", "at"]);
  const keywords = Array.isArray(parsed.keywords)
    ? Array.from(
        new Map(
          parsed.keywords
            .flatMap((k) =>
              String(k)
                .replace(/[",;.!?()]/g, "")
                .split(/[\s\-/_]+/),
            )
            .map((w) => w.trim().toLowerCase())
            .filter((w) => w.length > 1 && w.length < 30 && !STOP.has(w) && /^[a-z0-9]+$/i.test(w))
            .map((w) => [w, w]),
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
