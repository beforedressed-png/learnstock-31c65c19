import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Lock, Key } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
      <div className="min-h-screen text-foreground flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
        <Toaster />
        
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md glass rounded-3xl p-6 md:p-8 shadow-[var(--shadow-elegant)] relative z-10 border border-primary/10 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)] glow-ring">
            <Lock className="h-6 w-6" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Access Key Required</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Please enter your access key below to unlock the Learn Stock metadata dashboard.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block pl-1">
                Access Key
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  type="password"
                  placeholder="Enter access key..."
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-border/80 focus:border-primary/60 rounded-xl text-sm"
                  autoFocus
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 btn-shimmer bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold rounded-xl animate-pulse hover:animate-none"
            >
              Unlock Dashboard
            </Button>
          </form>

          <div className="border-t border-border/40 pt-4 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
