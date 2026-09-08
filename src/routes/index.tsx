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
import { Logo } from "@/components/Logo";
import { useReveal } from "@/hooks/use-reveal";
import { useMagnetic } from "@/hooks/use-magnetic";
import { useTilt } from "@/hooks/use-tilt";
import { BackToTop } from "@/components/BackToTop";
import { MarqueeStrip } from "@/components/MarqueeStrip";
import { CountUpStat } from "@/components/CountUpStat";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  useReveal();
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Logo className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">Learn Stock</span>
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-medium text-muted-foreground md:flex">
            <a href="#features" className="link-underline hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how" className="link-underline hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#faq" className="link-underline hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              Open App <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto max-w-6xl px-5 pt-24 pb-16 text-center lg:px-8 lg:pt-32">
          <div data-reveal className="section-badge mx-auto">
            AI-powered metadata
          </div>

          <h1
            data-reveal
            data-reveal-delay="1"
            className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
          >
            Stock metadata{" "}
            <br className="hidden md:block" />
            that <span className="text-shimmer">sells itself</span>
          </h1>

          <p
            data-reveal
            data-reveal-delay="2"
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
          >
            Drop your images, get Adobe-ready titles, single-word keywords, and the right category in
            seconds. Bring your own API key, export contributor-perfect CSV, and ship batches faster.
          </p>

          <div
            data-reveal
            data-reveal-delay="3"
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <MagneticLink
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              Get Access <ArrowRight className="h-4 w-4" />
            </MagneticLink>
            <MagneticAnchor
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/80 px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              How it works
            </MagneticAnchor>
          </div>

          {/* Marquee */}
          <div data-reveal data-reveal-delay="4" className="mt-12">
            <MarqueeStrip />
          </div>

          {/* Preview mock */}
          <div data-reveal data-reveal-delay="4" className="mx-auto mt-14 max-w-4xl">
            <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm transition-all">
              <div className="flex items-center justify-between border-b border-border/60 px-3 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-border" />
                  <span className="h-2 w-2 rounded-full bg-border" />
                  <span className="h-2 w-2 rounded-full bg-border" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground/60">learnstock.app</span>
                <div className="w-8" />
              </div>
              <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-5">
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2.5 text-left">
                      <div className="aspect-[4/3] rounded-lg border border-border/40 bg-card p-2">
                        <div className="h-full w-full rounded bg-muted/60" />
                      </div>
                      <div className="h-2 w-4/5 rounded bg-foreground/10" />
                      <div className="h-2 w-3/5 rounded bg-foreground/6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { v: <CountUpStat target={100} suffix="+" />, l: "Files per batch" },
              { v: "AI", l: "SEO-friendly metadata" },
              { v: <CountUpStat target={100} suffix="+" />, l: "Daily contributors" },
              { v: "Top 5%", l: "Search ranking rate" },
            ].map((s, i) => (
              <div
                key={s.l}
                data-reveal
                data-reveal-delay={String((i % 4) + 1)}
                className="lift rounded-xl border border-border/80 bg-card/60 p-5 text-center"
              >
                <div className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {s.v}
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="section-badge">
              Core features
            </span>
            <h2 data-reveal className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Everything you need to ship faster
            </h2>
            <p data-reveal data-reveal-delay="1" className="mx-auto mt-2.5 max-w-lg text-sm text-muted-foreground">
              Purpose-built tools for stock contributors who want higher search rankings and faster uploads.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Wand2, t: "AI-powered metadata", d: "Titles and keywords generated with Gemini and Grok, tuned to Adobe Stock guidelines." },
              { Icon: Layers, t: "Batch processing", d: "Drop dozens of images at once and generate contributor-ready tags in a single click." },
              { Icon: ShieldCheck, t: "Adobe-friendly titles", d: "Marketable rhythm, no filler words, and strict adherence to contributor guidelines." },
              { Icon: Zap, t: "Single-word keywords", d: "Compound phrases auto-split, deduped, and filtered of stop words automatically." },
              { Icon: FileSpreadsheet, t: "CSV & ZIP export", d: "Ready-to-upload CSV formatted precisely for Adobe Stock contributor accounts." },
              { Icon: Sparkles, t: "Custom prompts", d: "Inject your own style directives, mandatory keywords, and negative keywords." },
            ].map(({ Icon, t, d }, i) => (
              <div
                key={t}
                data-reveal
                data-reveal-delay={String((i % 3) + 1)}
                className="lift group rounded-xl border border-border/80 bg-card/70 p-6 transition-all hover:border-primary/40"
              >
                <div className="feature-icon">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground">{t}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Before vs After ── */}
        <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="section-badge">
              Quality comparison
            </span>
            <h2 data-reveal className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Before vs. After
            </h2>
          </div>

          <div className="relative mt-12 grid gap-5 md:grid-cols-2">
            {/* BEFORE */}
            <div
              data-reveal
              className="lift relative overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5 p-6"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-destructive">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Before (Rejected or Low Ranking)
              </div>
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title</p>
                <div className="mt-2 rounded-lg border border-destructive/20 bg-background/50 px-3 py-2.5">
                  <span className="text-xs text-muted-foreground line-through decoration-destructive/60">
                    Business woman working laptop office
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Keywords</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["business woman", "working", "laptop office"].map((k) => (
                    <span
                      key={k}
                      className="rounded-md border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[11px] text-muted-foreground line-through decoration-destructive/60"
                    >
                      {k}
                    </span>
                  ))}
                  <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                    +0 more
                  </span>
                </div>
              </div>
              <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <X className="h-3.5 w-3.5" />
                Compound phrases — Adobe search penalizes
              </p>
            </div>

            {/* AFTER */}
            <div
              data-reveal
              data-reveal-delay="2"
              className="lift relative overflow-hidden rounded-xl border border-success/30 bg-success/5 p-6"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                After — Learn Stock
              </div>
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Title</p>
                <div className="mt-2 rounded-lg border border-success/25 bg-background/50 px-3 py-2.5">
                  <span className="text-xs font-medium text-foreground">
                    Confident businesswoman working on laptop at modern office desk, remote work concept
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Keywords</p>
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
                      className="rounded-md border border-success/25 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-foreground"
                    >
                      {k}
                    </span>
                  ))}
                  <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    +39 more
                  </span>
                </div>
              </div>
              <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                <Check className="h-3.5 w-3.5" />
                Clean single-word keywords, CSV contributor-ready
              </p>
            </div>

            {/* Center indicator */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="section-badge">
              Workflow
            </span>
            <h2 data-reveal className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Three simple steps
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { Icon: Upload, t: "Upload your files", d: "Drag and drop your images. JPG, PNG, WebP, SVG, EPS — up to 100 files per batch." },
              { Icon: Wand2, t: "AI generates metadata", d: "Gemini or Grok analyzes each visual and writes optimized titles, keywords, and category." },
              { Icon: Download, t: "Export & upload", d: "Download a contributor-ready CSV or compiled ZIP pack in a single click." },
            ].map(({ Icon, t, d }, i) => (
              <div
                key={t}
                data-reveal
                data-reveal-delay={String(i + 1)}
                className="lift rounded-xl border border-border/80 bg-card/70 p-7 text-center"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-background">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground">{t}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="section-badge">
              FAQ
            </span>
            <h2 data-reveal className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {[
              { q: "Do I need my own API key?", a: "Yes. You bring your own Gemini or Grok API key — it is stored securely in your browser only." },
              { q: "Which platforms are supported?", a: "Adobe Stock contributor specification is fully tuned today. FreePik, Shutterstock, and Vecteezy formats are built in." },
              { q: "Are my images uploaded anywhere?", a: "No. Images are sent directly to the AI API from your browser. We never store or retain your files." },
              { q: "How accurate is the metadata?", a: "Strictly follows Adobe Stock guidelines: single-word keywords, proper categories, and marketable descriptive titles." },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border/80 bg-card/70 px-5 py-4 transition-colors hover:border-primary/30 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground">
                  {f.q}
                  <span className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-transform group-open:rotate-45 text-sm font-bold">
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground pr-6">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-6xl px-5 pb-24 lg:px-8">
          <div className="rounded-2xl border border-border/80 bg-card p-10 text-center shadow-sm sm:p-14">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              Ready to automate your stock workflow?
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              Start generating Adobe Stock metadata in seconds — clean, fast, and contributor-tuned.
            </p>
            <div className="mt-6">
              <MagneticLink
                to="/app"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                Get Access <ArrowRight className="h-4 w-4" />
              </MagneticLink>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/80 bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground md:flex-row lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Logo className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">Learn Stock</span>
          </div>
          <p>© {new Date().getFullYear()} Learn Stock. All rights reserved.</p>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
}

/* ── Helper components ── */

type AnchorAttrs = React.AnchorHTMLAttributes<HTMLAnchorElement>;

function MagneticLink({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) {
  const ref = useMagnetic<HTMLAnchorElement>(0.15, 5);
  return (
    <Link to={to} ref={ref} className={className}>
      {children}
    </Link>
  );
}

function MagneticAnchor({ className, children, ...rest }: AnchorAttrs) {
  const ref = useMagnetic<HTMLAnchorElement>(0.15, 5);
  return (
    <a ref={ref} className={className} {...rest}>
      {children}
    </a>
  );
}
