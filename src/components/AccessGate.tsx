import { Lock, KeyRound, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logoIcon from "@/assets/logo-icon.png";

const ACCESS_KEY = "learnstockbatch1accesskey343";
const STORAGE_KEY = "learnstock.access.v1";

export function hasAccess(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === ACCESS_KEY;
  } catch {
    return false;
  }
}

export function clearAccess() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function grantAccessFromKey(key: string): boolean {
  const normalized = key.trim().slice(0, 128);
  if (normalized !== ACCESS_KEY) return false;
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, ACCESS_KEY);
  } catch {
    /* ignore quota */
  }
  return true;
}

export function AccessGate({ invalidKey = false }: { invalidKey?: boolean }) {
  const error = invalidKey ? "Invalid access key" : "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-foreground">
      <Link
        to="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <div
        className={`w-full max-w-md rounded-2xl border border-primary/20 glass p-8 shadow-[var(--shadow-elegant)] ${
          invalidKey ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
        style={{
          // inline keyframes fallback
          animationName: invalidKey ? "shake" : undefined,
        }}
      >
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)] glow-ring">
            <img src={logoIcon} alt="" className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-glow flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" /> Access Required
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your access key to use the Metadata Dashboard.
            </p>
          </div>
        </div>

        <form
          action="/app#access"
          method="get"
          className="space-y-3"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);
            const key = String(formData.get("access") ?? "");
            window.location.href = `/app#access=${encodeURIComponent(key)}`;
          }}
        >
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <input
              autoFocus
              type="text"
              name="access"
              defaultValue=""
              placeholder="Access key"
              maxLength={128}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              data-bwignore="true"
              data-form-type="other"
              aria-autocomplete="none"
              className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Unlock Dashboard
          </button>
        </form>

        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          Don't have a key? Contact the Learn Stock admin.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
