import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Lock, Key } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/app")({
  component: AppPage,
});

function AppPage() {
  const [accessKey, setAccessKey] = useState("");
  const [hasAccess, setHasAccess] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("learnstock_access_granted") === "true";
    }
    return false;
  });

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.trim() === "learnstockbatch1accesskey343") {
      localStorage.setItem("learnstock_access_granted", "true");
      setHasAccess(true);
      toast.success("Access granted! Welcome to the Metadata Dashboard.");
    } else {
      toast.error("Invalid access key. Please try again.");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground selection:bg-primary/20 selection:text-primary">
        <Toaster />

        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Lock className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Access Key Required</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please enter your contributor access key to unlock the dashboard.
              </p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Access Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter access key..."
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="pl-9 h-10 rounded-lg border-border/80 bg-background text-xs"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
            >
              Unlock Dashboard
            </Button>
          </form>

          <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

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
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Contributor Workspace</span>
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
        <ControlsSidebar />
        <MetadataWorkspace />
      </main>
    </div>
  );
}
