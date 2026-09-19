import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Image as ImageIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { ConverterWorkspace } from "@/components/ConverterWorkspace";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/app")({ component: AppPage });

function AppPage() {
  const [appMode, setAppMode] = useState<"metadata" | "converter">("metadata");

  return (
    <div className="app-shell min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground">
      <Toaster />
      <header className="app-header sticky top-0 z-30">
        <div className="site-shell flex min-h-[72px] flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Back to Learn Stock home" className="flex h-9 w-9 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"><ArrowLeft className="h-4 w-4" /></Link>
            <div className="flex items-center gap-2.5">
              <Logo className="h-6 w-6 text-primary" />
              <div><h1 className="app-page-title leading-none">Learn Stock</h1></div>
            </div>
          </div>

          <div className="order-3 flex w-full items-center border-y border-border py-2 sm:order-none sm:w-auto sm:border-y-0 sm:py-0">
            <button onClick={() => setAppMode("metadata")} className={cn("workspace-nav-item", appMode === "metadata" && "workspace-nav-item--active")}>
              <Sparkles className="h-3.5 w-3.5" /> Metadata batches
            </button>
            <button onClick={() => setAppMode("converter")} className={cn("workspace-nav-item", appMode === "converter" && "workspace-nav-item--active")}>
              <ImageIcon className="h-3.5 w-3.5" /> Vector converter
            </button>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="site-shell py-6 lg:py-8">
        {appMode === "metadata" ? (
          <>
            <div className="mb-6 flex flex-col justify-between gap-3 border-b border-border pb-5 sm:flex-row sm:items-end">
              <div><h2 className="app-workspace-title text-3xl tracking-[-0.04em]">Prepare the work. Then review it.</h2></div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Set the rules once, add a batch, and review every suggested title, category, and keyword in context.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-7">
              <div className="workspace-rail p-1"><ControlsSidebar /></div>
              <MetadataWorkspace />
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 border-b border-border pb-5"><h2 className="app-workspace-title text-3xl tracking-[-0.04em]">Vector converter</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Turn EPS and AI source files into ready-to-preview JPEGs without leaving the contributor workflow.</p></div>
            <ConverterWorkspace />
          </div>
        )}
      </main>
    </div>
  );
}
