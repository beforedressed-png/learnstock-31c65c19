import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { ConverterWorkspace } from "@/components/ConverterWorkspace";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/app")({
  component: AppPage,
});

function AppPage() {
  const [appMode, setAppMode] = useState<"metadata" | "converter">("metadata");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Toaster />

      {/* ── App Header ── */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Logo className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <h1 className="text-sm font-bold tracking-tight text-foreground">Learn Stock</h1>
              <p className="text-[10px] text-muted-foreground">
                AI metadata for stock contributors
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center rounded-lg border border-border/60 bg-card p-1">
              <button
                onClick={() => setAppMode("metadata")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  appMode === "metadata"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Sparkles className="h-3 w-3" />
                <span>AI Metadata</span>
              </button>
              <button
                onClick={() => setAppMode("converter")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                  appMode === "converter"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <ImageIcon className="h-3 w-3" />
                <span>Vector Converter</span>
              </button>
            </div>
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>
      </header>

      {/* ── App Main Layout ── */}
      <main className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 lg:grid-cols-[360px_1fr] lg:gap-6 lg:px-8">
        {appMode === "metadata" ? (
          <>
            <ControlsSidebar />
            <MetadataWorkspace />
          </>
        ) : (
          <div className="lg:col-span-2 max-w-4xl mx-auto w-full">
            <ConverterWorkspace />
          </div>
        )}
      </main>
    </div>
  );
}
