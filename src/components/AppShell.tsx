import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { BookOpen, LayoutDashboard, LogOut, Trophy, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/session";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const roleLabel = { super_admin: "المشرف العام", supervisor: "المسمّع", student: "طالب" } as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  async function signOut() {
    setShowSignOutConfirm(false);
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
    <div className="min-h-screen pb-24 bg-background">
      <header className="bg-hero px-5 pt-4 pb-6 text-primary-foreground relative overflow-hidden shadow-sm">
        {/* خلفية جمالية خفيفة */}
        <div className="absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="mx-auto max-w-3xl space-y-2.5">
          {/* الشريط العلوي: شارة المركز والدور + زر تسجيل الخروج مع تأكيد */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/15 backdrop-blur-md px-3 py-1 border border-white/10 text-xs font-medium">
              <span className="font-bold tracking-wide">صفوة الإخاء</span>
              {me?.role && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="text-emerald-200 font-semibold">{roleLabel[me.role]}</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowSignOutConfirm(true)}
              aria-label="تسجيل الخروج"
              className="flex items-center gap-1.5 rounded-full bg-black/15 hover:bg-black/25 px-3 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 opacity-90" />
              <span>خروج</span>
            </button>
          </div>

          {/* العنوان الأساسي للصفحة */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans drop-shadow-sm">
              {title}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
        {children}
      </main>

      <ConfirmDialog
        open={showSignOutConfirm}
        title="تسجيل الخروج"
        description="هل أنت متأكد من رغبتك في تسجيل الخروج من التطبيق؟"
        confirmLabel="تسجيل الخروج"
        cancelLabel="إلغاء"
        destructive
        onConfirm={signOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />
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
