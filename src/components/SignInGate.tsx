import { Lock, LogOut, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logoIcon from "@/assets/logo-icon.png";
import { signInWithGoogle, signOut, type AuthState } from "@/hooks/use-auth";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.3 12 2.3 6.5 2.3 2 6.7 2 12.2c0 5.4 4.5 9.9 10 9.9 5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.2-.2-1.7H12z" />
    </svg>
  );
}

async function handleSignIn() {
  const res = await signInWithGoogle();
  if (res?.error) {
    toast.error(res.error.message || "Sign-in failed");
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-foreground">
      <Link
        to="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-primary/20 glass p-8 shadow-[var(--shadow-elegant)]">
        {children}
      </div>
    </div>
  );
}

function Header({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 mb-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)] glow-ring">
        <img src={logoIcon} alt="" className="h-7 w-7" />
      </span>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-glow flex items-center justify-center gap-2">
          {icon} {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function SignInGate({ state }: { state: AuthState }) {
  const { session, request } = state;

  // Not signed in
  if (!session) {
    return (
      <Shell>
        <Header
          icon={<Lock className="h-4 w-4" />}
          title="Access Required"
          subtitle="Sign in with Google to use the Metadata Dashboard."
        />
        <button
          onClick={handleSignIn}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <GoogleIcon /> Continue with Google
        </button>
        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          New users are reviewed by an admin before getting access.
        </p>
      </Shell>
    );
  }

  // Signed in but denied
  if (request?.status === "denied") {
    return (
      <Shell>
        <Header
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          title="Access Denied"
          subtitle="Your request to use this app was declined."
        />
        <p className="text-xs text-center text-muted-foreground mb-4">
          Signed in as <span className="font-mono">{session.user.email}</span>
        </p>
        <button
          onClick={signOut}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </Shell>
    );
  }

  // Signed in, pending (or no row yet from trigger)
  return (
    <Shell>
      <Header
        icon={<Clock className="h-4 w-4" />}
        title="Awaiting Approval"
        subtitle="Your request has been sent to the admin. You'll get access once approved."
      />
      <p className="text-xs text-center text-muted-foreground mb-4">
        Signed in as <span className="font-mono">{session.user.email}</span>
      </p>
      <button
        onClick={signOut}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        <LogOut className="h-3.5 w-3.5" /> Sign out
      </button>
    </Shell>
  );
}
