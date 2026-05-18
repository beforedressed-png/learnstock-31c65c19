import { useEffect, useState, type FormEvent } from "react";
import { Lock, KeyRound, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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

export function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (hasAccess()) onUnlock();
  }, [onUnlock]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim().slice(0, 128);
    if (trimmed === ACCESS_KEY) {
      try {
        localStorage.setItem(STORAGE_KEY, ACCESS_KEY);
      } catch {
        /* ignore quota */
      }
      toast.success("Access granted");
      onUnlock();
    } else {
      setError("Invalid access key");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

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
          shake ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
        style={{
          // inline keyframes fallback
          animationName: shake ? "shake" : undefined,
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

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              placeholder="Access key"
              maxLength={128}
              autoComplete="off"
              spellCheck={false}
              className="pl-9 font-mono text-sm"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={!value.trim()}>
            Unlock Dashboard
          </Button>
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
