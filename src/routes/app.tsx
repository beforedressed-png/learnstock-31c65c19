import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { Toaster } from "@/components/ui/sonner";
import { useGenSettings } from "@/lib/gen-settings";

export const Route = createFileRoute("/app")({
  component: AppPage,
  head: () => ({
    meta: [
      { title: "Generator — Learn Stock" },
      {
        name: "description",
        content:
          "Generate Adobe Stock titles, keywords and categories from your images using Gemini.",
      },
    ],
  }),
});

function AppPage() {
  const { settings, update } = useGenSettings();

  return (
    <div className="min-h-screen text-foreground">
      <Toaster />
      <header className="sticky top-0 z-30 glass border-b border-primary/20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link to="/" className="flex items-center gap-3 group" aria-label="Learn Stock home">
            <img src={logoWhite} alt="Learn Stock" className="h-8 w-auto" />
            <span className="hidden text-[11px] text-muted-foreground sm:inline">AI metadata for stock contributors</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-4 px-4 py-6 lg:grid-cols-[340px_1fr] lg:gap-6 lg:px-6">
        <ControlsSidebar settings={settings} update={update} />
        <MetadataWorkspace settings={settings} />
      </main>
    </div>
  );
}
