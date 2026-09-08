import { useEffect, useState } from "react";
import { Check, Clipboard, Eye, EyeOff, KeyRound, Trash2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GEMINI_MODELS, verifyApiKey, type GeminiModel } from "@/lib/gemini";
import { GROK_MODELS, verifyGrokKey, type GrokModel } from "@/lib/grok";
import { maskKey, useKeyStore, type Provider } from "@/lib/keys-store";
import { toast } from "sonner";

type ProviderMeta = {
  id: Provider;
  label: string;
  keyHint: string;
  keyPrefixes: string[];
  getKeyUrl: string;
  models: { id: string; label: string; note: string }[];
  verify: (key: string) => Promise<boolean>;
  description: string;
};

const MAX_API_KEY_CHARS = 512;

const PROVIDERS: ProviderMeta[] = [
  {
    id: "gemini",
    label: "Google Gemini",
    keyHint: "Enter Gemini API key",
    keyPrefixes: ["AIza", "AQ."],
    getKeyUrl: "https://aistudio.google.com/apikey",
    models: GEMINI_MODELS,
    verify: verifyApiKey,
    description: "Bring your own Gemini API key. Stored locally, never sent to third-party servers.",
  },
  {
    id: "grok",
    label: "xAI Grok",
    keyHint: "Enter Grok (xAI) API key",
    keyPrefixes: ["xai-"],
    getKeyUrl: "https://console.x.ai/",
    models: GROK_MODELS,
    verify: verifyGrokKey,
    description: "Bring your own xAI Grok API key. Stored locally, never sent to third-party servers.",
  },
];

export function ApiKeysDialog() {
  const store = useKeyStore();
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState<string | null>(null);

  const normalizeKeyInput = (value: string) => value.trim().slice(0, MAX_API_KEY_CHARS);

  const addKeyValue = (provider: Provider, rawValue: string) => {
    const meta = PROVIDERS.find((p) => p.id === provider)!;
    const trimmed = normalizeKeyInput(rawValue);
    if (!trimmed) return;
    
    const isValid = meta.keyPrefixes.some((prefix) => 
      trimmed.toLowerCase().startsWith(prefix.toLowerCase())
    );

    if (!isValid) {
      const prefixesLabel = meta.keyPrefixes.join(" or ");
      toast.error(`That doesn't look like a ${meta.label} key (starts with ${prefixesLabel}...)`);
      return;
    }
    store.addKey(trimmed, provider);
    toast.success("Key added");
  };

  const handleClipboardPaste = async (provider: Provider) => {
    try {
      const value = await navigator.clipboard.readText();
      addKeyValue(provider, value);
    } catch {
      toast.error("Clipboard permission was blocked. Click the paste zone and press Ctrl+V / Cmd+V.");
    }
  };

  const handleVerify = async (id: string, key: string, provider: Provider) => {
    const meta = PROVIDERS.find((p) => p.id === provider)!;
    setVerifying(id);
    try {
      const ok = await meta.verify(key);
      store.setStatus(id, ok ? "healthy" : "invalid");
      toast[ok ? "success" : "error"](ok ? "Key is healthy" : "Key is invalid");
    } catch {
      store.setStatus(id, "invalid");
      toast.error(`Could not reach ${meta.label} API`);
    } finally {
      setVerifying(null);
    }
  };

  const totalKeys = store.keys.length;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg border-border/80 text-xs font-medium" onClick={() => setOpen(true)}>
        <KeyRound className="h-3.5 w-3.5" />
        API Keys
        {totalKeys > 0 && (
          <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[9px]">
            {totalKeys}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <button
            aria-label="Close API key dialog"
            className="fixed inset-0"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-keys-title"
            className="relative z-10 grid max-h-[calc(100vh-2rem)] w-[min(38rem,calc(100vw-2rem))] gap-4 overflow-y-auto rounded-xl border border-border/80 bg-card p-6 shadow-xl"
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <h2 id="api-keys-title" className="flex items-center gap-2 text-base font-bold text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <KeyRound className="h-3.5 w-3.5" />
                  </span>
                  AI Provider Keys
                </h2>
                <button
                  aria-label="Close"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Bring your own API key. Keys are stored locally in your browser.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 rounded-lg bg-muted/60 p-1">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => store.setProvider(p.id)}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    store.provider === p.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p.label}
                  {store.keysFor(p.id).length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                      {store.keysFor(p.id).length}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {PROVIDERS.filter((p) => p.id === store.provider).map((meta) => {
              const providerKeys = store.keysFor(meta.id);
              const activeId = store.activeIdFor(meta.id);
              const currentModel = store.models[meta.id];
              return (
                <div key={meta.id} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Model
                      </label>
                      <select
                        value={currentModel}
                        onChange={(e) => {
                          if (meta.id === "gemini") store.setModelFor("gemini", e.target.value as GeminiModel);
                          else store.setModelFor("grok", e.target.value as GrokModel);
                        }}
                        className="h-8 w-full rounded-lg border border-border/80 bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary/60"
                      >
                        {meta.models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label} — {m.note}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Add API Key
                      </label>
                      <button
                        type="button"
                        aria-label={`Paste ${meta.label} API key`}
                        className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        onClick={() => handleClipboardPaste(meta.id)}
                        onPaste={(event) => {
                          event.preventDefault();
                          addKeyValue(meta.id, event.clipboardData.getData("text"));
                        }}
                      >
                        <Clipboard className="h-3.5 w-3.5" />
                        Paste key from clipboard
                      </button>
                      <div className="mt-1 flex justify-end">
                        <a
                          href={meta.getKeyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          Get API key <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Stored keys ({providerKeys.length})
                    </p>
                    <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                      {providerKeys.length === 0 && (
                        <div className="rounded-lg border border-dashed border-border/80 p-5 text-center text-xs text-muted-foreground">
                          No {meta.label} keys yet. Add one above to start generating.
                        </div>
                      )}
                      {providerKeys.map((k) => {
                        const isActive = k.id === activeId;
                        const shown = reveal[k.id];
                        return (
                          <div
                            key={k.id}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                              isActive
                                ? "border-primary/60 bg-primary/5"
                                : "border-border/80 bg-background",
                            )}
                          >
                            <button
                              onClick={() => store.setActiveId(k.id)}
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
                                isActive
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border/80 bg-background hover:border-primary/50",
                              )}
                              title={isActive ? "Active key" : "Set as active"}
                            >
                              {isActive && <Check className="h-2.5 w-2.5" />}
                            </button>

                            <code className="flex-1 truncate font-mono text-[11px]">
                              {shown ? k.key : maskKey(k.key)}
                            </code>

                            {k.status === "healthy" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Ready
                              </span>
                            )}
                            {k.status === "exhausted" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Quota
                              </span>
                            )}
                            {k.status === "invalid" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
                                <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Invalid
                              </span>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleVerify(k.id, k.key, meta.id)}
                              disabled={verifying === k.id}
                              title="Verify key"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => setReveal((r) => ({ ...r, [k.id]: !r[k.id] }))}
                              title={shown ? "Hide" : "Show"}
                            >
                              {shown ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={() => store.removeKey(k.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
              <span>Saved locally in browser storage.</span>
              <Button size="sm" className="h-8 rounded-lg text-xs" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
