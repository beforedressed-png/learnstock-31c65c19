import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Shield, Check, X, RotateCcw, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth, signOut, type AccessRequest } from "@/hooks/use-auth";
import { SignInGate } from "@/components/SignInGate";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin — Learn Stock" }],
  }),
});

function AdminPage() {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="min-h-screen bg-background text-foreground" />;
  }

  const isAdmin = auth.request?.is_admin === true && auth.request?.status === "approved";

  if (!isAdmin) {
    return (
      <>
        <Toaster />
        <SignInGate state={auth} />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <AdminDashboard />
    </>
  );
}

function AdminDashboard() {
  const [rows, setRows] = useState<AccessRequest[] | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "denied" | "all">("pending");

  const load = async () => {
    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (row: AccessRequest, status: "approved" | "denied" | "pending") => {
    const { error } = await supabase
      .from("access_requests")
      .update({
        status,
        decided_at: status === "pending" ? null : new Date().toISOString(),
      })
      .eq("user_id", row.user_id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      status === "approved"
        ? `Approved ${row.email}`
        : status === "denied"
          ? `Denied ${row.email}`
          : `Reset ${row.email}`,
    );
    load();
  };

  const filtered = (rows ?? []).filter((r) => (filter === "all" ? true : r.status === filter));

  const counts = {
    pending: (rows ?? []).filter((r) => r.status === "pending").length,
    approved: (rows ?? []).filter((r) => r.status === "approved").length,
    denied: (rows ?? []).filter((r) => r.status === "denied").length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Shield className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <h1 className="text-sm font-bold tracking-tight text-foreground">Admin Panel</h1>
              <p className="text-[10px] text-muted-foreground">Manage contributor requests</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> App
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["pending", "approved", "denied", "all"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === k
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {k}
              {k !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-70">({counts[k]})</span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <table className="w-full text-xs">
            <thead className="border-b border-border/60 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows === null && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {rows !== null && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No {filter === "all" ? "" : filter} requests.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.user_id} className="border-t border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.email}
                    {r.is_admin && (
                      <span className="ml-2 rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] uppercase font-bold text-primary">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      {r.status !== "approved" && (
                        <button
                          onClick={() => setStatus(r, "approved")}
                          className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                      )}
                      {r.status !== "denied" && !r.is_admin && (
                        <button
                          onClick={() => setStatus(r, "denied")}
                          className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <X className="h-3 w-3" /> Deny
                        </button>
                      )}
                      {r.status !== "pending" && !r.is_admin && (
                        <button
                          onClick={() => setStatus(r, "pending")}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" /> Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: AccessRequest["status"] }) {
  const map = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    denied: "bg-destructive/10 text-destructive border-destructive/30",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status]}`}
    >
      {status}
    </span>
  );
}
