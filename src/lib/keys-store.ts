// Browser-local API key storage. Keys never leave the user's browser
// except in direct calls to the chosen provider.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { GeminiModel } from "./gemini";
import type { GrokModel } from "./grok";

export type Provider = "gemini" | "grok";

const KEYS_LS = "learnstock.keys.v2";
const ACTIVE_LS = "learnstock.activeKey.v2";
const MODEL_LS = "learnstock.model.v2";
const PROVIDER_LS = "learnstock.provider.v1";
const MAX_KEYS_PER_PROVIDER = 20;
const MAX_KEY_LENGTH = 512;

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
type StoreState = {
  keys: StoredKey[];
  activeMap: ActiveMap;
  models: ModelMap;
  provider: Provider;
  hydrated: boolean;
};

const DEFAULT_MODELS: ModelMap = {
  gemini: "gemini-3.1-flash-lite-preview",
  grok: "grok-2-vision-latest",
};

function read<T>(k: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    if (typeof window === "undefined") return;
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
    if (typeof window === "undefined") return null;
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

const defaultState: StoreState = {
  keys: [],
  activeMap: {},
  models: DEFAULT_MODELS,
  provider: "gemini",
  hydrated: false,
};

let currentState: StoreState = defaultState;
const listeners = new Set<() => void>();

function sanitizeKeys(keys: StoredKey[]): StoredKey[] {
  const counts: Record<Provider, number> = { gemini: 0, grok: 0 };
  return keys.filter((item) => {
    if (item.provider !== "gemini" && item.provider !== "grok") return false;
    if (!item.key || item.key.length > MAX_KEY_LENGTH) return false;
    counts[item.provider] += 1;
    return counts[item.provider] <= MAX_KEYS_PER_PROVIDER;
  });
}

function loadStoredState(): StoreState {
  const migrated = migrateLegacy();
  const storedKeys = read<StoredKey[] | null>(KEYS_LS, null);
  const storedActive = read<ActiveMap | null>(ACTIVE_LS, null);
  const storedModels = read<ModelMap | null>(MODEL_LS, null);
  const storedProvider = read<Provider>(PROVIDER_LS, "gemini");

  return {
    keys: sanitizeKeys(storedKeys ?? migrated?.keys ?? []),
    activeMap: storedActive ?? migrated?.active ?? {},
    models: { ...DEFAULT_MODELS, ...(storedModels ?? migrated?.models ?? {}) },
    provider: storedProvider === "grok" ? "grok" : "gemini",
    hydrated: true,
  };
}

function persistState(state: StoreState) {
  if (!state.hydrated) return;
  write(KEYS_LS, state.keys);
  write(ACTIVE_LS, state.activeMap);
  write(MODEL_LS, state.models);
  write(PROVIDER_LS, state.provider);
}

function emit() {
  for (const listener of listeners) listener();
}

function updateStore(updater: (state: StoreState) => StoreState) {
  currentState = updater(currentState);
  persistState(currentState);
  emit();
}

function hydrateStore() {
  if (currentState.hydrated || typeof window === "undefined") return;
  currentState = loadStoredState();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrateStore();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentState;
}

function getServerSnapshot() {
  return defaultState;
}

export function useKeyStore() {
  const { keys, activeMap, models, provider, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const addKey = useCallback((key: string, forProvider: Provider) => {
    const trimmed = key.trim().slice(0, MAX_KEY_LENGTH);
    if (!trimmed) return;
    updateStore((state) => {
      if (state.keys.some((k) => k.key === trimmed && k.provider === forProvider)) return state;
      const providerKeys = state.keys.filter((k) => k.provider === forProvider);
      const id = crypto.randomUUID();
      const nextKeys = sanitizeKeys([
        ...state.keys,
        { id, key: trimmed, provider: forProvider, status: "unverified", addedAt: Date.now() },
      ]);
      return {
        ...state,
        keys: nextKeys,
        activeMap: providerKeys.length === 0 ? { ...state.activeMap, [forProvider]: id } : state.activeMap,
      };
    });
  }, []);

  const removeKey = useCallback((id: string) => {
    updateStore((state) => {
      const nextActive: ActiveMap = { ...state.activeMap };
      for (const p of Object.keys(nextActive) as Provider[]) {
        if (nextActive[p] === id) nextActive[p] = null;
      }
      return { ...state, keys: state.keys.filter((k) => k.id !== id), activeMap: nextActive };
    });
  }, []);

  const setStatus = useCallback((id: string, status: StoredKey["status"]) => {
    updateStore((state) => ({
      ...state,
      keys: state.keys.map((k) => (k.id === id ? { ...k, status } : k)),
    }));
  }, []);

  const setActiveId = useCallback((id: string) => {
    updateStore((state) => {
      const target = state.keys.find((k) => k.id === id);
      if (!target) return state;
      return { ...state, activeMap: { ...state.activeMap, [target.provider]: id } };
    });
  }, []);

  const setModelFor = useCallback(<P extends Provider>(p: P, m: ModelMap[P]) => {
    updateStore((state) => ({ ...state, models: { ...state.models, [p]: m } }));
  }, []);

  const setProvider = useCallback((p: Provider) => {
    updateStore((state) => ({ ...state, provider: p }));
  }, []);

  const keysFor = useCallback(
    (p: Provider) => keys.filter((k) => k.provider === p),
    [keys],
  );
  const activeIdFor = useCallback(
    (p: Provider) => activeMap[p] ?? keys.find((k) => k.provider === p)?.id ?? null,
    [activeMap, keys],
  );
  const activeKeyFor = useCallback(
    (p: Provider) => keys.find((k) => k.id === (activeMap[p] ?? keys.find((x) => x.provider === p)?.id)) ?? null,
    [activeMap, keys],
  );

  // Currently selected provider's active key (used by the workspace).
  const activeKey = useMemo(() => activeKeyFor(provider), [activeKeyFor, provider]);
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
    hydrated,
  };
}

export function maskKey(k: string): string {
  if (k.length <= 8) return k;
  return `${k.slice(0, 4)}...${k.slice(-4)}`;
}
