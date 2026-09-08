import { useCallback, useMemo, useRef, useState, useEffect } from "react";
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
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { generateMetadata, ADOBE_CATEGORIES, type GeminiModel, type StockMetadata } from "@/lib/gemini";
import { generateMetadataGrok, type GrokModel } from "@/lib/grok";
import { useKeyStore } from "@/lib/keys-store";
import { buildAdobeCsv, downloadText } from "@/lib/csv";
import { getGenSettings, type GenSettings } from "@/lib/gen-settings";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Status = "pending" | "running" | "done" | "error";

interface Item {
  id: string;
  file: File;
  previewUrl: string;
  status: Status;
  error?: string;
  meta?: StockMetadata;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/svg+xml,.eps,.ai";
const MAX_BYTES = 30 * 1024 * 1024;
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

export function MetadataWorkspace() {
  const store = useKeyStore();
  const [items, setItems] = useState<Item[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormats, setExportFormats] = useState<string[]>(["original", "eps", "jpg"]);
  const [csvExtensionMode, setCsvExtensionMode] = useState<"original" | "format">("format");
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [contributorName, setContributorName] = useState(() => localStorage.getItem("learnstock_contributor_name") || "JohnDoe");
  const [csvExtension, setCsvExtension] = useState<"eps" | "jpg" | "svg" | "png" | "original">("eps");
  const [removeCommas, setRemoveCommas] = useState(true);
  const [limitTitleLength, setLimitTitleLength] = useState(true);
  const [activeExportTab, setActiveExportTab] = useState<"csv" | "zip">("csv");

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.status === "done").length;
    const errors = items.filter((i) => i.status === "error").length;
    return { total, done, errors };
  }, [items]);

  const updateItemMeta = (id: string, newMeta: Partial<StockMetadata>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updatedMeta = { ...item.meta, ...newMeta } as StockMetadata;
        if (newMeta.category !== undefined) {
          const cat = ADOBE_CATEGORIES.find((c) => c.id === newMeta.category);
          updatedMeta.categoryLabel = cat?.label ?? "";
        }
        return { ...item, meta: updatedMeta };
      })
    );
  };

  const resetItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "pending", error: undefined, meta: undefined } : i))
    );
    toast.info("Item reset to pending");
  };

  const runSingleGeneration = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (!store.activeKey) {
      toast.error(`Add a ${store.provider === "grok" ? "Grok" : "Gemini"} API key first (Controls → API Keys)`);
      return;
    }

    const settings = getGenSettings();
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "running", error: undefined } : i)));

    const genOpts = {
      titleLength: settings.titleLength,
      keywordCount: settings.keywordCount,
      negativeTitleWords: settings.negativeTitleEnabled ? settings.negativeTitleWords : "",
      negativeKeywords: settings.negativeKeywordsEnabled ? settings.negativeKeywords : "",
      customPrompt: settings.customPromptEnabled ? settings.customPrompt : "",
      requiredKeywords: settings.customKeywordsEnabled ? settings.customKeywords : "",
      includeDescription: settings.platform === "general",
    };

    let currentKey = store.activeKey;
    try {
      const raw =
        store.provider === "grok"
          ? await generateMetadataGrok(item.file, currentKey.key, store.model as GrokModel, genOpts)
          : await generateMetadata(item.file, currentKey.key, store.model as GeminiModel, genOpts);
      const meta = applyPostProcessing(raw, settings);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "done", meta } : i)));
      toast.success(`Generated metadata for ${item.file.name}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "error", error: msg } : i)));
      toast.error(`Failed to generate metadata for ${item.file.name}: ${msg}`);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fileNameMatch = item.file.name.toLowerCase().includes(q);
        const titleMatch = item.meta?.title?.toLowerCase().includes(q) ?? false;
        return fileNameMatch || titleMatch;
      }
      return true;
    });
  }, [items, statusFilter, searchQuery]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const accepted: Item[] = [];
    for (const f of Array.from(files)) {
      const ext = f.name.split(".").pop()?.toLowerCase();
      const isAllowedType =
        f.type.startsWith("image/") ||
        ext === "eps" ||
        ext === "ai" ||
        ext === "svg";
      if (!isAllowedType) continue;
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} is larger than 30 MB — skipped`);
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
    const settings = getGenSettings();
    setRunning(true);
    const isQuotaError = (msg: string) =>
      /quota|rate.?limit|exceed|429|resource.?exhausted|too many requests|insufficient/i.test(msg);
    const isAuthError = (msg: string) =>
      /api key|invalid|permission|unauthor|forbidden|401|403/i.test(msg) && !isQuotaError(msg);

    const usedIds = new Set<string>();
    let currentKey = store.activeKey;
    usedIds.add(currentKey.id);

    const pickNextKey = () => {
      const pool = store.keysFor(store.provider).filter(
        (k) => !usedIds.has(k.id) && k.status !== "exhausted" && k.status !== "invalid",
      );
      return pool[0] ?? null;
    };

    for (const item of queue) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "running", error: undefined } : i)));
      const genOpts = {
        titleLength: settings.titleLength,
        keywordCount: settings.keywordCount,
        negativeTitleWords: settings.negativeTitleEnabled ? settings.negativeTitleWords : "",
        negativeKeywords: settings.negativeKeywordsEnabled ? settings.negativeKeywords : "",
        customPrompt: settings.customPromptEnabled ? settings.customPrompt : "",
        requiredKeywords: settings.customKeywordsEnabled ? settings.customKeywords : "",
        includeDescription: settings.platform === "general",
      };

      let lastError = "";
      let success = false;
      let stopBatch = false;

      while (currentKey) {
        try {
          const raw =
            store.provider === "grok"
              ? await generateMetadataGrok(item.file, currentKey.key, store.model as GrokModel, genOpts)
              : await generateMetadata(item.file, currentKey.key, store.model as GeminiModel, genOpts);
          const meta = applyPostProcessing(raw, settings);
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "done", meta } : i)));
          success = true;
          break;
        } catch (e) {
          lastError = e instanceof Error ? e.message : "Generation failed";
          if (isQuotaError(lastError)) {
            store.setStatus(currentKey.id, "exhausted");
            const next = pickNextKey();
            if (next) {
              usedIds.add(next.id);
              store.setActiveId(next.id);
              currentKey = next;
              toast.info(`Quota reached — switched to next key (…${next.key.slice(-4)})`);
              continue;
            }
            toast.error("All API keys exhausted — add a new key");
            stopBatch = true;
            break;
          }
          if (isAuthError(lastError)) {
            store.setStatus(currentKey.id, "invalid");
            const next = pickNextKey();
            if (next) {
              usedIds.add(next.id);
              store.setActiveId(next.id);
              currentKey = next;
              toast.warning(`Key rejected — switched to next key`);
              continue;
            }
            toast.error("API key rejected — no other keys available");
            stopBatch = true;
            break;
          }
          break;
        }
      }

      if (!success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error", error: lastError } : i)),
        );
        if (stopBatch) break;
      }
    }
    setRunning(false);
    toast.success("Batch complete");
  };

  const exportCsv = () => {
    const cleanName = contributorName.replace(/[^a-zA-Z0-9]/g, "") || "Contributor";
    localStorage.setItem("learnstock_contributor_name", cleanName);

    const rows = items
      .filter((i) => i.status === "done" && i.meta)
      .map((item) => {
        const baseName = item.file.name.replace(/\.[^.]+$/, "");
        const ext = csvExtension === "original"
          ? item.file.name.split(".").pop()
          : csvExtension;

        let title = item.meta!.title;
        if (removeCommas) {
          title = title.replace(/,/g, "");
        }
        if (limitTitleLength) {
          title = title.slice(0, 130);
        }

        return {
          filename: `${baseName}.${ext}`,
          meta: {
            ...item.meta!,
            title,
          },
        };
      });

    if (rows.length === 0) {
      toast.error("No completed items to export");
      return;
    }

    const csv = buildAdobeCsv(rows);
    const d = new Date();
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const y = String(d.getFullYear()).slice(-2);
    const dateStamp = `${m}_${date}_${y}`;
    const finalCsvName = `${cleanName}_${dateStamp}.csv`;

    downloadText(finalCsvName, csv);
    toast.success(`Exported CSV as ${finalCsvName}`);
    setExportDialogOpen(false);
  };

  const handlePackExport = async () => {
    const rows = items
      .filter((i) => i.status === "done" && i.meta)
      .map((i) => ({ file: i.file, meta: i.meta! }));
    if (rows.length === 0) {
      toast.error("No completed items to export");
      return;
    }

    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const zipName = `learnstock-export-${stamp}`;
      const { downloadZipArchive } = await import("@/lib/export-utils");
      
      await downloadZipArchive(
        rows,
        exportFormats,
        csvExtensionMode,
        zipName,
        (progressText) => setExportProgress(progressText)
      );

      toast.success("Export successful! ZIP downloaded.");
      setExportDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to generate export package");
    } finally {
      setExportProgress(null);
    }
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
      <section className="rounded-xl border border-border/80 bg-card shadow-sm">
        <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Upload className="h-3 w-3" />
          </div>
          <h2 className="text-xs font-bold text-foreground">Upload Files</h2>
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
            "m-4 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
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
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border/80 shadow-sm text-foreground">
            <Upload className="h-4 w-4" />
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
            <FormatChip icon={<ImageIcon className="h-3 w-3" />} label="Images" active />
            <FormatChip icon={<FileImage className="h-3 w-3" />} label="SVG" active />
            <FormatChip icon={<FileImage className="h-3 w-3" />} label="EPS" active />
            <FormatChip icon={<Video className="h-3 w-3" />} label="Videos" />
          </div>
          <p className="text-xs text-foreground">
            Drag &amp; drop files here, or{" "}
            <span className="font-semibold text-primary underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            JPG, PNG, WebP, SVG, EPS · up to 30 MB · Max {MAX_FILES} files
          </p>
        </div>
      </section>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {items.length === 0 ? (
            <span className="text-muted-foreground">Upload files to begin.</span>
          ) : (
            <>
              <Badge variant="secondary" className="gap-1.5 text-xs font-medium">
                <ImageIcon className="h-3 w-3" />
                {stats.total} file{stats.total === 1 ? "" : "s"}
              </Badge>
              {stats.done > 0 && (
                <Badge className="gap-1.5 bg-success text-success-foreground hover:bg-success/90 text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats.done} ready
                </Badge>
              )}
              {stats.errors > 0 && (
                <Badge variant="destructive" className="gap-1.5 text-xs font-medium">
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
            className="h-8 gap-1.5 rounded-lg border-border/80 text-xs hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </Button>
          <Button
            size="sm"
            onClick={runGeneration}
            disabled={running || items.length === 0}
            className="h-8 gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-sm hover:bg-primary/90 disabled:opacity-40"
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
            onClick={() => setExportDialogOpen(true)}
            disabled={stats.done === 0}
            className="h-8 gap-1.5 rounded-lg border-primary/40 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Export Pack
          </Button>
        </div>
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Your generated results will appear here.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload files and click &ldquo;Generate All&rdquo; to begin.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Results Queue
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Showing {filteredItems.length} of {items.length} items
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by file name or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 rounded-lg border border-border/80 bg-background pl-3 pr-8 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "pending", "running", "done", "error"] as const).map((status) => {
                  const count = status === "all"
                    ? items.length
                    : items.filter((i) => i.status === status).length;
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "h-8 rounded-lg border px-2.5 text-xs font-medium capitalize transition-colors flex items-center gap-1.5",
                        active
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{status}</span>
                      <span className={cn(
                        "text-[10px] rounded-full px-1.5 py-0.2 font-bold",
                        active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-12 text-center">
              <p className="text-xs font-medium text-muted-foreground">
                No items match your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredItems.map((item) => (
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
                  onUpdateMeta={(newMeta) => updateItemMeta(item.id, newMeta)}
                  onRegenerate={() => runSingleGeneration(item.id)}
                  onReset={() => resetItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={(open) => {
        if (!exportProgress) setExportDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px] border border-border/80 bg-card text-foreground rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Download className="h-4 w-4 text-primary" />
              Export Options
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure and download your metadata CSV or assets package.
            </DialogDescription>
          </DialogHeader>

          {exportProgress ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-semibold text-foreground">{exportProgress}</p>
              <p className="text-xs text-muted-foreground">This may take a moment depending on file sizes.</p>
            </div>
          ) : (
            <Tabs value={activeExportTab} onValueChange={(v) => setActiveExportTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/60 p-1 mb-4">
                <TabsTrigger value="csv" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Download CSV (Metadata)
                </TabsTrigger>
                <TabsTrigger value="zip" className="rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Download ZIP (Assets Pack)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4 py-1">
                {/* Contributor Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-0.5">
                    Contributor Name (used for CSV filename)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. JohnDoe"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                    className="h-9 rounded-lg border-border/80 bg-background text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground pl-0.5">
                    Adobe Stock spec: No spaces. Preview: <code className="text-primary font-bold">{contributorName.replace(/[^a-zA-Z0-9]/g, "") || "Contributor"}_{new Date().getMonth() + 1}_{new Date().getDate()}_{String(new Date().getFullYear()).slice(-2)}.csv</code>
                  </p>
                </div>

                {/* Filename Extension inside CSV */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-0.5">
                    Filename Extension Listed inside CSV
                  </label>
                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                    {(["eps", "jpg", "svg", "png", "original"] as const).map((ext) => (
                      <label key={ext} className="flex items-center gap-2 cursor-pointer py-1 font-medium capitalize">
                        <input
                          type="radio"
                          name="csvExt"
                          checked={csvExtension === ext}
                          onChange={() => setCsvExtension(ext)}
                          className="accent-primary"
                        />
                        <span>{ext === "original" ? "Original" : ext.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Adobe Stock compliance options */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-0.5">
                    Adobe Stock Compliance Options
                  </label>
                  <div className="flex flex-col gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="opt-commas"
                        checked={removeCommas}
                        onCheckedChange={(checked) => setRemoveCommas(!!checked)}
                      />
                      <label htmlFor="opt-commas" className="text-xs font-medium cursor-pointer select-none leading-none">
                        Remove commas from titles
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="opt-length"
                        checked={limitTitleLength}
                        onCheckedChange={(checked) => setLimitTitleLength(!!checked)}
                      />
                      <label htmlFor="opt-length" className="text-xs font-medium cursor-pointer select-none leading-none">
                        Limit titles to 130 characters
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4 mt-4">
                  <Button variant="ghost" onClick={() => setExportDialogOpen(false)} className="h-8 text-xs rounded-lg">
                    Cancel
                  </Button>
                  <Button
                    onClick={exportCsv}
                    className="h-8 rounded-lg bg-primary text-primary-foreground font-medium text-xs px-4 shadow-sm hover:bg-primary/90"
                  >
                    Download CSV File
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="zip" className="space-y-4 py-1">
                {/* Formats Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-0.5">
                    Select File Formats to Export in ZIP
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
                    {[
                      { id: "original", label: "Original File" },
                      { id: "jpg", label: "JPEG (.jpg)" },
                      { id: "png", label: "PNG (.png)" },
                      { id: "svg", label: "SVG Vector (.svg)" },
                      { id: "eps", label: "EPS Vector (.eps)" },
                      { id: "ai", label: "Illustrator (.ai)" },
                    ].map((f) => (
                      <div key={f.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`fmt-${f.id}`}
                          checked={exportFormats.includes(f.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setExportFormats([...exportFormats, f.id]);
                            } else {
                              setExportFormats(exportFormats.filter((x) => x !== f.id));
                            }
                          }}
                        />
                        <label htmlFor={`fmt-${f.id}`} className="text-xs font-medium cursor-pointer select-none">
                          {f.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CSV Filename Extension in ZIP */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-0.5">
                    ZIP CSV Filename Extension matching
                  </label>
                  <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="radio"
                        name="csvExtension"
                        checked={csvExtensionMode === "format"}
                        onChange={() => setCsvExtensionMode("format")}
                        className="accent-primary"
                      />
                      <span>Match primary exported format (e.g. <code>.eps</code>)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="radio"
                        name="csvExtension"
                        checked={csvExtensionMode === "original"}
                        onChange={() => setCsvExtensionMode("original")}
                        className="accent-primary"
                      />
                      <span>Keep original uploaded file extensions</span>
                    </label>
                  </div>
                </div>

                {items.some((item) => item.file.name.toLowerCase().endsWith(".eps") || item.file.name.toLowerCase().endsWith(".ai")) && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] text-amber-300 leading-normal">
                    Note: Pre-existing .eps/.ai files cannot be converted browser-side. They will be included in the zip as their original format.
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-border/60 pt-4 mt-4">
                  <Button variant="ghost" onClick={() => setExportDialogOpen(false)} className="h-8 text-xs rounded-lg">
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePackExport}
                    disabled={exportFormats.length === 0}
                    className="h-8 rounded-lg bg-primary text-primary-foreground font-medium text-xs px-4 shadow-sm hover:bg-primary/90"
                  >
                    Generate ZIP Pack
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground line-through opacity-50",
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
  onUpdateMeta,
  onRegenerate,
  onReset,
}: {
  item: Item;
  onRemove: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onUpdateMeta: (newMeta: Partial<StockMetadata>) => void;
  onRegenerate: () => void;
  onReset: () => void;
}) {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [bulkKeywords, setBulkKeywords] = useState("");

  useEffect(() => {
    if (item.meta?.keywords) {
      setBulkKeywords(item.meta.keywords.join(", "));
    }
  }, [item.meta?.keywords]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTag
      .replace(/[",;.!?()]/g, "")
      .trim()
      .toLowerCase();
    if (!clean) return;
    
    const words = clean.split(/[\s\-/_]+/).filter((w) => w.length > 1 && /^[a-z0-9]+$/i.test(w));
    if (words.length === 0) {
      setNewTag("");
      return;
    }
    
    const newKeywords = [...(item.meta?.keywords || [])];
    words.forEach((w) => {
      if (!newKeywords.includes(w)) newKeywords.push(w);
    });
    
    onUpdateMeta({ keywords: newKeywords.slice(0, 49) });
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!item.meta) return;
    onUpdateMeta({
      keywords: item.meta.keywords.filter((k) => k !== tag),
    });
  };

  const handleBulkKeywordsBlur = () => {
    const words = bulkKeywords
      .split(/[,\n]+/)
      .map((w) => w.trim().replace(/[",;.!?()]/g, ""))
      .flatMap((w) => w.split(/[\s\-/_]+/))
      .map((w) => w.toLowerCase())
      .filter((w) => w.length > 1 && w.length < 30 && /^[a-z0-9]+$/i.test(w));
    
    const deduped = Array.from(new Set(words)).slice(0, 49);
    onUpdateMeta({ keywords: deduped });
  };

  const isTitleWarning = item.meta ? item.meta.title.length > 130 : false;

  return (
    <article className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all hover:border-primary/40">
      <div className="grid gap-4 p-4 sm:grid-cols-[110px_1fr]">
        {/* Preview image */}
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center relative">
            {(() => {
              const ext = item.file.name.split(".").pop()?.toLowerCase();
              const isVectorPlaceholder = ext === "eps" || ext === "ai";
              if (isVectorPlaceholder) {
                return (
                  <div className="flex flex-col items-center justify-center text-center p-2 w-full h-full bg-muted/30">
                    <FileImage className="h-8 w-8 text-primary mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10">
                      {ext}
                    </span>
                    <span className="text-[9px] text-muted-foreground mt-1">Vector</span>
                  </div>
                );
              }
              return (
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              );
            })()}
          </div>
          <button
            onClick={onRemove}
            className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-card text-muted-foreground border border-border shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Content panel */}
        <div className="flex min-w-0 flex-col justify-between">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
            <p className="truncate text-xs font-bold text-foreground" title={item.file.name}>
              {item.file.name}
            </p>
            <div className="flex items-center gap-1.5">
              <StatusPill status={item.status} />
            </div>
          </div>

          {/* Running/Pending placeholders */}
          {item.status === "running" && (
            <div className="flex flex-1 items-center justify-center py-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Analyzing with AI…
              </span>
            </div>
          )}

          {item.status === "pending" && (
            <div className="flex flex-1 items-center justify-between py-5">
              <span className="text-xs text-muted-foreground">Ready for AI metadata generation</span>
              <Button
                size="sm"
                onClick={onRegenerate}
                className="h-7 px-3 gap-1.5 bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 rounded-lg shadow-sm"
              >
                <Sparkles className="h-3 w-3" /> Generate
              </Button>
            </div>
          )}

          {item.status === "error" && (
            <div className="flex flex-col gap-2.5 py-2">
              <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="leading-normal text-xs">{item.error}</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={onReset} className="h-7 text-xs gap-1 rounded-lg">
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
                <Button size="sm" onClick={onRegenerate} className="h-7 text-xs gap-1 rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> Retry
                </Button>
              </div>
            </div>
          )}

          {/* Done State metadata editing */}
          {item.status === "done" && item.meta && (
            <div className="space-y-3.5">
              {/* Title input */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Title
                  </label>
                  <span className={cn(
                    "text-[10px] tabular-nums font-medium rounded px-1.5 py-0.2",
                    isTitleWarning ? "bg-amber-500/10 text-amber-500 font-semibold" : "text-muted-foreground"
                  )}>
                    {item.meta.title.length} chars {isTitleWarning && "· Adobe recommends ≤ 130"}
                  </span>
                </div>
                <textarea
                  value={item.meta.title}
                  onChange={(e) => onUpdateMeta({ title: e.target.value })}
                  placeholder="Adobe-friendly title describing the visual subject..."
                  rows={2}
                  className={cn(
                    "w-full rounded-lg border border-border/80 bg-background p-2.5 text-xs text-foreground outline-none resize-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/20",
                    isTitleWarning && "border-amber-500/50 focus:border-amber-500"
                  )}
                />
              </div>

              {/* Description field */}
              {item.meta.description !== undefined && (
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Description
                    </label>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {item.meta.description.length}/150 chars
                    </span>
                  </div>
                  <textarea
                    value={item.meta.description}
                    onChange={(e) => onUpdateMeta({ description: e.target.value })}
                    placeholder="Short marketing description..."
                    maxLength={150}
                    rows={1}
                    className="w-full rounded-lg border border-border/80 bg-background p-2.5 text-xs text-foreground outline-none resize-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              )}

              {/* Category selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Adobe Category
                </span>
                <select
                  value={item.meta.category}
                  onChange={(e) => onUpdateMeta({ category: Number(e.target.value) })}
                  className="h-8 rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary/60"
                >
                  {ADOBE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keywords Tag/Bulk editor */}
              <div className="border-t border-border/60 pt-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Keywords ({item.meta.keywords.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    {isBulkMode ? "View Tags" : "Bulk Edit"}
                  </button>
                </div>

                {isBulkMode ? (
                  <div className="space-y-1.5">
                    <textarea
                      value={bulkKeywords}
                      onChange={(e) => setBulkKeywords(e.target.value)}
                      onBlur={handleBulkKeywordsBlur}
                      placeholder="Enter single-word keywords separated by commas..."
                      rows={4}
                      className="w-full rounded-lg border border-border/80 bg-background p-2.5 text-xs text-foreground font-mono resize-none outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Single-word terms required. Phrases auto-split on blur.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      {item.meta.keywords.map((kw, i) => (
                        <span
                          key={`${kw}-${i}`}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors",
                            i < 10
                              ? "bg-primary/10 text-primary font-medium border border-primary/20"
                              : "bg-muted text-muted-foreground border border-border/40"
                          )}
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(kw)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <form onSubmit={handleAddTag} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new keyword..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="h-8 flex-1 rounded-lg border border-border/80 bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 rounded-lg text-xs"
                      >
                        Add
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              {/* Individual Operations */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onReset}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRegenerate}
                    className="h-7 text-xs text-primary hover:text-primary/90 hover:bg-primary/5 rounded-lg"
                  >
                    <Sparkles className="h-3 w-3" /> Regenerate
                  </Button>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 gap-1 text-xs rounded-lg">
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={onDownload} className="h-7 gap-1 text-xs rounded-lg">
                    <FileSpreadsheet className="h-3 w-3" /> Export CSV
                  </Button>
                </div>
              </div>
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
      cls: "bg-muted text-muted-foreground border border-border/60",
      icon: <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />,
    },
    running: {
      label: "Generating",
      cls: "bg-primary/10 text-primary border border-primary/20",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    done: {
      label: "Ready",
      cls: "bg-success/15 text-success border border-success/30",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    error: {
      label: "Error",
      cls: "bg-destructive/10 text-destructive border border-destructive/20",
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
