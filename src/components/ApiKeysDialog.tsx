import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, KeyRound, Plus, Trash2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  keyPrefix: string;
  getKeyUrl: string;
  models: { id: string; label: string; note: string }[];
  verify: (key: string) => Promise<boolean>;
  description: string;
};

const PROVIDERS: ProviderMeta[] = [
  {
    id: "gemini",
    label: "Google Gemini",
    keyHint: "Enter Gemini API key",
    keyPrefix: "AIza",
    getKeyUrl: "https://aistudio.google.com/apikey",
    models: GEMINI_MODELS,
    verify: verifyApiKey,
    description: "Bring your own Gemini API key. Stored locally, never sent to our servers.",
  },
  {
    id: "grok",
    label: "xAI Grok",
    keyHint: "Enter Grok (xAI) API key",
    keyPrefix: "xai-",
    getKeyUrl: "https://console.x.ai/",
    models: GROK_MODELS,
    verify: verifyGrokKey,
    description: "Bring your own xAI Grok API key. Stored locally, never sent to our servers.",
  },
];

export function ApiKeysDialog() {
  const store = useKeyStore();
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<Provider, string>>({ gemini: "", grok: "" });
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState<string | null>(null);

  const handleAdd = (provider: Provider) => {
    const meta = PROVIDERS.find((p) => p.id === provider)!;
    const trimmed = drafts[provider].trim();
    if (!trimmed) return;
    if (!trimmed.toLowerCase().startsWith(meta.keyPrefix.toLowerCase())) {
      toast.error(`That doesn't look like a ${meta.label} key (should start with ${meta.keyPrefix}...)`);
      return;
    }
    store.addKey(trimmed, provider);
    setDrafts((d) => ({ ...d, [provider]: "" }));
    toast.success("Key added");
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
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <KeyRound className="h-4 w-4" />
        API Keys
        {totalKeys > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
            {totalKeys}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            aria-label="Close API key dialog"
            className="absolute inset-0 bg-background/80"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-keys-title"
            className="fixed left-1/2 top-1/2 z-10 grid max-h-[calc(100vh-2rem)] w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-lg"
          >
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 id="api-keys-title" className="flex items-center gap-2 text-lg font-semibold leading-none tracking-tight">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  <KeyRound className="h-3.5 w-3.5" />
                </span>
                AI Provider Keys
                <Badge className="ml-1 bg-success text-success-foreground hover:bg-success/90">
                  Free & Paid
                </Badge>
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a provider and bring your own API key. Keys are stored locally in your browser.
              </p>
            </div>

            <button
              aria-label="Close"
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid w-full grid-cols-2 rounded-md bg-muted p-1">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => store.setProvider(p.id)}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
                    store.provider === p.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p.label}
                  {store.keysFor(p.id).length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
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
                <div key={meta.id} className="space-y-5">
                  <p className="text-xs text-muted-foreground">{meta.description}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Model
                      </label>
                      <select
                        value={currentModel}
                        onChange={(e) => {
                          if (meta.id === "gemini") store.setModelFor("gemini", e.target.value as GeminiModel);
                          else store.setModelFor("grok", e.target.value as GrokModel);
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm outline-none focus:ring-1 focus:ring-ring"
                      >
                        {meta.models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label} — {m.note}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">Supports image analysis</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Add API key
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder={meta.keyHint}
                          value={drafts[meta.id]}
                          onChange={(e) => setDrafts((d) => ({ ...d, [meta.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAdd(meta.id);
                          }}
                        />
                        <Button size="icon" onClick={() => handleAdd(meta.id)} aria-label="Add key">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <a
                        href={meta.getKeyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                      >
                        Get API key <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Stored keys ({providerKeys.length})
                    </p>
                    <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                      {providerKeys.length === 0 && (
                        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
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
                              "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-colors",
                              isActive ? "border-primary/60 ring-1 ring-primary/20" : "border-border",
                            )}
                          >
                            <button
                              onClick={() => store.setActiveId(k.id)}
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                                isActive
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background hover:border-primary/50",
                              )}
                              title={isActive ? "Active key" : "Set as active"}
                            >
                              {isActive && <Check className="h-3 w-3" />}
                            </button>

                            <code className="flex-1 truncate font-mono text-xs">
                              {shown ? k.key : maskKey(k.key)}
                            </code>

                            {k.status === "healthy" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Healthy
                              </span>
                            )}
                            {k.status === "invalid" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                                <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Invalid
                              </span>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleVerify(k.id, k.key, meta.id)}
                              disabled={verifying === k.id}
                              title="Verify key"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => setReveal((r) => ({ ...r, [k.id]: !r[k.id] }))}
                              title={shown ? "Hide" : "Show"}
                            >
                              {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => store.removeKey(k.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>Keys are stored locally in your browser only.</span>
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
