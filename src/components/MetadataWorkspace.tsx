import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  Video,
  FileImage,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { generateMetadata, type GeminiModel, type StockMetadata } from "@/lib/gemini";
import { generateMetadataGrok, type GrokModel } from "@/lib/grok";
import { useKeyStore } from "@/lib/keys-store";
import { buildAdobeCsv, downloadText } from "@/lib/csv";
import type { GenSettings } from "@/lib/gen-settings";
import { toast } from "sonner";

type Status = "pending" | "running" | "done" | "error";

interface Item {
  id: string;
  file: File;
  previewUrl: string;
  status: Status;
  error?: string;
  meta?: StockMetadata;
}

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 100;

function applyPostProcessing(meta: StockMetadata, settings: GenSettings): StockMetadata {
  let title = meta.title;
  if (settings.prefixEnabled && settings.prefix.trim()) {
    title = `${settings.prefix.trim()} ${title}`;
  }
  if (settings.suffixEnabled && settings.suffix.trim()) {
    title = `${title} ${settings.suffix.trim()}`;
  }
  title = title.slice(0, settings.titleLength);

  let keywords = meta.keywords;
  if (settings.negativeKeywordsEnabled && settings.negativeKeywords.trim()) {
    const blocked = new Set(
      settings.negativeKeywords
        .split(/[,\n]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    );
    keywords = keywords.filter((k) => !blocked.has(k.toLowerCase()));
  }
  // Always-include custom keywords (split to single words, prepend, dedupe, cap at 49)
  if (settings.customKeywordsEnabled && settings.customKeywords.trim()) {
    const extra = settings.customKeywords
      .split(/[,\n\s\-/_]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 1 && /^[a-z0-9]+$/i.test(s));
    const seen = new Set<string>();
    keywords = [...extra, ...keywords]
      .filter((k) => {
        const key = k.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 49);
  }
  return { ...meta, title, keywords };
}

interface Props {
  settings: GenSettings;
}

export function MetadataWorkspace({ settings }: Props) {
  const store = useKeyStore();
  const [items, setItems] = useState<Item[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.status === "done").length;
    const errors = items.filter((i) => i.status === "error").length;
    return { total, done, errors };
  }, [items]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const accepted: Item[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is larger than 10 MB — skipped`);
        continue;
      }
      accepted.push({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: "pending",
      });
    }
    if (accepted.length === 0) return;
    setItems((prev) => {
      const combined = [...prev, ...accepted];
      if (combined.length > MAX_FILES) {
        toast.error(`Max ${MAX_FILES} files — extra files were dropped`);
        combined.slice(MAX_FILES).forEach((i) => URL.revokeObjectURL(i.previewUrl));
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
  };

  const runGeneration = async () => {
    if (!store.activeKey) {
      toast.error(`Add a ${store.provider === "grok" ? "Grok" : "Gemini"} API key first (Controls → API Keys)`);
      return;
    }
    const queue = items.filter((i) => i.status === "pending" || i.status === "error");
    if (queue.length === 0) {
      toast.info("Nothing to generate — all items are done");
      return;
    }
    setRunning(true);
    for (const item of queue) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "running", error: undefined } : i)));
      try {
        const genOpts = {
          titleLength: settings.titleLength,
          keywordCount: settings.keywordCount,
          negativeTitleWords: settings.negativeTitleEnabled ? settings.negativeTitleWords : "",
          negativeKeywords: settings.negativeKeywordsEnabled ? settings.negativeKeywords : "",
          customPrompt: settings.customPromptEnabled ? settings.customPrompt : "",
          requiredKeywords: settings.customKeywordsEnabled ? settings.customKeywords : "",
        };
        const raw =
          store.provider === "grok"
            ? await generateMetadataGrok(item.file, store.activeKey.key, store.model as GrokModel, genOpts)
            : await generateMetadata(item.file, store.activeKey.key, store.model as GeminiModel, genOpts);
        const meta = applyPostProcessing(raw, settings);
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "done", meta } : i)));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Generation failed";
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error", error: msg } : i)),
        );
        if (/api key|invalid|permission|unauthor/i.test(msg) && store.activeKey) {
          store.setStatus(store.activeKey.id, "invalid");
          toast.error("API key rejected — stopping batch");
          break;
        }
      }
    }
    setRunning(false);
    toast.success("Batch complete");
  };

  const exportCsv = () => {
    const rows = items
      .filter((i) => i.status === "done" && i.meta)
      .map((i) => ({ filename: i.file.name, meta: i.meta! }));
    if (rows.length === 0) {
      toast.error("No completed items to export");
      return;
    }
    const csv = buildAdobeCsv(rows);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`adobe-stock-${stamp}.csv`, csv);
    toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const copyMeta = async (m: StockMetadata) => {
    const text = `Title: ${m.title}\nKeywords: ${m.keywords.join(", ")}\nCategory: ${m.category} (${m.categoryLabel})`;
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      {/* Upload card */}
      <section className="glass rounded-2xl shadow-[var(--shadow-card)]">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
            <Upload className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-bold">Upload Files</h2>
        </header>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "m-4 cursor-pointer rounded-2xl border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition-all",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/30",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-card shadow-[var(--shadow-card)]">
            <Upload className="h-5 w-5 text-foreground" />
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
            <FormatChip icon={<ImageIcon className="h-3 w-3" />} label="Images" active />
            <FormatChip icon={<Video className="h-3 w-3" />} label="Videos" />
            <FormatChip icon={<FileImage className="h-3 w-3" />} label="SVG" />
            <FormatChip icon={<FileImage className="h-3 w-3" />} label="EPS" />
          </div>
          <p className="text-sm text-foreground">
            Drag &amp; drop files here, or{" "}
            <span className="font-semibold text-primary underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Supports image · JPG, PNG &amp; WebP up to 10 MB · Max {MAX_FILES} files
          </p>
        </div>
      </section>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass rounded-2xl px-4 py-3 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {items.length === 0 ? (
            <span className="text-muted-foreground">Upload files to begin.</span>
          ) : (
            <>
              <Badge variant="secondary" className="gap-1.5">
                <ImageIcon className="h-3 w-3" />
                {stats.total} file{stats.total === 1 ? "" : "s"}
              </Badge>
              {stats.done > 0 && (
                <Badge className="gap-1.5 bg-success text-success-foreground hover:bg-success/90">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats.done} ready
                </Badge>
              )}
              {stats.errors > 0 && (
                <Badge variant="destructive" className="gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  {stats.errors} failed
                </Badge>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={clearAll}
            disabled={running || items.length === 0}
            className="gap-1.5 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </Button>
          <Button
            size="sm"
            onClick={runGeneration}
            disabled={running || items.length === 0}
            className="gap-1.5 bg-foreground text-background shadow-sm hover:bg-foreground/90"
          >
            {running ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Generate All
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportCsv}
            disabled={stats.done === 0}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center glass rounded-2xl border border-dashed border-primary/30 px-6 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Your generated results will appear here.
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Upload some files and click &ldquo;Generate All&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onRemove={() => removeItem(item.id)}
              onCopy={() => item.meta && copyMeta(item.meta)}
              onDownload={() => {
                if (!item.meta) return;
                const csv = buildAdobeCsv([{ filename: item.file.name, meta: item.meta }]);
                downloadText(`${item.file.name.replace(/\.[^.]+$/, "")}.csv`, csv);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FormatChip({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground line-through opacity-60",
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function ItemCard({
  item,
  onRemove,
  onCopy,
  onDownload,
}: {
  item: Item;
  onRemove: () => void;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <article className="overflow-hidden glass rounded-2xl shadow-[var(--shadow-card)] transition-shadow hover:shadow-md">
      <div className="grid gap-4 p-4 sm:grid-cols-[120px_1fr]">
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
          <button
            onClick={onRemove}
            className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background text-muted-foreground shadow ring-1 ring-border transition-colors hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground" title={item.file.name}>
              {item.file.name}
            </p>
            <StatusPill status={item.status} />
          </div>

          {item.status === "error" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {item.error}
            </div>
          )}

          {item.status === "done" && item.meta && (
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Title
                  </p>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {item.meta.title.length} chars
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{item.meta.title}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Keywords ({item.meta.keywords.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.meta.keywords.map((kw, i) => (
                    <span
                      key={`${kw}-${i}`}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[11px]",
                        i < 10
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Category: <span className="font-medium text-foreground">{item.meta.category}</span> ·{" "}
                  {item.meta.categoryLabel}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 gap-1 text-xs">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={onDownload} className="h-7 gap-1 text-xs">
                    <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(item.status === "pending" || item.status === "running") && (
            <div className="flex flex-1 items-center text-xs text-muted-foreground">
              {item.status === "running" ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Analyzing image with Gemini…
                </span>
              ) : (
                <span>Waiting in queue</span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string; icon: React.ReactNode }> = {
    pending: {
      label: "Pending",
      cls: "bg-muted text-muted-foreground",
      icon: <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />,
    },
    running: {
      label: "Generating",
      cls: "bg-primary/10 text-primary",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    done: {
      label: "Ready",
      cls: "bg-success/15 text-success",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    error: {
      label: "Error",
      cls: "bg-destructive/10 text-destructive",
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };
  const v = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        v.cls,
      )}
    >
      {v.icon} {v.label}
    </span>
  );
}
