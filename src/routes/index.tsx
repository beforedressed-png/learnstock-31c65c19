import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileOutput,
  FolderOpen,
  ImagePlus,
  KeyRound,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Tags,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import contactSheet from "@/assets/contributor-contact-sheet.png";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="site-header">
        <div className="site-shell flex h-[72px] items-center justify-between gap-5">
          <Link to="/" className="brand-mark" aria-label="Learn Stock home">
            <span className="brand-mark__icon"><Logo className="h-5 w-5" /></span>
            <span>Learn Stock</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-foreground/70 md:flex" aria-label="Primary navigation">
            <a href="#workflow" className="editorial-link">Workflow</a>
            <a href="#built-for-review" className="editorial-link">Why Learn Stock</a>
            <a href="#answers" className="editorial-link">Answers</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Link to="/app" className="action-button action-button--small">Open workspace <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="site-shell grid gap-12 pb-20 pt-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14 lg:pb-28 lg:pt-28">
          <div className="max-w-2xl">
            <h1 className="display-title">Your images deserve better metadata.</h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground">Take a batch from raw images to clean, marketplace-ready metadata without losing the judgement that makes your work yours.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/app" className="action-button">Start a batch <ArrowRight className="h-4 w-4" /></Link>
              <a href="#workflow" className="quiet-button">See the workflow</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><KeyRound className="h-3.5 w-3.5 text-primary" /> Bring your own key</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Files stay in your browser</span>
            </div>
          </div>
          <ProductPreview />
        </section>

        <section id="workflow" className="border-y border-border bg-surface-warm">
          <div className="site-shell grid gap-12 py-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:py-24">
            <div>
              <h2 className="section-title">From folder to final review, in the right order.</h2>
              <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">Learn Stock gives the repetitive work to AI, then brings the details back into view before anything leaves your machine.</p>
            </div>
            <ol className="workflow-list">
              <WorkflowStep number="01" icon={FolderOpen} title="Bring in the work" text="Drop in an image batch and choose the marketplace rules you are working toward." />
              <WorkflowStep number="02" icon={Sparkles} title="Generate with intention" text="AI drafts titles, categories, and single-word keywords around the settings you set." />
              <WorkflowStep number="03" icon={ScanSearch} title="Review the details" text="Scan every image, keep what is right, and correct what only you can know." />
              <WorkflowStep number="04" icon={FileOutput} title="Export with confidence" text="Create a clean CSV or ZIP pack when the batch is ready for your contributor portal." />
            </ol>
          </div>
        </section>

        <section id="built-for-review" className="site-shell py-18 lg:py-28">
          <div className="max-w-2xl">
            <h2 className="section-title">The best automation leaves room for your eye.</h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            <ValueColumn icon={ImagePlus} title="See the image first" text="Every suggestion lives beside the visual it describes, not buried in an export sheet." />
            <ValueColumn icon={Tags} title="Keep metadata legible" text="Titles, categories, and keywords are made for quick editing—not just fast generation." />
            <ValueColumn icon={ShieldCheck} title="Stay in control" text="Your own AI key and local browser storage keep the workflow in your hands." />
          </div>
        </section>

        <section className="site-shell pb-18 lg:pb-28">
          <div className="review-manifesto">
            <div className="review-manifesto__signal"><span className="signal-dot" /><span>Contributor review checklist</span></div>
            <div className="review-manifesto__body">
              <h2 className="section-title">Let AI handle the first draft. Keep the final call.</h2>
              <ul className="mt-7 grid gap-x-8 gap-y-3 text-sm text-foreground/80 sm:grid-cols-2">
                <li><Check className="h-4 w-4" /> Single-word keyword checks</li>
                <li><Check className="h-4 w-4" /> Category visible at a glance</li>
                <li><Check className="h-4 w-4" /> Custom prompt controls</li>
                <li><Check className="h-4 w-4" /> Batch-level exports</li>
              </ul>
            </div>
            <Link to="/app" className="text-link">Open the workspace <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <section id="answers" className="border-y border-border bg-surface-muted">
          <div className="site-shell grid gap-10 py-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:py-24">
            <div><h2 className="section-title">Nothing hidden behind the workflow.</h2></div>
            <div className="divide-y divide-border border-y border-border">
              <Faq question="Do I need my own API key?" answer="Yes. Add your Gemini or Grok key in the workspace. It is stored locally in your browser, so you stay in control of access." />
              <Faq question="Are my images stored by Learn Stock?" answer="No. Your images are sent directly from the browser to the AI provider you choose. Learn Stock does not keep your image files." />
              <Faq question="Which exports can I create?" answer="The current workspace prepares contributor-focused CSV exports and ZIP packs, with settings designed around Adobe Stock conventions." />
            </div>
          </div>
        </section>

        <section className="site-shell py-16 lg:py-24">
          <div className="closing-cta">
            <div><h2 className="closing-title max-w-2xl text-4xl leading-[0.98] tracking-[-0.045em] text-primary-foreground sm:text-5xl">A clearer batch is one good start away.</h2></div>
            <Link to="/app" className="light-action-button">Open workspace <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border"><div className="site-shell flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-medium text-foreground"><Logo className="h-4 w-4 text-primary" /> Learn Stock</div><p>AI-assisted metadata for stock contributors.</p></div></footer>
    </div>
  );
}

function ProductPreview() {
  return <div className="product-preview" aria-label="Illustrative Learn Stock workspace preview">
    <div className="product-preview__topbar"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current batch</p><p className="mt-1 font-sans text-xl font-semibold tracking-[-0.02em] text-foreground">Golden hour collection</p></div><span className="batch-ready"><span /> 6 ready to review</span></div>
    <div className="product-preview__image-wrap"><img src={contactSheet} alt="Synthetic example contact sheet with lifestyle, landscape, and still-life stock imagery" /><span className="preview-note">Synthetic sample imagery</span></div>
    <div className="product-preview__footer"><div className="flex items-center gap-3"><span className="preview-count">06</span><span className="text-sm text-muted-foreground">images in this batch</span></div><div className="hidden items-center gap-2 text-sm font-medium text-primary sm:flex">Review metadata <ArrowRight className="h-4 w-4" /></div></div>
  </div>;
}

function WorkflowStep({ number, icon: Icon, title, text }: { number: string; icon: typeof FolderOpen; title: string; text: string }) {
  return <li className="workflow-step"><span className="workflow-step__number">{number}</span><Icon className="workflow-step__icon" /><div><h3>{title}</h3><p>{text}</p></div></li>;
}

function ValueColumn({ icon: Icon, title, text }: { icon: typeof ImagePlus; title: string; text: string }) {
  return <article className="value-column"><Icon className="h-5 w-5 text-primary" /><h3>{title}</h3><p>{text}</p></article>;
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return <details className="faq-row group"><summary>{question}<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary><p>{answer}</p></details>;
}
