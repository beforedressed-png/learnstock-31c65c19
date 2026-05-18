import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Shield } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { ControlsSidebar } from "@/components/ControlsSidebar";
import { MetadataWorkspace } from "@/components/MetadataWorkspace";
import { SignInGate } from "@/components/SignInGate";
import { Toaster } from "@/components/ui/sonner";
import { useGenSettings } from "@/lib/gen-settings";
import { useAuth, signOut } from "@/hooks/use-auth";

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
  const auth = useAuth();

  if (auth.loading) {
    return <div className="min-h-screen text-foreground" />;
  }

  const approved = auth.request?.status === "approved";
  if (!approved) {
    return (
      <>
        <Toaster />
        <SignInGate state={auth} />
      </>
    );
  }

  const isAdmin = auth.request?.is_admin === true;

  return (
    <div className="min-h-screen text-foreground">
      <Toaster />
      <header className="sticky top-0 z-30 glass border-b border-primary/20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)] glow-ring">
              <img src={logoIcon} alt="" className="h-4.5 w-4.5" />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-glow">Learn Stock</h1>
              <p className="text-[11px] text-muted-foreground">
                AI metadata for stock contributors
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-muted-foreground font-mono">
              {auth.session?.user.email}
            </span>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
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
