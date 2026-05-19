// Generation settings — title length, keyword count, prefix/suffix, negatives,
// custom prompt and custom keywords. Persisted to localStorage.
//
// Implemented as an external store via useSyncExternalStore so that
// components that don't render based on settings (e.g. the heavy
// MetadataWorkspace) don't re-render on every keystroke in the
// Controls inputs. Only ControlsSidebar subscribes; everything else
// reads via getGenSettings() inside event handlers.
import { useSyncExternalStore } from "react";

export type ExportPlatform = "adobe" | "shutterstock" | "freepik" | "vecteezy" | "pond5" | "general";

export interface GenSettings {
  platform: ExportPlatform;
  titleLength: number; // 30-200, Adobe recommends <=70
  keywordCount: number; // 10-49
  prefix: string;
  suffix: string;
  negativeTitleWords: string;
  negativeKeywords: string;
  customPrompt: string;
  customKeywords: string;
  prefixEnabled: boolean;
  suffixEnabled: boolean;
  negativeTitleEnabled: boolean;
  negativeKeywordsEnabled: boolean;
  customPromptEnabled: boolean;
  customKeywordsEnabled: boolean;
}

const DEFAULTS: GenSettings = {
  platform: "adobe",
  titleLength: 100,
  keywordCount: 35,
  prefix: "",
  suffix: "",
  negativeTitleWords: "",
  negativeKeywords: "",
  customPrompt: "",
  customKeywords: "",
  prefixEnabled: false,
  suffixEnabled: false,
  negativeTitleEnabled: false,
  negativeKeywordsEnabled: false,
  customPromptEnabled: false,
  customKeywordsEnabled: false,
};

const LS_KEY = "learnstock.gen-settings.v2";

let current: GenSettings = DEFAULTS;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      current = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<GenSettings>) };
    }
  } catch {
    /* ignore invalid storage */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(current));
  } catch {
    /* quota */
  }
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return DEFAULTS;
}

function setKey<K extends keyof GenSettings>(key: K, value: GenSettings[K]) {
  if (current[key] === value) return;
  current = { ...current, [key]: value };
  persist();
  emit();
}

export function getGenSettings(): GenSettings {
  hydrate();
  return current;
}

export function useGenSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { settings, update: setKey };
}
