// Generation settings — title length, keyword count, prefix/suffix, negatives,
// custom prompt and custom keywords. Persisted to localStorage.
import { useCallback, useEffect, useState } from "react";

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

export function useGenSettings() {
  const [settings, setSettings] = useState<GenSettings>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return DEFAULTS;
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<GenSettings>) };
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(settings));
    } catch {
      /* quota */
    }
  }, [settings]);

  const update = useCallback(
    <K extends keyof GenSettings>(key: K, value: GenSettings[K]) =>
      setSettings((s) => ({ ...s, [key]: value })),
    [],
  );

  return { settings, update };
}
