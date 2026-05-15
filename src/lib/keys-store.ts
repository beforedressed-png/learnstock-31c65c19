// Browser-local API key storage. Keys never leave the user's browser
// except in direct calls to Google.
import { useEffect, useState, useCallback } from "react";
import type { GeminiModel } from "./gemini";

const KEYS_LS = "learnstock.gemini.keys.v1";
const ACTIVE_LS = "learnstock.gemini.active.v1";
const MODEL_LS = "learnstock.gemini.model.v1";

export interface StoredKey {
  id: string;
  key: string;
  status: "unverified" | "healthy" | "invalid";
  addedAt: number;
}

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

export function useKeyStore() {
  const [keys, setKeys] = useState<StoredKey[]>(() => read(KEYS_LS, [] as StoredKey[]));
  const [activeId, setActiveId] = useState<string | null>(() => read<string | null>(ACTIVE_LS, null));
  const [model, setModel] = useState<GeminiModel>(
    () => read<GeminiModel>(MODEL_LS, "gemini-3.1-flash-lite-preview"),
  );

  useEffect(() => write(KEYS_LS, keys), [keys]);
  useEffect(() => write(ACTIVE_LS, activeId), [activeId]);
  useEffect(() => write(MODEL_LS, model), [model]);

  const addKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (!trimmed) return;
    setKeys((prev) => {
      if (prev.some((k) => k.key === trimmed)) return prev;
      const id = crypto.randomUUID();
      const next = [...prev, { id, key: trimmed, status: "unverified" as const, addedAt: Date.now() }];
      setActiveId((cur) => cur ?? id);
      return next;
    });
  }, []);

  const removeKey = useCallback((id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const setStatus = useCallback((id: string, status: StoredKey["status"]) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status } : k)));
  }, []);

  const activeKey = keys.find((k) => k.id === activeId) ?? keys[0] ?? null;

  return {
    keys,
    activeKey,
    activeId,
    setActiveId,
    addKey,
    removeKey,
    setStatus,
    model,
    setModel,
  };
}

export function maskKey(k: string): string {
  if (k.length <= 8) return k;
  return `${k.slice(0, 4)}...${k.slice(-4)}`;
}
