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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <KeyRound className="h-4 w-4" />
          API Keys
          {totalKeys > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {totalKeys}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <KeyRound className="h-3.5 w-3.5" />
            </span>
            AI Provider Keys
            <Badge className="ml-1 bg-success text-success-foreground hover:bg-success/90">
              Free & Paid
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Choose a provider and bring your own API key. Keys are stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={store.provider} onValueChange={(v) => store.setProvider(v as Provider)}>
          <TabsList className="grid w-full grid-cols-2">
            {PROVIDERS.map((p) => (
              <TabsTrigger key={p.id} value={p.id} className="gap-2">
                {p.label}
                {store.keysFor(p.id).length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    {store.keysFor(p.id).length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {PROVIDERS.map((meta) => {
            const providerKeys = store.keysFor(meta.id);
            const activeId = store.activeIdFor(meta.id);
            const currentModel = store.models[meta.id];
            return (
              <TabsContent key={meta.id} value={meta.id} className="mt-4 space-y-5">
                <p className="text-xs text-muted-foreground">{meta.description}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Model
                    </label>
                    <Select
                      value={currentModel}
                      onValueChange={(v) => {
                        if (meta.id === "gemini") store.setModelFor("gemini", v as GeminiModel);
                        else store.setModelFor("grok", v as GrokModel);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {meta.models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{m.label}</span>
                              <span className="text-[11px] text-muted-foreground">{m.note}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>Keys are stored locally in your browser only.</span>
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
