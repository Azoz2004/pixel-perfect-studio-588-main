import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BookOpen, LayoutDashboard, LogOut, Trophy, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/session";

const roleLabel = { super_admin: "المشرف العام", supervisor: "المسمّع", student: "طالب" } as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const nav =
    me?.role === "student"
      ? [{ to: "/me", label: "صفحتي", icon: User }, { to: "/honor", label: "لوحة الشرف", icon: Trophy }]
      : [
          { to: "/halaqa", label: "الحلقة", icon: BookOpen },
          ...(me?.role === "super_admin" ? [{ to: "/admin", label: "لوحة التحكم", icon: LayoutDashboard }] : []),
          { to: "/honor", label: "لوحة الشرف", icon: Trophy },
        ];

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-hero px-5 pt-6 pb-10 text-primary-foreground">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className="text-sm opacity-80">صفوة الإخاء · {me?.role ? roleLabel[me.role] : ""}</p>
            <h1 className="font-display text-3xl font-bold">{title}</h1>
            {me?.name && <p className="text-sm opacity-80">أهلاً، {me.name}</p>}
          </div>
          <button onClick={signOut} aria-label="تسجيل الخروج" className="rounded-full bg-primary-foreground/15 p-3">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>
      <main className="mx-auto -mt-6 max-w-3xl px-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl justify-around py-2">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 px-4 py-1 text-xs text-muted-foreground" activeProps={{ className: "text-primary font-bold" }}>
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border bg-card p-4 shadow-soft ${className}`}>{children}</section>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 text-center shadow-soft">
      <div className="text-2xl font-extrabold text-primary">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/** Animated skeleton placeholder — use while data is loading */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mt-3 space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="h-4 w-1/2 rounded-full bg-muted mb-2" />
          <div className="h-3 w-3/4 rounded-full bg-muted/70" />
        </div>
      ))}
    </div>
  );
}
