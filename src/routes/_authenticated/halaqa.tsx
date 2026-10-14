import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Bell, BookOpen, Check, ChevronDown, Clock, Download, KeyRound, MessageCircle, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, CardSkeleton, Panel } from "@/components/AppShell";
import { StudentDialog, type Student, type SupervisorItem } from "@/components/StudentDialog";
import { StudentCombobox } from "@/components/StudentCombobox";
import { StudentProfileDialog } from "@/components/StudentProfileDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchMe, useMe } from "@/lib/session";
import { fmtDate, levelName, LEVELS, ratingTone, sessionRating } from "@/lib/constants";
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

export function useSupervisors(enabled: boolean = true) {
  return useQuery({
    queryKey: ["supervisors"], enabled,
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id,role").in("role", ["super_admin", "supervisor"]);
      const ids = [...new Set((roles ?? []).map((r) => r.user_id))];
      if (!ids.length) return [];
      const { data } = await supabase.from("profiles").select("id,full_name,phone").in("id", ids);
      return (data ?? []).map((p) => ({
        ...p,
        role: roles?.find((r) => r.user_id === p.id)?.role ?? "supervisor",
      })) as SupervisorItem[];
    },
  });
}

function Halaqa() {
  const { data: me } = useMe();
  const { data: supervisors } = useSupervisors(true);
  const students = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await supabase.from("students").select("*").order("full_name")).data as Student[] ?? [],
  });
  const recitationsQuery = useQuery({
    queryKey: ["recitations-for-alerts"],
    queryFn: async () => (await supabase.from("recitations").select("student_id,created_at,kind,to_page").order("created_at", { ascending: false })).data ?? [],
  });

  const tabOrder = ["log", "students", "alerts", "history"];
  const [activeTab, setActiveTab] = useState("log");
  const [dlg, setDlg] = useState<{ open: boolean; student?: Student | null }>({ open: false });
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [selected, setSelected] = useState("");
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // إيماءات التمرير الأفقي بين التبويبات بسلاسة (Swipe Gestures)
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [role='combobox'], [role='dialog'], [role='slider'], button, [data-radix-popper-content-wrapper]")) {
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const endX = touch.clientX;
    const endY = touch.clientY;
    const deltaX = endX - touchStart.x;
    const deltaY = endY - touchStart.y;
    setTouchStart(null);

    // سحب أفقي بارز مع الحفاظ على التمرير الرأسي الطبيعي
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex === -1) return;

      // في الواجهة العربية RTL:
      // سحب الإصبع لليسار (deltaX < 0) ينتقل للتبويب التالي على اليسار (تسميع -> الطلاب -> المتابعة -> السجل)
      if (deltaX < 0 && currentIndex < tabOrder.length - 1) {
        const next = tabOrder[currentIndex + 1];
        if (next) setActiveTab(next);
      }
      // سحب الإصبع لليمين (deltaX > 0) يرجع للتبويب السابق على اليمين (السجل -> المتابعة -> الطلاب -> تسميع)
      else if (deltaX > 0 && currentIndex > 0) {
        const prev = tabOrder[currentIndex - 1];
        if (prev) setActiveTab(prev);
      }
    }
  };

  // المتابعة: متأخر > 8 أيام، منقطع > 14 يوماً (أكثر من أسبوعين)
  const inactiveStudents = useMemo(() => {
    const stList = students.data ?? [];
    const recList = recitationsQuery.data ?? [];
    const now = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;

    return stList.map((st) => {
      const last = recList.find((r) => r.student_id === st.id);
      let daysLate = 999;
      let hasRecited = false;
      if (last) {
        hasRecited = true;
        daysLate = Math.max(0, Math.floor((now - new Date(last.created_at).getTime()) / oneDay));
      }
      const status: "critical" | "warning" | "regular" =
        !hasRecited || daysLate > 14 ? "critical" : daysLate > 8 ? "warning" : "regular";

      return {
        student: st,
        hasRecited,
        daysLate,
        status,
        lastRec: last,
      };
    }).filter((item) => item.status !== "regular");
  }, [students.data, recitationsQuery.data]);

  const alertsCount = inactiveStudents.length;

  return (
    <AppShell title="الحلقة">
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid h-12 w-full grid-cols-4 rounded-xl bg-card shadow-soft">
          <TabsTrigger value="log">تسميع</TabsTrigger>
          <TabsTrigger value="students">الطلاب</TabsTrigger>
          <TabsTrigger value="alerts" className="relative flex items-center justify-center gap-1">
            <span>المتابعة</span>
            {alertsCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-extrabold text-destructive-foreground">
                {alertsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="min-h-[480px]"
        >
          <TabsContent value="log" className="outline-none transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-1">
            <LogForm students={students.data ?? []} selected={selected} setSelected={setSelected} onNew={() => setDlg({ open: true })} />
          </TabsContent>
          <TabsContent value="students" className="outline-none transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-1">
            <StudentsList
              students={students.data ?? []}
              supervisors={supervisors}
              onEdit={(s) => setDlg({ open: true, student: s })}
              onNew={() => setDlg({ open: true })}
              onViewProfile={(s) => setProfileStudent(s)}
            />
          </TabsContent>
          <TabsContent value="alerts" className="outline-none transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-1">
            <AlertsTab
              inactiveStudents={inactiveStudents}
              isLoading={recitationsQuery.isLoading || students.isLoading}
              supervisors={supervisors}
              onStartRecite={(studentId) => {
                setSelected(studentId);
                setActiveTab("log");
              }}
              onViewProfile={(s) => setProfileStudent(s)}
            />
          </TabsContent>
          <TabsContent value="history" className="outline-none transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-1">
            <History supervisors={supervisors} />
          </TabsContent>
        </div>
      </Tabs>

      {/* نافذة تعديل / إضافة طالب */}
      <StudentDialog open={dlg.open} onOpenChange={(o) => setDlg({ open: o })} student={dlg.student} supervisors={supervisors} onSaved={(id) => { if (!dlg.student) setSelected(id); }} />

      {/* نافذة الملف التفصيلي للطالب */}
      <StudentProfileDialog
        open={!!profileStudent}
        onOpenChange={(o) => !o && setProfileStudent(null)}
        student={profileStudent}
        supervisors={supervisors}
        onStartRecite={(id) => {
          setSelected(id);
          setActiveTab("log");
        }}
      />
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

  const lastRec = useQuery({
    queryKey: ["last-recitation", selected, kind],
    enabled: !!selected,
    queryFn: async () => {
      const { data } = await supabase
        .from("recitations")
        .select("to_page, kind, rating, created_at")
        .eq("student_id", selected)
        .eq("kind", kind)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const fromNum = +from;
  const toNum = +to;
  const isPagesFilled = from.trim() !== "" && to.trim() !== "";
  const isPageOrderInvalid = isPagesFilled && toNum < fromNum;
  const isPageOutOfRange = isPagesFilled && (fromNum < 1 || toNum < 1 || fromNum > 604 || toNum > 604);
  const totalPages = isPagesFilled && !isPageOrderInvalid && !isPageOutOfRange ? toNum - fromNum + 1 : 0;

  async function save() {
    if (!student) { toast.error("اختر الطالب أولاً"); return; }
    if (!from || !to) { toast.error("أدخل رقم صفحة البداية والنهاية"); return; }
    if (fromNum < 1 || toNum < 1) {
      toast.error("أرقام الصفحات يجب أن تبدأ من صفحة 1 فأكثر");
      return;
    }
    if (fromNum > 604 || toNum > 604) {
      toast.error("أرقام الصفحات لا يمكن أن تتجاوز 604 (عدد صفحات المصحف)");
      return;
    }
    if (toNum < fromNum) {
      toast.error(`غير منطقي: صفحة النهاية (${toNum}) يجب أن تكون أكبر من أو تساوي صفحة البداية (${fromNum})`);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("recitations").insert({
      student_id: student.id, supervisor_id: student.supervisor_id, kind,
      from_page: fromNum, to_page: toNum, mistakes, notes: notes || null,
    });
    setBusy(false);
    if (error) { toast.error("تعذر الحفظ"); return; }
    toast.success(`تم تسجيل الجلسة بنجاح (${totalPages} ${totalPages === 1 ? "صفحة" : "صفحات"}) — ${rating}`);
    setFrom(to ? String(toNum + 1) : ""); setTo(""); setMistakes(0); setNotes(""); setKind("hifz");
    qc.invalidateQueries({ queryKey: ["recitations"] });
    qc.invalidateQueries({ queryKey: ["recitations-for-alerts"] });
    qc.invalidateQueries({ queryKey: ["last-recitation", selected] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: ["honor"] });
    qc.invalidateQueries({ queryKey: ["student-recitations-profile", student.id] });
  }

  return (
    <Panel className="mt-3 space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label>الطالب</Label>
          <StudentCombobox students={students} value={selected} onChange={setSelected} />
        </div>
        <Button size="icon" variant="secondary" className="h-12 w-12 rounded-xl shrink-0" onClick={onNew} aria-label="طالب جديد"><UserPlus /></Button>
      </div>
      {student && (
        <p className="text-xs text-muted-foreground">مستوى {levelName(student.level)} · التقييم العام: {student.overall_rating}</p>
      )}
      <p className="text-xs text-muted-foreground">التاريخ والوقت: {new Date().toLocaleString("ar", { dateStyle: "full", timeStyle: "short" })}</p>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        {(["hifz", "review"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`h-11 rounded-lg font-bold ${kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{k === "hifz" ? "حفظ" : "مراجعة"}</button>
        ))}
      </div>

      {/* المساعد الذكي لتحديد الصفحة التالية بدقة حسب نوع التسميع (حفظ / مراجعة) */}
      {student && (
        <div className="pt-1">
          {lastRec.data?.to_page ? (() => {
            const nextFrom = (lastRec.data?.to_page ?? 0) + 1;
            const levelInfo = LEVELS.find((l) => l.id === student.level);
            const weeklyPages = levelInfo?.weekly ?? 0;
            const nextTo = weeklyPages > 0 ? (lastRec.data?.to_page ?? 0) + weeklyPages : null;
            const rangeLabel = nextTo
              ? `⚡ ابدأ من ص ${nextFrom} — ص ${nextTo}`
              : `⚡ ابدأ من ص ${nextFrom}`;
            return (
              <button
                type="button"
                onClick={() => {
                  setFrom(String(nextFrom));
                  if (nextTo) setTo(String(Math.min(nextTo, 604)));
                }}
                className="w-full inline-flex items-center justify-between gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 px-3 py-2 text-xs font-semibold text-primary transition-colors border border-primary/20 text-right"
              >
                <span>
                  آخر {kind === "hifz" ? "حفظ مسجل" : "مراجعة مسجلة"}: ص {lastRec.data.to_page}
                  {lastRec.data.created_at && ` (${new Date(lastRec.data.created_at).toLocaleDateString("ar-SA")})`}
                </span>
                <span className="rounded-lg bg-primary text-primary-foreground px-2 py-1 text-[11px] font-bold shrink-0">
                  {rangeLabel}
                </span>
              </button>
            );
          })() : kind === "hifz" && (student.prior_pages || 0) > 0 ? (() => {
            const nextFrom = (student.prior_pages || 0) + 1;
            const levelInfo = LEVELS.find((l) => l.id === student.level);
            const weeklyPages = levelInfo?.weekly ?? 0;
            const nextTo = weeklyPages > 0 ? (student.prior_pages || 0) + weeklyPages : null;
            const rangeLabel = nextTo
              ? `⚡ ابدأ من ص ${nextFrom} — ص ${nextTo}`
              : `⚡ ابدأ من ص ${nextFrom}`;
            return (
              <button
                type="button"
                onClick={() => {
                  setFrom(String(nextFrom));
                  if (nextTo) setTo(String(Math.min(nextTo, 604)));
                }}
                className="w-full inline-flex items-center justify-between gap-2 rounded-xl bg-accent/20 hover:bg-accent/30 px-3 py-2 text-xs font-semibold text-accent-foreground transition-colors border border-accent/40 text-right"
              >
                <span>حفظه السابق قبل الدورة: {student.prior_pages} صفحة</span>
                <span className="rounded-lg bg-accent text-accent-foreground px-2 py-1 text-[11px] font-bold shrink-0">
                  {rangeLabel}
                </span>
              </button>
            );
          })() : (
            <div className="rounded-lg bg-muted/60 px-3 py-1.5 text-[11px] text-muted-foreground text-center">
              {kind === "hifz" ? "لا يوجد حفظ سابق مسجل لهذا الطالب" : "لا توجد مراجعة سابقة مسجلة لهذا الطالب"}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>من صفحة</Label>
          <Input
            type="number"
            min={1}
            max={604}
            inputMode="numeric"
            className={`h-12 text-lg ${isPageOrderInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <Label>إلى صفحة</Label>
          <Input
            type="number"
            min={1}
            max={604}
            inputMode="numeric"
            className={`h-12 text-lg ${isPageOrderInvalid ? "border-destructive focus-visible:ring-destructive" : ""}`}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      {/* التنبيه المباشر في حال كان الترقيم غير منطقي أو خارج النطاق */}
      {isPageOrderInvalid ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-center text-xs font-bold text-destructive">
          ⚠️ غير منطقي: صفحة النهاية ({toNum}) أصغر من صفحة البداية ({fromNum})!
        </div>
      ) : isPageOutOfRange ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-center text-xs font-bold text-destructive">
          ⚠️ أرقام الصفحات يجب أن تكون ضمن المصحف الشريف (من 1 إلى 604)
        </div>
      ) : isPagesFilled && totalPages > 0 ? (
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-2 text-center text-xs font-bold text-primary">
          📖 إجمالي صفحات الجلسة: {totalPages} {totalPages === 1 ? "صفحة" : totalPages === 2 ? "صفحتان" : "صفحات"}
        </div>
      ) : null}

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
      <Button size="lg" className="w-full" onClick={save} disabled={busy || isPageOrderInvalid || isPageOutOfRange}>حفظ الجلسة</Button>
    </Panel>
  );
}

const RATING_CONFIG: Record<string, { label: string; icon: string; badge: string }> = {
  "امتياز": { label: "امتياز", icon: "🌟", badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25" },
  "ممتاز": { label: "ممتاز", icon: "💎", badge: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/25" },
  "جيد جداً": { label: "جيد جداً", icon: "🔷", badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/25" },
  "جيد": { label: "جيد", icon: "🔶", badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25" },
  "متوسط": { label: "متوسط", icon: "🟣", badge: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/25" },
  "يحتاج إعادة": { label: "يحتاج إعادة", icon: "🔄", badge: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25" },
};

const RATING_OPTIONS = ["امتياز", "ممتاز", "جيد جداً", "جيد", "متوسط", "يحتاج إعادة"] as const;

function StudentRatingPicker({
  currentRating,
  onSelect,
}: {
  currentRating: string;
  onSelect: (r: string) => void;
}) {
  const cfg = RATING_CONFIG[currentRating] || {
    label: currentRating || "امتياز",
    icon: "🌟",
    badge: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="انقر لتغيير التقييم"
          className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer ${cfg.badge}`}
        >
          <span>{cfg.icon}</span>
          <span>{cfg.label}</span>
          <ChevronDown className="h-3 w-3 opacity-60 mr-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl shadow-xl border bg-card">
        <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground border-b mb-1">
          اختر تقييم الطالب العام:
        </div>
        {RATING_OPTIONS.map((opt) => {
          const itemCfg = RATING_CONFIG[opt]!;
          const isSelected = currentRating === opt;
          return (
            <DropdownMenuItem
              key={opt}
              onClick={() => onSelect(opt)}
              className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10 text-primary font-extrabold" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{itemCfg.icon}</span>
                <span>{opt}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StudentsList({
  students,
  supervisors,
  onEdit,
  onNew,
  onViewProfile,
}: {
  students: Student[];
  supervisors?: SupervisorItem[] | undefined;
  onEdit: (s: Student) => void;
  onNew: () => void;
  onViewProfile: (s: Student) => void;
}) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const [acct, setAcct] = useState<Student | null>(null);
  const [toDelete, setToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const list = useMemo(() => {
    return students.filter((s) => {
      const matchName = s.full_name.includes(q);
      const matchLevel = selectedLevel === "all" || s.level === selectedLevel;
      return matchName && matchLevel;
    });
  }, [students, q, selectedLevel]);

  const supName = (id: string) => {
    const found = supervisors?.find((s) => s.id === id);
    if (!found) return undefined;
    return found.id === me?.id ? `${found.full_name} (أنا)` : found.full_name;
  };

  async function updateStudentRating(studentId: string, studentName: string, newRating: string) {
    const { error } = await supabase
      .from("students")
      .update({ overall_rating: newRating })
      .eq("id", studentId);

    if (error) {
      toast.error("تعذر تحديث تقييم الطالب");
      return;
    }
    toast.success(`تم تغيير تقييم الطالب ${studentName} إلى "${newRating}" بنجاح`);
    qc.invalidateQueries({ queryKey: ["students"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  }

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
        <Input placeholder="بحث عن طالب بالاسم…" className="h-11 bg-card" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button className="h-11 shrink-0" onClick={onNew}><Plus />إضافة طالب</Button>
      </div>

      {/* شريط فلترة المستويات */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedLevel("all")}
          className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition-colors ${
            selectedLevel === "all" ? "bg-primary text-primary-foreground font-bold" : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          الكل ({students.length})
        </button>
        {LEVELS.map((lvl) => {
          const count = students.filter((s) => s.level === lvl.id).length;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setSelectedLevel(lvl.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                selectedLevel === lvl.id ? "bg-primary text-primary-foreground font-bold" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {lvl.name} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>عرض {list.length} من {students.length} طالب</span>
      </div>

      {list.length === 0 && <Panel className="text-center text-muted-foreground">لا يوجد طلاب يطابقون البحث</Panel>}
      {list.map((s) => (
        <Panel key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors">
          <div
            className="min-w-0 flex-1 cursor-pointer group"
            onClick={() => onViewProfile(s)}
            title="انقر لعرض الملف التفصيلي للطالب"
          >
            <div className="font-bold flex items-center gap-2">
              <span className="group-hover:text-primary transition-colors text-base">{s.full_name}</span>
              <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                عرض الملف
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5">
              <span>مستوى {levelName(s.level)}</span>
              {supName(s.supervisor_id) && <span>· المسمّع: {supName(s.supervisor_id)}</span>}
              {s.user_id && <span className="text-emerald-600 font-medium">· لديه حساب</span>}
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0">
            {/* كبسة التقييم السريع المباشر */}
            <StudentRatingPicker
              currentRating={s.overall_rating}
              onSelect={(newRating) => updateStudentRating(s.id, s.full_name, newRating)}
            />

            <div className="flex shrink-0 gap-1">
              {!s.user_id && <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground" onClick={() => setAcct(s)} aria-label="إنشاء حساب"><KeyRound className="h-4 w-4" /></Button>}
              <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground" onClick={() => onEdit(s)} aria-label="تعديل"><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive" onClick={() => setToDelete(s)} aria-label="حذف"><Trash2 className="h-4 w-4" /></Button>
            </div>
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

function History({ supervisors }: { supervisors?: SupervisorItem[] | undefined }) {
  const qc = useQueryClient();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [filterSupervisor, setFilterSupervisor] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<number | "all">("all");
  const [filterKind, setFilterKind] = useState<"all" | "hifz" | "review">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["recitations", "recent"],
    queryFn: async () =>
      (await supabase
        .from("recitations")
        .select("*, students(full_name, level, supervisor_id)")
        .order("created_at", { ascending: false })
        .limit(300)).data ?? [],
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => {
      const st = r.students as { full_name: string; level: number; supervisor_id: string } | null;
      const matchSup = filterSupervisor === "all" || st?.supervisor_id === filterSupervisor;
      const matchLevel = filterLevel === "all" || st?.level === filterLevel;
      const matchKind = filterKind === "all" || r.kind === filterKind;
      return matchSup && matchLevel && matchKind;
    });
  }, [data, filterSupervisor, filterLevel, filterKind]);

  const hasActiveFilter = filterSupervisor !== "all" || filterLevel !== "all" || filterKind !== "all";

  function exportCSV() {
    if (!filtered.length) { toast.error("لا توجد جلسات للتصدير"); return; }
    const headers = ["اسم الطالب", "النوع", "من صفحة", "إلى صفحة", "الصفحات", "الأخطاء", "التقييم", "التاريخ", "ملاحظات"];
    const rows = filtered.map((r) => [
      `"${(r.students as any)?.full_name || ""}"`,
      r.kind === "hifz" ? "حفظ" : "مراجعة",
      r.from_page,
      r.to_page,
      r.pages ?? (r.to_page - r.from_page + 1),
      r.mistakes,
      `"${r.rating || ""}"`,
      `"${new Date(r.created_at).toLocaleDateString("ar-SA")}"`,
      `"${(r.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `سجل_تسميع_صفوة_الإخاء_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تنزيل ملف الإكسل (CSV) بنجاح");
  }

  async function confirmDelete() {
    if (!toDelete) return;
    await supabase.from("recitations").delete().eq("id", toDelete);
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["recitations"] });
    toast.success("تم حذف الجلسة");
  }

  if (isLoading) return <CardSkeleton rows={4} />;

  return (
    <div className="mt-3 space-y-3">
      {/* شريط الفلاتر */}
      <Panel className="py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold flex items-center gap-1.5">
            <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            فلترة السجل
          </span>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => { setFilterSupervisor("all"); setFilterLevel("all"); setFilterKind("all"); }}
              className="text-xs text-primary font-semibold hover:underline"
            >
              إلغاء الفلاتر
            </button>
          )}
        </div>

        {/* فلتر نوع التسميع */}
        <div>
          <div className="text-[11px] text-muted-foreground font-semibold mb-1.5">نوع التسميع</div>
          <div className="flex gap-1.5 text-xs">
            {(["all", "hifz", "review"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterKind(k)}
                className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  filterKind === k ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {k === "all" ? "الكل" : k === "hifz" ? "حفظ" : "مراجعة"}
              </button>
            ))}
          </div>
        </div>

        {/* فلتر المستوى */}
        <div>
          <div className="text-[11px] text-muted-foreground font-semibold mb-1.5">المستوى</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setFilterLevel("all")}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                filterLevel === "all" ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >الكل</button>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setFilterLevel(lvl.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  filterLevel === lvl.id ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >{lvl.name}</button>
            ))}
          </div>
        </div>

        {/* فلتر المسمّع */}
        {supervisors && supervisors.length > 1 && (
          <div>
            <div className="text-[11px] text-muted-foreground font-semibold mb-1.5">المسمّع</div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setFilterSupervisor("all")}
                className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  filterSupervisor === "all" ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >الكل</button>
              {supervisors.map((sup) => (
                <button
                  key={sup.id}
                  type="button"
                  onClick={() => setFilterSupervisor(sup.id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    filterSupervisor === sup.id ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >{sup.full_name}</button>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* رأس القائمة */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            {filtered.length} جلسة{hasActiveFilter ? " (بعد الفلترة)" : ""}
          </span>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5" />
            تصدير CSV
          </Button>
        </div>
      )}

      {!filtered.length && (
        <Panel className="text-center text-muted-foreground py-8">
          {hasActiveFilter ? "لا توجد جلسات تطابق الفلاتر المحددة" : "لا توجد جلسات بعد"}
        </Panel>
      )}
      {filtered.map((r) => (
        <Panel key={r.id} className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="font-bold">{(r.students as any)?.full_name}</div>
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



type InactiveItem = {
  student: Student;
  hasRecited: boolean;
  daysLate: number;
  status: "critical" | "warning" | "regular";
  lastRec?: { created_at: string; kind: string; to_page: number } | undefined;
};

function AlertsTab({
  inactiveStudents,
  isLoading,
  supervisors,
  onStartRecite,
  onViewProfile,
}: {
  inactiveStudents: InactiveItem[];
  isLoading: boolean;
  supervisors?: { id: string; full_name: string }[] | undefined;
  onStartRecite: (studentId: string) => void;
  onViewProfile?: (student: Student) => void;
}) {
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");
  const [q, setQ] = useState("");

  const criticalCount = useMemo(() => inactiveStudents.filter((x) => x.status === "critical").length, [inactiveStudents]);
  const warningCount = useMemo(() => inactiveStudents.filter((x) => x.status === "warning").length, [inactiveStudents]);

  const filtered = useMemo(() => {
    return inactiveStudents.filter((item) => {
      const matchName = item.student.full_name.includes(q);
      const matchStatus = filter === "all" || item.status === filter;
      return matchName && matchStatus;
    });
  }, [inactiveStudents, filter, q]);

  const supName = (id: string) => supervisors?.find((s) => s.id === id)?.full_name;

  function openWhatsApp(student: Student, daysLate: number, hasRecited: boolean) {
    if (!student.phone) {
      toast.error("لا يوجد رقم هاتف مسجل لهذا الطالب");
      return;
    }
    let clean = student.phone.replace(/[^\d]/g, "");
    if (clean.startsWith("05") && clean.length === 10) {
      clean = "966" + clean.slice(1);
    }
    const text = !hasRecited || daysLate >= 30
      ? `السلام عليكم ورحمة الله وبركاته أخي ${student.full_name}، حياك الله وبياك في حلقة القرآن (صفوة الإخاء) 🌸 ننتظر حضورك وتسميعك الأول معنا بإذن الله.`
      : `السلام عليكم ورحمة الله وبركاته أخي ${student.full_name}، نفتقد وجودك في حلقة القرآن (صفوة الإخاء) 🌱 مرّت ${daysLate} أيام منذ آخر تسميع لك، نرجو أن تكون بخير وعافية، وننتظر استئناف وردك المبارك قريباً.`;

    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (isLoading) return <CardSkeleton rows={4} />;

  return (
    <div className="mt-3 space-y-3">
      {/* إحصائيات التنبيهات السريعة */}
      <div className="grid grid-cols-2 gap-2">
        <div
          onClick={() => setFilter(filter === "critical" ? "all" : "critical")}
          className={`cursor-pointer rounded-2xl border p-3 text-center transition-all ${
            filter === "critical" ? "border-destructive bg-destructive/15 ring-2 ring-destructive/40" : "bg-card shadow-soft hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xl font-extrabold">{criticalCount}</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-muted-foreground">منقطع (&gt; 14 يوماً)</div>
        </div>

        <div
          onClick={() => setFilter(filter === "warning" ? "all" : "warning")}
          className={`cursor-pointer rounded-2xl border p-3 text-center transition-all ${
            filter === "warning" ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/40" : "bg-card shadow-soft hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
            <span className="text-xl font-extrabold">{warningCount}</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-muted-foreground">متأخر (&gt; 8 أيام)</div>
        </div>
      </div>

      {/* حقل البحث بالاسم */}
      <div className="flex gap-2">
        <Input
          placeholder="بحث في قائمة المنقطعين بالاسم…"
          className="h-11 bg-card"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {filter !== "all" && (
          <Button variant="ghost" className="h-11 text-xs" onClick={() => setFilter("all")}>
            إلغاء التصفية
          </Button>
        )}
      </div>

      {/* شريط معلومات التصفية */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>عرض {filtered.length} من أصل {inactiveStudents.length} حالة تنبيه</span>
        <span className="text-[11px]">التنبيه: متأخر (&gt; 8 أيام) · منقطع (&gt; 14 يوماً / أكثر من أسبوعين)</span>
      </div>

      {/* القائمة */}
      {filtered.length === 0 ? (
        <Panel className="py-8 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 text-xl">
            🌱
          </div>
          <p className="font-bold">ما شاء الله! لا يوجد طلاب في هذه القائمة</p>
          <p className="mt-1 text-xs text-muted-foreground">جميع الطلاب المسجلين مستمرون في التسميع بانتظام</p>
        </Panel>
      ) : (
        filtered.map(({ student, daysLate, hasRecited, lastRec, status }) => (
          <Panel key={student.id} className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => onViewProfile?.(student)}
                  title="انقر لعرض الملف التفصيلي للطالب"
                >
                  <span className="font-bold text-base group-hover:text-primary transition-colors">{student.full_name}</span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    مستوى {levelName(student.level)}
                  </span>
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                    عرض الملف
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {supName(student.supervisor_id) ? `المسمّع: ${supName(student.supervisor_id)} · ` : ""}
                  {student.phone ? <span dir="ltr">{student.phone}</span> : "لا يوجد هاتف"}
                </div>
              </div>

              {/* شارة حالة الانقطاع */}
              {status === "critical" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {!hasRecited ? "لم يسمّع بعد" : `منقطع (${daysLate} يوم)`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  متأخر ({daysLate} أيام)
                </span>
              )}
            </div>

            {/* تفاصيل آخر جلسة تسميع */}
            <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              {hasRecited && lastRec ? (
                <span>
                  آخر جلسة: {lastRec.kind === "hifz" ? "حفظ" : "مراجعة"} إلى ص {lastRec.to_page} · بتاريخ {fmtDate(lastRec.created_at)}
                </span>
              ) : (
                <span>لم يتم تسجيل أي جلسة تسميع لهذا الطالب حتى الآن</span>
              )}
            </div>

            {/* أزرار الإجراء السريع */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1 gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs h-9"
                onClick={() => openWhatsApp(student, daysLate, hasRecited)}
              >
                <MessageCircle className="h-4 w-4" />
                تذكير عبر واتساب
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-9 font-semibold"
                onClick={() => onStartRecite(student.id)}
              >
                <BookOpen className="h-4 w-4 text-primary" />
                تسميع الآن
              </Button>
            </div>
          </Panel>
        ))
      )}
    </div>
  );
}
