import { useState } from "react";
import { Check, Eye, EyeOff, KeyRound, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GEMINI_MODELS, verifyApiKey } from "@/lib/gemini";
import { maskKey, useKeyStore } from "@/lib/keys-store";
import { toast } from "sonner";

export function ApiKeysDialog() {
  const store = useKeyStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [verifying, setVerifying] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("AIza")) {
      toast.error("That doesn't look like a Gemini API key (should start with AIza...)");
      return;
    }
    store.addKey(trimmed);
    setDraft("");
    toast.success("Key added");
  };

  const handleVerify = async (id: string, key: string) => {
    setVerifying(id);
    try {
      const ok = await verifyApiKey(key);
      store.setStatus(id, ok ? "healthy" : "invalid");
      toast[ok ? "success" : "error"](ok ? "Key is healthy" : "Key is invalid");
    } catch {
      store.setStatus(id, "invalid");
      toast.error("Could not reach Gemini API");
    } finally {
      setVerifying(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <KeyRound className="h-4 w-4" />
          API Keys
          {store.keys.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {store.keys.length}
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
            Google Gemini
            <Badge className="ml-1 bg-success text-success-foreground hover:bg-success/90">
              Free & Paid
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Bring your own Gemini API key. Keys are stored locally in your browser only — never sent to
            our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Model
              </label>
              <Select value={store.model} onValueChange={(v) => store.setModel(v as typeof store.model)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GEMINI_MODELS.map((m) => (
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
                  placeholder="Enter Gemini API key"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                />
                <Button size="icon" onClick={handleAdd} aria-label="Add key">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <a
                href="https://aistudio.google.com/apikey"
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
              Stored keys ({store.keys.length})
            </p>
            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {store.keys.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No keys stored yet. Add one above to start generating metadata.
                </div>
              )}
              {store.keys.map((k) => {
                const isActive = k.id === store.activeKey?.id;
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
                      onClick={() => handleVerify(k.id, k.key)}
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

          <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
            <span>Keys are encrypted &amp; stored locally in your browser.</span>
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
