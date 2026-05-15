import { useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  Lock,
  SlidersHorizontal,
  Sparkles,
  TextCursorInput,
  Type,
  Hash,
  AlignLeft,
  Ban,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysDialog } from "./ApiKeysDialog";
import { cn } from "@/lib/utils";
import type { ExportPlatform, GenSettings } from "@/lib/gen-settings";
import { GEMINI_MODELS } from "@/lib/gemini";
import { useKeyStore } from "@/lib/keys-store";

interface Props {
  settings: GenSettings;
  update: <K extends keyof GenSettings>(k: K, v: GenSettings[K]) => void;
}

const PLATFORMS: { id: ExportPlatform; label: string; abbr: string; available: boolean }[] = [
  { id: "general", label: "General", abbr: "✦", available: false },
  { id: "adobe", label: "Adobe Stock", abbr: "St", available: true },
  { id: "shutterstock", label: "Shutterstock", abbr: "Ss", available: false },
  { id: "freepik", label: "FreePik", abbr: "Fp", available: false },
  { id: "vecteezy", label: "Vecteezy", abbr: "V", available: false },
  { id: "pond5", label: "Pond5", abbr: "P5", available: false },
];

export function ControlsSidebar({ settings, update }: Props) {
  const [tab, setTab] = useState<"metadata" | "prompt">("metadata");
  const [open, setOpen] = useState(true);
  const keyStore = useKeyStore();
  const activeModelLabel =
    GEMINI_MODELS.find((m) => m.id === keyStore.model)?.label ?? "Google Gemini";

  return (
    <aside className="space-y-4">
      {/* Controls card */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <header className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <h2 className="text-sm font-bold">Controls</h2>
              <p className="text-[11px] text-muted-foreground">{activeModelLabel}</p>
            </div>
          </div>
          <ApiKeysDialog />
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
            <TabsTrigger
              value="metadata"
              className="gap-1.5 rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Metadata
            </TabsTrigger>
            <TabsTrigger
              value="prompt"
              className="gap-1.5 rounded-lg data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              <TextCursorInput className="h-3.5 w-3.5" />
              Prompt
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "prompt" && (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
            <Lock className="mx-auto mb-2 h-4 w-4" />
            Custom prompts are coming soon. Adobe Stock guidelines are applied automatically.
          </div>
        )}
      </section>

      {/* Metadata Settings */}
      {tab === "metadata" && (
        <section className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold">Metadata Settings</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </button>

          {open && (
            <div className="space-y-5 border-t border-border p-4">
              {/* Export platform */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Export Platform
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => {
                    const active = settings.platform === p.id;
                    return (
                      <button
                        key={p.id}
                        disabled={!p.available}
                        onClick={() => p.available && update("platform", p.id)}
                        className={cn(
                          "group relative flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all",
                          active
                            ? "border-transparent bg-foreground text-background shadow-sm"
                            : "border-border bg-card hover:border-foreground/30",
                          !p.available && "cursor-not-allowed opacity-45",
                        )}
                        title={p.available ? "" : "Coming soon"}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                            active ? "bg-background/15 text-background" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {p.abbr}
                        </span>
                        <span className="flex-1 truncate font-medium">{p.label}</span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title length */}
              <SliderField
                icon={<AlignLeft className="h-3.5 w-3.5" />}
                label="Title Length"
                value={settings.titleLength}
                unit="chars"
                min={30}
                max={200}
                step={5}
                onChange={(v) => update("titleLength", v)}
                hint={settings.titleLength > 70 ? "Adobe recommends ≤ 70" : undefined}
              />

              {/* Description (placeholder, fixed) */}
              <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Type className="h-3.5 w-3.5" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Description</span>
                </div>
                <span className="text-muted-foreground">150 chars (fixed)</span>
              </div>

              {/* Keywords count */}
              <SliderField
                icon={<Hash className="h-3.5 w-3.5" />}
                label="Keywords Count"
                value={settings.keywordCount}
                unit="keywords"
                min={10}
                max={49}
                step={1}
                onChange={(v) => update("keywordCount", v)}
              />

              {/* Options */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Options
                </p>

                <ToggleRow
                  label="Prefix"
                  enabled={settings.prefixEnabled}
                  onToggle={(v) => update("prefixEnabled", v)}
                  value={settings.prefix}
                  onChangeValue={(v) => update("prefix", v)}
                  placeholder="Premium..."
                  accent="text-primary"
                />
                <ToggleRow
                  label="Suffix"
                  enabled={settings.suffixEnabled}
                  onToggle={(v) => update("suffixEnabled", v)}
                  value={settings.suffix}
                  onChangeValue={(v) => update("suffix", v)}
                  placeholder="...for design"
                />
                <ToggleRow
                  icon={<Ban className="h-3.5 w-3.5" />}
                  label="Negative Title Words"
                  enabled={settings.negativeTitleEnabled}
                  onToggle={(v) => update("negativeTitleEnabled", v)}
                  value={settings.negativeTitleWords}
                  onChangeValue={(v) => update("negativeTitleWords", v)}
                  placeholder="word1, word2"
                />
                <ToggleRow
                  icon={<Ban className="h-3.5 w-3.5" />}
                  label="Negative Keywords"
                  enabled={settings.negativeKeywordsEnabled}
                  onToggle={(v) => update("negativeKeywordsEnabled", v)}
                  value={settings.negativeKeywords}
                  onChangeValue={(v) => update("negativeKeywords", v)}
                  placeholder="keyword1, keyword2"
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  &ldquo;isolated on transparent background&rdquo; is auto-added for PNGs.
                </span>
              </div>
            </div>
          )}
        </section>
      )}
    </aside>
  );
}

function SliderField({
  icon,
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-primary tabular-nums">{value}</span>
          <span className="text-[11px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
      {hint && (
        <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  enabled,
  onToggle,
  value,
  onChangeValue,
  placeholder,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  value: string;
  onChangeValue: (v: string) => void;
  placeholder: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            accent ?? "text-foreground",
          )}
        >
          {icon}
          {label}
        </span>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      {enabled && (
        <Input
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          className="mt-2 h-8 text-xs"
        />
      )}
    </div>
  );
}
