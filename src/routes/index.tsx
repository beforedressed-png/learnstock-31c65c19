import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";
import { ApiKeysDialog } from "@/components/ApiKeysDialog";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
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

function Index() {
  return (
    <div className="min-h-screen bg-[var(--gradient-surface)]">
      <Toaster />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)]">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight">Learn Stock</h1>
              <p className="text-[11px] text-muted-foreground">AI metadata for Adobe Stock</p>
            </div>
          </div>
          <ApiKeysDialog />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Powered by Google Gemini
          </span>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Stock metadata,{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              done in seconds
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            Drop your images, let Gemini write SEO-optimized titles, 40+ keywords and the right Adobe
            Stock category — then export a ready-to-upload CSV.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Keys stay in your browser
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" /> Batch processing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Adobe Stock CSV format
            </span>
          </div>
        </section>

        <MetadataWorkspace />

        <footer className="mt-16 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          Bring your own Gemini API key ·{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Get one free
          </a>
        </footer>
      </main>
    </div>
  );
}
