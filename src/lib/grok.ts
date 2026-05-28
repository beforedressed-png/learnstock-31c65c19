// xAI Grok API client (BYOK — runs in browser, OpenAI-compatible)
// Docs: https://grok-api.apidog.io/  •  https://docs.x.ai/
import { ADOBE_CATEGORIES, type GenerateOptions, type StockMetadata } from "./gemini";

export type GrokModel =
  | "grok-2-vision-latest"
  | "grok-2-vision-1212"
  | "grok-4-latest"
  | "grok-3";

export const GROK_MODELS: { id: GrokModel; label: string; note: string }[] = [
  { id: "grok-2-vision-latest", label: "Grok 2 Vision (Latest)", note: "Best for image analysis" },
  { id: "grok-2-vision-1212", label: "Grok 2 Vision 1212", note: "Stable vision snapshot" },
  { id: "grok-4-latest", label: "Grok 4 (Latest)", note: "Newest, multimodal" },
  { id: "grok-3", label: "Grok 3", note: "Text-only fallback" },
];

const GROK_BASE = "https://api.x.ai/v1";

async function fileToDataUrl(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${btoa(binary)}`;
}

// Reuse the same prompt as Gemini for consistency.
function buildPrompt(opts: GenerateOptions): string {
  const titleCap = Math.max(30, Math.min(200, Math.round(opts.titleLength)));
  const kwTarget = Math.max(10, Math.min(49, Math.round(opts.keywordCount)));
  const kwMin = Math.max(10, kwTarget - 5);
  const kwMax = Math.min(49, kwTarget);
  const negTitle = (opts.negativeTitleWords ?? "").split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  const negKw = (opts.negativeKeywords ?? "").split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  const reqKw = (opts.requiredKeywords ?? "").split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  const customInstr = (opts.customPrompt ?? "").trim();
  const negTitleLine = negTitle.length ? `\n- NEVER use these words in the title: ${negTitle.join(", ")}.` : "";
  const negKwLine = negKw.length ? `\n- NEVER include these keywords (or close synonyms): ${negKw.join(", ")}.` : "";
  const reqKwLine = reqKw.length ? `\n- ALWAYS include these keywords: ${reqKw.join(", ")}.` : "";
  const customBlock = customInstr ? `\n\n# ADDITIONAL USER INSTRUCTIONS\n${customInstr}` : "";

  const descBlock = opts.includeDescription
    ? `\n\n# DESCRIPTION\n- ONE marketing sentence, 150 chars or fewer (hard limit). Plain English, no quotes/emojis/hashtags/trailing period.`
    : "";
  const outputShape = opts.includeDescription
    ? `{"title": string, "keywords": string[], "category": number, "description": string}`
    : `{"title": string, "keywords": string[], "category": number}`;

  return `You generate Adobe Stock metadata. Return VALID JSON ONLY: ${outputShape}.

# VISUAL STYLE DETECTION (MANDATORY — DO FIRST)
Identify the rendering style and reflect it in BOTH title and top keywords. Never omit it.
- 3D render / 3D icon / 3D illustration / 3D background / 3D character / clay: title MUST contain "3D"; top keywords MUST include "3d", "render", "rendering" plus the style word ("icon","illustration","character","background","clay"). ONLY classify as 3D if there is actual 3D depth or realism.
- isometric, low poly, flat, line, outline, minimalist, cartoon, watercolor, oil, pixel, sketch, vector, photo, photorealistic, AI generated: name the style in title AND top 10 keywords.
- ACCURACY WARNING: 2D vector graphics, flat icons, cartoon drawings, line art, or simple illustrations must NEVER be classified as "3D". Do not mistake simple gradients, rounded corners, or flat cartoon strokes for 3D volume.

# TITLE
- Marketable English phrase. Make it descriptive and detailed, aiming for around 80 to 100 characters (limit is ${titleCap} chars).
- Subject + short qualifier, comma, secondary clause. No "image of", "showing", "depicting".
- No brands, IPs, real people, artists, quotes, emojis, hashtags or trailing period.${negTitleLine}

# KEYWORDS
- ${kwMin}-${kwMax} keywords (target ${kwTarget}, max 49).
- EVERY keyword MUST be a SINGLE WORD. Split any multi-word concept.
- Order by importance. Top 10 must include split words from the title.
- Lowercase, no punctuation, no duplicates. No brands or IPs.${negKwLine}${reqKwLine}

# CATEGORY (id 1-21)
1 Animals, 2 Buildings and Architecture, 3 Business, 4 Drinks, 5 The Environment, 6 States of Mind, 7 Food, 8 Graphic Resources, 9 Hobbies and Leisure, 10 Industry, 11 Landscapes, 12 Lifestyle, 13 People, 14 Plants and Flowers, 15 Culture and Religion, 16 Science, 17 Social Issues, 18 Sports, 19 Technology, 20 Transport, 21 Travel.${customBlock}${descBlock}`;
}

export async function generateMetadataGrok(
  file: File,
  apiKey: string,
  model: GrokModel,
  opts: GenerateOptions,
): Promise<StockMetadata> {
  const dataUrl = await fileToDataUrl(file);

  const body = {
    model,
    temperature: 0.7,
    response_format: { type: "json_object" as const },
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          { type: "text", text: buildPrompt(opts) },
        ],
      },
    ],
  };

  const res = await fetch(`${GROK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = `Grok API error (${res.status})`;
    try {
      const j = JSON.parse(errText);
      msg = j?.error?.message || j?.error || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? "";
  let parsed: { title?: string; keywords?: string[]; category?: number; description?: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Grok returned invalid JSON");
  }

  const titleCap = Math.max(30, Math.min(200, Math.round(opts.titleLength)));
  const kwMax = Math.max(10, Math.min(49, Math.round(opts.keywordCount)));
  const STOP = new Set(["a", "an", "the", "of", "and", "or", "to", "in", "on", "with", "for", "by", "at"]);

  const title = String(parsed.title ?? "").replace(/\s+/g, " ").trim().slice(0, titleCap);
  const keywords = Array.isArray(parsed.keywords)
    ? Array.from(
        new Map(
          parsed.keywords
            .flatMap((k) => String(k).replace(/[",;.!?()]/g, "").split(/[\s\-/_]+/))
            .map((w) => w.trim().toLowerCase())
            .filter((w) => w.length > 1 && w.length < 30 && !STOP.has(w) && /^[a-z0-9]+$/i.test(w))
            .map((w) => [w, w]),
        ).values(),
      ).slice(0, kwMax)
    : [];
  const categoryId = Math.max(1, Math.min(21, Number(parsed.category) || 8));
  const categoryLabel = ADOBE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? "";

  if (!title) throw new Error("Grok returned empty title");
  if (keywords.length < 5) throw new Error("Grok returned too few keywords");

  const description = opts.includeDescription
    ? String(parsed.description ?? "").replace(/\s+/g, " ").trim().slice(0, 150) || undefined
    : undefined;

  return { title, keywords, category: categoryId, categoryLabel, description };
}

export async function verifyGrokKey(apiKey: string): Promise<boolean> {
  const res = await fetch(`${GROK_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return res.ok;
}
