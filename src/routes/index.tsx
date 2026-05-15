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
} from "lucide-react";

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
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-30 glass border-b border-primary/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">Learn Stock</span>
          </Link>
          <nav className="hidden items-center gap-6 text-xs text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
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
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] text-foreground/80 backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary-glow" />
            AI-powered stock metadata
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Generate stock metadata{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent text-glow">
              in seconds
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base">
            Upload your images and let Gemini craft Adobe Stock-ready titles and single-word
            keywords. Bring your own API key, export CSV, ship faster.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-glow px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-95 transition-opacity"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 rounded-full glass px-5 py-2.5 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors"
            >
              How it works
            </a>
          </div>

          {/* Preview mock */}
          <div className="mx-auto mt-14 max-w-4xl">
            <div className="glass rounded-2xl p-3 shadow-[var(--shadow-card)]">
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
              { v: "500+", l: "Files per batch" },
              { v: "Gemini", l: "Powered by Google AI" },
              { v: "49", l: "Keywords per image" },
              { v: "100%", l: "Single-word keywords" },
            ].map((s) => (
              <div key={s.l} className="glass rounded-xl px-4 py-5 text-center">
                <div className="text-xl font-bold text-glow md:text-2xl">{s.v}</div>
                <div className="mt-1 text-[11px] text-muted-foreground md:text-xs">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-glow">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
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
            ].map(({ Icon, t, d }) => (
              <div
                key={t}
                className="glass rounded-xl p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-glow">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{t}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-glow">
              How it works
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Three simple steps</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { Icon: Upload, t: "Upload your files", d: "Drag and drop your images. JPG, PNG, WebP." },
              { Icon: Wand2, t: "AI generates metadata", d: "Gemini analyzes each image and writes title + keywords." },
              { Icon: Download, t: "Export & upload", d: "Download a CSV ready for Adobe Stock." },
            ].map(({ Icon, t, d }, i) => (
              <div key={t} className="glass rounded-xl p-6 text-center">
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
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-glow">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Good to know</h2>
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
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="font-semibold text-foreground">Learn Stock</span>
          </div>
          <p>© {new Date().getFullYear()} Learn Stock. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
