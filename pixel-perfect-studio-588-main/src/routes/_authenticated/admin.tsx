import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, CardSkeleton, Panel, Stat } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchMe, useMe } from "@/lib/session";
import { LEVELS } from "@/lib/constants";
import { createStaff, deleteAccount } from "@/lib/accounts.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const me = await fetchMe();
    if (me?.role !== "super_admin") throw redirect({ to: "/halaqa" });
  },
  head: () => ({ meta: [{ title: "لوحة التحكم — صفوة الإخاء" }, { name: "description", content: "إحصائيات الدورة وإدارة المشرفين والمسمّعين." }] }),
  component: Admin,
});

function Admin() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [dlg, setDlg] = useState<null | "supervisor" | "super_admin">(null);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ data: st }, { data: recs }] = await Promise.all([
        supabase.from("students").select("id,level,supervisor_id,prior_pages"),
        supabase.from("recitations").select("pages,kind,rating,supervisor_id,created_at"),
      ]);
      return { students: st ?? [], recs: recs ?? [] };
    },
  });
  const staff = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id,role").in("role", ["super_admin", "supervisor"]);
      const ids = [...new Set((roles ?? []).map((r) => r.user_id))];
      const { data: profs } = ids.length ? await supabase.from("profiles").select("id,full_name,phone").in("id", ids) : { data: [] };
      return (profs ?? []).map((p) => ({ ...p, role: roles!.find((r) => r.user_id === p.id)!.role }));
    },
  });

  const s = stats.data;
  const pages = s?.recs.filter((r) => r.kind === "hifz").reduce((a, r) => a + (r.pages ?? 0), 0) ?? 0;
  const week = s?.recs.filter((r) => Date.now() - +new Date(r.created_at) < 7 * 864e5).length ?? 0;
  const excellent = s?.recs.filter((r) => r.rating === "امتياز" || r.rating === "ممتاز").length ?? 0;

  if (stats.isLoading) {
    return (
      <AppShell title="لوحة التحكم">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-4 text-center shadow-soft">
              <div className="h-8 w-16 rounded-full bg-muted mx-auto mb-2" />
              <div className="h-3 w-20 rounded-full bg-muted/70 mx-auto" />
            </div>
          ))}
        </div>
        <CardSkeleton rows={3} />
      </AppShell>
    );
  }

  async function remove(id: string, name: string) {
    setToDelete({ id, name });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteAccount({ data: { userId: toDelete.id } });
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["staff"] });
    } catch (e) { toast.error((e as Error).message); } finally { setDeleting(false); setToDelete(null); }
  }

  return (
    <AppShell title="لوحة التحكم">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="الطلاب" value={s?.students.length ?? "…"} />
        <Stat label="صفحات حفظ مسجلة" value={pages} />
        <Stat label="جلسات هذا الأسبوع" value={week} />
        <Stat label="جلسات متميزة" value={excellent} />
      </div>
      <Panel className="mt-3">
        <h2 className="mb-3 font-bold">توزيع المستويات</h2>
        {LEVELS.map((l) => {
          const n = s?.students.filter((x) => x.level === l.id).length ?? 0;
          const pct = s?.students.length ? (n / s.students.length) * 100 : 0;
          return (
            <div key={l.id} className="mb-2">
              <div className="flex justify-between text-sm"><span>{l.name}</span><span className="text-muted-foreground">{n}</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </Panel>
      <Panel className="mt-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">المشرفون والمسمّعون</h2>
          <div className="flex gap-1">
            <Button size="sm" onClick={() => setDlg("supervisor")}><UserPlus />مسمّع</Button>
            <Button size="sm" variant="secondary" onClick={() => setDlg("super_admin")}>مشرف عام</Button>
          </div>
        </div>
        <div className="divide-y">
          {staff.data?.map((p) => {
            const count = s?.students.filter((x) => x.supervisor_id === p.id).length ?? 0;
            return (
              <div key={p.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="font-bold">{p.full_name}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">{p.phone}</div>
                  <div className="text-xs text-muted-foreground">{p.role === "super_admin" ? "مشرف عام" : `مسمّع · ${count} طالب`}</div>
                </div>
                {p.id !== me?.id && <Button size="icon" variant="ghost" onClick={() => remove(p.id, p.full_name)} aria-label="حذف"><Trash2 className="text-destructive" /></Button>}
              </div>
            );
          })}
        </div>
      </Panel>
      <StaffDialog role={dlg} onClose={() => setDlg(null)} />
      <ConfirmDialog
        open={!!toDelete}
        title={`حذف حساب ${toDelete?.name ?? ""}`}
        description="سيُحذف هذا الحساب نهائياً ولن يتمكن صاحبه من الدخول. هذا الإجراء لا يمكن التراجع عنه."
        confirmLabel={deleting ? "جارٍ الحذف…" : "حذف"}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </AppShell>
  );
}

function StaffDialog({ role, onClose }: { role: null | "supervisor" | "super_admin"; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  async function go() {
    if (!role) return;
    setBusy(true);
    try {
      await createStaff({ data: { ...f, role } });
      toast.success("تم إنشاء الحساب");
      qc.invalidateQueries({ queryKey: ["staff"] }); qc.invalidateQueries({ queryKey: ["supervisors"] });
      setF({ name: "", phone: "", password: "" }); onClose();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Dialog open={!!role} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>{role === "super_admin" ? "إضافة مشرف عام" : "إضافة مسمّع"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>الاسم</Label><Input className="h-11" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>رقم الهاتف</Label><Input dir="ltr" className="h-11 text-right" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>كلمة المرور</Label><Input className="h-11" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <Button className="w-full" size="lg" onClick={go} disabled={busy}>إنشاء</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
