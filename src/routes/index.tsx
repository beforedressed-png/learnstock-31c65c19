import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { Toaster } from "@/components/ui/sonner";
import { useGenSettings } from "@/lib/gen-settings";

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
  const { settings, update } = useGenSettings();

  return (
    <div className="min-h-screen bg-[var(--gradient-surface)]">
      <Toaster />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)]">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight">Learn Stock</h1>
              <p className="text-[11px] text-muted-foreground">AI metadata for stock contributors</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-4 px-4 py-6 lg:grid-cols-[340px_1fr] lg:gap-6 lg:px-6">
        <ControlsSidebar settings={settings} update={update} />
        <MetadataWorkspace settings={settings} />
      </main>
    </div>
  );
}
