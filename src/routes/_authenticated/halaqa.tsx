import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, CardSkeleton, Panel } from "@/components/AppShell";
import { StudentDialog, type Student } from "@/components/StudentDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchMe, useMe } from "@/lib/session";
import { fmtDate, levelName, ratingTone, sessionRating } from "@/lib/constants";
import { createStudentAccount } from "@/lib/accounts.functions";

export const Route = createFileRoute("/_authenticated/halaqa")({
  ssr: false,
  beforeLoad: async () => {
    const me = await fetchMe();
    if (me?.role === "student") throw redirect({ to: "/me" });
  },
  head: () => ({ meta: [{ title: "الحلقة — صفوة الإخاء" }, { name: "description", content: "تسجيل جلسات التسميع وإدارة طلاب الحلقة." }] }),
  component: Halaqa,
});

export function useSupervisors(enabled: boolean) {
  return useQuery({
    queryKey: ["supervisors"], enabled,
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "supervisor");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (!ids.length) return [];
      const { data } = await supabase.from("profiles").select("id,full_name,phone").in("id", ids);
      return data ?? [];
    },
  });
}

function Halaqa() {
  const { data: me } = useMe();
  const isAdmin = me?.role === "super_admin";
  const { data: supervisors } = useSupervisors(isAdmin);
  const students = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await supabase.from("students").select("*").order("full_name")).data as Student[] ?? [],
  });
  const [dlg, setDlg] = useState<{ open: boolean; student?: Student | null }>({ open: false });
  const [selected, setSelected] = useState("");

  return (
    <AppShell title="الحلقة">
      <Tabs defaultValue="log" dir="rtl">
        <TabsList className="grid h-12 w-full grid-cols-3 rounded-xl bg-card shadow-soft">
          <TabsTrigger value="log">تسميع</TabsTrigger>
          <TabsTrigger value="students">الطلاب</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>
        <TabsContent value="log">
          <LogForm students={students.data ?? []} selected={selected} setSelected={setSelected} onNew={() => setDlg({ open: true })} />
        </TabsContent>
        <TabsContent value="students">
          <StudentsList students={students.data ?? []} supervisors={supervisors} onEdit={(s) => setDlg({ open: true, student: s })} onNew={() => setDlg({ open: true })} />
        </TabsContent>
        <TabsContent value="history"><History /></TabsContent>
      </Tabs>
      <StudentDialog open={dlg.open} onOpenChange={(o) => setDlg({ open: o })} student={dlg.student} supervisors={supervisors} onSaved={(id) => { if (!dlg.student) setSelected(id); }} />
    </AppShell>
  );
}

function LogForm({ students, selected, setSelected, onNew }: { students: Student[]; selected: string; setSelected: (s: string) => void; onNew: () => void }) {
  const qc = useQueryClient();
  const [kind, setKind] = useState<"hifz" | "review">("hifz");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const rating = sessionRating(mistakes);
  const student = students.find((s) => s.id === selected);

  async function save() {
    if (!student) { toast.error("اختر الطالب"); return; }
    if (!from || !to) { toast.error("أدخل الصفحات"); return; }
    setBusy(true);
    const { error } = await supabase.from("recitations").insert({
      student_id: student.id, supervisor_id: student.supervisor_id, kind,
      from_page: +from, to_page: +to, mistakes, notes: notes || null,
    });
    setBusy(false);
    if (error) { toast.error("تعذر الحفظ"); return; }
    toast.success(`تم تسجيل الجلسة — ${rating}`);
    setFrom(to ? String(+to + 1) : ""); setTo(""); setMistakes(0); setNotes(""); setKind("hifz");
    qc.invalidateQueries({ queryKey: ["recitations"] });
  }

  return (
    <Panel className="mt-3 space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label>الطالب</Label>
          <select className="mt-1 h-12 w-full rounded-xl border bg-background px-3 text-base" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">— اختر الطالب —</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        </div>
        <Button size="icon" variant="secondary" className="h-12 w-12 rounded-xl" onClick={onNew} aria-label="طالب جديد"><UserPlus /></Button>
      </div>
      {student && <p className="text-xs text-muted-foreground">مستوى {levelName(student.level)} · التقييم العام: {student.overall_rating}</p>}
      <p className="text-xs text-muted-foreground">التاريخ والوقت: {new Date().toLocaleString("ar", { dateStyle: "full", timeStyle: "short" })}</p>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        {(["hifz", "review"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`h-11 rounded-lg font-bold ${kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{k === "hifz" ? "حفظ" : "مراجعة"}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>من صفحة</Label><Input type="number" inputMode="numeric" className="h-12 text-lg" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label>إلى صفحة</Label><Input type="number" inputMode="numeric" className="h-12 text-lg" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      <div>
        <Label>عدد الأخطاء</Label>
        <div className="mt-1 flex items-center gap-3">
          <Button variant="outline" className="h-12 w-12 rounded-xl text-xl" onClick={() => setMistakes(Math.max(0, mistakes - 1))}>−</Button>
          <div className="flex-1 text-center text-3xl font-extrabold">{mistakes}</div>
          <Button variant="outline" className="h-12 w-12 rounded-xl text-xl" onClick={() => setMistakes(mistakes + 1)}>+</Button>
        </div>
        <div className={`mt-3 rounded-xl py-2 text-center font-bold ${ratingTone(rating)}`}>التقييم: {rating}</div>
      </div>
      <div><Label>ملاحظات (اختياري)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
      <Button size="lg" className="w-full" onClick={save} disabled={busy}>حفظ الجلسة</Button>
    </Panel>
  );
}

function StudentsList({ students, supervisors, onEdit, onNew }: { students: Student[]; supervisors?: { id: string; full_name: string }[] | undefined; onEdit: (s: Student) => void; onNew: () => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [acct, setAcct] = useState<Student | null>(null);
  const [toDelete, setToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const list = useMemo(() => students.filter((s) => s.full_name.includes(q)), [students, q]);
  const supName = (id: string) => supervisors?.find((s) => s.id === id)?.full_name;

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const { error } = await supabase.from("students").delete().eq("id", toDelete.id);
    setDeleting(false);
    setToDelete(null);
    if (error) { toast.error("تعذر الحذف"); return; }
    toast.success("تم حذف الطالب");
    qc.invalidateQueries({ queryKey: ["students"] });
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex gap-2">
        <Input placeholder="بحث عن طالب…" className="h-11 bg-card" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button className="h-11" onClick={onNew}><Plus />إضافة</Button>
      </div>
      {list.length === 0 && <Panel className="text-center text-muted-foreground">لا يوجد طلاب بعد</Panel>}
      {list.map((s) => (
        <Panel key={s.id} className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="font-bold">{s.full_name}</div>
            <div className="text-xs text-muted-foreground">
              مستوى {levelName(s.level)} · {s.overall_rating}{supName(s.supervisor_id) ? ` · ${supName(s.supervisor_id)}` : ""}
              {s.user_id ? " · لديه حساب" : ""}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            {!s.user_id && <Button size="icon" variant="ghost" onClick={() => setAcct(s)} aria-label="إنشاء حساب"><KeyRound /></Button>}
            <Button size="icon" variant="ghost" onClick={() => onEdit(s)} aria-label="تعديل"><Pencil /></Button>
            <Button size="icon" variant="ghost" onClick={() => setToDelete(s)} aria-label="حذف"><Trash2 className="text-destructive" /></Button>
          </div>
        </Panel>
      ))}
      <AccountDialog student={acct} onClose={() => setAcct(null)} />
      <ConfirmDialog
        open={!!toDelete}
        title={`حذف الطالب ${toDelete?.full_name ?? ""}`}
        description="سيُحذف الطالب وجميع جلسات تسميعه بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه."
        confirmLabel={deleting ? "جارٍ الحذف…" : "حذف"}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function AccountDialog({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Sync phone field whenever the selected student changes
  const effectivePhone = phone || student?.phone || "";

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose();
      setPhone("");
      setPassword("");
    } else {
      setPhone(student?.phone ?? "");
      setPassword("");
    }
  }

  async function go() {
    if (!student) return;
    if (!password || password.length < 6) { toast.error("كلمة المرور 6 أحرف على الأقل"); return; }
    setBusy(true);
    try {
      await createStudentAccount({ data: { studentId: student.id, name: student.full_name, phone: effectivePhone, password } });
      toast.success("تم إنشاء حساب الطالب");
      qc.invalidateQueries({ queryKey: ["students"] });
      onClose();
      setPhone("");
      setPassword("");
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <Dialog open={!!student} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>حساب دخول لـ {student?.full_name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>رقم الهاتف</Label>
            <Input dir="ltr" className="h-11 text-right" value={effectivePhone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>كلمة المرور</Label>
            <Input type="password" className="h-11" placeholder="6 أحرف على الأقل" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" size="lg" onClick={go} disabled={busy || !password}>
            {busy ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function History() {
  const qc = useQueryClient();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["recitations", "recent"],
    queryFn: async () => (await supabase.from("recitations").select("*, students(full_name)").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  async function confirmDelete() {
    if (!toDelete) return;
    await supabase.from("recitations").delete().eq("id", toDelete);
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["recitations"] });
    toast.success("تم حذف الجلسة");
  }

  if (isLoading) return <CardSkeleton rows={4} />;

  return (
    <div className="mt-3 space-y-2">
      {!data?.length && <Panel className="text-center text-muted-foreground">لا توجد جلسات بعد</Panel>}
      {data?.map((r) => (
        <Panel key={r.id} className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="font-bold">{r.students?.full_name}</div>
            <div className="text-xs text-muted-foreground">{r.kind === "hifz" ? "حفظ" : "مراجعة"} · ص {r.from_page}–{r.to_page} · {r.mistakes} أخطاء · {fmtDate(r.created_at)}</div>
            {r.notes && <div className="mt-1 text-xs">{r.notes}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ratingTone(r.rating ?? "")}`}>{r.rating}</span>
            <Button size="icon" variant="ghost" onClick={() => setToDelete(r.id)} aria-label="حذف"><Trash2 className="text-destructive" /></Button>
          </div>
        </Panel>
      ))}
      <ConfirmDialog
        open={!!toDelete}
        title="حذف الجلسة"
        description="هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
