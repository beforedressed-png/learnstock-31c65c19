import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Shield, Check, X, RotateCcw, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth, signOut, type AccessRequest } from "@/hooks/use-auth";
import { SignInGate } from "@/components/SignInGate";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin — Learn Stock" }],
  }),
});

function AdminPage() {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="min-h-screen text-foreground" />;
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
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-30 glass border-b border-primary/20">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-elegant)] glow-ring">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-glow">Admin Panel</h1>
              <p className="text-[11px] text-muted-foreground">Manage access requests</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to app
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

      <main className="mx-auto max-w-[1100px] px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["pending", "approved", "denied", "all"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                filter === k
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {k}
              {k !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-70">({counts[k]})</span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/20 glass">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
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
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {rows !== null && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No {filter === "all" ? "" : filter} requests.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.user_id} className="border-t border-border/60">
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.email}
                    {r.is_admin && (
                      <span className="ml-2 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] uppercase text-primary">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      {r.status !== "approved" && (
                        <button
                          onClick={() => setStatus(r, "approved")}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-[11px] text-primary hover:bg-primary/25"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                      )}
                      {r.status !== "denied" && !r.is_admin && (
                        <button
                          onClick={() => setStatus(r, "denied")}
                          className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-1 text-[11px] text-destructive hover:bg-destructive/25"
                        >
                          <X className="h-3 w-3" /> Deny
                        </button>
                      )}
                      {r.status !== "pending" && !r.is_admin && (
                        <button
                          onClick={() => setStatus(r, "pending")}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
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
    pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    denied: "bg-destructive/15 text-destructive border-destructive/30",
  } as const;
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${map[status]}`}
    >
      {status}
    </span>
  );
}
