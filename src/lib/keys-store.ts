// Browser-local API key storage. Keys never leave the user's browser
// except in direct calls to the chosen provider.
import { useEffect, useState, useCallback } from "react";
import type { GeminiModel } from "./gemini";
import type { GrokModel } from "./grok";

export type Provider = "gemini" | "grok";

const KEYS_LS = "learnstock.keys.v2";
const ACTIVE_LS = "learnstock.activeKey.v2";
const MODEL_LS = "learnstock.model.v2";
const PROVIDER_LS = "learnstock.provider.v1";

// Legacy v1 (Gemini-only) keys, migrated on first load.
const LEGACY_KEYS_LS = "learnstock.gemini.keys.v1";
const LEGACY_ACTIVE_LS = "learnstock.gemini.active.v1";
const LEGACY_MODEL_LS = "learnstock.gemini.model.v1";

export interface StoredKey {
  id: string;
  key: string;
  provider: Provider;
  status: "unverified" | "healthy" | "invalid";
  addedAt: number;
}

type ActiveMap = Partial<Record<Provider, string | null>>;
type ModelMap = { gemini: GeminiModel; grok: GrokModel };

const DEFAULT_MODELS: ModelMap = {
  gemini: "gemini-3.1-flash-lite-preview",
  grok: "grok-2-vision-latest",
};

function read<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* quota */
  }
}

function migrateLegacy(): {
  keys: StoredKey[];
  active: ActiveMap;
  models: ModelMap;
} | null {
  try {
    const legacyKeys = localStorage.getItem(LEGACY_KEYS_LS);
    if (!legacyKeys) return null;
    const parsed = JSON.parse(legacyKeys) as Array<Omit<StoredKey, "provider">>;
    const migrated: StoredKey[] = parsed.map((k) => ({ ...k, provider: "gemini" }));
    const legacyActive = read<string | null>(LEGACY_ACTIVE_LS, null);
    const legacyModel = read<GeminiModel>(LEGACY_MODEL_LS, DEFAULT_MODELS.gemini);
    return {
      keys: migrated,
      active: { gemini: legacyActive },
      models: { ...DEFAULT_MODELS, gemini: legacyModel },
    };
  } catch {
    return null;
  }
}

export function useKeyStore() {
  const [keys, setKeys] = useState<StoredKey[]>(() => {
    const v2 = read<StoredKey[] | null>(KEYS_LS, null);
    if (v2 && v2.length >= 0) return v2;
    return migrateLegacy()?.keys ?? [];
  });
  const [activeMap, setActiveMap] = useState<ActiveMap>(() => {
    const v2 = read<ActiveMap | null>(ACTIVE_LS, null);
    if (v2) return v2;
    return migrateLegacy()?.active ?? {};
  });
  const [models, setModels] = useState<ModelMap>(() => {
    const v2 = read<ModelMap | null>(MODEL_LS, null);
    if (v2) return { ...DEFAULT_MODELS, ...v2 };
    return migrateLegacy()?.models ?? DEFAULT_MODELS;
  });
  const [provider, setProvider] = useState<Provider>(
    () => read<Provider>(PROVIDER_LS, "gemini"),
  );

  useEffect(() => write(KEYS_LS, keys), [keys]);
  useEffect(() => write(ACTIVE_LS, activeMap), [activeMap]);
  useEffect(() => write(MODEL_LS, models), [models]);
  useEffect(() => write(PROVIDER_LS, provider), [provider]);

  const addKey = useCallback((key: string, forProvider: Provider) => {
    const trimmed = key.trim();
    if (!trimmed) return;
    let newId: string | null = null;
    setKeys((prev) => {
      if (prev.some((k) => k.key === trimmed && k.provider === forProvider)) return prev;
      newId = crypto.randomUUID();
      return [
        ...prev,
        { id: newId, key: trimmed, provider: forProvider, status: "unverified" as const, addedAt: Date.now() },
      ];
    });
    setActiveMap((cur) => (cur[forProvider] ? cur : { ...cur, [forProvider]: newId }));
  }, []);

  const removeKey = useCallback((id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setActiveMap((cur) => {
      const next: ActiveMap = { ...cur };
      for (const p of Object.keys(next) as Provider[]) {
        if (next[p] === id) next[p] = null;
      }
      return next;
    });
  }, []);

  const setStatus = useCallback((id: string, status: StoredKey["status"]) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status } : k)));
  }, []);

  const setActiveId = useCallback((id: string) => {
    setKeys((prev) => {
      const target = prev.find((k) => k.id === id);
      if (target) {
        setActiveMap((cur) => ({ ...cur, [target.provider]: id }));
      }
      return prev;
    });
  }, []);

  const setModelFor = useCallback(<P extends Provider>(p: P, m: ModelMap[P]) => {
    setModels((cur) => ({ ...cur, [p]: m }));
  }, []);

  const keysFor = (p: Provider) => keys.filter((k) => k.provider === p);
  const activeIdFor = (p: Provider) => activeMap[p] ?? keysFor(p)[0]?.id ?? null;
  const activeKeyFor = (p: Provider) => keys.find((k) => k.id === activeIdFor(p)) ?? null;

  // Currently selected provider's active key (used by the workspace).
  const activeKey = activeKeyFor(provider);
  const model = models[provider];

  return {
    keys,
    keysFor,
    activeKey,
    activeKeyFor,
    activeIdFor,
    setActiveId,
    addKey,
    removeKey,
    setStatus,
    models,
    model,
    setModelFor,
    provider,
    setProvider,
  };
}

export function maskKey(k: string): string {
  if (k.length <= 8) return k;
  return `${k.slice(0, 4)}...${k.slice(-4)}`;
}
