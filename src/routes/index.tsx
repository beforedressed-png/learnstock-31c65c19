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
  Star,
  Globe,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useReveal } from "@/hooks/use-reveal";
import { useMagnetic } from "@/hooks/use-magnetic";
import { useTilt } from "@/hooks/use-tilt";
import { BackToTop } from "@/components/BackToTop";
import { MarqueeStrip } from "@/components/MarqueeStrip";
import { CountUpStat } from "@/components/CountUpStat";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  useReveal();
  return (
    <div className="relative min-h-screen text-foreground">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-30 glass border-b border-primary/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)]">
              <Logo className="h-6 w-6 drop-shadow-md" />
            </span>
            <span className="text-sm font-bold tracking-tight">Learn Stock</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
            <a href="#features" className="link-underline hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="link-underline hover:text-foreground transition-colors">How it works</a>
            <a href="#faq" className="link-underline hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <Link
            to="/app"
            className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-5 py-2 text-[13px] font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 transition-opacity"
          >
            Open App <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-14 text-center lg:px-8 lg:pt-28">
          <div data-reveal className="section-badge mx-auto">
            <Sparkles className="h-3 w-3" />
            AI-powered metadata generation
          </div>

          <h1 data-reveal data-reveal-delay="1" className="mx-auto mt-6 max-w-3xl text-[2.75rem] font-extrabold leading-[1.08] tracking-tight md:text-[3.75rem]">
            Stock metadata{" "}
            <br className="hidden md:block" />
            that <span className="text-shimmer">sells itself</span>
          </h1>

          <p data-reveal data-reveal-delay="2" className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Drop your images, get Adobe-ready titles, single-word keywords and the right category in
            seconds. Bring your own API key, export a contributor-perfect CSV, and ship batches faster.
          </p>

          <div data-reveal data-reveal-delay="3" className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <MagneticLink
              to="/app"
              className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95"
            >
              Get Access <ArrowRight className="h-4 w-4" />
            </MagneticLink>
            <MagneticAnchor
              href="#how"
              className="glass-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              How it works
            </MagneticAnchor>
          </div>

          {/* Marquee */}
          <div data-reveal data-reveal-delay="4" className="mt-12">
            <MarqueeStrip />
          </div>

          {/* Preview mock */}
          <div data-reveal data-reveal-delay="4" className="mx-auto mt-16 max-w-4xl">
            <div className="glass lift rounded-2xl p-3 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-1.5 px-2 pb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-3 text-[10px] text-muted-foreground/50 font-medium">learnstock.app</span>
              </div>
              <div className="rounded-xl border border-primary/10 bg-background/30 p-5">
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2.5">
                      <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary/12 to-primary-glow/8 border border-primary/8" />
                      <div className="h-2 w-4/5 rounded bg-foreground/8" />
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
              { v: <CountUpStat target={100} suffix="+" />, l: "Daily users" },
              { v: "Top 5%", l: "Search ranking" },
            ].map((s, i) => (
              <TiltCard
                key={s.l}
                data-reveal
                data-reveal-delay={String((i % 4) + 1)}
                className="glass lift tilt-card rounded-xl px-5 py-6 text-center"
              >
                <div className="text-2xl font-extrabold text-glow md:text-3xl">{s.v}</div>
                <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">{s.l}</div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="section-badge">
              <Sparkles className="h-3 w-3" />
              Core features
            </span>
            <h2 data-reveal className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">
              Everything you need to ship faster
            </h2>
            <p data-reveal data-reveal-delay="1" className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Purpose-built tools for stock contributors who want higher search rankings and faster uploads.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Icon: Wand2, t: "AI-powered metadata", d: "Titles and keywords generated with Gemini, tuned to Adobe Stock guidelines." },
              { Icon: Layers, t: "Batch processing", d: "Drop dozens of images at once and process them in a single click." },
              { Icon: ShieldCheck, t: "Adobe-friendly titles", d: "Marketable rhythm, no filler verbs, no 'image of' fluff." },
              { Icon: Zap, t: "Single-word keywords", d: "Compound phrases auto-split, deduped and stop-words removed." },
              { Icon: FileSpreadsheet, t: "CSV export", d: "Ready-to-upload CSV for your Adobe Stock contributor account." },
              { Icon: Sparkles, t: "Custom prompts", d: "Inject your own style instructions and mandatory keywords." },
            ].map(({ Icon, t, d }, i) => (
              <TiltCard
                key={t}
                data-reveal
                data-reveal-delay={String((i % 3) + 1)}
                className="glass lift tilt-card group rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="feature-icon">
                  <Icon className="relative h-[18px] w-[18px] drop-shadow-[0_0_5px_hsl(var(--primary)/0.4)]" />
                </div>
                <h3 className="mt-4 text-sm font-bold">{t}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── Before vs After ── */}
        <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="section-badge">
              <Sparkles className="h-3 w-3" />
              See the difference
            </span>
            <h2 data-reveal className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">Before vs. After</h2>
          </div>

          <div className="relative mt-12 grid gap-6 md:grid-cols-2">
            {/* BEFORE */}
            <div data-reveal className="lift relative overflow-hidden rounded-2xl border border-destructive/25 bg-gradient-to-br from-destructive/8 to-transparent p-6 shadow-[0_0_30px_-12px_hsl(var(--destructive)/0.3)]">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-destructive">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Before
              </div>
              <div className="mt-5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Title</p>
                <div className="mt-2 rounded-lg border border-destructive/20 bg-background/30 px-3 py-2.5">
                  <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                    Business woman working laptop office
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Keywords</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["business woman", "working", "laptop office"].map((k) => (
                    <span
                      key={k}
                      className="rounded-md border border-destructive/25 bg-destructive/8 px-2 py-0.5 text-[11px] text-muted-foreground line-through decoration-destructive/50"
                    >
                      {k}
                    </span>
                  ))}
                  <span className="rounded-md border border-border bg-muted/20 px-2 py-0.5 text-[11px] text-muted-foreground">
                    +0 more
                  </span>
                </div>
              </div>
              <p className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-destructive">
                <X className="h-3.5 w-3.5" />
                Compound phrases — Adobe will reject
              </p>
            </div>

            {/* AFTER */}
            <div data-reveal data-reveal-delay="2" className="lift relative overflow-hidden rounded-2xl border border-success/25 bg-gradient-to-br from-success/8 to-primary/4 p-6 shadow-[0_0_30px_-12px_hsl(var(--success)/0.35)]">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                After — Learn Stock <Sparkles className="h-3 w-3 text-primary-glow" />
              </div>
              <div className="mt-5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Title</p>
                <div className="mt-2 rounded-lg border border-success/20 bg-background/30 px-3 py-2.5">
                  <span className="text-sm font-medium text-foreground">
                    Confident businesswoman working on laptop at modern office desk, remote work concept
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Keywords</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["businesswoman", "laptop", "office", "working", "professional", "confident", "remote", "desk", "corporate", "freelancer"].map((k) => (
                    <span key={k} className="rounded-md border border-success/25 bg-success/8 px-2 py-0.5 text-[11px] text-foreground/85">
                      {k}
                    </span>
                  ))}
                  <span className="rounded-md border border-primary/25 bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary-glow">
                    +39 more
                  </span>
                </div>
              </div>
              <p className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-success">
                <Check className="h-3.5 w-3.5" />
                Single-word keywords, CSV-ready
              </p>
            </div>

            {/* Center arrow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)] glow-ring">
                <ChevronRight className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <span className="hidden h-px w-24 bg-gradient-to-r from-transparent to-border sm:block" />
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium text-muted-foreground">
              <Lock className="h-3 w-3 text-primary-glow" />
              This is what gets ranked.
            </span>
            <span className="hidden h-px w-24 bg-gradient-to-l from-transparent to-border sm:block" />
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="section-badge">
              <Sparkles className="h-3 w-3" />
              Simple workflow
            </span>
            <h2 data-reveal className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">Three simple steps</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { Icon: Upload, t: "Upload your files", d: "Drag and drop your images. JPG, PNG, WebP — up to 100 files." },
              { Icon: Wand2, t: "AI generates metadata", d: "Gemini analyzes each image and writes optimized title + keywords." },
              { Icon: Download, t: "Export & upload", d: "Download a contributor-ready CSV for Adobe Stock in one click." },
            ].map(({ Icon, t, d }, i) => (
              <TiltCard key={t} data-reveal data-reveal-delay={String(i + 1)} className="glass lift tilt-card rounded-xl p-7 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Step 0{i + 1}
                </p>
                <h3 className="mt-1.5 text-[15px] font-bold">{t}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
          <div className="text-center">
            <span className="section-badge">
              <Sparkles className="h-3 w-3" />
              FAQ
            </span>
            <h2 data-reveal className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">Good to know</h2>
          </div>
          <div className="mt-10 space-y-3">
            {[
              { q: "Do I need my own API key?", a: "Yes. You bring your own Gemini API key — it's stored locally in your browser only." },
              { q: "Which platforms are supported?", a: "Adobe Stock today. More platforms (Shutterstock, Freepik) are coming." },
              { q: "Are my images uploaded anywhere?", a: "Images are sent directly to Google's Gemini API from your browser. We don't store them." },
              { q: "How accurate is the metadata?", a: "The AI follows Adobe's official guidelines strictly — single-word keywords, proper categories, and marketable titles. You can always edit results inline before exporting." },
            ].map((f) => (
              <details
                key={f.q}
                className="glass group rounded-xl px-5 py-3.5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between text-[14px] font-semibold">
                  {f.q}
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/40 text-primary-glow transition-transform group-open:rotate-45 text-sm font-bold">+</span>
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground pr-8">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-6xl px-5 pb-24 lg:px-8">
          <div className="glass relative overflow-hidden rounded-2xl px-8 py-14 text-center glow-ring">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-primary-glow/12" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                Ready to automate your workflow?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] text-muted-foreground">
                Start generating Adobe Stock metadata in seconds — completely free.
              </p>
              <MagneticLink
                to="/app"
                className="mt-7 btn-shimmer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow px-7 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95"
              >
                Get Access <ArrowRight className="h-4 w-4" />
              </MagneticLink>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-primary/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground md:flex-row lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)]">
              <Logo className="h-5 w-5" />
            </span>
            <span className="font-bold text-foreground">Learn Stock</span>
          </div>
          <p className="text-muted-foreground/60">© {new Date().getFullYear()} Learn Stock. All rights reserved.</p>
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

type TiltCardProps = React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode };

function TiltCard({ children, ...rest }: TiltCardProps) {
  const ref = useTilt<HTMLDivElement>(8);
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
