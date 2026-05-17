import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  Upload,
  Wand2,
  Download,
  Zap,
  Layers,
  ShieldCheck,
  FileSpreadsheet,
  ChevronRight,
  Check,
  X,
  Lock,
} from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Learn Stock — AI metadata for Adobe Stock" },
      {
        name: "description",
        content:
          "Generate Adobe Stock titles, keywords and categories from your images using Gemini. Bring your own API key, export ready-to-upload CSV.",
      },
      { property: "og:title", content: "Learn Stock — AI metadata for Adobe Stock" },
      {
        property: "og:description",
        content:
          "Drop images, generate SEO-optimized Adobe Stock metadata with Gemini, export CSV.",
      },
    ],
  }),
});

function Landing() {
  useReveal();
  return (
    <div className="min-h-screen text-foreground">
      {/* Scroll-driven progress bar (no JS per-frame) */}
      <div className="pointer-events-none fixed left-0 top-0 z-50 h-0.5 w-full origin-left scroll-progress bg-gradient-to-r from-primary via-primary-glow to-primary" />
      <header className="sticky top-0 z-30 glass border-b border-primary/15">

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)]">
              <img src={logoIcon} alt="Learn Stock" className="h-4.5 w-4.5" />
            </span>
            <span className="text-sm font-bold tracking-tight">Learn Stock</span>
          </Link>
          <nav className="hidden items-center gap-6 text-xs text-muted-foreground md:flex">
            <a href="#features" className="link-underline hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="link-underline hover:text-foreground transition-colors">How it works</a>
            <a href="#faq" className="link-underline hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-glow px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 transition-opacity"
          >
            Open App <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center lg:px-6 lg:pt-24">
          <div data-reveal className="glass-glow mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] text-foreground/85">
            <Sparkles className="h-3 w-3 text-primary-glow" />
            AI-powered stock metadata
          </div>
          <h1 data-reveal data-reveal-delay="1" className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Stock metadata that{" "}
            <br className="hidden md:block" />
            <span className="text-shimmer">
              sells itself
            </span>
          </h1>
          <p data-reveal data-reveal-delay="2" className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base">
            Drop your images, get Adobe-ready titles, single-word keywords and the right category in
            seconds. Bring your own AI key, export a contributor-perfect CSV, and ship batches faster.
          </p>
          <div data-reveal data-reveal-delay="3" className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 hover:-translate-y-0.5 transition-all duration-300"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="glass-glow inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-foreground/90 hover:text-foreground hover:-translate-y-0.5 transition-all duration-300"
            >
              How it works
            </a>
          </div>

          {/* Preview mock */}
          <div data-reveal data-reveal-delay="4" className="mx-auto mt-14 max-w-4xl">
            <div className="glass lift rounded-2xl p-3 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-1.5 px-2 pb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              </div>
              <div className="rounded-xl border border-primary/15 bg-background/40 p-4">
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/15 to-primary-glow/10 border border-primary/10" />
                      <div className="h-2 w-3/4 rounded bg-foreground/10" />
                      <div className="h-2 w-1/2 rounded bg-foreground/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { v: "100", l: "Files per batch" },
              { v: "AI-powered", l: "SEO-friendly metadata" },
              { v: "100", l: "Daily users" },
              { v: "Top 5%", l: "Search ranking" },
            ].map((s) => (
              <div key={s.l} data-reveal className="glass lift rounded-xl px-4 py-5 text-center">
                <div className="text-xl font-bold text-glow md:text-2xl">{s.v}</div>
                <div className="mt-1 text-[11px] text-muted-foreground md:text-xs">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
          <div className="text-center">
            <span className="glass-glow inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-glow">
              <Sparkles className="h-3 w-3" />
              Our features
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to ship faster
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                Icon: Wand2,
                t: "AI-powered metadata",
                d: "Titles and keywords generated with Gemini, tuned to Adobe Stock guidelines.",
              },
              {
                Icon: Layers,
                t: "Batch processing",
                d: "Drop dozens of images at once and process them in a single click.",
              },
              {
                Icon: ShieldCheck,
                t: "Adobe-friendly titles",
                d: "Marketable rhythm, no filler verbs, no 'image of' fluff.",
              },
              {
                Icon: Zap,
                t: "Single-word keywords",
                d: "Compound phrases auto-split, deduped and stop-words removed.",
              },
              {
                Icon: FileSpreadsheet,
                t: "CSV export",
                d: "Ready-to-upload CSV for your Adobe Stock contributor account.",
              },
              {
                Icon: Sparkles,
                t: "Custom prompts",
                d: "Inject your own style instructions and mandatory keywords.",
              },
            ].map(({ Icon, t, d }, i) => (
              <div
                key={t}
                data-reveal
                data-reveal-delay={String((i % 3) + 1)}
                className="glass lift rounded-xl p-5 hover:border-primary/40"
              >
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary-glow ring-1 ring-inset ring-white/10 shadow-[0_2px_8px_-3px_hsl(var(--primary)/0.35)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none">
                  <Icon className="relative h-4.5 w-4.5 drop-shadow-[0_0_5px_hsl(var(--primary)/0.5)]" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{t}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Before vs After */}
        <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
          <div className="text-center">
            <span className="glass-glow inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-glow">
              <Sparkles className="h-3 w-3" />
              See what changes
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Before vs. After</h2>
          </div>

          <div className="relative mt-10 grid gap-6 md:grid-cols-2">
            {/* BEFORE */}
            <div className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent p-6 shadow-[0_0_40px_-15px_hsl(var(--destructive)/0.4)]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-destructive">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Before
              </div>
              <div className="mt-5">
                <p className="text-xs text-muted-foreground">Title</p>
                <div className="mt-1.5 rounded-lg border border-destructive/25 bg-background/40 px-3 py-2.5">
                  <span className="text-sm text-muted-foreground line-through decoration-destructive/60">
                    Business woman working laptop office
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Keywords</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["business woman", "working", "laptop office"].map((k) => (
                    <span
                      key={k}
                      className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs text-muted-foreground line-through decoration-destructive/60"
                    >
                      {k}
                    </span>
                  ))}
                  <span className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs text-muted-foreground">
                    +0 more
                  </span>
                </div>
              </div>
              <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                <X className="h-3.5 w-3.5" />
                Compound phrases — Adobe will reject
              </p>
            </div>

            {/* AFTER */}
            <div className="relative overflow-hidden rounded-2xl border border-success/30 bg-gradient-to-br from-success/10 to-primary/5 p-6 shadow-[0_0_40px_-15px_hsl(var(--success)/0.5)]">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                After — Learn Stock <Sparkles className="h-3 w-3 text-primary-glow" />
              </div>
              <div className="mt-5">
                <p className="text-xs text-muted-foreground">Title</p>
                <div className="mt-1.5 rounded-lg border border-success/25 bg-background/40 px-3 py-2.5">
                  <span className="text-sm font-medium text-foreground">
                    Confident businesswoman working on laptop at modern office desk, remote work concept
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Keywords</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    "businesswoman",
                    "laptop",
                    "office",
                    "working",
                    "professional",
                    "confident",
                    "remote",
                    "desk",
                    "corporate",
                    "freelancer",
                  ].map((k) => (
                    <span
                      key={k}
                      className="rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs text-foreground/90"
                    >
                      {k}
                    </span>
                  ))}
                  <span className="rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 text-xs text-primary-glow">
                    +39 more
                  </span>
                </div>
              </div>
              <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-success">
                <Check className="h-3.5 w-3.5" />
                Single-word keywords, CSV-ready
              </p>
            </div>

            {/* Center arrow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)] glow-ring">
                <ChevronRight className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <span className="hidden h-px w-24 bg-gradient-to-r from-transparent to-border sm:block" />
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3 text-primary-glow" />
              This is what gets ranked.
            </span>
            <span className="hidden h-px w-24 bg-gradient-to-l from-transparent to-border sm:block" />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
          <div className="text-center">
            <span className="glass-glow inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-glow">
              <Sparkles className="h-3 w-3" />
              How it works
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Three simple steps</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { Icon: Upload, t: "Upload your files", d: "Drag and drop your images. JPG, PNG, WebP." },
              { Icon: Wand2, t: "AI generates metadata", d: "Gemini analyzes each image and writes title + keywords." },
              { Icon: Download, t: "Export & upload", d: "Download a CSV ready for Adobe Stock." },
            ].map(({ Icon, t, d }, i) => (
              <div key={t} data-reveal data-reveal-delay={String(i + 1)} className="glass lift rounded-xl p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Step 0{i + 1}
                </p>
                <h3 className="mt-1 text-sm font-semibold">{t}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-16 lg:px-6">
          <div className="text-center">
            <span className="glass-glow inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-glow">
              <Sparkles className="h-3 w-3" />
              Frequently asked questions
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Good to know</h2>
          </div>
          <div className="mt-8 space-y-3">
            {[
              {
                q: "Do I need my own API key?",
                a: "Yes. You bring your own Gemini API key — it's stored locally in your browser only.",
              },
              {
                q: "Which platforms are supported?",
                a: "Adobe Stock today. More platforms (Shutterstock, Freepik) are coming.",
              },
              {
                q: "Are my images uploaded anywhere?",
                a: "Images are sent directly to Google's Gemini API from your browser. We don't store them.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="glass group rounded-xl px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                  {f.q}
                  <span className="text-primary-glow transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-xs text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-20 lg:px-6">
          <div className="glass relative overflow-hidden rounded-2xl px-6 py-12 text-center glow-ring">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-primary-glow/15" />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Ready to automate your workflow?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Start generating Adobe Stock metadata in seconds.
              </p>
              <Link
                to="/app"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 transition-opacity"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)]">
              <img src={logoIcon} alt="" className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold text-foreground">Learn Stock</span>
          </div>
          <p>© {new Date().getFullYear()} Learn Stock. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
