import { useEffect, useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  SlidersHorizontal,
  Sparkles,
  TextCursorInput,
  Type,
  Hash,
  AlignLeft,
  Ban,
  Wand2,
  Tag,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysDialog } from "./ApiKeysDialog";
import { cn } from "@/lib/utils";
import { useGenSettings, type ExportPlatform } from "@/lib/gen-settings";
import { GEMINI_MODELS } from "@/lib/gemini";
import { GROK_MODELS } from "@/lib/grok";
import { useKeyStore } from "@/lib/keys-store";

const PLATFORMS: { id: ExportPlatform; label: string; abbr: string; available: boolean }[] = [
  { id: "general", label: "General", abbr: "✦", available: true },
  { id: "adobe", label: "Adobe Stock", abbr: "St", available: true },
  { id: "shutterstock", label: "Shutterstock", abbr: "Ss", available: false },
  { id: "freepik", label: "FreePik", abbr: "Fp", available: false },
  { id: "vecteezy", label: "Vecteezy", abbr: "V", available: false },
  { id: "pond5", label: "Pond5", abbr: "P5", available: false },
];

const cardCls = "rounded-xl border border-border/80 bg-card p-4 shadow-sm";

export function ControlsSidebar() {
  const { settings, update } = useGenSettings();
  const [tab, setTab] = useState<"metadata" | "prompt">("metadata");
  const [open, setOpen] = useState(true);
  const keyStore = useKeyStore();
  const activeModelLabel =
    keyStore.provider === "grok"
      ? GROK_MODELS.find((m) => m.id === keyStore.model)?.label ?? "xAI Grok"
      : GEMINI_MODELS.find((m) => m.id === keyStore.model)?.label ?? "Google Gemini";

  return (
    <aside className="space-y-4">
      {/* Controls card */}
      <section className={cardCls}>
        <header className="mb-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <h2 className="text-sm font-bold text-foreground">Controls</h2>
              <p className="text-[11px] text-muted-foreground">{activeModelLabel}</p>
            </div>
          </div>
          <ApiKeysDialog />
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/60 p-1">
            <TabsTrigger
              value="metadata"
              className="gap-1.5 rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Metadata
            </TabsTrigger>
            <TabsTrigger
              value="prompt"
              className="gap-1.5 rounded-md text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <TextCursorInput className="h-3.5 w-3.5" />
              Prompt
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Prompt tab — custom AI prompt + custom always-include keywords */}
      {tab === "prompt" && (
        <section className={cn(cardCls, "space-y-4")}>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Wand2 className="h-3.5 w-3.5 text-foreground" />
                Custom AI Prompt
              </span>
              <Switch
                checked={settings.customPromptEnabled}
                onCheckedChange={(v) => update("customPromptEnabled", v)}
              />
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">
              Extra instructions for the AI when generating title and keywords.
            </p>
            <DebouncedTextarea
              value={settings.customPrompt}
              onValueChange={(v) => update("customPrompt", v)}
              disabled={!settings.customPromptEnabled}
              placeholder="e.g. Focus on minimalist composition, mention lighting style, prefer cinematic mood…"
              rows={5}
              className="resize-none rounded-lg border-border/80 bg-background text-xs leading-relaxed"
            />
          </div>

          <div className="border-t border-border/60 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Tag className="h-3.5 w-3.5 text-foreground" />
                Custom Keywords
              </span>
              <Switch
                checked={settings.customKeywordsEnabled}
                onCheckedChange={(v) => update("customKeywordsEnabled", v)}
              />
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">
              Always include these keywords (placed first, deduped).
            </p>
            <DebouncedTextarea
              value={settings.customKeywords}
              onValueChange={(v) => update("customKeywords", v)}
              disabled={!settings.customKeywordsEnabled}
              placeholder="ai generated, concept art, isolated"
              rows={3}
              className="resize-none rounded-lg border-border/80 bg-background text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>Adobe Stock guidelines stay enforced. Custom prompt only adds focus without breaking JSON schema.</span>
          </div>
        </section>
      )}

      {/* Metadata Settings */}
      {tab === "metadata" && (
        <section className={cardCls}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <SlidersHorizontal className="h-3 w-3" />
              </div>
              <span className="text-xs font-bold text-foreground">Metadata Settings</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </button>

          {open && (
            <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
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
                          "group relative flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all",
                          active
                            ? "border-primary/60 bg-primary/10 text-primary font-semibold"
                            : "border-border/80 bg-background hover:border-primary/40 hover:bg-muted",
                          !p.available && "cursor-not-allowed opacity-40",
                        )}
                        title={p.available ? "" : "Coming soon"}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {p.abbr}
                        </span>
                        <span className="flex-1 truncate text-xs">{p.label}</span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SliderField
                icon={<AlignLeft className="h-3.5 w-3.5" />}
                label="Title Length"
                value={settings.titleLength}
                unit="chars"
                min={30}
                max={200}
                step={5}
                onChange={(v) => update("titleLength", v)}
                hint={settings.titleLength > 130 ? "Adobe recommends ≤ 130 (max 200)" : undefined}
              />

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Type className="h-3.5 w-3.5" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Description</span>
                </div>
                <span className="text-[11px] text-muted-foreground">150 chars (fixed)</span>
              </div>

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

              <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>
                  Use the Prompt tab to add a custom AI instruction or always-include keywords.
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
          <span className="text-sm font-bold text-foreground tabular-nums">{value}</span>
          <span className="text-[10px] text-muted-foreground">{unit}</span>
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

function DebouncedInput({
  value,
  onValueChange,
  delay = 250,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  delay?: number;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const id = window.setTimeout(() => onValueChange(draft), delay);
    return () => window.clearTimeout(id);
  }, [delay, draft, onValueChange, value]);

  return <Input {...props} value={draft} onChange={(e) => setDraft(e.target.value)} />;
}

function DebouncedTextarea({
  value,
  onValueChange,
  delay = 250,
  ...props
}: Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  delay?: number;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const id = window.setTimeout(() => onValueChange(draft), delay);
    return () => window.clearTimeout(id);
  }, [delay, draft, onValueChange, value]);

  return <Textarea {...props} value={draft} onChange={(e) => setDraft(e.target.value)} />;
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
    <div
      className={cn(
        "rounded-lg border bg-background/50 px-3 py-2 transition-colors",
        enabled ? "border-foreground/20" : "border-border/60",
      )}
    >
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
        <DebouncedInput
          value={value}
          onValueChange={onChangeValue}
          placeholder={placeholder}
          className="mt-2 h-8 rounded-md border-border/80 bg-background text-xs"
        />
      )}
    </div>
  );
}
