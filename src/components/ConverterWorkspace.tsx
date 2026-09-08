import { useCallback, useRef, useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
  FileImage,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { convertVectorViaWasm } from "@/lib/export-utils";

type Status = "pending" | "running" | "done" | "error";

interface ConverterItem {
  id: string;
  file: File;
  previewUrl: string;
  status: Status;
  error?: string;
  resultBlob?: Blob;
}

const ACCEPT = ".eps,.ai";
const MAX_BYTES = 30 * 1024 * 1024;
const MAX_FILES = 100;

export function ConverterWorkspace() {
  const [items, setItems] = useState<ConverterItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.status === "done").length;
    const errors = items.filter((i) => i.status === "error").length;
    return { total, done, errors };
  }, [items]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const accepted: ConverterItem[] = [];
    for (const f of Array.from(files)) {
      const ext = f.name.split(".").pop()?.toLowerCase();
      const isAllowedType = ext === "eps" || ext === "ai";
      if (!isAllowedType) {
        toast.error(`${f.name} is not an EPS or AI file.`);
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

  const runConversion = async () => {
    const queue = items.filter((i) => i.status === "pending" || i.status === "error");
    if (queue.length === 0) {
      toast.info("Nothing to convert — all items are done");
      return;
    }
    setRunning(true);

    for (const item of queue) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "running", error: undefined } : i)));
      
      try {
        const blob = await convertVectorViaWasm(item.file);
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "done", resultBlob: blob } : i)));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Conversion failed";
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error", error: msg } : i)),
        );
      }
    }
    setRunning(false);
    toast.success("Conversion batch complete!");
  };

  const exportZip = async () => {
    const doneItems = items.filter((i) => i.status === "done" && i.resultBlob);
    if (doneItems.length === 0) {
      toast.error("No converted items to export");
      return;
    }

    setExporting(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      
      for (const item of doneItems) {
        const baseName = item.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${baseName}.jpg`, item.resultBlob!);
      }

      const stamp = new Date().toISOString().slice(0, 10);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learnstock-vectors-${stamp}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("ZIP downloaded successfully!");
    } catch (e) {
      toast.error("Failed to generate ZIP");
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload card */}
      <section className="rounded-xl border border-border/80 bg-card shadow-sm">
        <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Upload className="h-3 w-3" />
          </div>
          <h2 className="text-xs font-bold text-foreground">Upload Vector Files</h2>
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
            <FormatChip icon={<FileImage className="h-3 w-3" />} label="EPS" active />
            <FormatChip icon={<FileImage className="h-3 w-3" />} label="AI" active />
          </div>
          <p className="text-xs text-foreground">
            Drag &amp; drop EPS/AI files here, or{" "}
            <span className="font-semibold text-primary underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Max {MAX_FILES} files
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
                <FileImage className="h-3 w-3" />
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
            onClick={runConversion}
            disabled={running || items.length === 0}
            className="h-8 gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-sm hover:bg-primary/90 disabled:opacity-40"
          >
            {running ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Converting…
              </>
            ) : (
              <>
                <ImageIcon className="h-3.5 w-3.5" /> Convert All
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={exportZip}
            disabled={stats.done === 0 || exporting}
            className="h-8 gap-1.5 rounded-lg border-primary/40 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 disabled:opacity-40"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export ZIP
          </Button>
        </div>
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FileImage className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Converted JPEGs will appear here.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload EPS/AI files and click &ldquo;Convert All&rdquo; to begin.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/80 bg-card p-3 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground">
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.status === "pending" && <Badge variant="secondary" className="text-[10px]">Pending</Badge>}
                {item.status === "running" && <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Converting</Badge>}
                {item.status === "done" && <Badge className="bg-success text-success-foreground text-[10px]">Done</Badge>}
                {item.status === "error" && <Badge variant="destructive" className="text-[10px]">Error</Badge>}
                
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {item.error && (
                <div className="mt-2 w-full flex items-center gap-1.5 text-[10px] text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {item.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormatChip({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border/60 bg-muted/40 text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </div>
  );
}
