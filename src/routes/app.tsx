import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/app")({
  component: AppPage,
});

function AppPage() {
  return (
    <div className="min-h-screen text-foreground">
      <Toaster />

      {/* ── App Header ── */}
      <header className="sticky top-0 z-30 glass border-b border-primary/15">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)] glow-ring transition-transform group-hover:scale-105">
              <img src={logoIcon} alt="" className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <h1 className="text-[15px] font-bold tracking-tight text-glow">Learn Stock</h1>
              <p className="text-[10px] font-medium text-muted-foreground">
                AI metadata for stock contributors
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 rounded-lg glass-glow px-3 py-1.5">
              <Sparkles className="h-3 w-3 text-primary-glow" />
              <span className="text-[10px] font-semibold text-muted-foreground">Metadata Generator</span>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/30 px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>
      </header>

      {/* ── App Main Layout ── */}
      <main className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 lg:grid-cols-[360px_1fr] lg:gap-6 lg:px-8">
        <ControlsSidebar />
        <MetadataWorkspace />
      </main>
    </div>
  );
}
